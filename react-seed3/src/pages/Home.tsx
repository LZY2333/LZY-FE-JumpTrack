import { useState } from 'react';
import { Button, Space, Typography } from 'antd';
import { SmileOutlined } from '@ant-design/icons';

export default function Home() {
  const [count, setCount] = useState(0);
  return (
    <Space direction="vertical" size="large">
      <Typography.Title level={2}>
        <SmileOutlined /> react-seed3 已就绪
      </Typography.Title>
      <Button type="primary" onClick={() => setCount(c => c + 1)}>
        点击次数：{count}
      </Button>
    </Space>
  );
}
