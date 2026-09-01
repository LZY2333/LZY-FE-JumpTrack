import { useEffect, useState } from 'react';
import { Alert, Table } from 'antd';
import type { TableColumnsType } from 'antd';
import { getMessageProcessingRecords } from '@/api/messages';
import { renderMessageDateTime } from '@/components/TableColumn/message';
import TableViewport from '@/components/TableViewport';
import type { MessageProcessingRecord } from '@/types';

/** 处理记录 Tab：独立加载报文经过各处理节点的时间、状态、结果及操作人。 */
const TabProcessing = ({ messageId }: { messageId?: string }) => {
  const [records, setRecords] = useState<MessageProcessingRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

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

    getMessageProcessingRecords(messageId)
      .then((data) => {
        if (!active) return;
        setRecords(data ?? []);
        if (!data) setError('No processing history was returned');
      })
      .catch((requestError: Error) => {
        if (active) setError(requestError.message || 'Failed to load processing history');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [messageId]);

  const columns: TableColumnsType<MessageProcessingRecord> = [
    /** 处理时间 */
    { title: 'Processed At', dataIndex: 'processTime', width: 180, render: renderMessageDateTime },
    /** 处理节点 */
    { title: 'Processing Node', dataIndex: 'node', width: 160 },
    /** 处理状态 */
    { title: 'Status', dataIndex: 'status', width: 120, render: (value: string) => value || '--' },
    /** 处理结果摘要 */
    { title: 'Result Summary', dataIndex: 'resultSummary' },
    /** 操作人 */
    { title: 'Operator', dataIndex: 'operator', width: 140, render: (value: string | null) => value || '--' },
  ];

  return (
    <div className='flex min-h-0 flex-1 flex-col overflow-hidden'>
      {error && <Alert className='mb-2 shrink-0' type='error' showIcon message={error} />}
      <TableViewport>
        <Table<MessageProcessingRecord>
          size='small'
          rowKey='recordId'
          columns={columns}
          dataSource={records}
          loading={loading}
          pagination={false}
          locale={{ emptyText: 'No processing history' }}
        />
      </TableViewport>
    </div>
  );
};

export default TabProcessing;
