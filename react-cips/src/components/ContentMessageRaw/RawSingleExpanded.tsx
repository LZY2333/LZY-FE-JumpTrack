import { useLayoutEffect, useRef, useState } from 'react';
import type { KeyboardEvent, PointerEvent, Ref } from 'react';
import type { MessageRaw } from '@/api/messages';
import RawSingle from './RawSingle';
import type { RawSingleRef } from './RawSingle';

const STORAGE_KEY = 'message-raw-expanded-height';
const DEFAULT_HEIGHT = 384;
const MIN_HEIGHT = 192;
const MAX_HEIGHT = 960;

/** 可调整高度的单条原文容器，提供展开动画、底部拖拽及高度记忆 */
const RawSingleExpanded = ({ raw, singleRef, expanded }: RawSingleExpandedProps) => {
  const resize = useRawHeight();
  return (
    <div
      ref={resize.containerRef}
      data-message-raw-expanded={expanded}
      className='flex min-h-0 flex-col overflow-hidden'
    >
      <RawSingle ref={singleRef} raw={raw} />
      <div
        role='separator'
        tabIndex={0}
        aria-label='Resize raw message height'
        aria-orientation='horizontal'
        aria-valuemin={resize.minHeight}
        aria-valuemax={resize.maxHeight}
        aria-valuenow={resize.height}
        title='Drag to resize; use Up/Down keys to adjust height'
        className='flex h-3 shrink-0 touch-none cursor-row-resize select-none items-center justify-center'
        onPointerDown={resize.handlePointerDown}
        onPointerMove={resize.handlePointerMove}
        onPointerUp={resize.handlePointerEnd}
        onPointerCancel={resize.handlePointerEnd}
        onLostPointerCapture={resize.handlePointerEnd}
        onKeyDown={resize.handleKeyDown}
      >
        <span className='h-1 w-10 rounded bg-gray-400' />
      </div>
    </div>
  );
};

export default RawSingleExpanded;

/** 列表原文展开区参数 */
interface RawSingleExpandedProps {
  /** 当前行原文 */
  raw: MessageRaw;
  /** 首条原文的外部操作引用 */
  singleRef?: Ref<RawSingleRef>;
  /** 当前行是否展开，用于重新播放入场动画 */
  expanded: boolean;
}

/** 原文调高手势快照 */
interface RawResizeState {
  /** 捕获的指针 */
  pointerId: number;
  /** 起始纵坐标 */
  startY: number;
  /** 起始高度 */
  startHeight: number;
}

/** 管理列表原文展开高度，拖拽结束后保存用户偏好 */
const useRawHeight = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const resizeRef = useRef<RawResizeState>();
  const [height, setHeight] = useState(readHeight);
  const heightRef = useRef(height);

  useLayoutEffect(() => {
    // 动态像素值通过 CSS 变量传入，布局和动画规则统一在全局样式维护
    containerRef.current?.style.setProperty('--message-raw-height', `${height}px`);
  }, [height]);

  const updateHeight = (value: number) => {
    const nextHeight = Math.max(MIN_HEIGHT, Math.min(MAX_HEIGHT, Math.round(value)));
    heightRef.current = nextHeight;
    setHeight(nextHeight);
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    resizeRef.current = { pointerId: event.pointerId, startY: event.clientY, startHeight: heightRef.current };
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const resize = resizeRef.current;
    if (!resize || resize.pointerId !== event.pointerId) return;
    updateHeight(resize.startHeight + event.clientY - resize.startY);
  };

  const handlePointerEnd = (event: PointerEvent<HTMLDivElement>) => {
    if (resizeRef.current?.pointerId !== event.pointerId) return;
    resizeRef.current = undefined;
    saveHeight(heightRef.current);
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;
    event.preventDefault();
    updateHeight(heightRef.current + (event.key === 'ArrowUp' ? -24 : 24));
    saveHeight(heightRef.current);
  };

  return {
    containerRef,
    height,
    minHeight: MIN_HEIGHT,
    maxHeight: MAX_HEIGHT,
    handlePointerDown,
    handlePointerMove,
    handlePointerEnd,
    handleKeyDown,
  };
};

const readHeight = () => {
  try {
    const value = Number(localStorage.getItem(STORAGE_KEY));
    return Number.isFinite(value) && value >= MIN_HEIGHT && value <= MAX_HEIGHT ? value : DEFAULT_HEIGHT;
  } catch {
    return DEFAULT_HEIGHT;
  }
};

const saveHeight = (height: number) => {
  try {
    localStorage.setItem(STORAGE_KEY, String(height));
  } catch {
    // 存储不可用时保留本次拖拽结果
  }
};
