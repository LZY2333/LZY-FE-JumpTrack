import type { ComponentType } from 'react';
import * as Field from '@/components/FormItem/tempSend';

/** cips.303.001.02 业务撤销申请 */
const FormCancellation = () => (
  <>
    <Field.OrgMsgId />
    <Field.OrgMsgType business='cancellation' />
    <Field.OrgInterbankSettlementAmount />
    <Field.EndToEndIdentification />
    <Field.CancelDirectMemberId />
    <Field.CancelIndirectMemberId />
  </>
);

/** cips.305.001.03 业务状态查询申请 */
const FormStatusQuery = () => (
  <>
    <Field.QueryDirectMemberId />
    <Field.QueryIndirectMemberId />
    <Field.OrgMsgId />
    <Field.OrgMsgType business='statusQuery' />
    <Field.OrgBusiDirectMemberId />
    <Field.EndToEndIdentification />
  </>
);

/** cips.307.001.01 通用签名信息业务 */
const FormSignedInformation = () => (
  <>
    <Field.InstructingParty />
    <Field.InstructedParty />
    <Field.TransactionTypeName />
    <Field.Title />
    <Field.Content />
    <Field.AttachmentName />
    <Field.AttachmentContent />
  </>
);

/** cips.313.001.01 跨境业务结算排队查询申请 */
const FormQueueQuery = () => <Field.QueryDirectMemberId />;

/** cips.350.001.01 资金调减申请 */
const FormFundsReduction = () => (
  <>
    <Field.DirectMemberId />
    <Field.AdjustedDirectMemberId />
    <Field.TransferredAmount business='funds' />
    <Field.Currency />
  </>
);

/** cips.351.001.01 预注资调减申请 */
const FormPrefundingReduction = () => (
  <>
    <Field.DirectMemberId />
    <Field.AdjustedDirectMemberId />
    <Field.TransferredAmount business='prefunding' />
    <Field.Currency />
  </>
);

/** cips.353.001.02 排队调整申请 */
const FormQueueAdjustment = () => (
  <>
    <Field.OrgTxId />
    <Field.EndToEndIdentification />
    <Field.DirectMemberId business='queue' />
    <Field.ProprietaryCode />
  </>
);

/** cips.354.001.01 限额修改申请 */
const FormWarningThreshold = () => (
  <>
    <Field.DirectMemberId />
    <Field.Code />
    <Field.Amount />
    <Field.Currency />
  </>
);

/** 按报文类型选择字段组合 */
export const tempSendForms: Readonly<Record<string, ComponentType>> = {
  'cips.303.001.02': FormCancellation,
  'cips.305.001.03': FormStatusQuery,
  'cips.307.001.01': FormSignedInformation,
  'cips.313.001.01': FormQueueQuery,
  'cips.350.001.01': FormFundsReduction,
  'cips.351.001.01': FormPrefundingReduction,
  'cips.353.001.02': FormQueueAdjustment,
  'cips.354.001.01': FormWarningThreshold,
};
