import { useEffect, useState } from 'react';
import { getMessageRaw } from '@/api/messages';
import type { MessageRaw } from '@/api/messages';
import { MessageDirection } from '@/types/enums';

type UseMessageRawParams = {
  /** 报文 ID。 */
  msgId?: string;
  /** 报文方向。 */
  msgDirection?: string;
  /** 是否发起 Raw Message 请求。 */
  enabled?: boolean;
};

/** 加载 Raw Message 数据。 */
const useMessageRaw = ({ msgId, msgDirection, enabled = true }: UseMessageRawParams) => {
  const [raw, setRaw] = useState<MessageRaw | null>(null);
  const [rawLoading, setRawLoading] = useState(false);
  const [rawError, setRawError] = useState<string>();

  useEffect(() => {
    if (!enabled) {
      setRaw(null);
      setRawError(undefined);
      setRawLoading(false);
      return;
    }

    if (!msgId) {
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

    getMessageRaw({ msgId, msgDirection })
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
  }, [enabled, msgDirection, msgId]);

  return { raw, rawLoading, rawError };
};

/** 校验报文方向。 */
const isMessageDirection = (value?: string): value is MessageDirection =>
  value !== undefined && Object.values<string>(MessageDirection).includes(value);

export default useMessageRaw;
