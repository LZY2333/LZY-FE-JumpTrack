import { useState } from 'react';
import type { CSSProperties } from 'react';
import { generatePath, useNavigate } from 'react-router-dom';
import { App, Button, Col, Form, Row } from 'antd';
import type { TableColumnsType, TableProps } from 'antd';
import { DownOutlined, DownloadOutlined, UpOutlined } from '@ant-design/icons';
import type { MessageRecord } from '@/types';
import type { MessageSortField, MessageSortOrder } from '@/types/enums';
import { exportMessages } from '@/api/messages';
import { RoutePath } from '@/router/paths';
import useMessageList, { PAGE_SIZE_OPTIONS, type MessageListFilterValues } from './useMessageList';
import ResizableTable from '@/components/ResizableTable';
import {
  BusinessStatusFilter,
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
  businessStatus,
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
import { saveBlobResponse } from '@/utils/fileUtil';

// 默认筛选：顶部 24px + 表单 88px + 表单下间距 16px + 表头 42px
// + 分页上间距 16px + 分页器 24px + 页面底部 24px = 234px。
const DEFAULT_TABLE_BODY_HEIGHT = 'calc(100vh - 234px)';
// 展开筛选：顶部 24px + 表单 184px + 表单下间距 16px + 表头 42px
// + 分页上间距 16px + 分页器 24px + 页面底部 24px = 330px。
const EXPANDED_TABLE_BODY_HEIGHT = 'calc(100vh - 330px)';
// 低频公共字段默认隐藏，用户仍可通过列设置开启并持久化自己的布局。
const DEFAULT_HIDDEN_COLUMNS = [
  'businessType',
  'msgChannel',
  'mainMsgId',
  'msgRelatedId',
  'msgEndId',
  'msgUetr',
  'createTime',
  'updateTime',
  'remark',
];

/** 报文查询与列表页面。 */
const MessageList = () => {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [form] = Form.useForm<MessageListFilterValues>();
  const [advancedVisible, setAdvancedVisible] = useState(false);
  const [exporting, setExporting] = useState(false);
  const {
    messages,
    total,
    loading,
    current,
    pageSize,
    queryConditions,
    setCurrent,
    setPageSize,
    setSort,
    query,
    reset,
  } = useMessageList();

  const handleReset = () => {
    form.resetFields();
    reset();
  };

  const handleExport = () => {
    if (exporting) return;
    setExporting(true);
    exportMessages(queryConditions)
      .then((response) => {
        saveBlobResponse(response, 'messages.xlsx');
        message.success('导出成功');
      })
      .finally(() => setExporting(false));
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
    businessStatus,
    messageTime,
    createTime,
    updateTime,
    remark,
    {
      title: '操作',
      key: 'action',
      width: 80,
      fixed: 'right',
      render: (_, record) => (
        <Button color='primary' variant='text' size='small' onClick={() => openDetail(record)}>
          查看
        </Button>
      ),
    },
  ];

  const tableBodyHeight = advancedVisible ? EXPANDED_TABLE_BODY_HEIGHT : DEFAULT_TABLE_BODY_HEIGHT;

  return (
    <div>
      <Form
        form={form}
        size='small'
        layout='horizontal'
        labelAlign='left'
        labelCol={{ span: 9 }}
        wrapperCol={{ span: 15 }}
        className='mb-4'
        onFinish={query}
      >
        <Row gutter={16}>
          <Col span={8} className='mb-2'>
            <MessageIdFilter />
          </Col>
          <Col span={8} className='mb-2'>
            <MessageBusinessNoFilter />
          </Col>
          <Col span={8} className='mb-2'>
            <MessageTypeFilter />
          </Col>
          <Col span={8} className='mb-2'>
            <MessageDirectionFilter />
          </Col>
          <Col span={8} className='mb-2'>
            <TransmissionStatusFilter />
          </Col>
          <Col span={8} className='mb-2'>
            <BusinessStatusFilter />
          </Col>
          <Col span={8} className={advancedVisible ? 'mb-2' : undefined}>
            <MessageTimeRangeFilter />
          </Col>
          {advancedVisible && (
            <>
              <Col span={8} className='mb-2'>
                <BusinessTypeFilter />
              </Col>
              <Col span={8} className='mb-2'>
                <MessageChannelFilter />
              </Col>
              <Col span={8} className='mb-2'>
                <MainMessageIdFilter />
              </Col>
              <Col span={8} className='mb-2'>
                <RelatedMessageIdFilter />
              </Col>
              <Col span={8} className='mb-2'>
                <EndToEndMessageIdFilter />
              </Col>
              <Col span={8}>
                <MessageUetrFilter />
              </Col>
              <Col span={8}>
                <MessageSendInstFilter />
              </Col>
              <Col span={8}>
                <MessageRecvInstFilter />
              </Col>
            </>
          )}
          <Col
            span={advancedVisible ? 24 : 16}
            className={`${advancedVisible ? 'mt-2 ' : ''}flex items-center justify-end`}
          >
            <Button size='small' type='link' onClick={() => setAdvancedVisible((visible) => !visible)}>
              更多条件 {advancedVisible ? <UpOutlined /> : <DownOutlined />}
            </Button>
            <Button size='small' htmlType='submit' color='primary' variant='solid'>
              查询
            </Button>
            <Button size='small' htmlType='button' className='ml-2' onClick={handleReset}>
              重置
            </Button>
            <Button
              htmlType='button'
              size='small'
              className='ml-2'
              icon={<DownloadOutlined />}
              loading={exporting}
              onClick={handleExport}
            >
              导出
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
        defaultHiddenColumnIds={DEFAULT_HIDDEN_COLUMNS}
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
    </div>
  );
};

export default MessageList;
