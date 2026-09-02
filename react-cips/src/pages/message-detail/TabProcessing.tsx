import { useEffect, useState } from 'react';
import { Alert, Table } from 'antd';
import type { TableColumnsType } from 'antd';
import { getMessageProcessingRecords } from '@/api/messages';
import { renderMessageDateTime } from '@/components/TableColumn/message';
import TableViewport from '@/components/TableViewport';
import type { MessageAuditTrailRecord } from '@/types';

/** 处理记录 Tab：按审计轨迹表展示报文处理过程中产生的事件。 */
const TabProcessing = ({ messageId }: { messageId?: string }) => {
  const [records, setRecords] = useState<MessageAuditTrailRecord[]>([]);
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

  const columns: TableColumnsType<MessageAuditTrailRecord> = [
    /** 事件发生时间 */
    { title: 'Event Time', dataIndex: 'eventTime', width: 180, render: renderMessageDateTime },
    /** 服务模块 */
    { title: 'Service Module', dataIndex: 'serviceModule', width: 180 },
    /** 事件编号 */
    { title: 'Event Code', dataIndex: 'eventCode', width: 110 },
    /** 事件详细内容 */
    { title: 'Event Detail', dataIndex: 'eventDetail' },
    /** 备注 */
    { title: 'Remark', dataIndex: 'remark', width: 160, render: (value: string | null) => value || '--' },
    /** 事件关联用户 */
    { title: 'Event User', dataIndex: 'eventUser', width: 140 },
  ];

  return (
    <div className='flex min-h-0 flex-1 flex-col overflow-hidden'>
      {error && <Alert className='mb-2 shrink-0' type='error' showIcon message={error} />}
      <TableViewport>
        <Table<MessageAuditTrailRecord>
          size='small'
          rowKey='logId'
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
