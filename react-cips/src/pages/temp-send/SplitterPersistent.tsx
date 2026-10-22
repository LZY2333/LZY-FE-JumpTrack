import { useRef } from 'react';
import type { ReactNode } from 'react';
import { Splitter } from 'antd';
import { useLocalStorageState, useSize } from 'ahooks';

/** 持久化分栏属性 */
interface SplitterPersistentProps {
  /** 宽度存储键 */
  storageKey: string;
  /** 左侧内容，接收紧凑布局状态 */
  left: (compact: boolean) => ReactNode;
  /** 右侧内容 */
  right: ReactNode;
}

const COMPACT_WIDTH = 760;

/** 拖拽分栏并记录宽度比例 */
const SplitterPersistent = ({ storageKey, left, right }: SplitterPersistentProps) => {
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const leftSize = useSize(leftPanelRef);
  const [leftPercent, setLeftPercent] = useLocalStorageState<number>(storageKey, { defaultValue: 60 });

  const handleResizeEnd = ([leftWidth, rightWidth]: number[]) => {
    setLeftPercent((leftWidth / (leftWidth + rightWidth)) * 100);
  };

  return (
    <Splitter onResizeEnd={handleResizeEnd}>
      <Splitter.Panel defaultSize={`${leftPercent}%`} min='25%' max='75%'>
        <div ref={leftPanelRef} className='h-full overflow-hidden pr-3'>
          {left((leftSize?.width ?? COMPACT_WIDTH) < COMPACT_WIDTH)}
        </div>
      </Splitter.Panel>
      <Splitter.Panel min='25%'>
        <div className='flex h-full min-h-0 min-w-0 flex-col overflow-hidden pl-3'>{right}</div>
      </Splitter.Panel>
    </Splitter>
  );
};

export default SplitterPersistent;
