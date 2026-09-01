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
      setRawError('Message ID is required');
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
  }, [messageId]);

  return { raw, rawLoading, rawError };
};

export default useMessageRaw;
