import { useEffect, useMemo } from 'react';
import type { CSSProperties } from 'react';
import { App, Button, Col, Flex, Form, Row } from 'antd';
import type { TableColumnsType } from 'antd';
import type { PartyRelationConditions, PartyRelationRecord } from '@/api/party';
import ResizableTable from '@/components/ResizableTable';
import { BankBicFilter, ChangeType, ChangeNumber, PartyId, RelationDirectPartyId } from '@/components/FormItem/party';
import { partyRelationColumns } from '@/components/TableColumn/party';
import usePartyRelationList, { PARTY_PAGE_SIZE_OPTIONS } from './usePartyRelationList';
import { openModalPartyRelationForm } from './ModalPartyRelationForm';

// 高度扣减明细（px）
// 页面上下边距：24 × 2 = 48
// Card 上下内边距与边框：12 × 2 + 1 × 2 = 26
// Card 标题栏（含分段切换）：38
// 筛选区域：2 × 24 + 1 × 8 = 56
// 操作按钮区域：上间距 8 + 按钮高度 24 = 32
// 表单与表格间距：16
// 表头：文字行高 22 + 上下内边距 8 × 2 + 下边框 1 = 39
// 分页区域：上间距 16 + 分页器高度 24 + 下间距 0 = 40
// 合计：48 + 26 + 38 + 56 + 32 + 16 + 39 + 40 = 295
// 分页下间距由 index.css 清除；横向滚动条包含在固定表体高度内
const TABLE_BODY_HEIGHT = 'calc(100vh - 295px)';

/** 直间参关系面板属性 */
interface PartyRelationProps {
  /** 从参与行联动的筛选条件 */
  linkedFilters?: PartyRelationConditions;
}

/** 管理直间参关系 */
const PartyRelation = ({ linkedFilters }: PartyRelationProps) => {
  const { modal, message } = App.useApp();
  const [form] = Form.useForm<PartyRelationConditions>();
  const { records, total, loading, current, pageSize, setCurrent, setPageSize, query, reset, refresh } =
    usePartyRelationList();

  useEffect(() => {
    if (!linkedFilters) return;
    form.resetFields();
    form.setFieldsValue(linkedFilters);
    query(linkedFilters);
  }, [linkedFilters, form, query]);

  const handleEdit = async (record: PartyRelationRecord | null) => {
    const saved = await openModalPartyRelationForm(modal, record);
    if (!saved) return;
    refresh();
    message.success(record ? 'Relation updated' : 'Relation added');
  };
  const handleReset = () => {
    form.resetFields();
    reset();
  };
  const columns = useMemo<TableColumnsType<PartyRelationRecord>>(
    () => [
      ...partyRelationColumns,
      {
        title: 'Actions',
        key: 'actions',
        width: 96,
        fixed: 'right',
        render: (_: unknown, record: PartyRelationRecord) => (
          <Button size='small' color='primary' variant='link' onClick={() => handleEdit(record)}>
            Edit
          </Button>
        ),
      },
    ],
    [handleEdit],
  );
  return (
    <Flex vertical gap='middle'>
      <Form form={form} size='small' labelAlign='left' labelCol={{ flex: '120px' }} onFinish={query}>
        <Row gutter={[16, 8]}>
          <Col span={8}>
            <PartyId filter />
          </Col>
          <Col span={8}>
            <ChangeType filter />
          </Col>
          <Col span={8}>
            <ChangeNumber />
          </Col>
          <Col span={8}>
            <RelationDirectPartyId filter />
          </Col>
          <Col span={8}>
            <BankBicFilter />
          </Col>
        </Row>
        <Flex justify='space-between' className='mt-2'>
          <Button size='small' type='primary' onClick={() => handleEdit(null)}>
            Add
          </Button>
          <Flex gap='small'>
            <Button size='small' type='primary' htmlType='submit'>
              Search
            </Button>
            <Button size='small' onClick={handleReset}>
              Reset
            </Button>
          </Flex>
        </Flex>
      </Form>
      <ResizableTable<PartyRelationRecord>
        className={`message-list-table${records.length === 0 ? ' message-list-table-empty' : ''}`}
        style={{ '--message-list-table-body-height': TABLE_BODY_HEIGHT } as CSSProperties}
        size='small'
        rowKey={(record) => JSON.stringify([record.partyId, record.directPartyId])}
        columns={columns}
        storageKey='party-relation-list-v2'
        dataSource={records}
        loading={loading}
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
  );
};
export default PartyRelation;
