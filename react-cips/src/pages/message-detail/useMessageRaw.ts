import { useEffect, useState } from 'react';
import { getMessageRaw } from '@/api/messages';
import type { MessageRaw } from '@/types';
import { MessageDirection } from '@/types/enums';

/** 加载当前报文原文，供详情页操作区和原文 Tab 共享。 */
const useMessageRaw = (messageId?: string, msgDirection?: string) => {
  const [raw, setRaw] = useState<MessageRaw | null>(null);
  const [rawLoading, setRawLoading] = useState(false);
  const [rawError, setRawError] = useState<string>();

  useEffect(() => {
    if (!messageId) {
      setRaw(null);
      setRawError('Message ID is required');
      setRawLoading(false);
      return;
    }
    if (!isMessageDirection(msgDirection)) {
      setRaw(null);
      setRawError('A valid message direction is required');
      setRawLoading(false);
      return;
    }

    let active = true;
    setRaw(null);
    setRawError(undefined);
    setRawLoading(true);

    getMessageRaw({ msgId: messageId, msgDirection })
      .then((data) => {
        if (!active) return;
        setRaw(data ?? null);
        if (!data) setRawError('No raw message was returned');
      })
      .catch((requestError: Error) => {
        if (active) setRawError(requestError.message || 'Failed to load the raw message');
      })
      .finally(() => {
        if (active) setRawLoading(false);
      });

    return () => {
      active = false;
    };
  }, [messageId, msgDirection]);

  return { raw, rawLoading, rawError };
};

/** 校验 URL 中的方向参数，避免使用非法值调用原文接口。 */
const isMessageDirection = (value?: string): value is MessageDirection =>
  value !== undefined && Object.values<string>(MessageDirection).includes(value);

export default useMessageRaw;
