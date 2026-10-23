import { createRef } from 'react';
import { Form } from 'antd';
import type { App, FormInstance } from 'antd';
import { savePartyRelation } from '@/api/party';
import type { PartyRelationRecord, PartyRelationSaveRequest } from '@/api/party';
import {
  BankBic,
  ChangeType,
  ChangeNumber,
  EffectiveDate,
  PartyId,
  RelationDirectPartyId,
} from '@/components/FormItem/party';

/** 直间参关系弹窗上下文 */
type PartyRelationModalApi = Pick<ReturnType<typeof App.useApp>['modal'], 'confirm'>;

/** 新增或修改直间参关系 */
export const openModalPartyRelationForm = (modal: PartyRelationModalApi, record: PartyRelationRecord | null) => {
  const formRef = createRef<FormInstance<PartyRelationSaveRequest>>();
  return modal.confirm({
    width: 520,
    title: record ? 'Edit Relation' : 'Add Relation',
    content: (
      <Form
        ref={formRef}
        className='flex flex-col gap-3'
        size='small'
        layout='horizontal'
        labelAlign='left'
        labelCol={{ flex: '120px' }}
        initialValues={record ?? undefined}
      >
        <PartyId disabled={Boolean(record)} />
        <RelationDirectPartyId disabled={Boolean(record)} />
        <BankBic />
        <ChangeType />
        <ChangeNumber />
        <EffectiveDate />
      </Form>
    ),
    okText: record ? 'Save' : 'Add',
    onOk: async () => {
      const values = await formRef.current?.validateFields();
      if (!values) return Promise.reject();
      await savePartyRelation(cleanPartyValues(values));
    },
  });
};

/** 清理未填写的提交字段 */
const cleanPartyValues = <Values extends object>(values: Values): Values =>
  Object.fromEntries(
    Object.entries(values).filter(([, value]) => value !== '' && value !== null && value !== undefined),
  ) as Values;
