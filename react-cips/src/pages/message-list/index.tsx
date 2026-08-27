import { useState } from 'react';
import type { CSSProperties } from 'react';
import { generatePath, useNavigate } from 'react-router-dom';
import { Button, Card, Col, Form, Row } from 'antd';
import type { TableColumnsType, TableProps } from 'antd';
import { DownOutlined, UpOutlined } from '@ant-design/icons';
import type { MessageRecord } from '@/types';
import { MessageDirection } from '@/types/enums';
import type { MessageSortField, MessageSortOrder } from '@/types/enums';
import { RoutePath } from '@/router/paths';
import useMessageList, { PAGE_SIZE_OPTIONS, type MessageListFilterValues } from './useMessageList';
import ResizableTable from '@/components/ResizableTable';
import {
  BusinessTypeFilter,
  EndToEndMessageIdFilter,
  MainMessageIdFilter,
  MessageBusinessNoFilter,
  MessageChannelFilter,
  MessageDirectionFilter,
  MessageIdFilter,
  MessageRecvInstFilter,
  MessageSendInstFilter,
  MessageTimeRangeFilter,
  MessageTypeFilter,
  MessageUetrFilter,
  RelatedMessageIdFilter,
  TransmissionStatusFilter,
} from '@/components/FormItem';
import {
  businessType,
  createTime,
  mainMsgId,
  messageTime,
  msgBusinessNo,
  msgChannel,
  msgDirection,
  msgEndId,
  msgId,
  msgRecvInst,
  msgRelatedId,
  msgSendInst,
  msgType,
  msgUetr,
  remark,
  transmissionStatus,
  updateTime,
} from '@/components/TableColumn';

// 默认筛选：页面上下边距 48px + Card 边框/内边距 26px + 表单 88px + 表单下间距 16px
// + 表头 42px + 分页上间距 16px + 分页器 24px = 260px。
const DEFAULT_TABLE_BODY_HEIGHT = 'calc(100vh - 260px)';
// 展开筛选后按钮与最后两个条件共用一行，比默认筛选多两行，共增加 64px。
const EXPANDED_TABLE_BODY_HEIGHT = 'calc(100vh - 324px)';
const DEFAULT_FILTER_VALUES: MessageListFilterValues = { msgDirection: MessageDirection.In };

/** 报文查询与列表页面。 */
const MessageList = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm<MessageListFilterValues>();
  const [advancedVisible, setAdvancedVisible] = useState(false);
  const { messages, total, loading, current, pageSize, setCurrent, setPageSize, setSort, query, reset } =
    useMessageList(DEFAULT_FILTER_VALUES);

  const handleReset = () => {
    form.resetFields();
    reset();
  };

  const handleTableChange: NonNullable<TableProps<MessageRecord>['onChange']> = (...args) => {
    const [, , sorter, extra] = args;
    if (extra.action !== 'sort') return;

    // 排序字段
    const activeSorter = Array.isArray(sorter) ? sorter[0] : sorter;
    const field = typeof activeSorter.field === 'string' ? activeSorter.field : undefined;
    const isSortableField = field === 'messageTime' || field === 'createTime' || field === 'updateTime';
    const order: MessageSortOrder | undefined = activeSorter.order ?? undefined;
    setSort(isSortableField ? (field as MessageSortField) : undefined, order);
  };

  const openDetail = (record: MessageRecord) =>
    navigate(generatePath(RoutePath.MessageDetail, { messageId: encodeURIComponent(record.msgId) }));

  const columns: TableColumnsType<MessageRecord> = [
    msgId,
    msgDirection,
    businessType,
    msgChannel,
    msgType,
    msgBusinessNo,
    mainMsgId,
    msgRelatedId,
    msgEndId,
    msgUetr,
    msgSendInst,
    msgRecvInst,
    transmissionStatus,
    messageTime,
    createTime,
    updateTime,
    remark,
  ];

  const tableBodyHeight = advancedVisible ? EXPANDED_TABLE_BODY_HEIGHT : DEFAULT_TABLE_BODY_HEIGHT;

  return (
    <Card size='small'>
      <Form
        form={form}
        size='small'
        layout='horizontal'
        labelAlign='left'
        labelCol={{ span: 9 }}
        wrapperCol={{ span: 15 }}
        className='mb-4'
        initialValues={DEFAULT_FILTER_VALUES}
        onFinish={query}
      >
        <Row gutter={[16, 8]}>
          <Col span={8}>
            <MessageDirectionFilter />
          </Col>
          <Col span={8}>
            <MessageIdFilter />
          </Col>
          <Col span={8}>
            <MessageTypeFilter />
          </Col>
          <Col span={8}>
            <MessageBusinessNoFilter />
          </Col>
          <Col span={8}>
            <TransmissionStatusFilter />
          </Col>
          <Col span={8}>
            <MessageTimeRangeFilter />
          </Col>
          {advancedVisible && (
            <>
              <Col span={8}>
                <MessageSendInstFilter />
              </Col>
              <Col span={8}>
                <MessageRecvInstFilter />
              </Col>
              <Col span={8}>
                <MessageChannelFilter />
              </Col>
              <Col span={8}>
                <BusinessTypeFilter />
              </Col>
              <Col span={8}>
                <MainMessageIdFilter />
              </Col>
              <Col span={8}>
                <RelatedMessageIdFilter />
              </Col>
              <Col span={8}>
                <EndToEndMessageIdFilter />
              </Col>
              <Col span={8}>
                <MessageUetrFilter />
              </Col>
            </>
          )}
          <Col span={8} className='ml-auto flex items-center justify-end'>
            <Button size='small' type='link' onClick={() => setAdvancedVisible((visible) => !visible)}>
              更多条件 {advancedVisible ? <UpOutlined /> : <DownOutlined />}
            </Button>
            <Button size='small' htmlType='submit' color='primary' variant='solid'>
              查询
            </Button>
            <Button size='small' htmlType='button' className='ml-2' onClick={handleReset}>
              重置
            </Button>
          </Col>
        </Row>
      </Form>

      <ResizableTable<MessageRecord>
        className={`message-list-table${messages.length === 0 ? ' message-list-table-empty' : ''}`}
        style={{ '--message-list-table-body-height': tableBodyHeight } as CSSProperties}
        rowKey='msgId'
        size='small'
        columns={columns}
        storageKey='message-list'
        dataSource={messages}
        loading={loading}
        onChange={handleTableChange}
        onRow={(record) => ({ onDoubleClick: () => openDetail(record), className: 'cursor-pointer' })}
        scroll={{ y: tableBodyHeight }}
        pagination={{
          current,
          pageSize,
          total,
          pageSizeOptions: PAGE_SIZE_OPTIONS,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (count) => `Total ${count}`,
          onChange: (nextCurrent, nextPageSize) => {
            setCurrent(nextCurrent);
            setPageSize(nextPageSize);
          },
        }}
      />
    </Card>
  );
};

export default MessageList;
