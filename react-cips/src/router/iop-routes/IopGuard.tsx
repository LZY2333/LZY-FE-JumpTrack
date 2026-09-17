import { Button, Result } from 'antd';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { RoutePath } from '../routePath';
import { IOP_TASK_ROUTE_PATHS } from './index';
import useIopGuard from './useIopGuard';

/** 在进入 IOP 业务路由前统一加载并校验 Task。 */
const IopGuard = () => {
  const iopContext = useIopGuard();
  const location = useLocation();

  if (iopContext.loading) return null;

  if (iopContext.error || !iopContext.data) {
    return (
      <Result
        status='error'
        title='Unable to open IOP task'
        subTitle={iopContext.error ?? 'IOP task data unavailable.'}
        extra={<Button onClick={iopContext.handleRetry}>Retry</Button>}
      />
    );
  }

  const routePath = IOP_TASK_ROUTE_PATHS[iopContext.data.taskFlowNo];
  if (!routePath) {
    return (
      <Result
        status='error'
        title='Unable to open IOP task'
        subTitle={`Unsupported IOP task type: ${iopContext.data.taskFlowNo}`}
      />
    );
  }

  const currentPath = location.pathname.replace(/\/$/, '') || RoutePath.IopRoot;
  if (currentPath !== RoutePath.IopRoot && currentPath !== routePath) {
    return <Navigate to={{ pathname: routePath, search: location.search }} replace />;
  }

  return <Outlet context={iopContext.data} />;
};

export default IopGuard;
