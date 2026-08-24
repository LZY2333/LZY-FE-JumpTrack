import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { generatePath, useNavigate } from 'react-router-dom';
import { Alert, Button, Table } from 'antd';
import type { TableColumnsType } from 'antd';
import { getRelatedMessages } from '@/api/messages';
import {
  businessStatus,
  messageTime,
  msgBusinessNo,
  msgDirection,
  msgId,
  msgRecvInst,
  msgSendInst,
  msgType,
  transmissionStatus,
} from '@/components/TableColumn';
import { RoutePath } from '@/router/paths';
import type { MessageRecord } from '@/types';

interface TabRelatedMessagesProps {
  /** 当前报文标识号，用于查询同一业务链路中的其他报文。 */
  messageId?: string;
}

/** 关联报文 Tab：独立加载并展示当前报文同一业务链路中的其他报文。 */
const TabRelatedMessages = ({ messageId }: TabRelatedMessagesProps) => {
  const navigate = useNavigate();
  const [records, setRecords] = useState<MessageRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [tableBodyHeight, setTableBodyHeight] = useState(0);
  const tableContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!messageId) {
      setRecords([]);
      setError('缺少报文标识号');
      setLoading(false);
      return;
    }

    let active = true;
    setRecords([]);
    setError(undefined);
    setLoading(true);

    getRelatedMessages(messageId)
      .then((data) => {
        if (!active) return;
        setRecords(data ?? []);
        if (!data) setError('未返回关联报文');
      })
      .catch((requestError: Error) => {
        if (active) setError(requestError.message || '关联报文加载失败');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [messageId]);

  useLayoutEffect(() => {
    const container = tableContainerRef.current;
    if (!container) return;

    const updateTableBodyHeight = () => {
      const header = container.querySelector<HTMLElement>('.ant-table-thead');
      const nextHeight = Math.max(container.clientHeight - (header?.offsetHeight ?? 0), 0);
      setTableBodyHeight((currentHeight) => (currentHeight === nextHeight ? currentHeight : nextHeight));
    };

    updateTableBodyHeight();
    const observer = new ResizeObserver(updateTableBodyHeight);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  /** 进入所选关联报文明细，路由参数变化后当前页面会重新加载。 */
  const handleOpenDetail = (record: MessageRecord) => {
    navigate(generatePath(RoutePath.MessageDetail, { messageId: encodeURIComponent(record.msgId) }));
  };

  const columns: TableColumnsType<MessageRecord> = [
    msgId,
    msgDirection,
    msgType,
    msgBusinessNo,
    msgSendInst,
    msgRecvInst,
    transmissionStatus,
    businessStatus,
    { ...messageTime, sorter: undefined },
    {
      title: '操作',
      key: 'action',
      width: 80,
      fixed: 'right',
      render: (_, record) => (
        <Button color='primary' variant='text' size='small' onClick={() => handleOpenDetail(record)}>
          查看
        </Button>
      ),
    },
  ];

  return (
    <div className='flex h-full flex-col overflow-hidden'>
      {error && <Alert className='mb-2 shrink-0' type='error' showIcon message={error} />}
      <div ref={tableContainerRef} className='min-h-0 flex-1 overflow-hidden'>
        <Table<MessageRecord>
          size='small'
          rowKey='msgId'
          columns={columns}
          dataSource={records}
          loading={loading}
          pagination={false}
          onRow={(record) => ({ onDoubleClick: () => handleOpenDetail(record), className: 'cursor-pointer' })}
          scroll={{ x: 'max-content', y: tableBodyHeight }}
          locale={{ emptyText: '暂无关联报文' }}
        />
      </div>
    </div>
  );
};

export default TabRelatedMessages;
