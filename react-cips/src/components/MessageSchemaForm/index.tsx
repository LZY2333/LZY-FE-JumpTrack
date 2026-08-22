import { useEffect, useMemo } from 'react';
import type { MouseEvent } from 'react';
import { createForm } from '@formily/core';
import { createSchemaField, FormProvider } from '@formily/react';
import type { ISchema } from '@formily/react';
import { App } from 'antd';
import { FormGrid, FormLayout, PreviewText } from '@formily/antd-v5';
import { MessageFormItem } from '@/components/FormItem';
import { copyText } from '@/utils/fileUtil';

const COPY_TARGET_SELECTOR = '.ant-formily-item-label-content, .ant-formily-item-control-content-component';

const SchemaField = createSchemaField({
  components: {
    FormGrid,
    MessageFormItem,
    PreviewText,
  },
});

interface MessageSchemaFormProps {
  schema: ISchema;
  values: Record<string, unknown>;
}

/** 使用前端白名单组件渲染静态 Formily Schema，始终保持只读紧凑模式。 */
export default function MessageSchemaForm({ schema, values }: MessageSchemaFormProps) {
  const { message } = App.useApp();
  const form = useMemo(() => createForm({ pattern: 'readPretty' }), [schema]);

  useEffect(() => {
    form.setValues(values, 'overwrite');
  }, [form, values]);

  /** 通过事件委托覆盖动态 Schema 字段，复制被双击区域的完整文本而非省略后的视觉内容。 */
  const handleDoubleClick = (event: MouseEvent<HTMLDivElement>) => {
    if (!(event.target instanceof HTMLElement)) return;
    const copyTarget = event.target.closest<HTMLElement>(COPY_TARGET_SELECTOR);
    if (!copyTarget || !event.currentTarget.contains(copyTarget)) return;
    const text = copyTarget.textContent?.trim();
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
    const text = hoverTarget.textContent?.trim();
    if (text) hoverTarget.title = text;
  };

  return (
    <div className='message-schema-form' onDoubleClick={handleDoubleClick} onMouseOver={handleMouseOver}>
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
}
