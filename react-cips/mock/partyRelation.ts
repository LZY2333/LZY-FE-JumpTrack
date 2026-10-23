import type { PartyRelationQuery, PartyRelationRecord, PartyRelationSaveRequest } from '@/api/party';
import { PartyChangeTypeEnum, ResCode } from '@/types/enums';

/** Mock 请求 */
interface PartyRelationMockRequest<Body> {
  /** 请求体 */
  body?: Body;
}

const relations: PartyRelationRecord[] = [
  {
    partyId: 'CIPS000003',
    directPartyId: 'CIPS000001',
    bankBic: 'CMBCCNBS',
    changeType: PartyChangeTypeEnum.Add,
    changeNumber: '1',
    effectiveDate: '2026-02-01',
    createTime: '2026-01-15T09:00:00',
    updateTime: '2026-02-01T09:00:00',
  },
  {
    partyId: 'CIPS000004',
    directPartyId: 'CIPS000002',
    bankBic: 'HSBCHKHH',
    changeType: PartyChangeTypeEnum.Add,
    changeNumber: '2',
    effectiveDate: '2026-03-01',
    createTime: '2026-02-01T09:00:00',
    updateTime: '2026-03-01T09:00:00',
  },
  {
    partyId: 'CIPS000005',
    directPartyId: 'CIPS000001',
    bankBic: 'CITIUS33',
    changeType: PartyChangeTypeEnum.Add,
    changeNumber: '3',
    effectiveDate: '2026-06-01',
    createTime: '2026-05-01T09:00:00',
    updateTime: '2026-06-01T09:00:00',
  },
];

/** 查询直间参关系 */
const handleList = ({ body }: PartyRelationMockRequest<PartyRelationQuery>) => {
  const { current = 1, pageSize = 20, ...filters } = body ?? {};
  const filtered = relations.filter((record) =>
    Object.entries(filters).every(([key, value]) => {
      if (!value) return true;
      const actual = record[key as keyof PartyRelationRecord];
      if (key === 'bankBic') return actual?.toLowerCase().includes(value.toLowerCase());
      return actual === value;
    }),
  );
  return {
    returnCode: ResCode.Success,
    body: {
      list: filtered.slice((current - 1) * pageSize, current * pageSize),
      current,
      pageSize,
      total: filtered.length,
    },
  };
};

/** 保存直间参关系 */
const handleSave = ({ body }: PartyRelationMockRequest<PartyRelationSaveRequest>) => {
  if (!body?.partyId?.trim() || !body.directPartyId?.trim() || !body.effectiveDate) {
    return { returnCode: 'ERR0400', errorMsg: 'Party ID, direct party ID and effective date are required.' };
  }
  if (body.changeNumber && !/^[1-9]\d{0,9}$/.test(body.changeNumber)) {
    return { returnCode: 'ERR0400', errorMsg: 'ChangeNumber must be a positive integer (up to 10 digits).' };
  }
  if (body.changeType && !Object.values(PartyChangeTypeEnum).includes(body.changeType)) {
    return { returnCode: 'ERR0400', errorMsg: 'ChangeType must be ADDD, MODI or DELE.' };
  }
  const index = relations.findIndex(
    (record) => record.partyId === body.partyId && record.directPartyId === body.directPartyId,
  );
  const now = new Date().toISOString();
  const record: PartyRelationRecord = {
    ...body,
    createTime: index < 0 ? now : relations[index].createTime,
    updateTime: now,
  };
  if (index < 0) relations.push(record);
  else relations[index] = record;
  return { returnCode: ResCode.Success };
};

export default [
  { url: '/pssst/manager/party/relations/list', method: 'post', response: handleList },
  { url: '/pssst/manager/party/relations/save', method: 'post', response: handleSave },
];
