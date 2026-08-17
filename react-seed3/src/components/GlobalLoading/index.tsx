import { Spin } from 'antd';
import useGlobalLoadingStore from '@/store/useGlobalLoadingStore';

export default function GlobalLoading() {
  const loading = useGlobalLoadingStore((state) => state.pendingCount > 0);

  if (!loading) return null;

  return (
    <div
      className='fixed inset-0 z-[2000] flex cursor-wait items-center justify-center'
      role='status'
      aria-label='Loading'
    >
      <div className='rounded-lg bg-white/90 px-6 py-5 shadow-lg'>
        <Spin size='large' />
      </div>
    </div>
  );
}
