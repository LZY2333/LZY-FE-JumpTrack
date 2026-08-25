import { useEffect, useMemo } from 'react';
import type { ComponentProps, MouseEvent } from 'react';
import { createForm } from '@formily/core';
import type { FormPatternTypes } from '@formily/core';
import { createSchemaField, FormProvider } from '@formily/react';
import type { ISchema } from '@formily/react';
import { App } from 'antd';
import { FormGrid, FormLayout, Input } from '@formily/antd-v5';
import cn from 'classnames';
import { MessageFormItem } from '@/components/FormItem';
import { copyText } from '@/utils/fileUtil';

const COPY_TARGET_SELECTOR = '.ant-formily-item-label-content, .ant-formily-item-control-content-component';

/** 详情输入框统一展示空态；禁用时让指针事件落到字段容器，以支持双击复制。 */
const MessageInput = ({ className, disabled, placeholder = '--', ...props }: ComponentProps<typeof Input>) => (
  <Input
    {...props}
    className={cn(disabled && 'pointer-events-none', className)}
    disabled={disabled}
    placeholder={placeholder}
  />
);

const SchemaField = createSchemaField({
  components: {
    FormGrid,
    Input: MessageInput,
    MessageFormItem,
  },
});

interface MessageSchemaFormProps {
  /** 描述字段结构和展示组件的静态 Schema。 */
  schema: ISchema;
  /** 填充到只读表单中的报文字段值。 */
  values: Record<string, unknown>;
  /** 控制字段以纯文本或只读控件形式展示。 */
  pattern?: FormPatternTypes;
}

/** 使用前端白名单组件渲染静态 Formily Schema，并保持紧凑详情模式。 */
const MessageSchemaForm = ({ schema, values, pattern = 'readPretty' }: MessageSchemaFormProps) => {
  const { message } = App.useApp();
  const form = useMemo(() => createForm({ pattern }), [pattern, schema]);

  useEffect(() => {
    form.setValues(normalizeInputValues(values), 'overwrite');
  }, [form, values]);

  /** 通过事件委托覆盖动态 Schema 字段，复制被双击区域的完整文本而非省略后的视觉内容。 */
  const handleDoubleClick = (event: MouseEvent<HTMLDivElement>) => {
    if (!(event.target instanceof HTMLElement)) return;
    const copyTarget = event.target.closest<HTMLElement>(COPY_TARGET_SELECTOR);
    if (!copyTarget || !event.currentTarget.contains(copyTarget)) return;
    const text = resolveTargetText(copyTarget);
    if (!text) return;

    event.preventDefault();
    copyText(text)
      .then(() => message.success('已复制'))
      .catch(() => message.error('复制失败'));
  };

  /** 省略区域悬浮时通过原生 title 展示完整内容，内容变化后无需额外同步状态。 */
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
      <FormProvider form={form}>
        <FormLayout
          layout='horizontal'
          size='small'
          labelAlign='left'
          labelWidth={112}
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
    </div>
  );
};

/** 将接口空值归一化为 Input 约定的空字符串，由控件 placeholder 负责展示 --。 */
const normalizeInputValues = (values: Record<string, unknown>) =>
  Object.fromEntries(
    Object.entries(values).map(([name, value]) => [name, value === null || value === undefined ? '' : value]),
  );

/** 优先读取 Input 的完整值，空 Input 使用当前展示的 placeholder。 */
const resolveTargetText = (target: HTMLElement) => {
  const input = target.querySelector<HTMLInputElement>('input');
  if (!input) return target.textContent?.trim();
  return input.value.trim() || input.placeholder.trim();
};

export default MessageSchemaForm;
