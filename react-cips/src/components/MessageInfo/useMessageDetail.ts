import { useEffect, useState } from 'react';
import { getMessage } from '@/api/messages';
import { startGlobalLoading } from '@/store/useGlobalLoadingStore';
import type { MessageDetail } from '@/types';

type UseMessageDetailOptions = {
  /** 报文 ID。 */
  msgId?: string;
  /** 是否启用明细查询。 */
  enabled?: boolean;
  /** 是否查询临时表。 */
  temp?: boolean;
};

/** 加载报文明细。 */
const useMessageDetail = ({
  msgId,
  enabled = true,
  temp = false,
}: UseMessageDetailOptions) => {
  const [detail, setDetail] = useState<MessageDetail | null>(null);
  const [detailError, setDetailError] = useState<string>();
  const [refreshVersion, setRefreshVersion] = useState(0);

  useEffect(() => {
    if (!enabled) {
      setDetail(null);
      setDetailError(undefined);
      return;
    }

    if (!msgId) {
      setDetail(null);
      setDetailError('Message ID is required');
      return;
    }
    let active = true;
    const stopGlobalLoading = startGlobalLoading();
    setDetail(null);
    setDetailError(undefined);

    getMessage(msgId, temp)
      .then((data) => {
        if (!active) return;
        setDetail(data ?? null);
        if (!data) setDetailError('Message details were not found');
      })
      .catch((error: Error) => {
        if (active) setDetailError(error.message || 'Failed to load message details');
      })
      .finally(stopGlobalLoading);

    return () => {
      active = false;
      stopGlobalLoading();
    };
  }, [enabled, msgId, refreshVersion, temp]);

  return { detail, detailError, handleRefresh: () => setRefreshVersion((version) => version + 1) };
};

export default useMessageDetail;
