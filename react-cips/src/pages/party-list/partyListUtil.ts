import type { PartyQueryConditions, PartyRecord, PartySaveRequest } from '@/api/party';
import { omitEmptyValues } from '@/utils';

/** 参与行查询表单值 */
export type PartyListFilterValues = PartyQueryConditions;

/** 构造参与行列表查询条件 */
export const buildPartyQueryConditions = (filters: PartyListFilterValues): PartyQueryConditions =>
  omitEmptyValues(filters);

/** 将参与行记录填入新增修改共用表单 */
export const buildPartyFormInitialValues = (record: PartyRecord): PartySaveRequest => ({
  partyId: record.partyId,
  effectiveDate: record.effectiveDate,
  bankCategory: record.bankCategory,
  domesticFlag: record.domesticFlag,
  bankBic: record.bankBic,
  bankLei: record.bankLei,
  endName: record.endName,
  chsName: record.chsName,
  custodian: record.custodian,
  directPartyId: record.directPartyId,
  partySts: record.partySts,
  status: record.status,
  loginSts: record.loginSts,
});

/** 构造参与行保存数据，空字段用于清空已有值 */
export const buildPartySaveRequest = (fields: PartySaveRequest): PartySaveRequest => ({
  partyId: fields.partyId,
  effectiveDate: fields.effectiveDate,
  bankCategory: fields.bankCategory,
  domesticFlag: fields.domesticFlag,
  bankBic: normalizePartyOptionalValue(fields.bankBic),
  bankLei: normalizePartyOptionalValue(fields.bankLei),
  endName: normalizePartyOptionalValue(fields.endName),
  chsName: normalizePartyOptionalValue(fields.chsName),
  custodian: normalizePartyOptionalValue(fields.custodian),
  directPartyId: normalizePartyOptionalValue(fields.directPartyId),
  partySts: normalizePartyOptionalValue(fields.partySts),
  status: normalizePartyOptionalValue(fields.status),
  loginSts: normalizePartyOptionalValue(fields.loginSts),
});

/** 参与行列表联合主键 */
export const buildPartyRecordKey = ({ partyId, effectiveDate }: PartyRecord) => `${partyId}:${effectiveDate}`;

/** 参与行可选字段空值统一为 null */
const normalizePartyOptionalValue = <Value>(value?: Value | null) => (value === '' ? null : value ?? null);
