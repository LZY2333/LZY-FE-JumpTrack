import { Children, cloneElement, isValidElement, useRef, useState } from 'react';
import type {
  DragEvent,
  HTMLAttributes,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
  ReactNode,
} from 'react';
import cn from 'classnames';
import { resolveResizedWidth, resolveResizeStartWidth } from './resizableTableUtil';

export interface ResizableHeaderCellProps extends Omit<HTMLAttributes<HTMLTableCellElement>, 'onResize'> {
  /** 当前列的稳定标识，用于拖拽排序。 */
  columnId?: string;
  /** 当前声明宽度；首次调宽优先使用 DOM 实际宽度。 */
  width?: number;
  /** 固定列为 false，普通列允许从 Title 发起拖拽。 */
  draggableColumn?: boolean;
  /** 是否需要拆分 Title 拖拽区与 sorter 点击区。 */
  sortableColumn?: boolean;
  /** finished=false 仅更新界面，finished=true 同步持久化。 */
  onColumnResize?: (width: number, finished: boolean) => void;
  /** 将源列移动到目标列之前。 */
  onColumnReorder?: (sourceId: string, targetId: string) => void;
}

/** 一次调宽手势的快照，避免每次 pointermove 都依赖 React state。 */
interface ResizeState {
  pointerId: number;
  startX: number;
  startWidth: number;
  width: number;
}

interface HeaderNodeProps extends HTMLAttributes<HTMLElement> {
  children?: ReactNode;
}

interface HeaderActions {
  draggable: boolean;
  sortTooltip: string;
  onDragStart: (event: DragEvent<HTMLElement>) => void;
  onSelectTitle: (element: HTMLElement) => void;
  onSort?: (event: ReactMouseEvent<HTMLElement>) => void;
  onSortByKeyboard?: (event: ReactKeyboardEvent<HTMLElement>) => void;
}

// 自定义 MIME 只接受本表格列拖拽，避免响应页面中的其他拖拽源。
const DRAG_MIME = 'application/x-resizable-table-column';
// 以下 class 由 antd 5 sorter 生成，是表头组件原生扩展点中的节点标识。
const TITLE_CLASS = 'ant-table-column-title';
const SORTER_CLASS = 'ant-table-column-sorter';
const SORTABLE_CELL_CLASS = 'ant-table-column-has-sorters';

/** 精确匹配 class token，避免 includes 误命中相似类名。 */
const hasClass = (className: string | undefined, target: string) => className?.split(/\s+/).includes(target) ?? false;

// antd 5 将 Title 和 sorter 注入到 children 中：Title 负责原生列拖拽，排序回调只下放给三角形。
const renderHeaderContent = (children: ReactNode, actions: HeaderActions): ReactNode =>
  Children.map(children, (child) => {
    // 文本等非 ReactElement 节点无需注入事件，保持原样。
    if (!isValidElement<HeaderNodeProps>(child)) return child;

    // Title 只承载列拖拽与文字选择，不承载排序点击。
    if (hasClass(child.props.className, TITLE_CLASS)) {
      return cloneElement(child, {
        draggable: actions.draggable || undefined,
        className: cn(child.props.className, 'select-text', actions.draggable ? 'cursor-move' : 'cursor-default'),
        onDoubleClick: (event: ReactMouseEvent<HTMLElement>) => {
          child.props.onDoubleClick?.(event);
          actions.onSelectTitle(event.currentTarget);
        },
        onDragStart: actions.draggable
          ? (event: DragEvent<HTMLElement>) => {
              child.props.onDragStart?.(event);
              actions.onDragStart(event);
            }
          : child.props.onDragStart,
      });
    }

    // sorter 三角形独占排序点击、键盘触发和 Tooltip。
    if (hasClass(child.props.className, SORTER_CLASS)) {
      // 提升层级以越过 sorter 容器的全表头伪元素。
      const sorter = cloneElement(child, {
        className: cn(child.props.className, 'relative z-10 cursor-pointer'),
        role: 'button',
        tabIndex: 0,
        'aria-label': actions.sortTooltip,
        onClick: (event: ReactMouseEvent<HTMLElement>) => {
          event.stopPropagation();
          child.props.onClick?.(event);
          actions.onSort?.(event);
        },
        onKeyDown: (event: ReactKeyboardEvent<HTMLElement>) => {
          event.stopPropagation();
          child.props.onKeyDown?.(event);
          actions.onSortByKeyboard?.(event);
        },
      });
      return sorter;
    }

    // 叶子节点没有可继续处理的子树，直接返回。
    if (child.props.children === null || child.props.children === undefined) return child;
    // antd 可能在顶层传数组或继续嵌套容器，统一递归处理。
    return cloneElement(child, undefined, renderHeaderContent(child.props.children, actions));
  });

