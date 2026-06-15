import { useEffect, useState } from 'react';
import { Button, Card, Col, DatePicker, Form, Input, InputNumber, List, Modal, Radio, Row, Upload } from 'antd';
import { DeleteOutlined, FileOutlined, UploadOutlined } from '@ant-design/icons';
import type { Moment } from 'moment';
import moment from 'moment';
import type { TaskDetail } from '@/types/task';

interface Attachment {
  name: string;
  uid: string;
}

interface Props {
  task: TaskDetail;
  readonly?: boolean;
  modifiedFields?: string[];
}

const customerFields = (task: TaskDetail) => [
  { label: 'Customer Type', value: task.customerType },
  { label: 'Customer Name', value: task.customerName },
  { label: 'Date of Birth', value: task.dateOfBirth },
  { label: 'CIF', value: task.cif },
  { label: 'Savings Account', value: task.savingsAccount },
  { label: 'Securities Account', value: task.securitiesAccount },
  { label: 'Fund Account', value: task.fundAccount },
  { label: 'Custodian Account', value: task.custodianAccount },
];

export default function TaskForm({ task, readonly = false, modifiedFields = [] }: Props) {
  const [form] = Form.useForm();
  const [changedFields, setChangedFields] = useState<Set<string>>(new Set());
  const [attachments, setAttachments] = useState<Attachment[]>(task.attachments);

  useEffect(() => {
    form.setFieldsValue({
      ourRef: task.ourRef,
      yourRef: task.yourRef,
      aipDate: task.aipDate ? moment(task.aipDate) : null,
      aipExpiryDate: task.aipExpiryDate ? moment(task.aipExpiryDate) : null,
      faDate: task.faDate ? moment(task.faDate) : null,
      ciesTerminationDate: task.ciesTerminationDate ? moment(task.ciesTerminationDate) : null,
      transferred3M: task.transferred3M,
      withdrawableHKD: task.withdrawableInterests.HKD,
      withdrawableUSD: task.withdrawableInterests.USD,
      transferredHKD: task.transferredInterests.HKD,
      transferredUSD: task.transferredInterests.USD,
    });
    setAttachments(task.attachments);
  }, [task, form]);

  // Maker 模式：用户手动改过的字段加黄色边框；Checker 模式：Maker 已保存的修改字段加黄色背景
  // 两种高亮来源不同，故用不同样式区分
  const hl = (field: string) => {
    if (readonly) return modifiedFields.includes(field) ? 'rounded bg-yellow-100 px-2 pt-1' : '';
    return changedFields.has(field) ? 'rounded ring-2 ring-yellow-400' : '';
  };

  const handleValuesChange = (changed: Record<string, unknown>) => {
    // aipExpiryDate 由系统自动计算，不应算作用户修改，排除在高亮范围之外
    const manual = Object.keys(changed).filter(k => k !== 'aipExpiryDate');
    if (manual.length) setChangedFields(prev => new Set([...prev, ...manual]));

    if ('aipDate' in changed && task.customerType === 'CIES 2.0') {
      const d = changed.aipDate as Moment | null;
      // setFieldsValue 在 onValuesChange 内调用是安全的：antd 只对用户交互触发 onValuesChange，
      // 程序调用 setFieldsValue 不会再次触发，不存在无限循环风险
      form.setFieldsValue({ aipExpiryDate: d ? d.clone().add(180, 'days') : null });
    }
  };

  // T-17: delete attachment with confirm
  const handleDelete = (uid: string) => {
    Modal.confirm({
      title: 'Confirm Delete',
      onOk: () => setAttachments(prev => prev.filter(a => a.uid !== uid)),
    });
  };

  return (
    <Row gutter={16}>
      {/* Left: customer info + editable form */}
      <Col span={15}>
        {/* T-10: read-only customer info */}
        <Card title="客户基本信息" size="small" className="mb-4">
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            {customerFields(task).map(({ label, value }) => (
              <div key={label}>
                <div className="mb-1 text-xs text-gray-500">{label}</div>
                <Input disabled value={value} />
              </div>
            ))}
          </div>
        </Card>

        {/* T-11 / T-12 / T-13 / T-14: editable fields */}
        <Card title="申报信息" size="small">
          <Form form={form} layout="vertical" disabled={readonly} onValuesChange={handleValuesChange}>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item name="ourRef" label="Our Ref" required className={hl('ourRef')}>
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="yourRef" label="Your Ref" required className={hl('yourRef')}>
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="aipDate" label="AIP Date" className={hl('aipDate')}>
                  <DatePicker className="w-full" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="aipExpiryDate" label="AIP Expiry Date（系统计算）">
                  <DatePicker className="w-full" disabled />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="faDate" label="FA Date" className={hl('faDate')}>
                  <DatePicker className="w-full" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="ciesTerminationDate" label="CIES Termination Date" className={hl('ciesTerminationDate')}>
                  <DatePicker className="w-full" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item name="transferred3M" label="Transferred 3M" required className={hl('transferred3M')}>
                  <Radio.Group>
                    <Radio value="Y">Y</Radio>
                    <Radio value="N">N</Radio>
                  </Radio.Group>
                </Form.Item>
              </Col>
            </Row>

            {/* T-14: interest fields */}
            <Row gutter={16} className="mt-2 border-t pt-4">
              <Col span={12}>
                <div className="mb-2 text-sm font-medium">Withdrawable Interests</div>
                <Form.Item name="withdrawableHKD" label="HKD" className={hl('withdrawableHKD')}>
                  <InputNumber className="w-full" min={0} />
                </Form.Item>
                <Form.Item name="withdrawableUSD" label="USD" className={hl('withdrawableUSD')}>
                  <InputNumber className="w-full" min={0} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <div className="mb-2 text-sm font-medium">Transferred Interests</div>
                <Form.Item name="transferredHKD" label="HKD" className={hl('transferredHKD')}>
                  <InputNumber className="w-full" min={0} />
                </Form.Item>
                <Form.Item name="transferredUSD" label="USD" className={hl('transferredUSD')}>
                  <InputNumber className="w-full" min={0} />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Card>
      </Col>

      {/* Right: T-15 / T-16 / T-17 attachment area */}
      <Col span={9}>
        <Card title="附件 (Attachment)" size="small">
          <List
            size="small"
            dataSource={attachments}
            renderItem={att => (
              <List.Item
                actions={
                  readonly
                    ? []
                    : [
                        <Button
                          key="del"
                          type="text"
                          danger
                          size="small"
                          icon={<DeleteOutlined />}
                          onClick={() => handleDelete(att.uid)}
                        />,
                      ]
                }
              >
                <FileOutlined className="mr-2 text-gray-400" />
                <span>{att.name}</span>
              </List.Item>
            )}
          />
          {!readonly && (
            <Upload
              beforeUpload={file => {
                setAttachments(prev => [...prev, { name: file.name, uid: file.uid }]);
                return false;
              }}
              showUploadList={false}
            >
              <Button icon={<UploadOutlined />} size="small" className="mt-2">
                Upload
              </Button>
            </Upload>
          )}
        </Card>
      </Col>
    </Row>
  );
}
