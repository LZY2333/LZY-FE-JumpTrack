import { useEffect, useState } from 'react';
import { Select } from 'antd';
import useUserStore from '@/store/useUserStore';
import { getUsers } from '@/api/users';
import type { User } from '@/types';

export default function DevUserSwitcher() {
  const { user, login } = useUserStore();
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    getUsers().then(setUsers);
  }, []);

  return (
    <Select
      value={user?.id}
      onChange={(id) => login(id)}
      size="small"
      className="w-44"
      placeholder="选择用户"
      options={users.map(u => ({ value: u.id, label: `${u.id} · ${u.name}` }))}
    />
  );
}
