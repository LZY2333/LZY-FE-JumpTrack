import { useRef, useState } from 'react';
import type {
  DragEvent,
  MouseEvent as ReactMouseEvent,
  PointerEvent as ReactPointerEvent,
  HTMLAttributes,
} from 'react';
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

export default function ResizableTitle(props: ResizableTitleProps) {
  const { colId, width, onResize, onResizeStop, onReorder, className, children, ...restProps } = props;
  const thRef = useRef<HTMLTableCellElement>(null);
  const titleRef = useRef<HTMLSpanElement>(null);
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

  // 按下点若落在「标题文字」或「调宽手柄」上，则关闭表头拖拽（放行选中/调宽）；
  // 落在标题以外的表头区域才把表头识别为排序拖拽源。
  const handleMouseDown = (e: ReactMouseEvent<HTMLTableCellElement>) => {
    if (!thRef.current) return;
    const target = e.target as Node;
    const onTitle = titleRef.current?.contains(target);
    const onHandle = handleRef.current?.contains(target);
    thRef.current.draggable = !onTitle && !onHandle;
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

  return (
    <th
      ref={thRef}
      className={cn('relative', movable && 'cursor-move', isOver && 'bg-black/5', className)}
      draggable={movable}
      onMouseDown={movable ? handleMouseDown : undefined}
      onDragStart={movable ? handleDragStart : undefined}
      onDragOver={movable ? handleDragOver : undefined}
      onDragLeave={movable ? () => setIsOver(false) : undefined}
      onDrop={movable ? handleDrop : undefined}
      {...restProps}
    >
      <span ref={titleRef} className="cursor-text select-text">
        {children}
      </span>
      {resizable ? (
        <span
          ref={handleRef}
          draggable={false}
          onPointerDown={handlePointerDown}
          onDragStart={(e) => e.preventDefault()}
          className="absolute top-0 right-0 h-full w-1 cursor-col-resize select-none"
        />
      ) : null}
    </th>
  );
}
