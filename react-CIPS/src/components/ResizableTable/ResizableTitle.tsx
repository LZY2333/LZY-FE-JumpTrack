import { Children, cloneElement, isValidElement, useRef, useState } from 'react';
import type {
  DragEvent,
  KeyboardEvent as ReactKeyboardEvent,
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
  HTMLAttributes,
  ReactNode,
} from 'react';
import { Tooltip } from 'antd';
import cn from 'classnames';

interface ResizableTitleProps extends Omit<HTMLAttributes<HTMLTableCellElement>, 'onResize'> {
  /** 列 id，列排序时标识源/目标列 */
  colId?: string;
  /** 当前列宽；弹性列可不设，按下时以实际渲染宽度为起点 */
  width?: number;
  /** 调宽过程中实时回传新列宽 */
  onResize?: (width: number) => void;
  /** 调宽结束回传最终列宽（用于持久化） */
  onResizeStop?: (width: number) => void;
  /** 列拖拽排序：把 sourceId 移动到 targetId 之前 */
  onReorder?: (sourceId: string, targetId: string) => void;
}

const MIN_WIDTH = 50;
// 自定义拖拽标识，避免与页面其它拖拽源混淆
const DRAG_MIME = 'application/x-resizable-col';
const SORTER_CLASS = 'ant-table-column-sorter';

interface SorterNodeProps {
  className?: string;
  children?: ReactNode;
  role?: string;
  tabIndex?: number;
  'aria-label'?: string;
}

const isSorterTarget = (target: EventTarget | null) =>
  target instanceof Element && Boolean(target.closest(`.${SORTER_CLASS}`));

/** 找到 antd 注入的排序图标，仅为图标补充 Tooltip 与键盘焦点。 */
const decorateSorter = (node: ReactNode, tooltip: string): ReactNode => {
  if (!isValidElement<SorterNodeProps>(node)) return node;

  const classNames = node.props.className?.split(/\s+/) ?? [];
  if (classNames.includes(SORTER_CLASS)) {
    const trigger = cloneElement(node, {
      role: 'button',
      tabIndex: 0,
      'aria-label': tooltip,
    });
    return <Tooltip title={tooltip}>{trigger}</Tooltip>;
  }

  if (node.props.children == null) return node;
  return cloneElement(node, undefined, Children.map(node.props.children, (child) => decorateSorter(child, tooltip)));
};

export default function ResizableTitle(props: ResizableTitleProps) {
  const {
    colId,
    width,
    onResize,
    onResizeStop,
    onReorder,
    className,
    children,
    onClick: triggerSort,
    onKeyDown: triggerSortByKeyboard,
    ...restProps
  } = props;
  const thRef = useRef<HTMLTableCellElement>(null);
  const handleRef = useRef<HTMLSpanElement>(null);
  const startX = useRef(0);
  const startWidth = useRef(0);
  const latestWidth = useRef(0);
  const [isOver, setIsOver] = useState(false);

  const movable = Boolean(colId && onReorder); // 可拖拽排序
  const resizable = Boolean(onResize); // 可调宽（封装给每列都注入了回调）

  // ==== 列宽拖拽：右侧手柄，用 pointer 事件监听全局移动/抬起 ====
  const handlePointerMove = (e: PointerEvent) => {
    const next = Math.max(MIN_WIDTH, startWidth.current + (e.clientX - startX.current));
    latestWidth.current = next;
    onResize?.(next);
  };

  const handlePointerUp = () => {
    document.removeEventListener('pointermove', handlePointerMove);
    document.removeEventListener('pointerup', handlePointerUp);
    document.body.classList.remove('select-none');
    onResizeStop?.(latestWidth.current);
  };

  const handlePointerDown = (e: ReactPointerEvent<HTMLSpanElement>) => {
    e.preventDefault();
    // 弹性列（未显式设 width）以当前实际渲染宽度为起点
    const base = width ?? thRef.current?.offsetWidth ?? MIN_WIDTH;
    startX.current = e.clientX;
    startWidth.current = base;
    latestWidth.current = base;
    document.body.classList.add('select-none');
    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
  };

  // 排序图标和调宽手柄各自处理交互，其余整个表头区域均可拖拽列顺序。
  const handleMouseDown = (e: ReactMouseEvent<HTMLTableCellElement>) => {
    if (!thRef.current) return;
    const target = e.target as Node;
    const onHandle = handleRef.current?.contains(target);
    thRef.current.draggable = !isSorterTarget(e.target) && !onHandle;
  };

  // antd 把排序回调注入 th；这里只在实际点击排序图标时转发。
  const handleClick = (e: ReactMouseEvent<HTMLTableCellElement>) => {
    if (isSorterTarget(e.target)) triggerSort?.(e);
  };

  const handleKeyDown = (e: ReactKeyboardEvent<HTMLTableCellElement>) => {
    if (isSorterTarget(e.target)) triggerSortByKeyboard?.(e);
  };

  // ==== 列排序拖拽 ====
  const handleDragStart = (e: DragEvent<HTMLTableCellElement>) => {
    e.dataTransfer.setData(DRAG_MIME, colId ?? '');
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: DragEvent<HTMLTableCellElement>) => {
    if (!e.dataTransfer.types.includes(DRAG_MIME)) return;
    e.preventDefault(); // 允许 drop
    e.dataTransfer.dropEffect = 'move';
    if (!isOver) setIsOver(true);
  };

  const handleDrop = (e: DragEvent<HTMLTableCellElement>) => {
    e.preventDefault();
    setIsOver(false);
    const sourceId = e.dataTransfer.getData(DRAG_MIME);
    if (sourceId && colId) onReorder?.(sourceId, colId);
  };

  const sortTooltip =
    restProps['aria-sort'] === 'ascending'
      ? 'Click to sort descending'
      : restProps['aria-sort'] === 'descending'
        ? 'Click to cancel sorting'
        : 'Click to sort ascending';
  const title = triggerSort ? decorateSorter(children, sortTooltip) : children;

  return (
    <th
      {...restProps}
      ref={thRef}
      className={cn('relative', movable && '!cursor-move', isOver && 'bg-black/5', className)}
      draggable={movable}
      tabIndex={triggerSort ? undefined : restProps.tabIndex}
      onMouseDown={movable ? handleMouseDown : undefined}
      onClick={triggerSort ? handleClick : undefined}
      onKeyDown={triggerSortByKeyboard ? handleKeyDown : undefined}
      onDragStart={movable ? handleDragStart : undefined}
      onDragOver={movable ? handleDragOver : undefined}
      onDragLeave={movable ? () => setIsOver(false) : undefined}
      onDrop={movable ? handleDrop : undefined}
    >
      <span className='block'>{title}</span>
      {resizable ? (
        <span
          ref={handleRef}
          draggable={false}
          onPointerDown={handlePointerDown}
          onDragStart={(e) => e.preventDefault()}
          className='absolute top-0 right-0 h-full w-1 cursor-col-resize select-none'
        />
      ) : null}
    </th>
  );
}
