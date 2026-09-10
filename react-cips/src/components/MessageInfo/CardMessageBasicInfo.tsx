import CardCollapse from '@/components/CardCollapse';
import MessageSchemaForm from '@/components/MessageSchemaForm';
import { messageBasicInfoSchema } from '@/schemas/messages';
import type { MessageDetail } from '@/types';
import { toMessageBasicFormData } from './messageDetailUtil';

interface ContentMessageBasicInfoProps {
  /** Message detail. */
  detail: MessageDetail | null;
}

interface CardMessageBasicInfoProps extends ContentMessageBasicInfoProps {
  /** Layout class name. */
  className?: string;
}

/** Basic Info Card */
export const CardMessageBasicInfo = ({ detail, className }: CardMessageBasicInfoProps) => (
  <CardCollapse className={className} size='small' title='Basic Info'>
    <ContentMessageBasicInfo detail={detail} />
  </CardCollapse>
);

/** Basic Info Content */
export const ContentMessageBasicInfo = ({ detail }: ContentMessageBasicInfoProps) => (
  <MessageSchemaForm
    schema={messageBasicInfoSchema}
    values={detail ? toMessageBasicFormData(detail.msgBasicInfo) : {}}
    pattern='disabled'
  />
);
