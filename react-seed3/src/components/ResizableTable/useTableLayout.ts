import { useCallback, useMemo, useState } from 'react';
import type { HTMLAttributes } from 'react';
import type { ColumnsType, ColumnType } from 'antd/es/table';
import type { ResizableHeaderCellProps } from './ResizableTitle';

export interface TableLayout {
  /** 用户调整后的列宽，按列 id 保存。 */
  widths: Record<string, number>;
  /** 完整列顺序，包含当前隐藏列。 */
  order: string[];
  /** 被用户隐藏的列 id。 */
  hidden: string[];
}

/** 列设置弹层只依赖的最小展示模型。 */
export interface ColumnMeta {
  colId: string;
  title: string;
  visible: boolean;
}

// 空布局表示完全使用源码列定义，是初始化和重置的共同基线。
const EMPTY_LAYOUT: TableLayout = { widths: {}, order: [], hidden: [] };
// 所有列必须有确定宽度，否则浏览器会根据单元格内容重新分配未声明宽度的列。
const DEFAULT_COLUMN_WIDTH = 160;

// 保留用户对旧列的排序；新增列按源码中的相邻位置插入，并清除已删除列和重复 id。
export const resolveColumnOrder = (order: string[], sourceIds: string[]) => {
  // sourceIdSet 用于一次性剔除缓存中已经删除的列。
  const sourceIdSet = new Set(sourceIds);
  // Set 去重，同时保留有效缓存顺序。
  const resolved = Array.from(new Set(order.filter((id) => sourceIdSet.has(id))));

  sourceIds.forEach((sourceId, sourceIndex) => {
    // 已存在的列保留用户顺序，无需重新插入。
    if (resolved.includes(sourceId)) return;

    // 新列优先跟随源码中的前置相邻列；没有前置列时再寻找后置锚点。
    const previousId = sourceIds
      .slice(0, sourceIndex)
      .reverse()
      .find((id) => resolved.includes(id));
    const nextId = sourceIds.slice(sourceIndex + 1).find((id) => resolved.includes(id));
    // 两侧都没有已知列时追加到末尾。
    let insertIndex = resolved.length;
    // 找到前置锚点时插入其后，保持已有列的用户顺序。
    if (previousId) {
      insertIndex = resolved.indexOf(previousId) + 1;
    // 只有后置锚点时插入其前，适配新增首列。
    } else if (nextId) {
      insertIndex = resolved.indexOf(nextId);
    }
    resolved.splice(insertIndex, 0, sourceId);
  });

  return resolved;
};

/** 按当前源码列集合清洗缓存，保证增删列后旧布局仍可安全使用。 */
export const migrateTableLayout = (layout: TableLayout, sourceIds: string[]): TableLayout => {
  const sourceIdSet = new Set(sourceIds);
  return {
    widths: Object.fromEntries(
      Object.entries(layout.widths).filter(
        ([id, width]) => sourceIdSet.has(id) && Number.isFinite(width),
      ),
    ),
    order: resolveColumnOrder(layout.order, sourceIds),
    hidden: Array.from(new Set(layout.hidden.filter((id) => sourceIdSet.has(id)))),
  };
};

/** 从 localStorage 读取布局；未启用缓存或缓存无效时回退到空布局。 */
const readLayout = (storageKey?: string): TableLayout => {
  // storageKey 缺省表示只维护当前组件生命周期内的状态。
  if (!storageKey) return EMPTY_LAYOUT;

  try {
    const value = JSON.parse(localStorage.getItem(storageKey) ?? 'null') as Partial<TableLayout> | null;
    return {
      widths: value?.widths && typeof value.widths === 'object' ? value.widths : {},
      order: Array.isArray(value?.order) ? value.order.filter((id): id is string => typeof id === 'string') : [],
      hidden: Array.isArray(value?.hidden)
        ? value.hidden.filter((id): id is string => typeof id === 'string')
        : [],
    };
  } catch {
    // JSON 损坏或浏览器禁用 Storage 时不阻断表格渲染。
    return EMPTY_LAYOUT;
  }
};

/** 解析列的稳定 id，优先级为 key → dataIndex → index。 */
const getColumnId = <T>(column: ColumnType<T>, index: number) => {
  // 显式 key 最稳定，优先用于持久化。
  if (column.key !== null && column.key !== undefined) return String(column.key);
  // 数组 dataIndex 转为路径字符串，支持嵌套字段列。
  if (Array.isArray(column.dataIndex)) return column.dataIndex.map(String).join('.');
  // 普通 dataIndex 可直接作为列 id。
  if (column.dataIndex !== null && column.dataIndex !== undefined) return String(column.dataIndex);

  // 开发环境提示调用方补稳定标识；生产环境安静回退到 index。
  if (import.meta.env.DEV) {
    console.warn('[ResizableTable] Column requires a stable key or dataIndex:', column);
  }
  return String(index);
};

/** 保存完整布局；Storage 不可用时保持内存交互可用。 */
const writeLayout = (storageKey: string | undefined, layout: TableLayout) => {
  // 未配置缓存键时不执行持久化。
  if (!storageKey) return;
  try {
    localStorage.setItem(storageKey, JSON.stringify(layout));
  } catch {
    // Storage availability must not block table interaction.
  }
};

/** 重置时只删除当前表格自己的缓存键，不误伤同前缀的业务缓存。 */
const removeLayout = (storageKey?: string) => {
  // 纯内存表格没有需要清理的缓存。
  if (!storageKey) return;
  try {
    localStorage.removeItem(storageKey);
  } catch {
    // Storage availability must not block table interaction.
  }
};

