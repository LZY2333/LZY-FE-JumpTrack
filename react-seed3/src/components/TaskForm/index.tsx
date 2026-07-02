import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { Button, Card, Col, Form, List, Modal, Row, Upload, message } from 'antd';
import type { RcFile } from 'antd/es/upload';
import { DeleteOutlined, FileOutlined, UploadOutlined } from '@ant-design/icons';
import moment from 'moment';
import type { Attachment, Customer } from '@/types';
import {
  AipDate,
  AipExpiryDate,
  CiesTerminationDate,
  Cif,
  CURRENCY_FIELDS,
  CustodianAccount,
  CustomerName,
  CustomerType,
  DateOfBirth,
  FaDate,
  FundAccount,
  OurRef,
  SavingsAccount,
  SecuritiesAccount,
  Transferred3M,
  YourRef,
} from '@/components/FormItem';

interface Props {
  customer: Customer;
  attachments: Attachment[];
  readonly?: boolean;
}

export interface TaskFormValues {
  customer: Customer;
  attachments: Attachment[];
}

export interface TaskFormRef {
  // 先做字段校验，校验通过才返回表单值；不通过则 reject（antd 自动定位到首个错误项）
  validate: () => Promise<TaskFormValues>;
}

const HIGHLIGHT = 'rounded ring-2 ring-primary';
// 附件上传限制
const ALLOWED_TYPES = ['application/pdf', 'image/png', 'image/jpeg'];
const MAX_SIZE_MB = 10;

type Path = string | (string | number)[];
const at = (obj: unknown, path: Path): unknown =>
  (Array.isArray(path) ? path : [path]).reduce<unknown>(
    (acc, key) => (acc == null ? undefined : (acc as Record<string | number, unknown>)[key]),
    obj,
  );

const TaskForm = forwardRef<TaskFormRef, Props>(
  ({ customer, attachments: initialAttachments, readonly = false }, ref) => {
    const [form] = Form.useForm();
    // values 跟踪当前表单值，customer 为后端下发的基线；高亮逻辑由调用方（本组件）持有，
    // 字段组件本身保持通用、无高亮。表单存储已与 Customer 同构，可直接按路径比较。
    const [values, setValues] = useState<Customer>(customer);
    const [attachments, setAttachments] = useState<Attachment[]>(initialAttachments);

    useEffect(() => {
      setAttachments(initialAttachments);
    }, [initialAttachments]);

    useImperativeHandle(
      ref,
      () => ({
        validate: () =>
          form.validateFields().then(() => ({
            customer: { ...customer, ...form.getFieldsValue(true) },
            attachments,
          })),
      }),
      [customer, form, attachments],
    );

    // 当前输入值与基线不同即高亮，仅用于可修改字段；常驻 transition 让高亮淡入淡出
    const hl = (path: Path) =>
      `transition-all duration-300 ${at(values, path) !== at(customer, path) ? HIGHLIGHT : ''}`;

    const handleValuesChange = (changed: Customer) => {
      if ('aipDate' in changed && customer.customerType === 'CIES 2.0') {
        const aip = form.getFieldValue('aipDate') as string;
        form.setFieldsValue({ aipExpiryDate: aip ? moment(aip).add(180, 'days').format('YYYY-MM-DD') : '' });
      }
      setValues(form.getFieldsValue(true));
    };

    const handleDelete = (att: Attachment) => {
      Modal.confirm({
        title: '确认删除附件',
        content: `确定删除「${att.name}」吗？此操作不可撤销。`,
        okText: '删除',
        okButtonProps: { danger: true },
        cancelText: '取消',
        onOk: () => setAttachments((prev) => prev.filter((item) => item.uid !== att.uid)),
      });
    };

    // 上传前校验文件类型与大小，不通过则提示并忽略
    const beforeUpload = (file: RcFile) => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        message.error('仅支持 PDF / PNG / JPG 格式');
        return Upload.LIST_IGNORE;
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        message.error(`文件大小不能超过 ${MAX_SIZE_MB}MB`);
        return Upload.LIST_IGNORE;
      }
      setAttachments((prev) => [...prev, { name: file.name, uid: file.uid }]);
      return false;
    };

    const renderInterests = (group: 'withdrawableInterests' | 'transferredInterests', title: string) => {
      const interests = customer[group];
      return (
        <div className='space-y-3'>
          <div className='text-sm font-medium'>{title}</div>
          {Object.keys(interests).map((cur) => {
            const Field = CURRENCY_FIELDS[cur];
            const path = [group, cur];
            return Field ? <Field key={cur} name={path} className={hl(path)} /> : null;
          })}
        </div>
      );
    };

    return (
      <Form<Customer>
        form={form}
        layout='horizontal'
        labelAlign='left'
        labelCol={{ span: 10 }}
        wrapperCol={{ span: 14 }}
        disabled={readonly}
        scrollToFirstError
        initialValues={customer}
        onValuesChange={handleValuesChange}>
        {/* 客户信息 与 申报信息 并列，整表由通用字段组件拼装；初始值经 initialValues 一次性注入 */}
        <Row gutter={16}>
          {/* Left: 客户信息（含可修改的 Our Ref / Your Ref） */}
          <Col span={12}>
            <Card title='客户信息' size='small' className='h-full'>
              <div className='space-y-3'>
                <CustomerType />
                <CustomerName />
                <DateOfBirth />
                <Cif />
                <SavingsAccount />
                <SecuritiesAccount />
                <FundAccount />
                <CustodianAccount />
                <OurRef className={hl('ourRef')} />
                <YourRef className={hl('yourRef')} />
              </div>
            </Card>
          </Col>

          {/* Right: 申报信息 */}
          <Col span={12}>
            <Card title='申报信息' size='small' className='h-full'>
              <div className='space-y-3'>
                <AipDate className={hl('aipDate')} />
                <AipExpiryDate />
                <FaDate className={hl('faDate')} />
                <CiesTerminationDate className={hl('ciesTerminationDate')} />
                <Transferred3M className={hl('transferred3M')} />
                <div className='grid grid-cols-2 gap-x-4 border-t pt-3'>
                  {renderInterests('withdrawableInterests', 'Withdrawable Interests')}
                  {renderInterests('transferredInterests', 'Transferred Interests')}
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* 附件区域放在下方，占满整行 */}
        <Card title='附件 (Attachment)' size='small' className='mt-4'>
          <List
            size='small'
            dataSource={attachments}
            renderItem={(att) => (
              <List.Item
                className='group rounded px-2 transition-colors hover:bg-gray-50'
                actions={
                  readonly
                    ? []
                    : [
                        <Button
                          key='del'
                          type='text'
                          danger
                          size='small'
                          icon={<DeleteOutlined />}
                          onClick={() => handleDelete(att)}
                        />,
                      ]
                }>
                {/* 图标+文件名合成一个 flex 子项，space-between 才会让名字始终靠左 */}
                <div className='flex items-center'>
                  <FileOutlined className='mr-2 text-gray-400' />
                  <span>{att.name}</span>
                </div>
              </List.Item>
            )}
          />
          {!readonly && (
            <Upload beforeUpload={beforeUpload} showUploadList={false}>
              <Button icon={<UploadOutlined />} size='small' className='mt-2'>
                Upload
              </Button>
            </Upload>
          )}
        </Card>
      </Form>
    );
  },
);

export default TaskForm;
