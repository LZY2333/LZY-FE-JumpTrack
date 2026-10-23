import type { PartyQuery, PartyQueryConditions, PartyQueryResult, PartyRecord, PartySaveRequest } from '@/api/party';
import {
  PartyBankCategoryEnum,
  PartyChangeTypeEnum,
  PartyDomesticFlagEnum,
  PartyBusinessStatusEnum,
  PartyLoginStatusEnum,
  ResCode,
} from '@/types/enums';

interface MockRequestOption<Body> {
  /** vite-plugin-mock 解析后的请求体 */
  body?: Body;
}

const parties: PartyRecord[] = [
  {
    changeType: PartyChangeTypeEnum.Add,
    changeNumber: '1',
    partyId: 'CIPS000001',
    bankBic: 'ICBKCNBJ',
    bankLei: 'LEI-CN-001',
    endName: 'Industrial and Commercial Bank of China',
    chsName: '中国工商银行',
    custodian: null,
    bankCategory: PartyBankCategoryEnum.Direct,
    domesticFlag: PartyDomesticFlagEnum.Domestic,
    effectiveDate: '2026-01-01',
    status: PartyBusinessStatusEnum.Enabled,
    loginSts: PartyLoginStatusEnum.LoggedIn,
    createTime: '2025-12-01T09:00:00',
    updateTime: '2026-01-01T09:00:00',
    createUser: 'U001',
    createBrno: 'ORG001',
  },
  {
    changeType: PartyChangeTypeEnum.Add,
    changeNumber: '1',
    partyId: 'CIPS000002',
    bankBic: 'CCBQCNBJ',
    bankLei: 'LEI-CN-002',
    endName: 'China Construction Bank',
    chsName: '中国建设银行',
    custodian: null,
    bankCategory: PartyBankCategoryEnum.Direct,
    domesticFlag: PartyDomesticFlagEnum.Domestic,
    effectiveDate: '2026-01-01',
    status: PartyBusinessStatusEnum.Enabled,
    loginSts: PartyLoginStatusEnum.LoggedOut,
    createTime: '2025-12-02T09:00:00',
    updateTime: '2026-01-01T09:00:00',
    createUser: 'U002',
    createBrno: 'ORG001',
  },
  {
    changeType: PartyChangeTypeEnum.Add,
    changeNumber: '1',
    partyId: 'CIPS000003',
    bankBic: 'CMBCCNBS',
    bankLei: 'LEI-CN-003',
    endName: 'China Merchants Bank',
    chsName: '招商银行',
    custodian: 'CIPS000001',
    bankCategory: PartyBankCategoryEnum.Indirect,
    domesticFlag: PartyDomesticFlagEnum.Domestic,
    effectiveDate: '2026-02-01',
    status: PartyBusinessStatusEnum.Disabled,
    loginSts: PartyLoginStatusEnum.LoggedOut,
    createTime: '2026-01-15T09:00:00',
    updateTime: '2026-02-01T09:00:00',
    createUser: 'U003',
    createBrno: 'ORG001',
  },
  {
    changeType: PartyChangeTypeEnum.Add,
    changeNumber: '1',
    partyId: 'CIPS000004',
    bankBic: 'HSBCHKHH',
    bankLei: 'LEI-HK-001',
    endName: 'Hang Seng Bank',
    chsName: '恒生银行',
    custodian: 'CIPS000002',
    bankCategory: PartyBankCategoryEnum.Indirect,
    domesticFlag: PartyDomesticFlagEnum.Overseas,
    effectiveDate: '2026-03-01',
    status: PartyBusinessStatusEnum.Enabled,
    loginSts: PartyLoginStatusEnum.LoggedIn,
    createTime: '2026-02-01T09:00:00',
    updateTime: '2026-03-01T09:00:00',
    createUser: 'U001',
    createBrno: 'ORG001',
  },
  {
    changeType: PartyChangeTypeEnum.Add,
    changeNumber: '1',
    partyId: 'CIPS000005',
    bankBic: 'CITIUS33',
    bankLei: 'LEI-US-001',
    endName: 'Citibank',
    chsName: '花旗银行',
    custodian: 'CIPS000001',
    bankCategory: PartyBankCategoryEnum.Indirect,
    domesticFlag: PartyDomesticFlagEnum.Overseas,
    effectiveDate: '2026-06-01',
    status: PartyBusinessStatusEnum.Disabled,
    loginSts: PartyLoginStatusEnum.LoggedOut,
    createTime: '2026-05-01T09:00:00',
    updateTime: '2026-06-01T09:00:00',
    createUser: 'U002',
    createBrno: 'ORG001',
  },
];

