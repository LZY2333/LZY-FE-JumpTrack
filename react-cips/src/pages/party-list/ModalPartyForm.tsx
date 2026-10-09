import { createRef } from 'react';
import { Col, Form, Row } from 'antd';
import type { App, FormInstance } from 'antd';
import { deleteParty, saveParty } from '@/api/party';
import type { PartyRecord, PartySaveRequest } from '@/api/party';
import {
  BankBic,
  BankCategory,
  BankLei,
  ChsName,
  Custodian,
  DirectPartyId,
  DomesticFlag,
  EffectiveDate,
  EndName,
  PartyId,
  PartySts,
} from '@/components/FormItem/party';
import { buildPartyFormInitialValues } from './partyListUtil';

/** 参与行弹窗使用的 Ant Design 上下文能力 */
type ModalPartyApi = Pick<ReturnType<typeof App.useApp>['modal'], 'confirm'>;

/** 打开新增或修改参与行弹窗，保存成功后返回 true */
export const openModalPartyForm = async (modal: ModalPartyApi, record: PartyRecord | null): Promise<boolean> => {
  const formRef = createRef<FormInstance<PartySaveRequest>>();

  return modal.confirm({
    width: 760,
    title: record ? 'Edit Party' : 'Add Party',
    content: (
      <Form
        ref={formRef}
        size='small'
        layout='vertical'
        initialValues={record ? buildPartyFormInitialValues(record) : undefined}
      >
        <Row gutter={[16, 8]}>
          <Col span={12}>
            <PartyId disabled={Boolean(record)} />
          </Col>
          <Col span={12}>
            <BankBic />
          </Col>
          <Col span={12}>
            <BankLei />
          </Col>
          <Col span={12}>
            <ChsName />
          </Col>
          <Col span={12}>
            <PartySts />
          </Col>
          <Col span={12}>
            <EndName />
          </Col>
          <Col span={12}>
            <BankCategory />
          </Col>
          <Col span={12}>
            <DomesticFlag />
          </Col>
          <Col span={12}>
            <DirectPartyId />
          </Col>
          <Col span={12}>
            <Custodian />
          </Col>
          <Col span={12}>
            <EffectiveDate />
          </Col>
        </Row>
      </Form>
    ),
    okText: record ? 'Save' : 'Add',
    onOk: async () => {
      const fields = await formRef.current?.validateFields();
      if (!fields) return Promise.reject();

      await saveParty(fields);
    },
  });
};

/** 删除成功后返回 true，接口失败时保留确认弹窗 */
export const openModalPartyDelete = async (modal: ModalPartyApi, record: PartyRecord): Promise<boolean> =>
  modal.confirm({
    title: 'Delete Party',
    content: `Delete party ${record.partyId}?`,
    okText: 'Delete',
    okButtonProps: { danger: true },
    onOk: async () => {
      await deleteParty({ partyId: record.partyId });
    },
  });
