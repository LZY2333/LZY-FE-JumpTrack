import { Alert } from 'antd';
import MessageSchemaForm from '@/components/MessageSchemaForm';
import { getMessageSchema } from '@/schemas/messages';
import type { MessageDetail } from '@/types';
import { MessageBusinessType } from '@/types/enums';

interface ContentMessageBusinessInfoProps {
  /** Message detail. */
  detail: MessageDetail | null;
  /** 高亮字段 */
  highLightFields?: readonly string[];
  /** 表格吸顶与横向滚动条吸底的滚动容器 */
  scrollContainer?: HTMLElement | null;
}

interface CardMessageBusinessInfoProps extends ContentMessageBusinessInfoProps {
  /** Layout class name. */
  className?: string;
}

/** Business Info */
export const CardMessageBusinessInfo = ({
  detail,
  className,
  highLightFields,
  scrollContainer,
}: CardMessageBusinessInfoProps) => (
  <div className={className}>
    <ContentMessageBusinessInfo detail={detail} highLightFields={highLightFields} scrollContainer={scrollContainer} />
  </div>
);

/** Business Info Content */
export const ContentMessageBusinessInfo = ({
  detail,
  highLightFields,
  scrollContainer,
}: ContentMessageBusinessInfoProps) => {
  if (detail?.msgBasicInfo.businessType === MessageBusinessType.Other) {
    return (
      <Alert
        type='info'
        showIcon
        message='No structured business info for Other messages. The raw message remains available.'
      />
    );
  }

  const schema = getMessageSchema(detail?.msgBasicInfo.businessType);
  if (!schema) {
    return (
      <Alert
        type='info'
        showIcon
        message='No business info template is available for this business type. View or download the raw message instead.'
      />
    );
  }

  return (
    <MessageSchemaForm
      schema={schema}
      values={detail ? { ...detail } : {}}
      pattern='disabled'
      highLightFields={highLightFields}
      scrollContainer={scrollContainer}
    />
  );
};
