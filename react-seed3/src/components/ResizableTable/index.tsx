import { Table } from 'antd';
import type { ColumnsType, TableProps } from 'antd/es/table';
import ColumnSettings from './ColumnSettings';
import ResizableTitle from './ResizableTitle';
import useTableLayout from './useTableLayout';

// 通过 antd Table 原生 components 扩展点替换表头单元格，不改写表体行为。
const components = { header: { cell: ResizableTitle } };

interface ResizableTableProps<T> extends Omit<TableProps<T>, 'columns' | 'components'> {
  /** 调用方提供的原始列定义，布局层不会修改其对象。 */
  columns: ColumnsType<T>;
  /** 配置后持久化列宽、顺序和显隐；缺省时只保存于内存。 */
  storageKey?: string;
}

/** 在 antd Table 之上组合列布局管理和列设置入口。 */
export default function ResizableTable<T extends object>(props: ResizableTableProps<T>) {
  // tableLayout 默认 fixed，确保数值列宽不参与内容自适应计算。
  const { columns, storageKey, pagination, scroll, tableLayout = 'fixed', ...tableProps } = props;
  // layout 是列布局的唯一来源，封装最终列、总宽度和设置操作。
  const layout = useTableLayout(columns, storageKey);

  return (
    <div>
      <div className='mb-2 flex justify-end'>
        <ColumnSettings
          columns={layout.columnMetaList}
          onToggle={layout.toggleColumn}
          onReset={layout.reset}
        />
      </div>
      {/* false 关闭分页；调用方仍可覆盖分页细节和布局层计算的 scroll.x。 */}
      <Table<T>
        {...tableProps}
        columns={layout.columns}
        components={components}
        pagination={pagination === false ? false : { size: 'small', ...pagination }}
        scroll={{ x: layout.tableWidth, ...scroll }}
        tableLayout={tableLayout}
        showSorterTooltip={false}
      />
    </div>
  );
}
