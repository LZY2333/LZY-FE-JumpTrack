import { createRef } from 'react';
import { Form } from 'antd';
import type { App, FormInstance } from 'antd';
import { saveParty } from '@/api/party';
import type { PartyRecord, PartySaveRequest } from '@/api/party';
import useUserStore from '@/store/useUserStore';
import {
  BankBic,
  ChangeType,
  ChangeNumber,
  BankCategory,
  BankLei,
  ChsName,
  Custodian,
  DomesticFlag,
  EffectiveDate,
  EndName,
  LoginSts,
  Status,
} from '@/components/FormItem/party';

/** 参与行弹窗使用的 Ant Design 上下文能力 */
type ModalPartyApi = Pick<ReturnType<typeof App.useApp>['modal'], 'confirm' | 'warning'>;

/** 打开新增或修改参与行弹窗，保存成功后返回 true */
export const openModalPartyForm = async (modal: ModalPartyApi, record: PartyRecord | null): Promise<boolean> => {
  const formRef = createRef<FormInstance<PartySaveRequest>>();

  return modal.confirm({
    width: 520,
    title: record ? 'Edit Party' : 'Add Party',
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
        <EffectiveDate disabled={Boolean(record)} />
        <BankBic />
        <EndName />
        <BankCategory />
        <DomesticFlag />
        <Status />
        <LoginSts />
        <ChsName />
        <BankLei />
        <Custodian />
        <ChangeType />
        <ChangeNumber />
      </Form>
    ),
    okText: record ? 'Save' : 'Add',
    onOk: async () => {
      const fields = await formRef.current?.validateFields();
      if (!fields) return Promise.reject();

      if (record) {
        await saveParty(cleanPartyValues(fields));
        return;
      }

      const user = useUserStore.getState().user;
      if (!user) {
        modal.warning({ title: 'Authentication Required', content: 'Please log in before adding a party.' });
        return Promise.reject();
      }

      await saveParty({ ...cleanPartyValues(fields), createUser: user.userId, createBrno: user.orgId });
    },
  });
};

/** 清理未填写的提交字段 */
const cleanPartyValues = <Values extends object>(values: Values): Values =>
  Object.fromEntries(
    Object.entries(values).filter(([, value]) => value !== '' && value !== null && value !== undefined),
  ) as Values;
