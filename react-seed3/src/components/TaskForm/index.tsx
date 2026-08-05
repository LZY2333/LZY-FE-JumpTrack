import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { Button, Card, Col, Form, List, Modal, Row, Upload, message } from 'antd';
import type { RcFile } from 'antd/es/upload';
import { DeleteOutlined, DownloadOutlined, FileOutlined, UploadOutlined } from '@ant-design/icons';
import moment from 'moment';
import type { Attachment, Customer } from '@/types';
import { downloadAttachment, uploadAttachment } from '@/api/tasks';
import { CiesFlag as CiesFlagValue } from '@/types/enums';
import { getCustomerChange } from '@/components/TaskForm/customerChange';
import {
  AnnualReportDate,
  BankCusRef,
  CapitalInvestFlag,
  CiesFlag,
  CusBirthDate,
  CusCnName,
  CusEnName,
  CusId,
  CusPrmAct,
  FormalAppDate,
  GovCusRef,
  InvestmentAccounts,
  PrincipleAppDate,
  PrincipleExpDate,
  TerminationDate,
  TransferIntr,
  WithdrawnIntr,
} from '@/components/FormItem';

interface Props {
  taskId: string;
  /** 数据仓中的原始客户信息，作为字段高亮与锁定规则的比较基线。 */
  customer: Customer;
  /** 任务保存的完整客户变更；尚未保存时为 null。 */
  customerChange: Customer | null;
  attachments: Attachment[];
  readonly?: boolean;
}

