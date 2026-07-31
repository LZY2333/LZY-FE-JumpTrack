import { useEffect, useRef, useState } from 'react';
import { Select } from 'antd';
import { UserSwitchOutlined } from '@ant-design/icons';
import useUserStore from '@/store/useUserStore';
import { getUsers } from '@/api/users';
import type { User } from '@/types';

export default function DevUserSwitcher() {
  const { user, login } = useUserStore();
  const mockEnabled = __MOCK_ENABLED__;
  const [users, setUsers] = useState<User[]>([]);
  const [pos, setPos] = useState<{ y: number; side: 'left' | 'right' }>({ y: 80, side: 'right' });
  const dragging = useRef(false);

  useEffect(() => {
    if (!mockEnabled) return;

    getUsers().then((res) => {
      if (!res?.length) {
        setUsers([]);
        return;
      }
      login(res[0].id);
      setUsers(res);
    });
  }, [mockEnabled]);

  const handlePointerDown = (e: React.PointerEvent) => {
    dragging.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    const y = Math.min(Math.max(e.clientY, 8), window.innerHeight - 48);
    const side = e.clientX < window.innerWidth / 2 ? 'left' : 'right';
    setPos({ y, side });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    dragging.current = false;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

  // 仅本地 Mock 模式展示，代理真实后端或生产构建时不渲染
  if (!mockEnabled) return null;

  const sideClass = pos.side === 'right' ? 'right-0 flex-row-reverse' : 'left-0 flex-row';

  return (
    <div className={`group fixed z-50 flex items-center gap-2 ${sideClass}`} style={{ top: pos.y }}>
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className='flex h-10 w-10 cursor-move touch-none items-center justify-center rounded-full bg-red-700 text-white shadow-lg'
      >
        <UserSwitchOutlined />
      </div>
      <div className='hidden group-hover:block'>
        <Select
          value={user?.id}
          onChange={(id) => login(id)}
          size='small'
          className='w-40'
          placeholder='Select user'
          getPopupContainer={(triggerNode) => triggerNode.parentElement!}
          options={users.map((item) => ({ value: item.id, label: `${item.id} · ${item.name}` }))}
        />
      </div>
    </div>
  );
}
