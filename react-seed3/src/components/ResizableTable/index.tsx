import { Table } from 'antd';
import type { TableColumnsType, TableProps } from 'antd';
import ColumnSettings from './ColumnSettings';
import ResizableTitle from './ResizableTitle';
import useTableLayout from './useTableLayout';

// 通过 antd Table 原生 components 扩展点替换表头单元格，不改写表体行为。
const components = { header: { cell: ResizableTitle } };

type ResizableTableScroll<T> = Omit<NonNullable<TableProps<T>['scroll']>, 'x'>;

interface ResizableTableProps<T> extends Omit<TableProps<T>, 'columns' | 'components' | 'scroll' | 'tableLayout'> {
  /** 调用方提供的原始列定义，布局层不会修改其对象。 */
  columns: TableColumnsType<T>;
  /** 配置后持久化列宽、顺序和显隐；缺省时只保存于内存。 */
  storageKey?: string;
  /** 横向布局由组件统一管理；调用方只配置纵向滚动。 */
  scroll?: ResizableTableScroll<T>;
}

/** 在 antd Table 之上组合列布局管理和列设置入口。 */
export default function ResizableTable<T extends object>(props: ResizableTableProps<T>) {
  const { columns, storageKey, pagination, scroll, ...tableProps } = props;
  // layout 是列布局的唯一来源，封装最终列、总宽度和设置操作。
  const layout = useTableLayout(columns, storageKey);

  return (
    <div className='relative'>
      <div className='absolute right-4 top-4 z-10'>
        <ColumnSettings columns={layout.columnMetaList} onToggle={layout.toggleColumn} onReset={layout.reset} />
      </div>
      {/* fixed 与 scroll.x 是列宽模型的不变量，不开放给调用方覆盖。 */}
      <Table<T>
        {...tableProps}
        columns={layout.columns}
        components={components}
        pagination={pagination === false ? false : { size: 'small', ...pagination }}
        scroll={{ ...scroll, x: layout.tableWidth }}
        tableLayout='fixed'
        showSorterTooltip={{ target: 'sorter-icon' }}
      />
    </div>
  );
}
