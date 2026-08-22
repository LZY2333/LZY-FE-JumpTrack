import { useEffect, useState } from 'react';
import { getMessage } from '@/api/messages';
import type { MessageDetail } from '@/types';
import { startGlobalLoading } from '@/store/useGlobalLoadingStore';

/** 加载报文基础信息和结构化字段，Tab 内的独立业务数据由各 Tab 自行请求。 */
const useMessageDetail = (messageId?: string) => {
  const [detail, setDetail] = useState<MessageDetail | null>(null);
  const [detailError, setDetailError] = useState<string>();

  useEffect(() => {
    if (!messageId) {
      setDetail(null);
      setDetailError('缺少报文标识号');
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
        if (!data) setDetailError('未找到报文明细');
      })
      .catch((error: Error) => {
        if (active) setDetailError(error.message || '报文明细加载失败');
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
