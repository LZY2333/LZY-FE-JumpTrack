import type { MessageDetail, MessageRaw } from '@/types';

/** 获取枚举展示文案；未登记的接口值直接回显，空值统一展示 --。 */
export const resolveLabel = <T extends string>(labels: Record<T, string>, value: T) => labels[value] || value || '--';

/** 优先展示详情返回的报文编号，其次使用路由编号，均为空时展示 --。 */
export const resolveDisplayMessageId = (detail: MessageDetail | null, messageId?: string) =>
  detail?.msgId || messageId || '--';

/** 原文加载中、请求未返回或内容为空时禁用依赖原文内容的操作。 */
export const isRawContentActionDisabled = (raw: MessageRaw | null, rawLoading: boolean) => rawLoading || !raw?.content;
