import { useEffect, useRef, useState } from 'react';
import { Select } from 'antd';
import { UserSwitchOutlined } from '@ant-design/icons';
import useUserStore from '@/store/useUserStore';
import type { User } from '@/types';
import { Role } from '@/types/enums';

const MOCK_USERS: User[] = [
  { userId: 'U001', orgId: 'ORG001', userName: '张三', roles: [Role.Maker] },
  { userId: 'U002', orgId: 'ORG001', userName: '李四', roles: [Role.Checker] },
  { userId: 'U003', orgId: 'ORG001', userName: '王五', roles: [Role.Maker, Role.Checker] },
];

export default function DevUserSwitcher() {
  const { user, setUser } = useUserStore();
  const [pos, setPos] = useState<{ y: number; side: 'left' | 'right' }>({ y: 80, side: 'right' });
  const draggingRef = useRef(false);

  useEffect(() => {
    if (user) return;
    setUser(MOCK_USERS[0]);
  }, [setUser, user]);

  const handleUserChange = (userId: string) => {
    const selectedUser = MOCK_USERS.find((item) => item.userId === userId);
    if (!selectedUser) return;
    setUser(selectedUser);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    draggingRef.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    const y = Math.min(Math.max(e.clientY, 8), window.innerHeight - 48);
    const side = e.clientX < window.innerWidth / 2 ? 'left' : 'right';
    setPos({ y, side });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    draggingRef.current = false;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  };

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
          value={user?.userId}
          onChange={handleUserChange}
          size='small'
          className='w-56'
          placeholder='Select user'
          getPopupContainer={(triggerNode) => triggerNode.parentElement || triggerNode}
          options={MOCK_USERS.map((item) => ({
            value: item.userId,
            label: `${item.userId} · ${item.userName}`,
          }))}
        />
      </div>
    </div>
  );
}
