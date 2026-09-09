import { useEffect, useState } from 'react';
import { getMessage } from '@/api/messages';
import type { MessageDetail } from '@/types';
import { MessageBusinessType, MessageDirection } from '@/types/enums';
import { startGlobalLoading } from '@/store/useGlobalLoadingStore';

/** 加载报文基础信息和结构化字段，原文等独立资源由各自的 Hook 负责。 */
const useMessageDetail = (msgId?: string, msgDirection?: string, businessType?: string) => {
  const [detail, setDetail] = useState<MessageDetail | null>(null);
  const [detailError, setDetailError] = useState<string>();

  useEffect(() => {
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

    getMessage({ msgId, msgDirection, businessType })
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
  }, [businessType, msgDirection, msgId]);

  return { detail, detailError };
};

/** 校验 URL 中的方向参数，避免使用非法值调用详情接口。 */
const isMessageDirection = (value?: string): value is MessageDirection =>
  value !== undefined && Object.values<string>(MessageDirection).includes(value);

/** 校验 URL 中的业务类型参数，确保后端能够选择对应实体表。 */
const isMessageBusinessType = (value?: string): value is MessageBusinessType =>
  value !== undefined && Object.values<string>(MessageBusinessType).includes(value);

export default useMessageDetail;
