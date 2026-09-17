import type { MessageRaw } from '@/api/messages';

// #region ==================== 报文原文打印 Util ====================

const PRINT_WINDOW_FEATURES = 'width=960,height=720';
const PRINT_DOCUMENT_STYLES = `
  @page { margin: 16mm; }
  body { margin: 0; color: #000; font-family: Consolas, "Courier New", monospace; }
  pre { margin: 0; white-space: pre-wrap; overflow-wrap: anywhere; font-size: 10pt; line-height: 1.5; }
`;

/** 向用户操作同步打开的窗口写入格式化 XML 并触发打印。 */
export const printXmlDocument = (title: string, content: string, printWindow = openTextPrintWindow()) => {
  if (!printWindow) return false;

  printWindow.document.title = title;
  appendPrintDocumentHead(printWindow.document);
  appendPrintTextContent(printWindow.document, content);
  triggerPrint(printWindow);
  return true;
};

/** 创建独立文本打印文档，避免把详情页导航、Tab 和操作按钮一并打印。 */
const openTextPrintWindow = () => {
  const printWindow = window.open('', '_blank', PRINT_WINDOW_FEATURES);
  if (printWindow) printWindow.opener = null;
  return printWindow;
};

/** 写入打印页面的基础元数据和样式。 */
const appendPrintDocumentHead = (document: Document) => {
  const charset = document.createElement('meta');
  charset.setAttribute('charset', 'UTF-8');

  const style = document.createElement('style');
  style.textContent = PRINT_DOCUMENT_STYLES;

  document.head.append(charset, style);
};

/** 使用 DOM API 写入纯文本，确保报文内容不会被当作 HTML 解析。 */
const appendPrintTextContent = (document: Document, content: string) => {
  const rawContent = document.createElement('pre');
  rawContent.textContent = content;

  document.body.append(rawContent);
};

/** 完成打印文档并在打印结束后关闭临时窗口。 */
const triggerPrint = (printWindow: Window) => {
  printWindow.document.close();
  printWindow.addEventListener('afterprint', () => printWindow.close(), { once: true });
  printWindow.focus();
  printWindow.print();
};

// #endregion ==================== 报文原文打印 Util ====================

/** 原文加载中、请求未返回或内容为空时禁用依赖原文内容的操作。 */
export const isRawContentActionDisabled = (raw: MessageRaw | null, rawLoading: boolean) =>
  rawLoading || !raw?.msgContent;