/** 将源码列定义与用户布局合并，向表格输出最终列和全部布局操作。 */
export default function useTableLayout<T>(sourceColumns: ColumnsType<T>, storageKey?: string) {
  // storedLayout 只保存用户布局，不复制任何行数据或业务状态。
  const [storedLayout, setStoredLayout] = useState<TableLayout>(() => readLayout(storageKey));

  // key/dataIndex 是列宽、顺序和显隐跨版本持久化时唯一可信的稳定标识。
  const source = useMemo(() => {
    // columnsById 让后续排序、显隐和列宽操作都走同一索引。
    const columnsById = new Map<string, ColumnType<T>>();
    sourceColumns.forEach((column, index) => {
      columnsById.set(getColumnId(column as ColumnType<T>, index), column as ColumnType<T>);
    });
    return { columnsById, ids: Array.from(columnsById.keys()) };
  }, [sourceColumns]);

  // 渲染时直接迁移旧缓存，不用 useEffect 再同步一份派生状态。
  const layout = useMemo(() => migrateTableLayout(storedLayout, source.ids), [storedLayout, source]);

  /** 布局的唯一提交入口；persist=false 用于调宽过程中的临时状态。 */
  const commit = useCallback(
    (next: TableLayout, persist = true) => {
      setStoredLayout(next);
      // 只在需要落库的操作完成时同步 localStorage。
      if (persist) writeLayout(storageKey, next);
    },
    [storageKey],
  );

  /** 更新指定列宽；调宽结束前不执行持久化。 */
  const resizeColumn = useCallback(
    (colId: string, width: number, finished: boolean) => {
      // 拖动中只更新内存，抬起时才写 localStorage，避免高频同步 IO。
      commit({ ...layout, widths: { ...layout.widths, [colId]: width } }, finished);
    },
    [commit, layout],
  );

  /** 将源列移动到目标列之前，并立即持久化新顺序。 */
  const reorderColumn = useCallback(
    (sourceId: string, targetId: string) => {
      // 同列拖放或未知源列都不会改变布局。
      if (sourceId === targetId || !source.columnsById.has(sourceId)) return;
      // 先移除源列，防止插入后出现重复 id。
      const order = layout.order.filter((id) => id !== sourceId);
      const targetIndex = order.indexOf(targetId);
      // 目标列可能已在拖拽过程中被移除，找不到时安全退出。
      if (targetIndex < 0) return;
      order.splice(targetIndex, 0, sourceId);
      commit({ ...layout, order });
    },
    [commit, layout, source],
  );

  /** 切换单列显隐，并确保始终至少保留一列可见。 */
  const toggleColumn = useCallback(
    (colId: string) => {
      // 已隐藏则移除 id，当前可见则追加 id。
      const hidden = layout.hidden.includes(colId)
        ? layout.hidden.filter((id) => id !== colId)
        : [...layout.hidden, colId];
      // hidden 数等于列总数时拒绝提交，避免得到无可见列的表格。
      if (hidden.length < source.ids.length) commit({ ...layout, hidden });
    },
    [commit, layout, source],
  );

  /** 同时重置内存布局和当前表格的持久化布局。 */
  const reset = useCallback(() => {
    removeLayout(storageKey);
    setStoredLayout(EMPTY_LAYOUT);
  }, [storageKey]);

  // 设置面板按当前用户顺序展示全部列，包括已隐藏列。
  const columnMetaList = useMemo<ColumnMeta[]>(
    () =>
      layout.order.map((colId) => {
        const column = source.columnsById.get(colId)!;
        return {
          colId,
          title: typeof column.title === 'string' ? column.title : colId,
          visible: !layout.hidden.includes(colId),
        };
      }),
    [layout, source],
  );

  // 最终列：依次应用顺序、显隐、数值宽度和表头交互能力。
  const columns = useMemo<ColumnsType<T>>(
    () =>
      layout.order
        .filter((colId) => !layout.hidden.includes(colId))
        .map((colId) => {
          // layout.order 已经过迁移，当前 id 必然能从索引中取到列定义。
          const column = source.columnsById.get(colId)!;
          // 用户宽度优先，其次源码宽度，最后使用不受内容影响的默认宽度。
          const width =
            layout.widths[colId] ??
            (typeof column.width === 'number' ? column.width : DEFAULT_COLUMN_WIDTH);
          const originalHeaderCell = column.onHeaderCell;
          // 右固定列依赖稳定的右边界，不开放右侧调宽；固定列也不参与列顺序拖拽。
          const resizable = column.fixed !== 'right';

          return {
            ...column,
            width,
            ellipsis: column.ellipsis ?? true,
            // 保留调用方的 onHeaderCell，并补充 ResizableTitle 所需的能力参数。
            onHeaderCell: (headerColumn) =>
              ({
                ...originalHeaderCell?.(headerColumn),
                columnId: colId,
                width,
                draggableColumn: !column.fixed,
                sortableColumn: Boolean(column.sorter),
                onColumnResize: resizable
                  ? (nextWidth: number, finished: boolean) => resizeColumn(colId, nextWidth, finished)
                  : undefined,
                onColumnReorder: reorderColumn,
              }) as ResizableHeaderCellProps as HTMLAttributes<HTMLElement>,
          } as ColumnType<T>;
        }),
    [layout, reorderColumn, resizeColumn, source],
  );
  // 使用可见列宽总和作为 scroll.x，避免 max-content 因行数据有无而改变列宽分配。
  const tableWidth = columns.reduce((total, column) => total + Number(column.width), 0);

  return { columns, tableWidth, columnMetaList, toggleColumn, reset };
}
