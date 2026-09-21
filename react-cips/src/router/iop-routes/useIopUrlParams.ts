import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

/** 读取 IOP iframe 的 URL 参数，并映射为前端统一使用的 camelCase 字段名。 */
const useIopUrlParams = (): IopUrlParams => {
  const location = useLocation();

  return useMemo(() => {
    const searchParams = new URLSearchParams(location.search);

    // 左侧 key 是外部 IOP 的原始参数名；业务页只使用右侧统一后的字段名。
    return {
      applicationId: searchParams.get('applicationid') ?? '',
      iopWfTaskId: searchParams.get('taskid') ?? '',
      iopFlwiId: searchParams.get('flwiid') ?? '',
      iopWkiId: searchParams.get('wkiid') ?? '',
      iopNodNam: searchParams.get('nodnam') ?? '',
      userId: searchParams.get('userid') ?? '',
      orgId: searchParams.get('orgid') ?? '',
      userName: searchParams.get('userName') ?? '',
    };
  }, [location.search]);
};

export default useIopUrlParams;

export type IopUrlParams = {
  /** IOP 应用编号：applicationid。 */
  readonly applicationId: string;
  /** IOP 工作流任务编号：taskid，对应 PSSST_TRN_TASK_INFO.IOP_WF_TASK_ID。 */
  readonly iopWfTaskId: string;
  /** IOP 工作流实例编号：flwiid，对应 PSSST_TRN_TASK_INFO.IOP_FLWI_ID。 */
  readonly iopFlwiId: string;
  /** IOP 工作流节点编号：wkiid，对应 PSSST_TRN_TASK_INFO.IOP_WKI_ID。 */
  readonly iopWkiId: string;
  /** IOP 工作流节点名称：nodnam，对应 PSSST_TRN_TASK_INFO.IOP_NODNAM。 */
  readonly iopNodNam: string;
  /** 当前用户 ID：userid。 */
  readonly userId: string;
  /** 当前用户机构号：orgid。 */
  readonly orgId: string;
  /** 当前用户名称：userName。 */
  readonly userName: string;
};
