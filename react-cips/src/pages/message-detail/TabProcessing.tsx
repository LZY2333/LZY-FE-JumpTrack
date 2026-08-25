import { useEffect, useState } from 'react';
import { Alert, Table } from 'antd';
import type { TableColumnsType } from 'antd';
import { getMessageProcessingRecords } from '@/api/messages';
import { renderMessageDateTime } from '@/components/TableColumn/message';
import type { MessageProcessingRecord } from '@/types';
import DetailTableViewport, { FILL_TABLE_CLASS_NAME } from './detailTableViewport';

/** 处理记录 Tab：独立加载报文经过各处理节点的时间、状态、结果及操作人。 */
const TabProcessing = ({ messageId }: { messageId?: string }) => {
  const [records, setRecords] = useState<MessageProcessingRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

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

    getMessageProcessingRecords(messageId)
      .then((data) => {
        if (!active) return;
        setRecords(data ?? []);
        if (!data) setError('未返回处理记录');
      })
      .catch((requestError: Error) => {
        if (active) setError(requestError.message || '处理记录加载失败');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [messageId]);

  const columns: TableColumnsType<MessageProcessingRecord> = [
    { title: '处理时间', dataIndex: 'processTime', width: 180, render: renderMessageDateTime },
    { title: '处理节点', dataIndex: 'node', width: 160 },
    { title: '状态', dataIndex: 'status', width: 120, render: (value: string) => value || '--' },
    { title: '结果摘要', dataIndex: 'resultSummary' },
    { title: '操作人', dataIndex: 'operator', width: 140, render: (value: string | null) => value || '--' },
  ];

  return (
    <div className='flex min-h-0 flex-1 flex-col overflow-hidden'>
      {error && <Alert className='mb-2 shrink-0' type='error' showIcon message={error} />}
      <DetailTableViewport>
        {(tableBodyHeight) => (
          <Table<MessageProcessingRecord>
            className={FILL_TABLE_CLASS_NAME}
            size='small'
            rowKey='recordId'
            columns={columns}
            dataSource={records}
            loading={loading}
            pagination={false}
            scroll={{ y: tableBodyHeight }}
            locale={{ emptyText: '暂无处理记录' }}
          />
        )}
      </DetailTableViewport>
    </div>
  );
};

export default TabProcessing;
