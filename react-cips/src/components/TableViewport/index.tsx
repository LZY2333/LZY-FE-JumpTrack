import classNames from 'classnames';
import { cloneElement, useLayoutEffect, useRef, useState } from 'react';
import type { ReactElement } from 'react';
import type { TableProps } from 'antd';

const FILL_TABLE_CLASS_NAME =
  'h-full [&_.ant-spin-nested-loading]:h-full [&_.ant-spin-container]:flex [&_.ant-spin-container]:h-full [&_.ant-spin-container]:flex-col [&_.ant-table]:min-h-0 [&_.ant-table]:flex-1 [&_.ant-table]:overflow-hidden [&_.ant-table-container]:flex [&_.ant-table-container]:h-full [&_.ant-table-container]:flex-col [&_.ant-table-header]:shrink-0 [&_.ant-table-body]:min-h-0 [&_.ant-table-body]:flex-1 [&_.ant-table-placeholder]:h-full';

interface TableViewportProps<RecordType extends object> {
  /** 需要自适应剩余高度并由视口注入滚动配置的 Ant Design Table。 */
  children: ReactElement<TableProps<RecordType>>;
}

/** 表格自适应视口：占满父级剩余高度，并为子 Table 注入横纵向滚动配置。 */
const TableViewport = <RecordType extends object,>({ children }: TableViewportProps<RecordType>) => {
  const [tableBodyHeight, setTableBodyHeight] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const records = children.props.dataSource ?? [];

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
      {cloneElement(children, {
        className: classNames(FILL_TABLE_CLASS_NAME, children.props.className),
        scroll: {
          x: records.length > 0 ? 'max-content' : undefined,
          y: tableBodyHeight,
        },
      })}
    </div>
  );
};

export default TableViewport;
