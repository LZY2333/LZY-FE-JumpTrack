import { useState } from 'react';
import type { Key, Ref } from 'react';
import { Table } from 'antd';
import type { TableColumnsType } from 'antd';
import type { MessageRaw } from '@/api/messages';
import { msgId, msgDirection, msgType, createTime } from '@/components/TableColumn/message';
import RawSingleExpanded from './RawSingleExpanded';
import type { RawSingleRef } from './RawSingle';

/** 原文列表展示参数 */
interface RawListProps {
  /** 后端原始顺序的报文列表，首条为当前报文 */
  raws: MessageRaw[];
  /** 将首条编辑器的操作连接到外部入口 */
  currentSingleRef: Ref<RawSingleRef>;
}

const columns: TableColumnsType<MessageRaw> = [msgId, msgDirection, msgType, createTime];

/** 展示当前及关联报文，默认展开首条且同时只展开一条原文 */
const RawList = ({ raws, currentSingleRef }: RawListProps) => {
  const [expandedRowKeys, setExpandedRowKeys] = useState<Key[]>(() => raws.slice(0, 1).map(getRawKey));

  const handleExpand = (expanded: boolean, raw: MessageRaw) => {
    setExpandedRowKeys(expanded ? [getRawKey(raw)] : []);
  };

  return (
    <div className='min-h-0 flex-1 overflow-auto'>
      <Table<MessageRaw>
        tableLayout='fixed'
        size='small'
        columns={columns}
        dataSource={raws}
        rowKey={getRawKey}
        pagination={false}
        expandable={{
          columnWidth: 40,
          expandedRowKeys,
          onExpand: handleExpand,
          expandedRowRender: (raw) => (
            <RawSingleExpanded
              singleRef={raw === raws[0] ? currentSingleRef : undefined}
              raw={raw}
              expanded={expandedRowKeys.includes(getRawKey(raw))}
            />
          ),
        }}
      />
    </div>
  );
};

const getRawKey = (raw: MessageRaw) => `${raw.msgDirection}:${raw.msgId}`;

export default RawList;
