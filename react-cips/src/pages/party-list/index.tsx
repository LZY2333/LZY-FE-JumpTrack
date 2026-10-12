import { useCallback, useMemo } from 'react';
import type { CSSProperties } from 'react';
import { App as AntdApp, Button, Card, Col, Flex, Form, Row } from 'antd';
import type { TableColumnsType } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { PartyRecord } from '@/api/party';
import ResizableTable from '@/components/ResizableTable';
import {
  BankBicFilter,
  BankCategoryFilter,
  BankLeiFilter,
  ChsNameFilter,
  CustodianFilter,
  DirectPartyIdFilter,
  DomesticFlagFilter,
  EndNameFilter,
  LoginStsFilter,
  PartyIdFilter,
  PartyStsFilter,
  StatusFilter,
} from '@/components/FormItem/party';
import {
  bankBic,
  bankCategory,
  bankLei,
  chsName,
  custodian,
  directPartyId,
  domesticFlag,
  effectiveDate,
  endName,
  loginSts,
  partyCreateTime,
  partyId,
  partySts,
  partyUpdateTime,
  status,
} from '@/components/TableColumn/party';
import usePartyList, { PARTY_PAGE_SIZE_OPTIONS } from './usePartyList';
import { buildPartyRecordKey, type PartyListFilterValues } from './partyListUtil';
import { openModalPartyDelete, openModalPartyForm } from './ModalPartyForm';

// 参考报文列表，四行筛选和一行按钮比 LCW 列表多两行，每行 32px
const TABLE_BODY_HEIGHT = 'calc(100vh - 362px)';
const partyColumns: TableColumnsType<PartyRecord> = [
  partyId,
  chsName,
  endName,
  bankBic,
  bankLei,
  bankCategory,
  domesticFlag,
  partySts,
  directPartyId,
  custodian,
  effectiveDate,
  status,
  loginSts,
  partyCreateTime,
  partyUpdateTime,
];

/** 参与行列表页 */
const PartyList = () => {
  const { message, modal } = AntdApp.useApp();
  const [form] = Form.useForm<PartyListFilterValues>();
  const { authenticated, records, loading, current, pageSize, setCurrent, setPageSize, query, reset, refresh } =
    usePartyList();

  const handleSearch = (values: PartyListFilterValues) => {
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

  const handleDelete = useCallback(
    async (record: PartyRecord) => {
      // if (!authenticated) {
      //   message.warning('Please log in first.');
      //   return;
      // }

      const deleted = await openModalPartyDelete(modal, record);
      if (!deleted) return;
      setCurrent(1);
      refresh();
      message.success('Party deleted');
    },
    [authenticated, message, modal, refresh, setCurrent],
  );

  const columns = useMemo<TableColumnsType<PartyRecord>>(
    () => [
      ...partyColumns,
      {
        title: 'Actions',
        key: 'actions',
        width: 140,
        fixed: 'right',
        render: (_: unknown, record: PartyRecord) => (
          <Flex gap='small'>
            <Button size='small' color='primary' variant='link' onClick={() => handleOpenPartyForm(record)}>
              Edit
            </Button>
            <Button size='small' color='primary' variant='link' onClick={() => handleDelete(record)}>
              Delete
            </Button>
          </Flex>
        ),
      },
    ],
    [handleDelete, handleOpenPartyForm],
  );

  return (
    <Card className='h-full overflow-hidden' size='small' title='Party Management'>
      <Flex vertical gap='middle'>
        <Form
          form={form}
          size='small'
          layout='horizontal'
          labelAlign='left'
          labelCol={{ span: 10 }}
          wrapperCol={{ span: 14 }}
          onFinish={handleSearch}
        >
          <Row gutter={[16, 8]}>
            <Col span={8}>
              <PartyIdFilter />
            </Col>
            <Col span={8}>
              <BankBicFilter />
            </Col>
            <Col span={8}>
              <BankLeiFilter />
            </Col>
            <Col span={8}>
              <ChsNameFilter />
            </Col>
            <Col span={8}>
              <EndNameFilter />
            </Col>
            <Col span={8}>
              <PartyStsFilter />
            </Col>
            <Col span={8}>
              <BankCategoryFilter />
            </Col>
            <Col span={8}>
              <DomesticFlagFilter />
            </Col>
            <Col span={8}>
              <DirectPartyIdFilter />
            </Col>
            <Col span={8}>
              <CustodianFilter />
            </Col>
            <Col span={8}>
              <StatusFilter />
            </Col>
            <Col span={8}>
              <LoginStsFilter />
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
          rowKey={buildPartyRecordKey}
          size='small'
          columns={columns}
          storageKey='party-list-v1'
          dataSource={records}
          loading={loading}
          locale={{ emptyText: authenticated ? 'No parties found' : 'Waiting for authentication...' }}
          scroll={{ y: TABLE_BODY_HEIGHT }}
          pagination={{
            current,
            pageSize,
            total: records.length,
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
    </Card>
  );
};

export default PartyList;
