import { useEffect, useState } from 'react';
import { getMessage, getMessageTemp } from '@/api/messages';
import { startGlobalLoading } from '@/store/useGlobalLoadingStore';
import type { MessageDetail } from '@/types';
import { MessageBusinessType, MessageDirection } from '@/types/enums';

type UseMessageDetailOptions = {
  /** 报文 ID。 */
  msgId?: string;
  /** 报文方向。 */
  msgDirection?: string;
  /** 业务类型。 */
  businessType?: string;
  /** 是否启用明细查询。 */
  enabled?: boolean;
  /** 是否查询临时表。 */
  temp?: boolean;
};

/** 加载报文明细。 */
const useMessageDetail = ({
  msgId,
  msgDirection,
  businessType,
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
    if (!isMessageDirection(msgDirection)) {
      setDetail(null);
      setDetailError('A valid message direction is required');
      return;
    }
    if (!isMessageBusinessType(businessType)) {
      setDetail(null);
      setDetailError('A valid business type is required');
      return;
    }

    let active = true;
    const stopGlobalLoading = startGlobalLoading();
    setDetail(null);
    setDetailError(undefined);

    const requestMessageDetail = temp ? getMessageTemp : getMessage;
    requestMessageDetail({ msgId, msgDirection, businessType })
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
  }, [businessType, enabled, msgDirection, msgId, refreshVersion, temp]);

  return { detail, detailError, handleRefresh: () => setRefreshVersion((version) => version + 1) };
};

/** 校验报文方向。 */
const isMessageDirection = (value?: string): value is MessageDirection =>
  value !== undefined && Object.values<string>(MessageDirection).includes(value);

/** 校验业务类型。 */
const isMessageBusinessType = (value?: string): value is MessageBusinessType =>
  value !== undefined && Object.values<string>(MessageBusinessType).includes(value);

export default useMessageDetail;