/** 自定义表头单元格：统一隔离调宽、Title 拖列和 sorter 排序三个交互区域。 */
export default function ResizableTitle(props: ResizableHeaderCellProps) {
  const {
    columnId,
    width,
    draggableColumn,
    sortableColumn,
    onColumnResize,
    onColumnReorder,
    className,
    children,
    tabIndex,
    onClick: triggerSort,
    onKeyDown: triggerSortByKeyboard,
    onDragOver,
    onDragLeave,
    onDrop,
    ...cellProps
  } = props;
  // 确定列宽是拖拽计算的唯一坐标系；DOM 宽度只用于兼容无声明宽度的表头。
  const cellRef = useRef<HTMLTableCellElement>(null);
  // 调宽过程保存在 Ref 中，避免 pointermove 高频触发表头自身状态更新。
  const resizeStateRef = useRef<ResizeState>();
  // 仅用于标记当前列是否为有效的列拖拽落点。
  const [dropTarget, setDropTarget] = useState(false);

  // Pointer Capture 让调宽手柄在指针移出表头后仍能持续接收 move/up，无需 document 级监听。
  const handleResizeStart = (event: ReactPointerEvent<HTMLSpanElement>) => {
    event.preventDefault();
    event.stopPropagation();

    const startWidth = resolveResizeStartWidth(width, cellRef.current?.getBoundingClientRect().width);
    resizeStateRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startWidth,
      width: startWidth,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleResizeMove = (event: ReactPointerEvent<HTMLSpanElement>) => {
    const state = resizeStateRef.current;
    // 忽略非当前调宽手势产生的 pointermove。
    if (!state || state.pointerId !== event.pointerId) return;

    state.width = resolveResizedWidth(state.startWidth, event.clientX - state.startX);
    onColumnResize?.(state.width, false);
  };

  const handleResizeEnd = (event: ReactPointerEvent<HTMLSpanElement>) => {
    const state = resizeStateRef.current;
    // pointerup/pointercancel 可能来自其他指针，不能结束当前手势。
    if (!state || state.pointerId !== event.pointerId) return;

    event.stopPropagation();
    resizeStateRef.current = undefined;
    onColumnResize?.(state.width, true);
    // 主动释放捕获，确保浏览器恢复正常的指针分发。
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  /** 写入列 id，开始原生 HTML5 列拖拽。 */
  const handleDragStart = (event: DragEvent<HTMLElement>) => {
    event.stopPropagation();
    event.dataTransfer.setData(DRAG_MIME, columnId ?? '');
    event.dataTransfer.effectAllowed = 'move';
  };

  /** 双击选中完整标题，解决 draggable 元素无法普通框选的问题。 */
  const handleSelectTitle = (element: HTMLElement) => {
    // draggable 元素会优先进入拖拽；双击显式选中完整标题，兼顾整区拖列与 Ctrl+C 复制。
    const selection = window.getSelection();
    // 浏览器未提供 Selection API 时安全退出，不影响其他表头功能。
    if (!selection) return;

    const range = document.createRange();
    range.selectNodeContents(element);
    selection.removeAllRanges();
    selection.addRange(range);
  };

  /** 仅允许 ResizableTable 列拖拽进入 drop 状态。 */
  const handleDragOver = (event: DragEvent<HTMLTableCellElement>) => {
    onDragOver?.(event);
    // 其他拖拽源继续走浏览器默认行为。
    if (!event.dataTransfer.types.includes(DRAG_MIME)) return;

    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    setDropTarget(true);
  };

  /** 指针真正离开当前 th 后才清除落点状态，避免经过子节点时闪烁。 */
  const handleDragLeave = (event: DragEvent<HTMLTableCellElement>) => {
    onDragLeave?.(event);
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDropTarget(false);
  };

  /** 读取源列 id，并交给布局层完成列顺序变更。 */
  const handleDrop = (event: DragEvent<HTMLTableCellElement>) => {
    onDrop?.(event);
    // 非列拖拽不修改当前布局。
    if (!event.dataTransfer.types.includes(DRAG_MIME)) return;

    event.preventDefault();
    setDropTarget(false);
    const sourceId = event.dataTransfer.getData(DRAG_MIME);
    // 源列与目标列都有效时才提交重排。
    if (sourceId && columnId) onColumnReorder?.(sourceId, columnId);
  };

  // 无障碍文案跟随 antd 注入的 aria-sort，保持与下一次排序动作一致。
  let sortTooltip = 'Click to sort ascending';
  // 已升序时，下一次点击进入降序。
  if (cellProps['aria-sort'] === 'ascending') sortTooltip = 'Click to sort descending';
  // 已降序时，下一次点击取消排序。
  if (cellProps['aria-sort'] === 'descending') sortTooltip = 'Click to cancel sorting';

  // 将当前表头能力集中传给 antd children 转换函数，避免各节点自行读取外层状态。
  const actions: HeaderActions = {
    draggable: Boolean(draggableColumn),
    sortTooltip,
    onDragStart: handleDragStart,
    onSelectTitle: handleSelectTitle,
    onSort: triggerSort ? (event) => triggerSort(event as unknown as ReactMouseEvent<HTMLTableCellElement>) : undefined,
    onSortByKeyboard: triggerSortByKeyboard
      ? (event) => triggerSortByKeyboard(event as unknown as ReactKeyboardEvent<HTMLTableCellElement>)
      : undefined,
  };
  // 非排序列没有 antd Title 包装，需要由当前组件补充原生 draggable 容器。
  let title = children;
  // 排序列复用 antd 生成的 Title/sorter，只重新分配各自的事件职责。
  if (sortableColumn) {
    title = renderHeaderContent(children, actions);
    // 非排序普通列将整个标题作为拖拽区。
  } else if (draggableColumn) {
    title = (
      <div
        draggable
        className='min-w-0 cursor-move select-text truncate'
        onDoubleClick={(event) => handleSelectTitle(event.currentTarget)}
        onDragStart={handleDragStart}
      >
        {children}
      </div>
    );
  }
  // antd 默认把排序 cursor/hover 放在整个 th；移除后由 Title 和三角形分别声明交互反馈。
  const cellClassName = className
    ?.split(/\s+/)
    .filter((name) => name !== SORTABLE_CELL_CLASS)
    .join(' ');

  return (
    <th
      {...cellProps}
      ref={cellRef}
      tabIndex={sortableColumn ? undefined : tabIndex}
      className={cn('relative', dropTarget && 'bg-black/5', cellClassName)}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {title}
      {onColumnResize ? (
        <span
          className='absolute top-0 right-0 h-full w-1 cursor-col-resize touch-none select-none'
          onClick={(event) => event.stopPropagation()}
          onPointerDown={handleResizeStart}
          onPointerMove={handleResizeMove}
          onPointerUp={handleResizeEnd}
          onPointerCancel={handleResizeEnd}
        />
      ) : null}
    </th>
  );
}
