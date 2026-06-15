import { useEffect, useState } from 'react';
import { Button, Checkbox, Table, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import axios from 'axios';

interface User {
  id: string;
  name: string;
  isMaker: boolean;
  isChecker: boolean;
  isAdmin: boolean;
}

export default function PermissionAdmin() {
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    axios.get('/api/users').then(res => setUsers(res.data.data));
  }, []);

  const update = (id: string, field: keyof User, value: boolean) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, [field]: value } : u));
  };

  const columns: ColumnsType<User> = [
    { title: '工号', dataIndex: 'id', width: 80 },
    { title: '姓名', dataIndex: 'name', width: 100 },
    {
      title: 'Maker', dataIndex: 'isMaker', width: 80,
      render: (val, record) => (
        <Checkbox checked={val} onChange={e => update(record.id, 'isMaker', e.target.checked)} />
      ),
    },
    {
      title: 'Checker', dataIndex: 'isChecker', width: 80,
      render: (val, record) => (
        <Checkbox checked={val} onChange={e => update(record.id, 'isChecker', e.target.checked)} />
      ),
    },
    {
      title: '管理员', dataIndex: 'isAdmin', width: 80,
      render: (val, record) => (
        <Checkbox checked={val} onChange={e => update(record.id, 'isAdmin', e.target.checked)} />
      ),
    },
  ];

  const handleSave = () => {
    axios.post('/api/users/save', { users }).then(() => message.success('保存成功'));
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
