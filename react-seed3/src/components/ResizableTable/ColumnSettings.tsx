import { Button, Checkbox, Popover } from 'antd';
import { SettingOutlined } from '@ant-design/icons';
import type { ColumnMeta } from './useTableLayout';

interface ColumnSettingsProps {
  columns: ColumnMeta[];
  onToggle: (colId: string) => void;
  onReset: () => void;
}

// 列设置弹层：勾选控制列显隐 + 一键重置整个表格布局。
// 每个 Checkbox 各包一层 div，打断相邻 checkbox-wrapper 关系，避免 antd 给次项加 margin-left 导致缩进不齐。
export default function ColumnSettings({ columns, onToggle, onReset }: ColumnSettingsProps) {
  const content = (
    <div className="flex min-w-32 flex-col gap-1">
      {columns.map((col) => (
        <div key={col.colId}>
          <Checkbox checked={col.visible} onChange={() => onToggle(col.colId)}>
            {col.title}
          </Checkbox>
        </div>
      ))}
      <div className="flex justify-end border-t border-gray-100">
        <Button type="link" size="small" className="px-0" onClick={onReset}>
          Reset
        </Button>
      </div>
    </div>
  );

  return (
    <Popover content={content} trigger="click" placement="bottomRight">
      <Button icon={<SettingOutlined />} size="small">
        Columns
      </Button>
    </Popover>
  );
}
