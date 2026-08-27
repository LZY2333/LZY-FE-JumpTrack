import { useEffect, useState } from 'react';
import { getMessageRaw } from '@/api/messages';
import type { MessageRaw } from '@/types';

/** 加载当前报文原文，供详情页操作区和原文 Tab 共享。 */
const useMessageRaw = (messageId?: string) => {
  const [raw, setRaw] = useState<MessageRaw | null>(null);
  const [rawLoading, setRawLoading] = useState(false);
  const [rawError, setRawError] = useState<string>();

  useEffect(() => {
    if (!messageId) {
      setRaw(null);
      setRawError('缺少报文标识号');
      setRawLoading(false);
      return;
    }

    let active = true;
    setRaw(null);
    setRawError(undefined);
    setRawLoading(true);

    getMessageRaw(messageId)
      .then((data) => {
        if (!active) return;
        setRaw(data ?? null);
        if (!data) setRawError('未返回原始报文');
      })
      .catch((requestError: Error) => {
        if (active) setRawError(requestError.message || '原始报文加载失败');
      })
      .finally(() => {
        if (active) setRawLoading(false);
      });

    return () => {
      active = false;
    };
  }, [messageId]);

  return { raw, rawLoading, rawError };
};

export default useMessageRaw;
