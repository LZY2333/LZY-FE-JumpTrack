import { Alert } from 'antd';
import { CardMessageBasicInfo } from './CardMessageBasicInfo';
import { CardMessageBusinessInfo } from './CardMessageBusinessInfo';
import useMessageDetail from './useMessageDetail';

interface PanelMessageDetailProps {
  /** 报文 ID。 */
  msgId?: string;
  /** 报文方向。 */
  msgDirection?: string;
  /** 业务类型。 */
  businessType?: string;
  /** 是否查询临时表。 */
  temp?: boolean;
}

/** 查询并展示报文基础信息和业务信息。 */
const PanelMessageDetail = ({ msgId, msgDirection, businessType, temp = false }: PanelMessageDetailProps) => {
  const { detail, detailError } = useMessageDetail({ msgId, msgDirection, businessType, temp });

  return (
    <div className='h-full overflow-auto'>
      {detailError && <Alert className='mb-3' type='error' showIcon message={detailError} />}
      <CardMessageBasicInfo detail={detail} />
      <CardMessageBusinessInfo className='mt-3' detail={detail} />
    </div>
  );
};

export default PanelMessageDetail;
