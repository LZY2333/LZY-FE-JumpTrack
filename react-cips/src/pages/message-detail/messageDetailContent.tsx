import { Alert, Card } from 'antd';
import type { MessageDetail } from '@/types';
import MessageSchemaForm from '@/components/MessageSchemaForm';
import { getMessageSchema, messageBasicInfoSchema } from '@/schemas/messages';
import { toMessageBasicFormData } from '@/utils/messageUtil';

interface MessageBasicInfoPanelProps {
  /** 当前报文明细；请求完成前允许为空。 */
  detail: MessageDetail | null;
  /** 调用方用于参与页面布局的样式类。 */
  className?: string;
}

interface MessageBusinessContentProps {
  /** 当前报文明细；用于选择业务 Schema 并填充字段。 */
  detail: MessageDetail | null;
}

interface MessageBusinessInfoPanelProps extends MessageBusinessContentProps {
  /** 调用方用于参与页面布局的样式类。 */
  className?: string;
}

/** 基础信息面板：使用禁用 Input 保留表单形态和字段边界。 */
export const MessageBasicInfoPanel = ({ detail, className }: MessageBasicInfoPanelProps) => (
  <Card className={className} size='small' title='基础信息'>
    <MessageSchemaForm
      schema={messageBasicInfoSchema}
      values={detail ? toMessageBasicFormData(detail) : {}}
      pattern='disabled'
    />
  </Card>
);

/** 业务信息内容：按报文类型选择结构化 Schema。 */
export const MessageBusinessContent = ({ detail }: MessageBusinessContentProps) => {
  const schema = getMessageSchema(detail?.msgType);
  if (!schema) {
    return <Alert type='info' showIcon message='当前报文类型暂无业务信息模板，可查看或下载报文原文。' />;
  }
  return <MessageSchemaForm schema={schema} values={detail?.formData ?? {}} pattern='disabled' />;
};

/** 业务信息面板：供弹窗等无 Tab 容器的简化明细复用。 */
export const MessageBusinessInfoPanel = ({ detail, className }: MessageBusinessInfoPanelProps) => (
  <Card className={className} size='small' title='业务信息'>
    <MessageBusinessContent detail={detail} />
  </Card>
);
