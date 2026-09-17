import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

/** 读取 IOP iframe 的 URL 参数，返回业务和任务表字段约定的 camelCase 名称。 */
const useIopUrlParams = (): IopUrlParams => {
  const location = useLocation();

  return useMemo(() => {
    const searchParams = new URLSearchParams(location.search);

    // 左侧 key 是外部 IOP 的原始参数名；业务页只使用右侧统一后的字段名。
    return {
      busRefNo: searchParams.get('applicationid') ?? '',
      iopWfTaskId: searchParams.get('taskid') ?? searchParams.get('wkiid') ?? '',
      iopFlwiId: searchParams.get('flwiid') ?? '',
      iopNodnam: searchParams.get('nodnam') ?? '',
      userId: searchParams.get('userid') ?? '',
      orgId: searchParams.get('orgid') ?? '',
      userName: searchParams.get('userName') ?? '',
    };
  }, [location.search]);
};

export default useIopUrlParams;

export type IopUrlParams = {
  /** 外围系统业务流水（msg_id）。 */
  readonly busRefNo: string;
  /** IOP 工作流任务编号，对应 PSSST_TRN_TASK_INFO.IOP_WF_TASK_ID。 */
  readonly iopWfTaskId: string;
  /** IOP 工作流实例编号 */
  readonly iopFlwiId: string;
  /** IOP 工作流节点code */
  readonly iopNodnam: string;
  /** 当前用户 ID */
  readonly userId: string;
  /** 当前用户机构号 */
  readonly orgId: string;
  /** 用户名称。 */
  readonly userName: string;
};
