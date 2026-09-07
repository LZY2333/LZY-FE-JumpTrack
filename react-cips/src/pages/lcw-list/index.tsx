import { useState } from 'react';
import type { CSSProperties, Key } from 'react';
import { generatePath, useNavigate } from 'react-router-dom';
import { App as AntdApp, Button, Card, Col, Form, Row } from 'antd';
import type { TableColumnsType, TableProps } from 'antd';
import { RedoOutlined } from '@ant-design/icons';
import type { LcwRecord } from '@/types';
import { MessageDirection, SortOrder } from '@/types/enums';
import { RoutePath } from '@/router/paths';
import ResizableTable from '@/components/ResizableTable';
import {
  LcwInitialStatusFilter,
  LcwResponseCodeFilter,
  MessageChannelFilter,
  MessageDateRangeFilter,
  MessageDirectionFilter,
  MessageIdFilter,
} from '@/components/FormItem';
import {
  lcwInitialTime,
  lcwFailureInfo,
  lcwInitialStatus,
  msgChannel,
  msgDate,
  msgDirection,
  msgId,
} from '@/components/TableColumn';
import useLcwList, { LCW_PAGE_SIZE_OPTIONS } from './useLcwList';
import { isLcwSortField, type LcwListFilterValues } from './lcwListUtil';

// 页面边距 48 + Card 内边距与边框 26 + Card 标题 38 + 表单 88（两行筛选 56 + 按钮上间距 8 + 按钮 24）
// + 表单下间距 16 + 表头 42 + 分页间距 16 + 分页器 24 = 298px。
const DEFAULT_TABLE_BODY_HEIGHT = 'calc(100vh - 298px)';
const DEFAULT_FILTER_VALUES: LcwListFilterValues = {
  msgDirection: MessageDirection.In,
};
const columns: TableColumnsType<LcwRecord> = [
  msgId,
  msgDirection,
  msgDate,
  msgChannel,
  lcwInitialStatus,
  lcwFailureInfo,
  lcwInitialTime,
];

/** 展示 LCW 任务并支持批量勾选重试。 */
const LcwList = () => {
  const navigate = useNavigate();
  const { message, modal } = AntdApp.useApp();
  const [form] = Form.useForm<LcwListFilterValues>();
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);
  const {
    records,
    total,
    loading,
    retrying,
    current,
    pageSize,
    setCurrent,
    setPageSize,
    setSort,
    query,
    reset,
    retry,
  } = useLcwList(DEFAULT_FILTER_VALUES);

  const handleSearch = (values: LcwListFilterValues) => {
    setSelectedRowKeys([]);
    query(values);
  };

  const handleReset = () => {
    form.resetFields();
    setSelectedRowKeys([]);
    reset();
  };

  const handleTableChange: NonNullable<TableProps<LcwRecord>['onChange']> = (...args) => {
    const [, , sorter, extra] = args;
    if (extra.action !== 'sort') return;

    const activeSorter = Array.isArray(sorter) ? sorter[0] : sorter;
    const field = typeof activeSorter.field === 'string' ? activeSorter.field : undefined;
    let order: SortOrder | undefined;
    if (activeSorter.order === 'ascend') order = SortOrder.Ascend;
    if (activeSorter.order === 'descend') order = SortOrder.Descend;
    setSelectedRowKeys([]);
    setSort(isLcwSortField(field) ? field : undefined, order);
  };

  const handleRetrySelected = () => {
    const msgIds = selectedRowKeys.map(String);
    if (msgIds.length === 0) {
      message.warning('Please select at least one LCW message.');
      return;
    }

    modal.confirm({
      title: `Retry ${msgIds.length} selected LCW message${msgIds.length > 1 ? 's' : ''}?`,
      content: 'The server will validate the latest LCW status before accepting each retry.',
      okText: 'Retry',
      cancelText: 'Cancel',
      onOk: async () => {
        await retry(msgIds);
        setSelectedRowKeys([]);
        message.success(`${msgIds.length} LCW message${msgIds.length > 1 ? 's were' : ' was'} submitted.`);
      },
    });
  };

  const openMessageDetail = (record: LcwRecord) =>
    navigate(generatePath(RoutePath.MessageDetail, { messageId: encodeURIComponent(record.msgId) }));

  const rowSelection: NonNullable<TableProps<LcwRecord>['rowSelection']> = {
    selectedRowKeys,
    columnWidth: 56,
    onChange: (nextSelectedRowKeys: Key[]) => {
      setSelectedRowKeys(nextSelectedRowKeys);
    },
  };

  return (
    <Card className='h-full overflow-hidden' size='small' title='LCW Tasks'>
      <Form
        form={form}
        size='small'
        layout='horizontal'
        labelAlign='left'
        labelCol={{ span: 9 }}
        wrapperCol={{ span: 15 }}
        className='mb-4'
        initialValues={DEFAULT_FILTER_VALUES}
        onFinish={handleSearch}
      >
        <Row gutter={[16, 8]}>
          <Col span={8}>
            <MessageDirectionFilter />
          </Col>
          <Col span={8}>
            <MessageDateRangeFilter />
          </Col>
          <Col span={8}>
            <MessageChannelFilter />
          </Col>
          <Col span={8}>
            <MessageIdFilter />
          </Col>
          <Col span={8}>
            <LcwInitialStatusFilter />
          </Col>
          <Col span={8}>
            <LcwResponseCodeFilter />
          </Col>
        </Row>
        <Row gutter={[16, 8]} className='mt-2'>
          <Col span={16} className='flex items-center'>
            <Button
              size='small'
              type='primary'
              icon={<RedoOutlined />}
              loading={retrying}
              onClick={handleRetrySelected}
            >
              Retry Selected
            </Button>
          </Col>
          <Col span={8} className='ml-auto flex items-center justify-end'>
            <Button size='small' htmlType='submit' color='primary' variant='solid'>
              Search
            </Button>
            <Button size='small' htmlType='button' className='ml-2' onClick={handleReset}>
              Reset
            </Button>
          </Col>
        </Row>
      </Form>

      <ResizableTable<LcwRecord>
        className={`message-list-table${records.length === 0 ? ' message-list-table-empty' : ''}`}
        style={{ '--message-list-table-body-height': DEFAULT_TABLE_BODY_HEIGHT } as CSSProperties}
        rowKey='msgId'
        rowSelection={rowSelection}
        size='small'
        columns={columns}
        storageKey='lcw-list-v1'
        dataSource={records}
        loading={loading}
        locale={{ emptyText: 'No LCW tasks found' }}
        onChange={handleTableChange}
        onRow={(record) => ({ onDoubleClick: () => openMessageDetail(record), className: 'cursor-pointer' })}
        scroll={{ y: DEFAULT_TABLE_BODY_HEIGHT }}
        pagination={{
          current,
          pageSize,
          total,
          pageSizeOptions: LCW_PAGE_SIZE_OPTIONS,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (count) => `Selected ${selectedRowKeys.length} · Total ${count}`,
          onChange: (nextCurrent, nextPageSize) => {
            setSelectedRowKeys([]);
            setCurrent(nextCurrent);
            setPageSize(nextPageSize);
          },
        }}
      />
    </Card>
  );
};

export default LcwList;
