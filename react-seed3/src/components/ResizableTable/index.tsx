import { Table } from 'antd';
import type { TableProps, ColumnsType } from 'antd/es/table';
import useTableLayout from './useTableLayout';
import ResizableTitle from './ResizableTitle';
import ColumnSettings from './ColumnSettings';
import { resolveResetPageSize } from './resizableTableUtil';

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
  const { columns, storageKey, pagination, scroll, ...restProps } = props;
  const { columns: layoutColumns, columnMetaList, toggleColumn, reset } = useTableLayout(columns, storageKey);
  // 分页器默认用 small 尺寸，更紧凑；调用方传入 pagination.size 时可覆盖
  const mergedPagination = pagination === false ? false : { size: 'small' as const, ...pagination };
  // 可调宽表格默认按列实际宽度扩展，避免拖动右边界时挤压其他列；调用方可覆盖 x。
  const mergedScroll = { x: 'max-content' as const, ...scroll };
  const handleSettingsReset = () => {
    if (pagination) {
      pagination.onChange?.(1, resolveResetPageSize(pagination));
    }
    reset();
  };

  return (
    <div className='relative'>
      {/* 列设置贴在表格右上角（表头行内），不单独占行，避免挤压表格可用高度 */}
      <div className='absolute top-2 right-2 z-10'>
        <ColumnSettings columns={columnMetaList} onToggle={toggleColumn} onReset={handleSettingsReset} />
      </div>
      <Table<T>
        columns={layoutColumns}
        components={components}
        pagination={mergedPagination}
        scroll={mergedScroll}
        {...restProps}
        showSorterTooltip={false}
      />
    </div>
  );
}
