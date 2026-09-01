import { useEffect, useState } from 'react';
import { getMessage } from '@/api/messages';
import type { MessageDetail } from '@/types';
import { startGlobalLoading } from '@/store/useGlobalLoadingStore';

/** 加载报文基础信息和结构化字段，原文等独立资源由各自的 Hook 负责。 */
const useMessageDetail = (messageId?: string) => {
  const [detail, setDetail] = useState<MessageDetail | null>(null);
  const [detailError, setDetailError] = useState<string>();

  useEffect(() => {
    if (!messageId) {
      setDetail(null);
      setDetailError('Message ID is required');
      return;
    }

    let active = true;
    const stopGlobalLoading = startGlobalLoading();
    setDetail(null);
    setDetailError(undefined);

    getMessage(messageId)
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
  }, [messageId]);

  return { detail, detailError };
};

export default useMessageDetail;
