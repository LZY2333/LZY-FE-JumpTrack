import { useEffect, useState } from 'react';
import { Alert, App, Button, Empty, Spin } from 'antd';
import { CopyOutlined, DownloadOutlined, PrinterOutlined } from '@ant-design/icons';
import { downloadMessage, getMessageRaw } from '@/api/messages';
import XMLViewer from '@/components/XMLViewer';
import type { MessageRaw } from '@/types';
import { copyText, saveBlobResponse } from '@/utils/fileUtil';
import { isRawContentActionDisabled } from './util';
import { printTextDocument } from './printUtil';

interface TabRawProps {
  /** 当前报文标识号，用于加载、下载和命名原文。 */
  messageId?: string;
}

/** 报文原文 Tab：独立加载、复制、打印和下载报文系统接收或发送的原始 XML。 */
const TabRaw = ({ messageId }: TabRawProps) => {
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

  /** 打开只包含当前 XML 原文的浏览器打印窗口。 */
  const handlePrint = () => {
    if (!raw?.content) return;
    const opened = printTextDocument(raw.fileName || `${messageId || 'message'}.xml`, raw.content);
    if (!opened) message.error('打印窗口被浏览器拦截，请允许弹出窗口后重试');
  };

  const rawContentActionDisabled = isRawContentActionDisabled(raw, loading);

  const content = raw?.content ? (
    <XMLViewer className='min-h-0 flex-1 text-xs' xml={raw.content} />
  ) : (
    <div className='flex flex-1 items-center justify-center'>
      <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description='暂无原始报文' />
    </div>
  );

  return (
    <div className='flex min-h-0 flex-1 flex-col'>
      {error && <Alert className='mb-2 shrink-0' type='error' showIcon message={error} />}
      <div className='mb-2 flex shrink-0 justify-start gap-2'>
        <Button size='small' icon={<CopyOutlined />} disabled={rawContentActionDisabled} onClick={handleCopy}>
          复制原文
        </Button>
        <Button size='small' icon={<PrinterOutlined />} disabled={rawContentActionDisabled} onClick={handlePrint}>
          打印原文
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
