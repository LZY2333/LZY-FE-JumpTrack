import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { Button, Card, Col, Form, List, Modal, Row, Upload, message } from 'antd';
import type { RcFile } from 'antd/es/upload';
import { DeleteOutlined, FileOutlined, UploadOutlined } from '@ant-design/icons';
import moment from 'moment';
import type { Attachment, Customer } from '@/types';
import { uploadAttachment } from '@/api/tasks';
import {
  AipDate,
  AipExpiryDate,
  AnnualReportDate,
  BankCusRef,
  CURRENCY_FIELDS,
  CusId,
  CusPrmAct,
  CustodianAct,
  CustomerCnName,
  CustomerEnName,
  CustomerType,
  DateOfBirth,
  FaDate,
  FundAct,
  GovCusRef,
  SecurityAct,
  TerminationDate,
  Transferred3M,
} from '@/components/FormItem';

interface Props {
  taskId: string;
  customer: Customer;
  // 接口原始值（未叠加 newValue 草稿），仅用于高亮对比，不参与表单展示
  originalCustomer: Customer;
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
  ({ taskId, customer, originalCustomer, attachments: initialAttachments, readonly = false }, ref) => {
    const [form] = Form.useForm();
    // values 跟踪当前表单值，customer 为 newValue 草稿叠加后的初始值；originalCustomer 才是
    // 接口原始基线，高亮对比统一以它为准，这样重新进入详情页时草稿字段也会立即高亮。
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

    // 当前输入值与接口原始基线不同即高亮，仅用于可修改字段；常驻 transition 让高亮淡入淡出
    const hl = (path: Path) =>
      `transition-all duration-300 ${at(values, path) !== at(originalCustomer, path) ? HIGHLIGHT : ''}`;

    // Annual Report Date：originalCustomer 该字段一旦非空即永久锁定，不允许再修改
    const annualReportDateLocked = !!originalCustomer.AnnualReportDate;
    // AIP Date / FA Date：originalCustomer 对应字段一旦非空即永久锁定，不允许再修改
    const aipDateLocked = !!originalCustomer.aipDate;
    const faDateLocked = !!originalCustomer.faDate;

    const handleValuesChange = (changed: Customer) => {
      if ('aipDate' in changed && customer.cusType === 'CIES 2.0') {
        const aip = form.getFieldValue('aipDate') as string;
        form.setFieldsValue({ aipExpiryDate: aip ? moment(aip).add(180, 'days').format('YYYY-MM-DD') : '' });
      }
      setValues(form.getFieldsValue(true));
    };

    const handleDelete = (att: Attachment) => {
      Modal.confirm({
        title: 'Confirm Delete Attachment',
        content: `Delete "${att.fileName}"? This action cannot be undone.`,
        okText: 'Delete',
        okButtonProps: { danger: true },
        cancelText: 'Cancel',
        onOk: () => setAttachments((prev) => prev.filter((item) => item.fileId !== att.fileId)),
      });
    };

    // 上传前校验文件类型与大小，通过后调用专门的附件上传接口，由后端落库并返回真实附件信息
    const beforeUpload = (file: RcFile) => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        message.error('Only PDF / PNG / JPG formats are supported');
        return Upload.LIST_IGNORE;
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        message.error(`File size must not exceed ${MAX_SIZE_MB}MB`);
        return Upload.LIST_IGNORE;
      }
      uploadAttachment(taskId, file)
        .then((attachment) => {
          setAttachments((prev) => [...prev, attachment]);
        })
        .catch(() => {
          message.error('Attachment upload failed');
        });
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
          {/* Left: 客户信息 */}
          <Col span={12}>
            <Card title='Customer Info' size='small' className='h-full'>
              <div className='space-y-3'>
                <CustomerType />
                <CustomerCnName />
                <CustomerEnName />
                <DateOfBirth />
                <CusId />
                <CusPrmAct />
                <SecurityAct />
                <FundAct />
                <CustodianAct />
              </div>
            </Card>
          </Col>

          {/* Right: 申报信息（Our Ref / Your Ref 放最上面） */}
          <Col span={12}>
            <Card title='Declaration Info' size='small' className='h-full'>
              <div className='space-y-3'>
                <BankCusRef className={hl('bankCusRef')} />
                <GovCusRef className={hl('govCusRef')} />
                <AipDate disabled={readonly || aipDateLocked} className={hl('aipDate')} />
                <AipExpiryDate />
                <FaDate disabled={readonly || faDateLocked} className={hl('faDate')} />
                <AnnualReportDate disabled={readonly || annualReportDateLocked} className={hl('AnnualReportDate')} />
                <TerminationDate className={hl('terminationDate')} />
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
        <Card title='Attachments' size='small' className='mt-4'>
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
                  <span>{att.fileName}</span>
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