export interface TaskFormValues {
  customerChange?: Customer;
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
  ({ taskId, customer, customerChange, attachments: initialAttachments, readonly = false }, ref) => {
    const [form] = Form.useForm();
    // 已保存变更优先作为表单初始值；无变更时回退到原始客户信息。
    const initialCustomer = customerChange ?? customer;
    const [currentCustomer, setCurrentCustomer] = useState<Customer>(initialCustomer);
    const [attachments, setAttachments] = useState<Attachment[]>(initialAttachments);

    useEffect(() => {
      form.setFieldsValue(initialCustomer);
      setCurrentCustomer(initialCustomer);
    }, [form, initialCustomer]);

    useEffect(() => {
      setAttachments(initialAttachments);
    }, [initialAttachments]);

    useImperativeHandle(
      ref,
      () => ({
        validate: () =>
          form.validateFields().then(() => {
            const currentValues = { ...initialCustomer, ...form.getFieldsValue(true) } as Customer;
            const currentCustomerChange = getCustomerChange(customer, currentValues);

            return currentCustomerChange
              ? { customerChange: currentCustomerChange, attachments }
              : { attachments };
          }),
      }),
      [attachments, customer, form, initialCustomer],
    );

    // 当前表单值与原始客户信息不同即高亮；已保存的变更在重新进入页面时也会立即高亮。
    const hl = (path: Path) =>
      `transition-all duration-300 ${at(currentCustomer, path) !== at(customer, path) ? HIGHLIGHT : ''}`;

    // 锁定规则只取原始客户信息，任务变更值不会把原本可编辑的字段错误锁死。
    const annualReportDateLocked = !!customer.annualReportDate;
    const principleAppDateLocked = !!customer.principleAppDate;
    const formalAppDateLocked = !!customer.formalAppDate;
    const withdrawnIntrCurrencies = Object.keys(initialCustomer.withdrawnIntr ?? {});
    const transferIntrCurrencies = Object.keys(initialCustomer.transferIntr ?? {});

    const handleValuesChange = (changed: Partial<Customer>) => {
      if ('principleAppDate' in changed) {
        const principleAppDate = form.getFieldValue('principleAppDate') as string;
        let principleExpDate = '';
        if (principleAppDate && customer.ciesFlag === CiesFlagValue.Cies10) {
          principleExpDate = moment(principleAppDate).add(6, 'months').format('YYYY-MM-DD');
        }
        if (principleAppDate && customer.ciesFlag === CiesFlagValue.Cies20) {
          principleExpDate = moment(principleAppDate).add(180, 'days').format('YYYY-MM-DD');
        }
        form.setFieldsValue({
          principleExpDate,
        });
      }
      setCurrentCustomer(form.getFieldsValue(true) as Customer);
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
          if (!attachment) {
            message.error('Attachment upload returned no data');
            return;
          }
          setAttachments((prev) => [...prev, attachment]);
        })
        .catch(() => {
          message.error('Attachment upload failed');
        });
      return false;
    };

    const handleDownload = (fileName: string) => {
      downloadAttachment(fileName)
        .then((blob) => {
          const objectUrl = URL.createObjectURL(blob);
          const anchor = document.createElement('a');
          anchor.href = objectUrl;
          anchor.download = fileName;
          try {
            document.body.appendChild(anchor);
            anchor.click();
          } finally {
            anchor.remove();
            window.setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
          }
        })
        .catch(() => {
          message.error('Attachment download failed');
        });
    };

    return (
      <>
        <Form<Customer>
          form={form}
          layout='horizontal'
          labelAlign='left'
          labelCol={{ span: 10 }}
          wrapperCol={{ span: 14 }}
          disabled={readonly}
          scrollToFirstError
          initialValues={initialCustomer}
          onValuesChange={handleValuesChange}
        >
          {/* 客户信息与申报信息并列；initialValues 初始化，聚合响应变化时由 setFieldsValue 同步。 */}
          <Row gutter={16}>
            {/* Left: 客户信息 */}
            <Col span={12}>
              <Card title='Customer Info' size='small' className='h-full'>
                <div className='space-y-3'>
                  <CiesFlag />
                  <CusCnName />
                  <CusEnName />
                  <CusBirthDate />
                  <CusId />
                  <CusPrmAct />
                  <InvestmentAccounts />
                </div>
              </Card>
            </Col>

            {/* Right: 申报信息（Our Ref / Your Ref 放最上面） */}
            <Col span={12}>
              <Card title='Declaration Info' size='small' className='h-full'>
                <div className='space-y-3'>
                  <BankCusRef className={hl('bankCusRef')} />
                  <GovCusRef className={hl('govCusRef')} />
                  <PrincipleAppDate disabled={readonly || principleAppDateLocked} className={hl('principleAppDate')} />
                  <PrincipleExpDate className={hl('principleExpDate')} />
                  <FormalAppDate disabled={readonly || formalAppDateLocked} className={hl('formalAppDate')} />
                  <AnnualReportDate disabled={readonly || annualReportDateLocked} className={hl('annualReportDate')} />
                  <TerminationDate className={hl('terminationDate')} />
                  <CapitalInvestFlag className={hl('capitalInvestFlag')} />
                  <div className='grid grid-cols-2 gap-x-4 border-t pt-3'>
                    <WithdrawnIntr
                      currencies={withdrawnIntrCurrencies}
                      getFieldClassName={(currency) => hl(['withdrawnIntr', currency])}
                    />
                    <TransferIntr
                      currencies={transferIntrCurrencies}
                      getFieldClassName={(currency) => hl(['transferIntr', currency])}
                    />
                  </div>
                </div>
              </Card>
            </Col>
          </Row>
        </Form>

        {/* 附件区域独立于 Form，避免 readonly 禁用下载操作 */}
        <Card title='Attachments' size='small' className='mt-4'>
          <List
            size='small'
            dataSource={attachments}
            renderItem={(att) => (
              <List.Item
                className='group rounded px-2 transition-colors hover:bg-gray-50'
                actions={[
                  <Button
                    key='download'
                    type='text'
                    size='small'
                    danger
                    icon={<DownloadOutlined />}
                    onClick={() => handleDownload(att.fileName)}
                  />,
                  !readonly && (
                    <Button
                      key='del'
                      type='text'
                      size='small'
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleDelete(att)}
                    />
                  ),
                ].filter(Boolean)}
              >
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
      </>
    );
  },
);

TaskForm.displayName = 'TaskForm';

export default TaskForm;
