import { Navigate, useLocation, useOutletContext } from 'react-router-dom';
import { IOP_TASK_ROUTE_PATHS } from './index';
import type { IopTaskData } from './useIopGuard';

/** 从 IOP 根路径按 Task 类型跳转到对应业务页面。 */
const IopIndex = () => {
  const task = useOutletContext<IopTaskData>();
  const location = useLocation();
  const routePath = IOP_TASK_ROUTE_PATHS[task.taskFlowNo];

  // IopGuard 已统一拦截不支持的 Task 类型。
  if (!routePath) return null;

  return <Navigate to={{ pathname: routePath, search: location.search }} replace />;
};

export default IopIndex;
