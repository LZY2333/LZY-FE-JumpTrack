import type { AxiosResponse } from 'axios';

const UTF8_FILE_NAME_PATTERN = /filename\*=UTF-8''([^;]+)/i;
const FILE_NAME_PATTERN = /filename="?([^";]+)"?/i;

/** 从 Content-Disposition 解析 UTF-8 或普通文件名。 */
export const getDownloadFileName = (contentDisposition?: string, fallback = 'download') => {
  if (!contentDisposition) return fallback;
  const utf8Match = contentDisposition.match(UTF8_FILE_NAME_PATTERN);
  if (utf8Match?.[1]) return decodeURIComponent(utf8Match[1]);
  return contentDisposition.match(FILE_NAME_PATTERN)?.[1] || fallback;
};

/** 使用浏览器原生能力保存 Blob，并在触发下载后立即释放临时 URL。 */
export const saveBlobResponse = (response: AxiosResponse<Blob>, fallbackFileName: string) => {
  const fileName = getDownloadFileName(response.headers['content-disposition'], fallbackFileName);
  const url = URL.createObjectURL(response.data);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
};

/** 优先使用 Clipboard API；非安全上下文回退到浏览器原生复制命令。 */
export const copyText = async (value: string) => {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const textarea = document.createElement('textarea');
  textarea.value = value;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand('copy');
  document.body.removeChild(textarea);
  if (!copied) throw new Error('浏览器未允许复制');
};
