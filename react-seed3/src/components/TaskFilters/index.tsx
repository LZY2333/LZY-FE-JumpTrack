import { useEffect, useMemo, useState } from 'react';
import { Button, Col, DatePicker, Form, Input, Row, Select } from 'antd';
import type { Moment } from 'moment';
import { debounce } from 'lodash';
import { TaskStatus } from '@/types/enums';

interface Props {
  status: string;
  dateRange: [Moment, Moment] | null;
  onStatusChange: (value: string) => void;
  onCusIdChange: (value: string) => void;
  onDateRangeChange: (value: [Moment, Moment] | null) => void;
  onReset: () => void;
}

export default function TaskFilters({
  status,
  dateRange,
  onStatusChange,
  onCusIdChange,
  onDateRangeChange,
  onReset,
}: Props) {
  // 客户号即时回显（本地态），300ms 后才把最终值抛给上层发起查询
  const [cusIdInput, setCusIdInput] = useState('');

  const applyCusId = useMemo(
    () => debounce((value: string) => onCusIdChange(value), 300),
    [onCusIdChange],
  );
  useEffect(() => () => applyCusId.cancel(), [applyCusId]);

  const handleReset = () => {
    applyCusId.cancel();
    setCusIdInput('');
    onReset();
  };

  return (
    <Form layout="horizontal" labelAlign="left" labelCol={{ span: 7 }} wrapperCol={{ span: 17 }} className="mb-4">
      <Row gutter={16}>
        <Col span={7}>
          <Form.Item label="Status" className="mb-0">
            <Select
              value={status}
              onChange={onStatusChange}
              className="w-full"
              options={[
                { value: '', label: 'All Statuses' },
                { value: TaskStatus.Pending, label: 'Pending' },
                { value: TaskStatus.Cancelled, label: 'Cancelled' },
                { value: TaskStatus.Submitted, label: 'Submitted' },
                { value: TaskStatus.Returned, label: 'Returned' },
                { value: TaskStatus.Approved, label: 'Approved' },
              ]}
            />
          </Form.Item>
        </Col>
        <Col span={7}>
          <Form.Item label="Customer ID" className="mb-0">
            <Input
              allowClear
              placeholder="Filter by Customer ID (CIF)"
              value={cusIdInput}
              onChange={(e) => {
                setCusIdInput(e.target.value);
                applyCusId(e.target.value);
              }}
            />
          </Form.Item>
        </Col>
        <Col span={7}>
          <Form.Item label="Created Date" className="mb-0">
            <DatePicker.RangePicker
              className="w-full"
              value={dateRange}
              onChange={(range) => onDateRangeChange(range?.[0] && range?.[1] ? [range[0] as Moment, range[1] as Moment] : null)}
            />
          </Form.Item>
        </Col>
        <Col span={3} className="flex items-center justify-end">
          <Button onClick={handleReset}>Reset</Button>
        </Col>
      </Row>
    </Form>
  );
}
