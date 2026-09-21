import { createContext, useContext, useEffect, useMemo } from 'react';
import type { ComponentProps, MouseEvent, PropsWithChildren } from 'react';
import { createForm } from '@formily/core';
import type { FormPatternTypes } from '@formily/core';
import { createSchemaField, FormProvider, useField } from '@formily/react';
import type { ISchema } from '@formily/react';
import { App, Card, ConfigProvider, Table, theme } from 'antd';
import type { TableColumnsType } from 'antd';
import { FormGrid, FormItem as FormilyFormItem, FormLayout, Input, PreviewText } from '@formily/antd-v5';
import type { IFormItemProps } from '@formily/antd-v5';
import cn from 'classnames';
import CardCollapse from '@/components/CardCollapse';
import { copyText } from '@/utils/fileUtil';

const COPY_TARGET_SELECTOR = '.ant-formily-item-label-content, .ant-formily-item-control-content-component';
const EMPTY_HIGH_LIGHT_FIELDS: readonly string[] = [];
const HighLightFieldsContext = createContext<ReadonlySet<string>>(new Set<string>());

interface MessageSchemaFormProps {
  /** 描述字段结构和展示组件的静态 Schema。 */
  schema: ISchema;
  /** 填充到只读表单中的报文字段值。 */
  values: Record<string, unknown>;
  /** 控制字段以纯文本或只读控件形式展示。 */
  pattern?: FormPatternTypes;
  /** 高亮字段 */
  highLightFields?: readonly string[];
}

/** Formily Schema 渲染组件 */
const MessageSchemaForm = ({
  schema,
  values,
  pattern = 'readPretty',
  highLightFields = EMPTY_HIGH_LIGHT_FIELDS,
}: MessageSchemaFormProps) => {
  const { message } = App.useApp();
  const { token } = theme.useToken();
  const form = useMemo(() => createForm({ pattern }), [pattern, schema]);
  const highLightFieldSet = useMemo(() => new Set(highLightFields), [highLightFields]);

  useEffect(() => {
    form.setValues(normalizeInputValues(values), 'overwrite');
  }, [form, values]);

  /** 双击复制 */
  const handleDoubleClick = (event: MouseEvent<HTMLDivElement>) => {
    if (!(event.target instanceof HTMLElement)) return;
    const copyTarget = event.target.closest<HTMLElement>(COPY_TARGET_SELECTOR);
    if (!copyTarget || !event.currentTarget.contains(copyTarget)) return;
    const text = resolveTargetText(copyTarget);
    if (!text) return;

    event.preventDefault();
    copyText(text)
      .then(() => message.success('Copied'))
      .catch(() => message.error('Failed to copy'));
  };

  /** hover展示完整title */
  const handleMouseOver = (event: MouseEvent<HTMLDivElement>) => {
    if (!(event.target instanceof HTMLElement)) return;
    const hoverTarget = event.target.closest<HTMLElement>(COPY_TARGET_SELECTOR);
    if (!hoverTarget || !event.currentTarget.contains(hoverTarget)) return;
    const text = resolveTargetText(hoverTarget);
    if (text) hoverTarget.title = text;
  };

  return (
    <div
      className='message-schema-form [&_.ant-formily-item-label-content]:cursor-copy [&_.ant-formily-item-control-content-component]:cursor-default'
      onDoubleClick={handleDoubleClick}
      onMouseOver={handleMouseOver}
    >
      <HighLightFieldsContext.Provider value={highLightFieldSet}>
        <ConfigProvider theme={{ token: { colorTextDisabled: token.colorText } }}>
          <FormProvider form={form}>
            <FormLayout
              layout='horizontal'
              size='small'
              labelAlign='left'
              labelWidth={128}
              labelWrap={false}
              wrapperWrap={false}
              spaceGap={4}
              gridColumnGap={12}
              gridRowGap={0}
              feedbackLayout='none'
            >
              <SchemaField schema={schema} />
            </FormLayout>
          </FormProvider>
        </ConfigProvider>
      </HighLightFieldsContext.Provider>
    </div>
  );
};

/** Formily 详情字段装饰器 */
const MessageFormItem = ({ children, className, ...props }: PropsWithChildren<IFormItemProps>) => {
  const highlighted = useIsFieldHighlighted();

  return (
    // 空值只在展示层转换为 --，不污染表单数据。
    <PreviewText.Placeholder value='--'>
      <FormilyFormItem
        {...props}
        className={cn(
          highlighted && '[&_.ant-input-disabled]:font-semibold [&_.ant-input-disabled]:!text-yellow-500',
          className,
        )}
      >
        {children}
      </FormilyFormItem>
    </PreviewText.Placeholder>
  );
};

