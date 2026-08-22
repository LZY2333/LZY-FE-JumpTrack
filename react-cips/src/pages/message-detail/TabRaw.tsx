import { useEffect, useState } from 'react';
import { Alert, App, Button, Empty, Spin } from 'antd';
import { CopyOutlined, DownloadOutlined } from '@ant-design/icons';
import { downloadMessage, getMessageRaw } from '@/api/messages';
import XMLViewer from '@/components/XMLViewer';
import type { MessageRaw } from '@/types';
import { copyText, saveBlobResponse } from '@/utils/fileUtil';
import { isCopyDisabled } from './util';

/** 报文原文 Tab：独立加载、复制和下载报文系统接收或发送的原始 XML。 */
const TabRaw = ({ messageId }: { messageId?: string }) => {
  const { message } = App.useApp();
  const [raw, setRaw] = useState<MessageRaw | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!messageId) {
      setRaw(null);
      setError('缺少报文标识号');
      setLoading(false);
      return;
    }

    let active = true;
    setRaw(null);
    setError(undefined);
    setLoading(true);

    getMessageRaw(messageId)
      .then((data) => {
        if (!active) return;
        setRaw(data ?? null);
        if (!data) setError('未返回原始报文');
      })
      .catch((requestError: Error) => {
        if (active) setError(requestError.message || '原始报文加载失败');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [messageId]);

  const handleCopy = () => {
    if (!raw?.content) return;
    copyText(raw.content)
      .then(() => message.success('原文已复制'))
      .catch(() => message.error('复制失败'));
  };

  const handleDownload = () => {
    if (!messageId || downloading) return;
    setDownloading(true);
    downloadMessage(messageId)
      .then((response) => saveBlobResponse(response, raw?.fileName || `${messageId}.xml`))
      .finally(() => setDownloading(false));
  };

  const content = raw?.content ? (
    <XMLViewer className='min-h-0 flex-1 text-xs' xml={raw.content} />
  ) : (
    <div className='flex flex-1 items-center justify-center'>
      <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description='暂无原始报文' />
    </div>
  );

  return (
    <div className='flex h-full flex-col'>
      {error && <Alert className='mb-2 shrink-0' type='error' showIcon message={error} />}
      <div className='mb-2 flex shrink-0 justify-end gap-2'>
        <Button size='small' icon={<CopyOutlined />} disabled={isCopyDisabled(raw, loading)} onClick={handleCopy}>
          复制原文
        </Button>
        <Button
          size='small'
          icon={<DownloadOutlined />}
          loading={downloading}
          disabled={!messageId}
          onClick={handleDownload}
        >
          下载原文
        </Button>
      </div>
      <div className='flex min-h-0 flex-1 flex-col'>
        {loading ? (
          <div className='flex flex-1 items-center justify-center gap-2'>
            <Spin size='small' />
            <span>正在加载原文</span>
          </div>
        ) : (
          content
        )}
      </div>
    </div>
  );
};

export default TabRaw;
