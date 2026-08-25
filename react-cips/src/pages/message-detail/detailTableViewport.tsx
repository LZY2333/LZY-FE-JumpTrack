import { useLayoutEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';

// 将 antd Table 的内部容器串成纵向 Flex，使 scroll.y 从最大高度约束变为实际剩余高度。
export const FILL_TABLE_CLASS_NAME =
  'h-full [&_.ant-spin-nested-loading]:h-full [&_.ant-spin-container]:flex [&_.ant-spin-container]:h-full [&_.ant-spin-container]:flex-col [&_.ant-table]:min-h-0 [&_.ant-table]:flex-1 [&_.ant-table]:overflow-hidden [&_.ant-table-container]:flex [&_.ant-table-container]:h-full [&_.ant-table-container]:flex-col [&_.ant-table-header]:shrink-0 [&_.ant-table-body]:min-h-0 [&_.ant-table-body]:flex-1 [&_.ant-table-placeholder]:h-full';

interface DetailTableViewportProps {
  /** 根据视口扣除表头后的高度渲染表格。 */
  children: (tableBodyHeight: number) => ReactNode;
}

/** 明细 Tab 表格视口：占满父级余高，并把实际表体高度桥接给 antd Table。 */
const DetailTableViewport = ({ children }: DetailTableViewportProps) => {
  const [tableBodyHeight, setTableBodyHeight] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    /** 容器变化时同步表体可用高度，覆盖窗口缩放和隐藏 Tab 激活。 */
    const updateTableBodyHeight = () => {
      const header = container.querySelector<HTMLElement>('.ant-table-thead');
      const nextHeight = Math.max(container.clientHeight - (header?.offsetHeight ?? 0), 0);
      setTableBodyHeight((currentHeight) => (currentHeight === nextHeight ? currentHeight : nextHeight));
    };

    updateTableBodyHeight();
    const observer = new ResizeObserver(updateTableBodyHeight);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className='min-h-0 flex-1 overflow-hidden'>
      {children(tableBodyHeight)}
    </div>
  );
};

export default DetailTableViewport;
