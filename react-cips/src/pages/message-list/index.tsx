import { useState } from 'react';
import type { CSSProperties } from 'react';
import { generatePath, useNavigate } from 'react-router-dom';
import { Button, Card, Col, Form, Row } from 'antd';
import type { TableColumnsType, TableProps } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import type { MessageRecord } from '@/types';
import { MessageDirection, SortOrder } from '@/types/enums';
import { RoutePath } from '@/router/routePath';
import useMessageList, { PAGE_SIZE_OPTIONS } from './useMessageList';
import { isMessageSortField, type MessageListFilterValues } from './messageListUtil';
import ResizableTable from '@/components/ResizableTable';
import {
  MessageDirectionFilter,
  MessageBusinessTypeFilter,
  MessageStatusFilter,
  MessageDateRangeFilter,
  MessageTypeFilter,
  MessageBusinessNoFilter,
  MessageIdFilter,
  TranIdFilter,
  MessageAmountCurrencyFilter,
  MessageChannelFilter,
  MessageOwnerFilter,
  MainMessageIdFilter,
  RelatedMessageIdFilter,
  EndToEndMessageIdFilter,
  MessageUetrFilter,
} from '@/components/FormItem';
import {
  msgId,
  msgDirection,
  businessType,
  msgChannel,
  msgType,
  msgBusinessNo,
  amount,
  currency,
  tranId,
  msgRecvStatus,
  msgSendStatus,
  msgDate,
  msgUetr,
  msgOwnerDept,
  msgOwnerGroup,
  mainMsgId,
  msgRelatedId,
  msgEndId,
  createTime,
  updateTime,
  remark,
} from '@/components/TableColumn';

// 页面边距 48 + Card 26 + 表单 120 + 表单下间距 16 + 表头 42 + 分页间距 16 + 分页器 24。
const DEFAULT_TABLE_BODY_HEIGHT = 'calc(100vh - 292px)';
// 当前布局展开后多两行，每行 32px。
const EXPANDED_TABLE_BODY_HEIGHT = 'calc(100vh - 356px)';
const DEFAULT_FILTER_VALUES: MessageListFilterValues = { msgDirection: MessageDirection.In };
const DEFAULT_HIDDEN_COLUMN_IDS = [
  'msgOwnerDept',
  'msgOwnerGroup',
  'mainMsgId',
  'msgRelatedId',
  'msgEndId',
  'createTime',
  'updateTime',
  'remark',
];

/** 报文查询与列表页面。 */
const MessageList = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm<MessageListFilterValues>();
  const [advancedVisible, setAdvancedVisible] = useState(false);
  const {
    authenticated,
    messages,
    total,
    loading,
    current,
    pageSize,
    setCurrent,
    setPageSize,
    setSort,
    query,
    reset,
    queryDirection,
  } = useMessageList(DEFAULT_FILTER_VALUES);

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
    let order: SortOrder | undefined;
    if (activeSorter.order === 'ascend') order = SortOrder.Ascend;
    if (activeSorter.order === 'descend') order = SortOrder.Descend;
    setSort(isMessageSortField(field) ? field : undefined, order);
  };

  const openDetail = (record: MessageRecord) =>
    navigate(
      generatePath(RoutePath.MessageDetail, {
        msgId: encodeURIComponent(record.msgId),
        msgDirection: record.msgDirection,
        businessType: record.businessType,
      }),
    );

  const columns: TableColumnsType<MessageRecord> = [
    msgId,
    msgDirection,
    businessType,
    msgChannel,
    msgType,
    msgBusinessNo,
    amount,
    currency,
    tranId,
    queryDirection === MessageDirection.Out ? msgSendStatus : msgRecvStatus,
    msgDate,
    msgUetr,
    msgOwnerDept,
    msgOwnerGroup,
    mainMsgId,
    msgRelatedId,
    msgEndId,
    createTime,
    updateTime,
    remark,
  ];

  const tableBodyHeight = advancedVisible ? EXPANDED_TABLE_BODY_HEIGHT : DEFAULT_TABLE_BODY_HEIGHT;
  const advancedClassName = advancedVisible ? 'visible h-16 pt-2 opacity-100' : 'invisible h-0 pt-0 opacity-0';

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
            <MessageBusinessTypeFilter />
          </Col>
          <Col span={8}>
            <MessageStatusFilter />
          </Col>
          <Col span={8}>
            <MessageDateRangeFilter />
          </Col>
          <Col span={8}>
            <MessageTypeFilter />
          </Col>
          <Col span={8}>
            <MessageBusinessNoFilter />
          </Col>
          <Col span={8}>
            <MessageIdFilter />
          </Col>
          <Col span={8}>
            <TranIdFilter />
          </Col>
          <Col span={8}>
            <MessageAmountCurrencyFilter />
          </Col>
        </Row>
        {/* 两行高级筛选及顶部间距共 64px，与现有表格高度扣减保持一致。 */}
        <Row
          gutter={[16, 8]}
          className={`box-border content-start overflow-hidden transition-all duration-200 ease-in-out motion-reduce:transition-none ${advancedClassName}`}
        >
          <Col span={8}>
            <MessageChannelFilter />
          </Col>
          <Col span={8}>
            <MessageOwnerFilter />
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
        </Row>
        <Row gutter={[16, 8]} className='mt-2'>
          <Col span={8} className='ml-auto flex items-center justify-end'>
            <Button
              size='small'
              color='primary'
              variant='link'
              onClick={() => setAdvancedVisible((visible) => !visible)}
            >
              More Filters
              <DownOutlined
                className={`transition-transform duration-200 motion-reduce:transition-none ${
                  advancedVisible ? 'rotate-180' : 'rotate-0'
                }`}
              />
            </Button>
            <Button size='small' htmlType='submit' color='primary' variant='solid' disabled={!authenticated}>
              Search
            </Button>
            <Button size='small' htmlType='button' className='ml-2' onClick={handleReset}>
              Reset
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
        storageKey='message-list-v4'
        defaultHiddenColumnIds={DEFAULT_HIDDEN_COLUMN_IDS}
        dataSource={messages}
        loading={loading}
        locale={{ emptyText: authenticated ? 'No messages found' : 'Waiting for authentication...' }}
        onChange={handleTableChange}
        onRow={(record) => ({ onDoubleClick: () => openDetail(record), className: 'cursor-pointer' })}
        scroll={{ y: tableBodyHeight }}
        pagination={{
          current,
          pageSize,
          total,
          disabled: !authenticated,
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