/** 详情输入框统一展示空态；禁用时让指针事件落到字段容器，以支持双击复制。 */
const MessageInput = ({ className, disabled, placeholder = '--', ...props }: ComponentProps<typeof Input>) => (
  <Input
    {...props}
    className={cn(disabled && 'pointer-events-none', className)}
    disabled={disabled}
    placeholder={placeholder}
  />
);

/** 详情多行文本统一展示空态，并保留字段容器的双击复制能力。 */
const MessageTextArea = ({
  className,
  disabled,
  placeholder = '--',
  status,
  ...props
}: ComponentProps<typeof Input.TextArea>) => {
  const highlighted = useIsFieldHighlighted();

  return (
    <Input.TextArea
      {...props}
      className={cn('mb-1', disabled && 'pointer-events-none', className)}
      disabled={disabled}
      placeholder={placeholder}
      status={highlighted ? 'warning' : status}
    />
  );
};

/** 判断当前 Schema 字段是否需要高亮展示。 */
const useIsFieldHighlighted = () => {
  const field = useField();
  const highLightFields = useContext(HighLightFieldsContext);
  const fieldPath = field.path.toArr();
  const fieldName = String(fieldPath[fieldPath.length - 1]);
  return highLightFields.has(fieldName);
};

interface MessageSectionProps {
  /** 当前业务信息区块标题。 */
  title: string;
  /** 是否使用可收起 Card。 */
  collapsible?: boolean;
}

/** 带标题的业务信息区块。 */
const MessageSection = ({ title, collapsible = false, children }: PropsWithChildren<MessageSectionProps>) => {
  if (collapsible) {
    return (
      <CardCollapse className='mb-3 last:mb-0' size='small' title={title}>
        {children}
      </CardCollapse>
    );
  }

  return (
    <Card className='mb-3 last:mb-0' size='small' title={title}>
      {children}
    </Card>
  );
};

interface MessageBusinessTableColumn {
  /** 数据库字段对应的 camelCase 属性名。 */
  dataIndex: string;
  /** 用户可见的英文字段名。 */
  title: string;
  /** 表格列宽。 */
  width?: number;
}

interface MessageBusinessTableProps {
  /** 一对多子表记录。 */
  value?: Array<Record<string, unknown>>;
  /** 子表面板标题。 */
  title: string;
  /** 作为表格行唯一标识的字段。 */
  rowKey: string;
  /** 子表字段列定义。 */
  columns: MessageBusinessTableColumn[];
  /** 是否使用可收起 Card。 */
  collapsible?: boolean;
}

/** 一对多业务属性表，保持数据库字段列顺序并提供横向滚动。 */
const MessageBusinessTable = ({
  value = [],
  title,
  rowKey,
  columns,
  collapsible = false,
}: MessageBusinessTableProps) => {
  const tableColumns: TableColumnsType<Record<string, unknown>> = columns.map((column) => ({
    ...column,
    render: renderBusinessTableCell,
  }));
  const table = (
    <Table<Record<string, unknown>>
      bordered
      size='small'
      rowKey={rowKey}
      columns={tableColumns}
      dataSource={value}
      pagination={false}
      scroll={{ x: 'max-content' }}
    />
  );

  if (collapsible) {
    return (
      <CardCollapse className='mb-3 last:mb-0' size='small' title={title}>
        {table}
      </CardCollapse>
    );
  }

  return (
    <Card className='mb-3 last:mb-0' size='small' title={title}>
      {table}
    </Card>
  );
};

const SchemaField = createSchemaField({
  components: {
    FormGrid,
    FormGridColumn: FormGrid.GridColumn,
    Input: MessageInput,
    MessageBusinessTable,
    MessageFormItem,
    MessageSection,
    TextArea: MessageTextArea,
  },
});

/** 将接口空值归一化为 Input 约定的空字符串，由控件 placeholder 负责展示 --。 */
const normalizeInputValues = (values: Record<string, unknown>) =>
  Object.fromEntries(Object.entries(values).map(([name, value]) => [name, normalizeInputValue(value)]));

/** 递归处理嵌套业务对象和子表记录中的接口空值。 */
const normalizeInputValue = (value: unknown): unknown => {
  if (value === null || value === undefined) return '';
  if (Array.isArray(value)) return value.map(normalizeInputValue);
  if (typeof value !== 'object') return value;

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([name, childValue]) => [
      name,
      normalizeInputValue(childValue),
    ]),
  );
};

/** 优先读取 Input 的完整值，空 Input 使用当前展示的 placeholder。 */
const resolveTargetText = (target: HTMLElement) => {
  const input = target.querySelector<HTMLInputElement | HTMLTextAreaElement>('input, textarea');
  if (!input) return target.textContent?.trim();
  return input.value.trim() || input.placeholder.trim();
};

/** 业务子表空值统一展示为 --。 */
const renderBusinessTableCell = (value: unknown) =>
  value === undefined || value === null || value === '' ? '--' : String(value);

export default MessageSchemaForm;
