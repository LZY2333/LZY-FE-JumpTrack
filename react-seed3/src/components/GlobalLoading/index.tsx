import { Spin } from 'antd';
import useGlobalLoadingStore from '@/store/useGlobalLoadingStore';
import useUserStore from '@/store/useUserStore';
import { AuthStatus } from '@/types/enums';

const GlobalLoading = () => {
  const taskLoading = useGlobalLoadingStore((state) => state.pendingCount > 0);
  const authLoading = useUserStore((state) => state.authStatus === AuthStatus.Checking);

  return <Spin fullscreen spinning={authLoading || taskLoading} size='large' tip='Loading' />;
};

export default GlobalLoading;
