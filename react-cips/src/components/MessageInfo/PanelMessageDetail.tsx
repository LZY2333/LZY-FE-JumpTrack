import { Alert } from 'antd';
import { CardMessageBasicInfo } from './CardMessageBasicInfo';
import { CardMessageBusinessInfo } from './CardMessageBusinessInfo';
import useMessageDetail from './useMessageDetail';

interface PanelMessageDetailProps {
  /** 报文 ID。 */
  msgId?: string;
  /** 查临时表，目前 IOP Manual Entry、Inquiry Reply 使用。 */
  temp?: boolean;
  /** 高亮字段。 */
  highLightFields?: readonly string[];
}

/** 报文信息 基础+业务，自动查询 纯展示组件 */
const PanelMessageDetail = ({
  msgId,
  temp = false,
  highLightFields,
}: PanelMessageDetailProps) => {
  const { detail, detailError } = useMessageDetail({ msgId, temp });

  return (
    <div className='h-full overflow-auto'>
      {detailError && <Alert className='mb-3' type='error' showIcon message={detailError} />}
      <CardMessageBasicInfo detail={detail} />
      <CardMessageBusinessInfo className='mt-3' detail={detail} highLightFields={highLightFields} />
    </div>
  );
};

export default PanelMessageDetail;
