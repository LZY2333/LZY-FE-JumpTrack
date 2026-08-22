import type { MessageDetail, MessageRaw } from '@/types';

/** 获取枚举展示文案；未登记的接口值直接回显，避免页面出现空白。 */
export const resolveLabel = <T extends string>(labels: Record<T, string>, value: T) => labels[value] || value;

/** 优先展示详情返回的报文编号，详情尚未返回时使用路由编号。 */
export const resolveDisplayMessageId = (detail: MessageDetail | null, messageId?: string) => detail?.msgId ?? messageId;

/** 原文加载中、请求未返回或内容为空时禁止复制。 */
export const isCopyDisabled = (raw: MessageRaw | null, rawLoading: boolean) => rawLoading || !raw?.content;
