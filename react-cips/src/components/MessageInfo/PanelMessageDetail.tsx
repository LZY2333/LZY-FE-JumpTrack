import { useRef } from 'react';
import { Alert, Tabs } from 'antd';
import ContentMessageRaw from '@/components/ContentMessageRaw';
import type { ContentMessageRawRef } from '@/components/ContentMessageRaw';
import { CardMessageBasicInfo } from './CardMessageBasicInfo';
import { CardMessageBusinessInfo } from './CardMessageBusinessInfo';
import useMessageDetail from './useMessageDetail';

interface PanelMessageDetailProps {
  /** 报文 ID */
  msgId?: string;
  /** 查临时表，目前 IOP Manual Entry、Inquiry Reply 使用 */
  temp?: boolean;
  /** 高亮字段 */
  highLightFields?: readonly string[];
}

/** 报文信息面板，切换展示基础与业务信息及报文原文 */
const PanelMessageDetail = ({ msgId, temp = false, highLightFields }: PanelMessageDetailProps) => {
  const messageRawRef = useRef<ContentMessageRawRef>(null);
  const { detail, detailError } = useMessageDetail({ msgId, temp });
  const msgDirection = detail?.msgBasicInfo.msgDirection;

  const tabs = [
    {
      key: 'structured',
      label: '报文信息',
      children: (
        <div>
          <CardMessageBasicInfo detail={detail} />
          <CardMessageBusinessInfo className='mt-3' detail={detail} highLightFields={highLightFields} />
        </div>
      ),
    },
    {
      key: 'raw',
      label: '报文明细',
      children: (
        <div className='flex h-96 min-h-0 flex-col overflow-hidden'>
          <ContentMessageRaw ref={messageRawRef} msgId={msgId} msgDirection={msgDirection} />
        </div>
      ),
    },
  ];

  return (
    <div>
      {detailError && <Alert className='mb-3' type='error' showIcon message={detailError} />}
      <Tabs size='small' defaultActiveKey='structured' items={tabs} />
    </div>
  );
};

export default PanelMessageDetail;
