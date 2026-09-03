import { useEffect, useState } from 'react';
import { Alert, Button, Table } from 'antd';
import type { TableColumnsType } from 'antd';
import { getRelatedMessages } from '@/api/messages';
import {
  msgBusinessNo,
  msgDirection,
  businessType,
  msgId,
  msgDate,
  msgRecvStatus,
  msgSendStatus,
  msgType,
} from '@/components/TableColumn';
import TableViewport from '@/components/TableViewport';
import type { MessageRecord } from '@/types';
import ModalMessageRelated from './ModalMessageRelated';

interface TabRelatedMessagesProps {
  /** 当前报文标识号，用于查询同一业务链路中的其他报文。 */
  messageId?: string;
}

/** 关联报文 Tab：独立加载并展示当前报文同一业务链路中的其他报文。 */
const TabRelatedMessages = ({ messageId }: TabRelatedMessagesProps) => {
  const [records, setRecords] = useState<MessageRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [selectedMessageId, setSelectedMessageId] = useState<string>();

  useEffect(() => {
    if (!messageId) {
      setRecords([]);
      setError('Message ID is required');
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
        if (!data) setError('No related messages were returned');
      })
      .catch((requestError: Error) => {
        if (active) setError(requestError.message || 'Failed to load related messages');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [messageId]);

  /** 在弹窗中打开所选关联报文的简化明细。 */
  const handleOpenDetail = (record: MessageRecord) => {
    setSelectedMessageId(record.msgId);
  };

  const columns: TableColumnsType<MessageRecord> = [
    msgId,
    msgDirection,
    businessType,
    msgType,
    msgBusinessNo,
    msgRecvStatus,
    msgSendStatus,
    { ...msgDate, sorter: undefined },
    {
      /** 操作 */
      title: 'Action',
      key: 'action',
      width: 80,
      fixed: 'right',
      render: (_, record) => (
        <Button color='primary' variant='text' size='small' onClick={() => handleOpenDetail(record)}>
          View
        </Button>
      ),
    },
  ];

  return (
    <>
      <div className='flex min-h-0 flex-1 flex-col overflow-hidden'>
        {error && <Alert className='mb-2 shrink-0' type='error' showIcon message={error} />}
        <TableViewport>
          <Table<MessageRecord>
            size='small'
            rowKey='msgId'
            columns={columns}
            dataSource={records}
            loading={loading}
            pagination={false}
            onRow={(record) => ({ onDoubleClick: () => handleOpenDetail(record), className: 'cursor-pointer' })}
            locale={{ emptyText: 'No related messages' }}
          />
        </TableViewport>
      </div>
      {selectedMessageId && (
        <ModalMessageRelated messageId={selectedMessageId} open onClose={() => setSelectedMessageId(undefined)} />
      )}
    </>
  );
};

export default TabRelatedMessages;
