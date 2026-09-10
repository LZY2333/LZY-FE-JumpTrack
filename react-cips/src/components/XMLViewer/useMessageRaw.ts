import { useEffect, useState } from 'react';
import { getMessageRaw } from '@/api/messages';
import type { MessageRaw } from '@/api/messages';
import { MessageDirection } from '@/types/enums';

/** 加载 Raw Message。 */
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

/** 校验报文方向。 */
const isMessageDirection = (value?: string): value is MessageDirection =>
  value !== undefined && Object.values<string>(MessageDirection).includes(value);

export default useMessageRaw;
