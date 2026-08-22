import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Alert, Table, Tag } from 'antd';
import type { TableColumnsType } from 'antd';
import { getMessageProcessingRecords } from '@/api/messages';
import { renderMessageDateTime } from '@/components/TableColumn/message';
import type { MessageProcessingRecord } from '@/types';

/** 处理记录 Tab：独立加载报文经过各处理节点的时间、状态、结果及操作人。 */
const TabProcessing = ({ messageId }: { messageId?: string }) => {
  const [records, setRecords] = useState<MessageProcessingRecord[]>([]);
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

  const columns: TableColumnsType<MessageProcessingRecord> = [
    { title: '处理时间', dataIndex: 'processTime', width: 180, render: renderMessageDateTime },
    { title: '处理节点', dataIndex: 'node', width: 160 },
    { title: '状态', dataIndex: 'status', width: 120, render: (value: string) => <Tag>{value || '--'}</Tag> },
    { title: '结果摘要', dataIndex: 'resultSummary' },
    { title: '操作人', dataIndex: 'operator', width: 140, render: (value: string | null) => value || '--' },
  ];

  return (
    <div className='flex h-full flex-col overflow-hidden'>
      {error && <Alert className='mb-2 shrink-0' type='error' showIcon message={error} />}
      <div ref={tableContainerRef} className='min-h-0 flex-1 overflow-hidden'>
        <Table<MessageProcessingRecord>
          size='small'
          rowKey='recordId'
          columns={columns}
          dataSource={records}
          loading={loading}
          pagination={false}
          scroll={{ y: tableBodyHeight }}
          locale={{ emptyText: '暂无处理记录' }}
        />
      </div>
    </div>
  );
};

export default TabProcessing;