/** 按页面筛选条件返回参与行分页结果 */
const handlePartyList = ({ body }: MockRequestOption<PartyQuery>) => {
  const { current = 1, pageSize = 20, ...conditions } = body ?? {};
  const filtered = parties.filter((party) => matchesParty(party, conditions));
  const result: PartyQueryResult = {
    list: filtered.slice((current - 1) * pageSize, current * pageSize).map((party) => ({ ...party })),
    current,
    pageSize,
    total: filtered.length,
  };
  return { returnCode: ResCode.Success, body: result };
};

/** 新增或修改参与行 */
const handlePartySave = ({ body: request }: MockRequestOption<PartySaveRequest>) => {
  if (!isPartySaveRequestValid(request)) {
    return {
      returnCode: 'ERR0400',
      errorMsg:
        'Party ID, effective date, category, domestic flag, valid business status and login status are required.',
    };
  }

  const partyId = request.partyId.trim();
  const existingIndex = parties.findIndex((party) => matchesPartyPrimaryKey(party, { ...request, partyId }));
  const now = new Date().toISOString();
  const existingRecord = existingIndex >= 0 ? parties[existingIndex] : undefined;
  const saved = buildPartyRecord({ ...request, partyId }, existingRecord, now);
  if (existingIndex >= 0) {
    parties[existingIndex] = saved;
  } else {
    parties.push(saved);
  }
  return { returnCode: ResCode.Success };
};

export default [
  { url: '/pssst/manager/party/list', method: 'post', response: handlePartyList },
  { url: '/pssst/manager/party/save', method: 'post', response: handlePartySave },
];

/** 参与行保存必填字段校验 */
const isPartySaveRequestValid = (request?: PartySaveRequest): request is PartySaveRequest => {
  if (!request) return false;

  if (request.changeNumber && !/^[1-9]\d{0,9}$/.test(request.changeNumber)) return false;
  if (request.changeType && !Object.values(PartyChangeTypeEnum).includes(request.changeType)) return false;

  const requiredValues = [request.partyId?.trim(), request.effectiveDate, request.bankCategory, request.domesticFlag];
  if (!requiredValues.every(Boolean)) return false;

  return (
    Object.values(PartyBusinessStatusEnum).includes(request.status) &&
    Object.values(PartyLoginStatusEnum).includes(request.loginSts)
  );
};

/** 参与行保存时保留原创建信息，新增记录使用请求中的创建人和部门号 */
const buildPartyRecord = (
  request: PartySaveRequest,
  existingRecord: PartyRecord | undefined,
  updateTime: string,
): PartyRecord => {
  const { createUser = 'U001', createBrno = 'ORG001' } = existingRecord ?? request;

  return {
    ...request,
    bankBic: request.bankBic ?? null,
    bankLei: request.bankLei ?? null,
    endName: request.endName ?? null,
    chsName: request.chsName ?? null,
    custodian: request.custodian ?? null,
    status: request.status,
    loginSts: request.loginSts,
    createTime: existingRecord?.createTime ?? updateTime,
    updateTime,
    createUser,
    createBrno,
  };
};

/** 参与行联合主键匹配 */
const matchesPartyPrimaryKey = (party: PartyRecord, primaryKey: Pick<PartyRecord, 'partyId' | 'effectiveDate'>) =>
  party.partyId === primaryKey.partyId && party.effectiveDate === primaryKey.effectiveDate;

/** 同时应用参与行文本条件与枚举条件 */
const matchesParty = (party: PartyRecord, conditions: PartyQueryConditions) => {
  const textFields: Array<[string | null, string | undefined]> = [
    [party.partyId, conditions.partyId],
    [party.bankBic, conditions.bankBic],
    [party.bankLei, conditions.bankLei],
    [party.chsName, conditions.chsName],
    [party.endName, conditions.endName],
    [party.custodian, conditions.custodian],
  ];
  if (!textFields.every(([value, filter]) => matchesText(value, filter))) return false;

  const enumFields = [
    [party.changeType, conditions.changeType],
    [party.changeNumber, conditions.changeNumber],
    [party.bankCategory, conditions.bankCategory],
    [party.domesticFlag, conditions.domesticFlag],
    [party.status, conditions.status],
    [party.loginSts, conditions.loginSts],
  ];
  return enumFields.every(([value, filter]) => !filter || value === filter);
};

const matchesText = (value: string | null, filter?: string) =>
  !filter || Boolean(value?.toLocaleLowerCase().includes(filter.toLocaleLowerCase()));
