import { Alert, Card } from 'antd';
import MessageSchemaForm from '@/components/MessageSchemaForm';
import { getMessageSchema } from '@/schemas/messages';
import type { MessageDetail } from '@/types';
import { MessageBusinessType } from '@/types/enums';

interface ContentMessageBusinessInfoProps {
  /** Message detail. */
  detail: MessageDetail | null;
}

interface CardMessageBusinessInfoProps extends ContentMessageBusinessInfoProps {
  /** Layout class name. */
  className?: string;
}

/** Business Info Card */
export const CardMessageBusinessInfo = ({ detail, className }: CardMessageBusinessInfoProps) => (
  <Card className={className} size='small' title='Business Info'>
    <ContentMessageBusinessInfo detail={detail} />
  </Card>
);

/** Business Info Content */
export const ContentMessageBusinessInfo = ({ detail }: ContentMessageBusinessInfoProps) => {
  if (detail?.msgBasicInfo.businessType === MessageBusinessType.Other) {
    return (
      <Alert
        type='info'
        showIcon
        message='No structured business information for Other messages. The raw message remains available.'
      />
    );
  }

  const schema = getMessageSchema(detail?.msgBasicInfo.businessType);
  if (!schema) {
    return (
      <Alert
        type='info'
        showIcon
        message='No business information template is available for this business type. View or download the raw message instead.'
      />
    );
  }

  return <MessageSchemaForm schema={schema} values={detail ? { ...detail } : {}} pattern='disabled' />;
};
