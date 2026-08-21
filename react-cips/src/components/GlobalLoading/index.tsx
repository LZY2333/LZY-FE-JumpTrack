import { Spin } from 'antd';
import useGlobalLoadingStore from '@/store/useGlobalLoadingStore';

const GlobalLoading = () => {
  const taskLoading = useGlobalLoadingStore((state) => state.pendingCount > 0);

  return <Spin fullscreen spinning={taskLoading} size='large' tip='Loading' />;
};

export default GlobalLoading;
