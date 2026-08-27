import dayjs from 'dayjs';
import type { MessageDetail, MessageRaw, MessageRecord } from '@/types';
import {
  BUSINESS_STATUS_LABELS,
  BUSINESS_TYPE_LABELS,
  MESSAGE_DIRECTION_LABELS,
  TRANSMISSION_STATUS_LABELS,
} from '@/types/enums';

// #region ==================== 报文原文打印 Util ====================

const PRINT_WINDOW_FEATURES = 'width=960,height=720';
const PRINT_DOCUMENT_STYLES = `
  @page { margin: 16mm; }
  body { margin: 0; color: #000; font-family: Consolas, "Courier New", monospace; }
  pre { margin: 0; white-space: pre-wrap; overflow-wrap: anywhere; font-size: 10pt; line-height: 1.5; }
`;

/** 创建独立文本打印文档，避免把详情页导航、Tab 和操作按钮一并打印。 */
export const openTextPrintWindow = () => {
  const printWindow = window.open('', '_blank', PRINT_WINDOW_FEATURES);
  if (printWindow) printWindow.opener = null;
  return printWindow;
};

/** 向用户操作同步打开的窗口写入纯文本并触发打印。 */
export const printTextDocument = (title: string, content: string, printWindow = openTextPrintWindow()) => {
  if (!printWindow) return false;

  printWindow.document.title = title;
  appendPrintDocumentContent(printWindow.document, content);
  printWindow.document.close();
  printWindow.addEventListener('afterprint', () => printWindow.close(), { once: true });
  printWindow.focus();
  printWindow.print();
  return true;
};

/** 使用 DOM API 写入纯文本，确保报文内容不会被当作 HTML 解析。 */
const appendPrintDocumentContent = (document: Document, content: string) => {
  const charset = document.createElement('meta');
  charset.setAttribute('charset', 'UTF-8');

  const style = document.createElement('style');
  style.textContent = PRINT_DOCUMENT_STYLES;

  const rawContent = document.createElement('pre');
  rawContent.textContent = content;

  document.head.append(charset, style);
  document.body.append(rawContent);
};

// #endregion ==================== 报文原文打印 Util ====================

/** 获取枚举展示文案；未登记的接口值直接回显，空值统一展示 --。 */
export const resolveLabel = <T extends string>(labels: Record<T, string>, value: T) => labels[value] || value || '--';

/** 优先展示详情返回的报文编号，其次使用路由编号，均为空时展示 --。 */
export const resolveDisplayMessageId = (detail: MessageDetail | null, messageId?: string) =>
  detail?.msgId || messageId || '--';

/** 原文加载中、请求未返回或内容为空时禁用依赖原文内容的操作。 */
export const isRawContentActionDisabled = (raw: MessageRaw | null, rawLoading: boolean) => rawLoading || !raw?.content;

// #region ==================== 报文基础信息展示值 ====================

const DATE_TIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';
const DATE_FORMAT = 'YYYY-MM-DD';

/** 将详情公共字段转换为只读表单值；只转换展示格式，不补空值。 */
export const toMessageBasicFormData = (record: MessageRecord): Record<string, unknown> => ({
  ...record,
  msgDirection: resolveLabel(MESSAGE_DIRECTION_LABELS, record.msgDirection),
  businessType: resolveLabel(BUSINESS_TYPE_LABELS, record.businessType),
  transmissionStatus: resolveLabel(TRANSMISSION_STATUS_LABELS, record.transmissionStatus),
  businessStatus: resolveLabel(BUSINESS_STATUS_LABELS, record.businessStatus),
  msgRecvDate: formatDateTime(record.msgRecvDate),
  msgSendTime: formatDateTime(record.msgSendTime),
  messageTime: formatDate(record.messageTime),
  createTime: formatDateTime(record.createTime),
  updateTime: formatDateTime(record.updateTime),
});

/** 将有效时间转换为详情展示格式，空值和非法时间保持原值。 */
const formatDateTime = (value: string | null) => {
  if (!value) return value;
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format(DATE_TIME_FORMAT) : value;
};

/** 将有效日期转换为详情展示格式，空值和非法日期保持原值。 */
const formatDate = (value: string | null) => {
  if (!value) return value;
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format(DATE_FORMAT) : value;
};

// #endregion ==================== 报文基础信息展示值 ====================
