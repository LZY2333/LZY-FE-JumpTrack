import { useEffect, useRef, useState } from 'react';
import { Select } from 'antd';
import { UserSwitchOutlined } from '@ant-design/icons';
import useUserStore from '@/store/useUserStore';
import { getUsers } from '@/api/users';
import type { User } from '@/types';

export default function DevUserSwitcher() {
  const { user, login } = useUserStore();
  const [users, setUsers] = useState<User[]>([]);
  const [pos, setPos] = useState<{ y: number; side: 'left' | 'right' }>({ y: 80, side: 'right' });
  const dragging = useRef(false);

  useEffect(() => {
    getUsers().then((res) => {
      login(res[0].id)
      setUsers(res)
    });
  }, []);

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

  // 仅本地 dev server 展示，生产构建不渲染
  if (!import.meta.env.DEV) return null;

  const sideClass = pos.side === 'right' ? 'right-0 flex-row-reverse' : 'left-0 flex-row';

  return (
    <div className={`group fixed z-50 flex items-center gap-2 ${sideClass}`} style={{ top: pos.y }}>
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="flex h-10 w-10 cursor-move touch-none items-center justify-center rounded-full bg-red-700 text-white shadow-lg"
      >
        <UserSwitchOutlined />
      </div>
      <div className="hidden group-hover:block">
        <Select
          value={user?.id}
          onChange={(id) => login(id)}
          size="small"
          className="w-40"
          placeholder="选择用户"
          getPopupContainer={triggerNode => triggerNode.parentElement!}
          options={users.map(u => ({ value: u.id, label: `${u.id} · ${u.name}` }))}
        />
      </div>
    </div>
  );
}
