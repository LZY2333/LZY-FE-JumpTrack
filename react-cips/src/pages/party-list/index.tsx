import { useCallback, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import { App as AntdApp, Button, Card, Col, Flex, Form, Row, Segmented, ConfigProvider } from 'antd';
import type { TableColumnsType } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { PartyQueryConditions, PartyRecord } from '@/api/party';
import ResizableTable from '@/components/ResizableTable';
import {
  BankBicFilter,
  ChangeType,
  ChangeNumber,
  BankCategoryFilter,
  DomesticFlagFilter,
  EndNameFilter,
  LoginStsFilter,
  StatusFilter,
} from '@/components/FormItem/party';
import {
  bankBic,
  changeType,
  changeNumber,
  bankCategory,
  bankLei,
  chsName,
  custodian,
  domesticFlag,
  effectiveDate,
  endName,
  loginSts,
  partyCreateBrno,
  partyCreateTime,
  partyCreateUser,
  partyUpdateTime,
  status,
} from '@/components/TableColumn/party';
import usePartyList, { PARTY_PAGE_SIZE_OPTIONS } from './usePartyList';
import { openModalPartyForm } from './ModalPartyForm';

import PartyRelation from './PartyRelation';
import type { PartyRelationConditions } from '@/api/party';
import { PartyBankCategoryEnum } from '@/types/enums';

// 为筛选标签预留冒号及间距
const FILTER_LABEL_WIDTH = '120px';
// 高度扣减明细（px）
// 页面上下边距：24 × 2 = 48
// Card 上下内边距与边框：12 × 2 + 1 × 2 = 26
// Card 标题栏（含分段切换）：38
// 筛选区域：3 × 24 + 2 × 8 = 88
// 操作按钮区域：上间距 8 + 按钮高度 24 = 32
// 表单与表格间距：16
// 表头：文字行高 22 + 上下内边距 8 × 2 + 下边框 1 = 39
// 分页区域：上间距 16 + 分页器高度 24 + 下间距 0 = 40
// 合计：48 + 26 + 38 + 88 + 32 + 16 + 39 + 40 = 327
// 分页下间距由 index.css 清除；横向滚动条包含在固定表体高度内
const TABLE_BODY_HEIGHT = 'calc(100vh - 327px)';
const partyColumns: TableColumnsType<PartyRecord> = [
  bankBic,
  changeType,
  changeNumber,
  endName,
  bankCategory,
  domesticFlag,
  status,
  loginSts,
  chsName,
  bankLei,
  custodian,
  effectiveDate,
  partyCreateTime,
  partyUpdateTime,
  partyCreateUser,
  partyCreateBrno,
];

/** 参与行列表页 */
const PartyList = () => {
  const [activeTab, setActiveTab] = useState('party');
  const [relationFilters, setRelationFilters] = useState<PartyRelationConditions>();
  const handleViewRelations = useCallback((record: PartyRecord) => {
    setRelationFilters(getPartyRelationFilters(record));
    setActiveTab('relation');
  }, []);
  const { message, modal } = AntdApp.useApp();
  const [form] = Form.useForm<PartyQueryConditions>();
  const { authenticated, records, total, loading, current, pageSize, setCurrent, setPageSize, query, reset, refresh } =
    usePartyList();

  const handleSearch = (values: PartyQueryConditions) => {
    // if (!authenticated) {
    //   message.warning('Please log in first.');
    //   return;
    // }
    query(values);
  };

  const handleReset = () => {
    form.resetFields();
    reset();
  };

  const handleOpenPartyForm = useCallback(
    async (record: PartyRecord | null) => {
      // if (!authenticated) {
      //   message.warning('Please log in first.');
      //   return;
      // }

      const saved = await openModalPartyForm(modal, record);
      if (!saved) return;
      refresh();
      message.success(record ? 'Party updated' : 'Party added');
    },
    [authenticated, message, modal, refresh],
  );

  const columns = useMemo<TableColumnsType<PartyRecord>>(
    () => [
      ...partyColumns,
      {
        title: 'Actions',
        key: 'actions',
        width: 176,
        fixed: 'right',
        render: (_: unknown, record: PartyRecord) => (
          <Flex gap={4} onDoubleClick={(e) => e.stopPropagation()}>
            <Button size='small' color='primary' variant='link' onClick={() => handleOpenPartyForm(record)}>
              Edit
            </Button>
            <Button size='small' color='primary' variant='link' onClick={() => handleViewRelations(record)}>
              {record.bankCategory === PartyBankCategoryEnum.Direct ? 'View Indirect' : 'View Direct'}
            </Button>
          </Flex>
        ),
      },
    ],
    [handleOpenPartyForm, handleViewRelations],
  );

  return (
    <Card
      className='h-full overflow-hidden'
      size='small'
      title={
        <Flex align='center' gap='small'>
          <span>Party Management</span>
          <ConfigProvider theme={{ components: { Segmented: { itemSelectedColor: 'var(--ant-color-primary)' } } }}>
            <Segmented<string>
              size='small'
              aria-label='Party management view'
              value={activeTab}
              onChange={setActiveTab}
              options={[
                { value: 'party', label: 'Info' },
                { value: 'relation', label: 'Relations' },
              ]}
            />
          </ConfigProvider>
        </Flex>
      }
    >
      <div hidden={activeTab !== 'relation'}>
        <PartyRelation linkedFilters={relationFilters} />
      </div>
      <div hidden={activeTab !== 'party'}>
        <Flex vertical gap='middle'>
          <Form
            form={form}
            size='small'
            layout='horizontal'
            labelAlign='left'
            labelCol={{ flex: FILTER_LABEL_WIDTH }}
            onFinish={handleSearch}
          >
            <Row gutter={[16, 8]}>
              <Col span={8}>
                <BankBicFilter />
              </Col>
              <Col span={8}>
                <EndNameFilter />
              </Col>
              <Col span={8}>
                <BankCategoryFilter />
              </Col>
              <Col span={8}>
                <DomesticFlagFilter />
              </Col>
              <Col span={8}>
                <StatusFilter />
              </Col>
              <Col span={8}>
                <LoginStsFilter />
              </Col>
              <Col span={8}>
                <ChangeType filter />
              </Col>
              <Col span={8}>
                <ChangeNumber />
              </Col>
            </Row>
            <Row gutter={[16, 8]} className='mt-2'>
              <Col span={16} className='flex items-center'>
                <Button size='small' type='primary' icon={<PlusOutlined />} onClick={() => handleOpenPartyForm(null)}>
                  Add
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

          <ResizableTable<PartyRecord>
            className={`message-list-table${records.length === 0 ? ' message-list-table-empty' : ''}`}
            style={{ '--message-list-table-body-height': TABLE_BODY_HEIGHT } as CSSProperties}
            rowKey={(record) => `${record.partyId}:${record.effectiveDate}`}
            onRow={(record) => ({ onDoubleClick: () => handleViewRelations(record) })}
            size='small'
            columns={columns}
            storageKey='party-list-v3'
            dataSource={records}
            loading={loading}
            locale={{ emptyText: authenticated ? 'No parties found' : 'Waiting for authentication...' }}
            scroll={{ y: TABLE_BODY_HEIGHT }}
            pagination={{
              current,
              pageSize,
              total,
              pageSizeOptions: PARTY_PAGE_SIZE_OPTIONS,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (count) => `Total ${count}`,
              onChange: (nextCurrent, nextPageSize) => {
                setCurrent(nextCurrent);
                setPageSize(nextPageSize);
              },
            }}
          />
        </Flex>
      </div>
    </Card>
  );
};

export default PartyList;

/** 按参与资格定位直间参关系 */
export const getPartyRelationFilters = (record: PartyRecord): PartyRelationConditions =>
  record.bankCategory === PartyBankCategoryEnum.Direct
    ? { directPartyId: record.partyId }
    : { partyId: record.partyId };
