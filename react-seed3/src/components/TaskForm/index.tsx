import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { Button, Card, Col, Form, List, Modal, Row, Upload, message } from 'antd';
import type { RcFile } from 'antd/es/upload';
import { DeleteOutlined, DownloadOutlined, FileOutlined, UploadOutlined } from '@ant-design/icons';
import moment from 'moment';
import type { Attachment } from '@/types';
import { downloadAttachment, uploadAttachment } from '@/api/tasks';
import {
  getInterestCurrencies,
  isSemanticallyEqual,
  type CustomerFormModel,
} from '@/pages/task-detail/customerFormUtil';
import { CiesFlag as CiesFlagValue } from '@/types/enums';
import {
  AnnualReportDate,
  BankCusRef,
  CapitalInvestFlag,
  CiesFlag,
  CustodianAct,
  CusBirthDate,
  CusCnName,
  CusEnName,
  CusId,
  CusPrmAct,
  FormalAppDate,
  FundAct,
  GovCusRef,
  InvestmentInterests,
  PrincipleAppDate,
  PrincipleExpDate,
  SecurityAct,
  TerminationDate,
} from '@/components/FormItem';

interface TaskFormDataProps {
  empty?: false;
  taskId: string;
  /** 表单初始值：已保存的变更优先，否则使用原始客户表单模型。 */
  initialForm: CustomerFormModel;
  /** 原始客户表单模型，始终作为字段高亮和锁定规则的比较基线。 */
  customerForm: CustomerFormModel;
  attachments: Attachment[];
  readonly?: boolean;
}

interface EmptyTaskFormProps {
  /** 加载中或详情数据异常时，渲染无数据、无操作入口的只读表单。 */
  empty: true;
}

type Props = TaskFormDataProps | EmptyTaskFormProps;

export interface TaskFormValues {
  customerFormNew: CustomerFormModel;
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
const EMPTY_ATTACHMENTS: Attachment[] = [];
const EMPTY_CUSTOMER_FORM_MODEL: CustomerFormModel = {
  cusId: '',
  cusPrmAct: [],
  ciesFlag: '' as CustomerFormModel['ciesFlag'],
  cusEnName: '',
  cusCnName: '',
  cusBirthDate: '',
  govCusRef: '',
  bankCusRef: '',
  principleAppDate: '',
  principleExpDate: '',
  formalAppDate: '',
  annualReportDate: '',
  terminationDate: '',
  capitalInvestFlag: '' as CustomerFormModel['capitalInvestFlag'],
  securityAct: [],
  fundAct: [],
  custodianAct: [],
  withdrawnIntr: {},
  transferIntr: {},
};

type Path = string | (string | number)[];
const at = (obj: unknown, path: Path): unknown =>
  (Array.isArray(path) ? path : [path]).reduce<unknown>(
    (acc, key) => (acc == null ? undefined : (acc as Record<string | number, unknown>)[key]),
    obj,
  );

const TaskForm = forwardRef<TaskFormRef, Props>((props, ref) => {
  const taskId = props.empty ? '' : props.taskId;
  const initialForm = props.empty ? EMPTY_CUSTOMER_FORM_MODEL : props.initialForm;
  const customerForm = props.empty ? EMPTY_CUSTOMER_FORM_MODEL : props.customerForm;
  const initialAttachments = props.empty ? EMPTY_ATTACHMENTS : props.attachments;
  const readonly = props.empty || (props.readonly ?? false);
  const [form] = Form.useForm();
  const [currentForm, setCurrentForm] = useState<CustomerFormModel>(initialForm);
  const [attachments, setAttachments] = useState<Attachment[]>(initialAttachments);

  useEffect(() => {
    form.setFieldsValue(initialForm);
    setCurrentForm(initialForm);
  }, [form, initialForm]);

  useEffect(() => {
    setAttachments(initialAttachments);
  }, [initialAttachments]);

  useImperativeHandle(
    ref,
    () => ({
      validate: () =>
        form.validateFields().then(() => {
          const customerFormNew = {
            ...initialForm,
            ...form.getFieldsValue(true),
          } as CustomerFormModel;
          return { customerFormNew, attachments };
        }),
    }),
    [attachments, form, initialForm],
  );

  // 当前表单值与原始客户表单模型不同即高亮；已保存的变更也会立即高亮。
  const hl = (path: Path) =>
    `transition-all duration-300 ${
      isSemanticallyEqual(at(currentForm, path), at(customerForm, path)) ? '' : HIGHLIGHT
    }`;

  const handleValuesChange = (changed: Partial<CustomerFormModel>) => {
    if ('principleAppDate' in changed) {
      const principleAppDate = form.getFieldValue('principleAppDate') as string;
      let principleExpDate = '';
      if (principleAppDate && customerForm.ciesFlag === CiesFlagValue.Cies10) {
        principleExpDate = moment(principleAppDate).add(6, 'months').format('YYYY-MM-DD');
      }
      if (principleAppDate && customerForm.ciesFlag === CiesFlagValue.Cies20) {
        principleExpDate = moment(principleAppDate).add(180, 'days').format('YYYY-MM-DD');
      }
      form.setFieldsValue({
        principleExpDate,
      });
    }
    setCurrentForm(form.getFieldsValue(true) as CustomerFormModel);
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
      <Form<CustomerFormModel>
        form={form}
        layout='horizontal'
        labelAlign='left'
        labelCol={{ span: 10 }}
        wrapperCol={{ span: 14 }}
        disabled={readonly}
        scrollToFirstError
        initialValues={initialForm}
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
                <PrincipleAppDate
                  disabled={readonly || !!customerForm.principleAppDate}
                  className={hl('principleAppDate')}
                />
                <PrincipleExpDate className={hl('principleExpDate')} />
                <FormalAppDate disabled={readonly || !!customerForm.formalAppDate} className={hl('formalAppDate')} />
                <AnnualReportDate
                  disabled={readonly || !!customerForm.annualReportDate}
                  className={hl('annualReportDate')}
                />
                <TerminationDate className={hl('terminationDate')} />
                <CapitalInvestFlag className={hl('capitalInvestFlag')} />
                <InvestmentInterests
                  currencies={getInterestCurrencies(customerForm, initialForm)}
                  getFieldClassName={(fieldName, currency) => hl([fieldName, currency])}
                />
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
});

TaskForm.displayName = 'TaskForm';

export default TaskForm;
