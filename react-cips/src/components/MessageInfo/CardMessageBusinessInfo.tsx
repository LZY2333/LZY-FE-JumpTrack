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
}

interface CardMessageBusinessInfoProps extends ContentMessageBusinessInfoProps {
  /** Layout class name. */
  className?: string;
}

/** Business Info */
export const CardMessageBusinessInfo = ({ detail, className, highLightFields }: CardMessageBusinessInfoProps) => (
  <div className={className}>
    <ContentMessageBusinessInfo detail={detail} highLightFields={highLightFields} />
  </div>
);

/** Business Info Content */
export const ContentMessageBusinessInfo = ({ detail, highLightFields }: ContentMessageBusinessInfoProps) => {
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
    />
  );
};
