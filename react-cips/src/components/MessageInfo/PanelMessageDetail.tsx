import { Alert, Tabs } from 'antd';
import ContentMessageRaw from '@/components/ContentMessageRaw';
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
  /** 是否展示报文原文 */
  showRaw?: boolean;
}

/** 报文信息面板，切换展示基础与业务信息及报文原文 */
const PanelMessageDetail = ({ msgId, temp = false, highLightFields, showRaw = true }: PanelMessageDetailProps) => {
  const { detail, detailError } = useMessageDetail({ msgId, temp });

  const tabs = [
    {
      key: 'structured',
      label: 'Message Info',
      children: (
        <div>
          <CardMessageBasicInfo detail={detail} />
          <CardMessageBusinessInfo className='mt-3' detail={detail} highLightFields={highLightFields} />
        </div>
      ),
    },
    ...(showRaw
      ? [
          {
            key: 'raw',
            label: 'Message Raw',
            forceRender: true,
            children: (
              <div className='flex h-96 flex-col overflow-hidden'>
                <ContentMessageRaw msgId={msgId} />
              </div>
            ),
          },
        ]
      : []),
  ];

  return (
    <div>
      {detailError && <Alert className='mb-3' type='error' showIcon message={detailError} />}
      <Tabs size='small' defaultActiveKey='structured' items={tabs} />
    </div>
  );
};

export default PanelMessageDetail;
