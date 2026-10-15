import { useEffect, useState } from 'react';
import { getMessageRaws } from '@/api/messages';
import type { MessageRaw } from '@/api/messages';

/** 加载当前及关联报文原文，忽略已失效请求的响应 */
const useRaws = (msgId?: string) => {
  const [raws, setRaws] = useState<MessageRaw[]>([]);
  const [rawLoading, setRawLoading] = useState(Boolean(msgId));
  const [rawError, setRawError] = useState<string>();

  useEffect(() => {
    setRaws([]);
    setRawError(undefined);
    if (!msgId) {
      setRawError('Message ID is required');
      setRawLoading(false);
      return;
    }

    let active = true;
    setRawLoading(true);
    getMessageRaws(msgId)
      .then((data) => {
        if (active) setRaws(data ?? []);
      })
      .catch((requestError: Error) => {
        if (active) setRawError(requestError.message || 'Failed to load raw messages');
      })
      .finally(() => {
        if (active) setRawLoading(false);
      });

    return () => {
      active = false;
    };
  }, [msgId]);

  return { raws, rawLoading, rawError };
};

export default useRaws;
