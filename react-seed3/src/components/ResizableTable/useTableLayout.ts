import { useCallback, useMemo, useState } from 'react';
import type { HTMLAttributes } from 'react';
import type { ColumnsType, ColumnType } from 'antd/es/table';

/** 单个表格持久化的布局：列宽、列顺序、隐藏列，均以列 id 为键 */
interface TableLayout {
  widths: Record<string, number>;
  order: string[];
  hidden: string[];
}

/** 列设置面板用的单列元信息 */
export interface ColumnMeta {
  colId: string;
  title: string;
  visible: boolean;
}

const EMPTY_LAYOUT: TableLayout = { widths: {}, order: [], hidden: [] };

/** 读取持久化布局，storageKey 缺省或解析失败时退化为空布局 */
const readLayout = (storageKey?: string): TableLayout => {
  if (!storageKey) return EMPTY_LAYOUT;
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return EMPTY_LAYOUT;
    return { ...EMPTY_LAYOUT, ...(JSON.parse(raw) as Partial<TableLayout>) };
  } catch {
    return EMPTY_LAYOUT;
  }
};

/**
 * 优先用列的 key/dataIndex 作持久化标识，列顺序调整或增删后仍能对上。
 * 无 key/dataIndex 时只能回退到 index，此时增删列会导致布局错位，开发环境告警提醒补 key。
 */
const getColId = <T>(col: ColumnType<T>, index: number) => {
  if (col.key != null) return String(col.key);
  if (typeof col.dataIndex === 'string' || typeof col.dataIndex === 'number') {
    return String(col.dataIndex);
  }
  if (import.meta.env.DEV) {
    console.warn(
      '[ResizableTable] 列缺少 key/dataIndex，回退用 index 作持久化标识，增删列后布局可能错位，建议为该列显式指定 key：',
      col,
    );
  }
  return String(index);
};

// 表格布局管理：接收原始列定义，产出「排序 + 显隐 + 列宽」处理后的列，
// 并返回列设置面板所需的元信息与操作方法。storageKey 缺省时仅内存态、不落库。
export default function useTableLayout<T>(source: ColumnsType<T>, storageKey?: string) {
  const [layout, setLayout] = useState<TableLayout>(() => readLayout(storageKey));

  // 落库；storageKey 缺省时跳过（可拖拽但不持久化）
  const persist = useCallback(
    (next: TableLayout) => {
      if (storageKey) localStorage.setItem(storageKey, JSON.stringify(next));
    },
    [storageKey],
  );

  // 统一更新入口：基于上一态计算下一态，并按需落库
  const update = useCallback(
    (updater: (prev: TableLayout) => TableLayout, save = true) => {
      setLayout((prev) => {
        const next = updater(prev);
        if (save) persist(next);
        return next;
      });
    },
    [persist],
  );

  // 原始列按 colId 建索引，供后续按 id 取列与排序；仅在 source 变化时重建
  const { colMap, sourceIds } = useMemo(() => {
    const map = new Map<string, ColumnType<T>>();
    source.forEach((col, index) => {
      map.set(getColId(col as ColumnType<T>, index), col as ColumnType<T>);
    });
    return { colMap: map, sourceIds: Array.from(map.keys()) };
  }, [source]);

  // 按已存顺序（失效 id 过滤）+ 新增列追加到末尾，得到最终列序
  const resolveOrder = useCallback(
    (order: string[]) => [...order.filter((id) => colMap.has(id)), ...sourceIds.filter((id) => !order.includes(id))],
    [colMap, sourceIds],
  );
  const orderedIds = useMemo(() => resolveOrder(layout.order), [resolveOrder, layout.order]);

  // 列宽拖拽：save=false 为拖拽中间态（不落库），拖拽结束再以 save=true 落库
  const resizeColumn = useCallback(
    (colId: string, width: number, save: boolean) =>
      update((prev) => ({ ...prev, widths: { ...prev.widths, [colId]: width } }), save),
    [update],
  );

  // 列排序：把 sourceId 移动到 targetId 之前
  const reorderColumn = useCallback(
    (sourceId: string, targetId: string) => {
      if (sourceId === targetId) return;
      update((prev) => {
        const current = resolveOrder(prev.order).filter((id) => id !== sourceId);
        const targetIndex = current.indexOf(targetId);
        if (targetIndex === -1) return prev;
        current.splice(targetIndex, 0, sourceId);
        return { ...prev, order: current };
      });
    },
    [update, resolveOrder],
  );

  // 列显隐切换；先剔除失效 id 再基于「有效隐藏数」判断，至少保留一列可见
  const toggleColumn = useCallback(
    (colId: string) => {
      update((prev) => {
        const validHidden = prev.hidden.filter((id) => colMap.has(id));
        const isHidden = validHidden.includes(colId);
        if (!isHidden && validHidden.length >= sourceIds.length - 1) return prev;
        const hidden = isHidden ? validHidden.filter((id) => id !== colId) : [...validHidden, colId];
        return { ...prev, hidden };
      });
    },
    [update, colMap, sourceIds],
  );

  // 重置整个表格布局：清内存态并清除持久化
  const reset = useCallback(() => {
    if (storageKey) localStorage.removeItem(storageKey);
    setLayout(EMPTY_LAYOUT);
  }, [storageKey]);

  // 列设置面板数据：按当前列序列出每列的显隐状态
  const columnMetaList: ColumnMeta[] = useMemo(
    () =>
      orderedIds.map((colId) => {
        const col = colMap.get(colId)!;
        return {
          colId,
          title: typeof col.title === 'string' ? col.title : colId,
          visible: !layout.hidden.includes(colId),
        };
      }),
    [orderedIds, colMap, layout.hidden],
  );

  // 交给 antd 的最终列：过滤隐藏列、按列序排列、注入列宽与表头交互回调
  const columns: ColumnsType<T> = useMemo(
    () =>
      orderedIds
        .filter((colId) => !layout.hidden.includes(colId))
        .map((colId) => {
          const column = colMap.get(colId)!;
          const width = layout.widths[colId] ?? (column.width as number | undefined);
          return {
            ...column,
            width,
            ellipsis: column.ellipsis ?? true,
            // 表头 cell（ResizableTitle）通过这些 props 获得列宽拖拽与排序能力
            onHeaderCell: () =>
              ({
                colId,
                width,
                onResize: (nextWidth: number) => resizeColumn(colId, nextWidth, false),
                onResizeStop: (nextWidth: number) => resizeColumn(colId, nextWidth, true),
                onReorder: reorderColumn,
              } as unknown as HTMLAttributes<HTMLElement>),
          } as ColumnType<T>;
        }),
    [orderedIds, colMap, layout.hidden, layout.widths, resizeColumn, reorderColumn],
  );

  return { columns, columnMetaList, toggleColumn, reset };
}
