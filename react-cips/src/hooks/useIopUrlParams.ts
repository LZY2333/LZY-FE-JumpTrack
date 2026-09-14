import { useLocation } from 'react-router-dom';

/** 读取当前路由中的 IOP 页面参数。 */
const useIopUrlParams = (): IopUrlParams => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  return {
    wkiId: searchParams.get('wkiid') ?? '',
    taskId: searchParams.get('taskid') ?? '',
    flwiId: searchParams.get('flwiid') ?? '',
    nodeName: searchParams.get('nodnam') ?? '',
    userId: searchParams.get('userid') ?? '',
    orgId: searchParams.get('orgid') ?? '',
    userName: searchParams.get('userName') ?? '',
  };
};

export default useIopUrlParams;

export type IopUrlParams = {
  /** 工作项 ID。 */
  readonly wkiId: string;
  /** 任务 ID。 */
  readonly taskId: string;
  /** 流程实例 ID。 */
  readonly flwiId: string;
  /** 节点名称。 */
  readonly nodeName: string;
  /** 用户 ID。 */
  readonly userId: string;
  /** 机构 ID。 */
  readonly orgId: string;
  /** 用户名称。 */
  readonly userName: string;
};
