import { useEffect, useState } from 'react';
import { Button, Checkbox, Table, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { getUsers, saveUsers } from '@/api/users';
import { User } from '@/types';
import { Role } from '@/types/enums';

export default function Permission() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    getUsers().then(setUsers);
  }, []);

  const toggleRole = (id: string, role: Role, checked: boolean) => {
    setUsers(prev => prev.map(u => u.id === id
      ? { ...u, roles: checked ? [...u.roles, role] : u.roles.filter(r => r !== role) }
      : u));
  };

  const columns: ColumnsType<User> = [
    { title: '工号', dataIndex: 'id', width: 80 },
    { title: '姓名', dataIndex: 'name', width: 100 },
    {
      title: 'Maker', dataIndex: 'roles', width: 80,
      render: (_, record) => (
        <Checkbox
          checked={record.roles.includes(Role.Maker)}
          onChange={e => toggleRole(record.id, Role.Maker, e.target.checked)}
        />
      ),
    },
    {
      title: 'Checker', dataIndex: 'roles', width: 80,
      render: (_, record) => (
        <Checkbox
          checked={record.roles.includes(Role.Checker)}
          onChange={e => toggleRole(record.id, Role.Checker, e.target.checked)}
        />
      ),
    },
    {
      title: '管理员', dataIndex: 'roles', width: 80,
      render: (_, record) => (
        <Checkbox
          checked={record.roles.includes(Role.Admin)}
          onChange={e => toggleRole(record.id, Role.Admin, e.target.checked)}
        />
      ),
    },
  ];

  const handleSave = () => {
    saveUsers(users).then(() => message.success('保存成功'));
  };

  return (
    <div>
      <Table rowKey="id" columns={columns} dataSource={users} pagination={false} />
      <div className="mt-4 flex justify-end">
        <Button type="primary" onClick={handleSave}>保存</Button>
      </div>
    </div>
  );
}
