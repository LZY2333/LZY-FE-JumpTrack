import { Button, Checkbox, Popover, Space, Tooltip } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import type { ColumnMeta } from './useTableLayout';

interface ColumnSettingsProps {
  /** 按当前列顺序展示的设置项。 */
  columns: ColumnMeta[];
  /** 切换指定列显隐。 */
  onToggle: (colId: string) => void;
  /** 恢复源码默认布局。 */
  onReset: () => void;
}

// 列设置弹层：勾选控制列显隐 + 一键重置整个表格布局。
export default function ColumnSettings({ columns, onToggle, onReset }: ColumnSettingsProps) {
  // 用于禁用最后一个可见列，界面层与布局层共同保证至少保留一列。
  const visibleCount = columns.filter((column) => column.visible).length;
  // content 独立声明，避免 Popover 主结构中混入设置列表细节。
  const content = (
    <div className='flex min-w-32 flex-col gap-1'>
      <Space direction='vertical' size={4}>
        {columns.map((col) => (
          <Checkbox
            key={col.colId}
            checked={col.visible}
            disabled={col.visible && visibleCount === 1}
            onChange={() => onToggle(col.colId)}
          >
            {col.title}
          </Checkbox>
        ))}
      </Space>
      <div className='flex justify-end border-t border-gray-100 pt-1'>
        <Button type='text' size='small' className='app-text-button px-0' onClick={onReset}>
          Reset
        </Button>
      </div>
    </div>
  );

  return (
    <Popover content={content} trigger='click' placement='bottomRight'>
      <Tooltip title='Columns'>
        <Button shape='circle' icon={<SettingOutlined />} size='small' />
      </Tooltip>
    </Popover>
  );
}
