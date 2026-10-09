import type { PartyQueryConditions, PartyRecord, PartySaveRequest } from '@/api/party';
import { omitEmptyValues } from '@/utils';

/** 参与行查询表单值 */
export type PartyListFilterValues = PartyQueryConditions;

/** 构造参与行列表查询条件 */
export const buildPartyQueryConditions = (filters: PartyListFilterValues): PartyQueryConditions =>
  omitEmptyValues(filters);

/** 将参与行记录填入新增修改共用表单 */
export const buildPartyFormInitialValues = (record: PartyRecord): Partial<PartySaveRequest> => ({
  partyId: record.partyId,
  bankBic: record.bankBic ?? '',
  bankLei: record.bankLei ?? '',
  endName: record.endName ?? '',
  chsName: record.chsName ?? '',
  custodian: record.custodian ?? '',
  directPartyId: record.directPartyId ?? '',
  bankCategory: record.bankCategory ?? undefined,
  domesticFlag: record.domesticFlag ?? undefined,
  partySts: record.partySts ?? undefined,
  effectiveDate: record.effectiveDate,
});
