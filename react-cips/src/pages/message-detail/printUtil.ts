const PRINT_WINDOW_FEATURES = 'width=960,height=720';
const PRINT_DOCUMENT_STYLES = `
  @page { margin: 16mm; }
  body { margin: 0; color: #000; font-family: Consolas, "Courier New", monospace; }
  pre { margin: 0; white-space: pre-wrap; overflow-wrap: anywhere; font-size: 10pt; line-height: 1.5; }
`;

/** 创建独立文本打印文档，避免把详情页导航、Tab 和操作按钮一并打印。 */
export const printTextDocument = (title: string, content: string) => {
  const printWindow = window.open('', '_blank', PRINT_WINDOW_FEATURES);
  if (!printWindow) return false;

  printWindow.opener = null;
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
