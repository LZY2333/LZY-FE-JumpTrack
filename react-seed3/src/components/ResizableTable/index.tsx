import { Table } from 'antd';
import type { TableProps, ColumnsType } from 'antd/es/table';
import useTableLayout from './useTableLayout';
import ResizableTitle from './ResizableTitle';
import ColumnSettings from './ColumnSettings';

// 自定义表头单元格：承载列宽拖拽与列排序拖拽
const components = {
  header: { cell: ResizableTitle },
};

interface ResizableTableProps<T> extends Omit<TableProps<T>, 'columns' | 'components'> {
  columns: ColumnsType<T>;
  /** 传入后按此 key 持久化列宽/顺序/显隐到 localStorage；不传则仅内存态 */
  storageKey?: string;
}

// Table 二次封装：列宽拖拽 + 列排序 + 列显隐 + 布局重置，可选持久化
export default function ResizableTable<T extends object>(props: ResizableTableProps<T>) {
  const { columns, storageKey, ...restProps } = props;
  const { columns: layoutColumns, columnMetas, toggleColumn, reset } = useTableLayout(
    columns,
    storageKey,
  );

  return (
    <div>
      <div className="mb-2 flex justify-end">
        <ColumnSettings columns={columnMetas} onToggle={toggleColumn} onReset={reset} />
      </div>
      <Table<T> columns={layoutColumns} components={components} {...restProps} />
    </div>
  );
}
