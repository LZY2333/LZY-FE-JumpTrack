import type { PartyDeleteRequest, PartyQueryConditions, PartyRecord, PartySaveRequest } from '@/api/party';
import {
  PartyBankCategoryEnum,
  PartyDomesticFlagEnum,
  PartyBusinessStatusEnum,
  PartyLoginStatusEnum,
  ResCode,
  YesNo,
} from '@/types/enums';

interface MockRequestOption<Body> {
  /** vite-plugin-mock 解析后的请求体 */
  body?: Body;
}

const parties: PartyRecord[] = [
  {
    partyId: 'CIPS000001',
    bankBic: 'ICBKCNBJ',
    bankLei: 'LEI-CN-001',
    endName: 'Industrial and Commercial Bank of China',
    chsName: '中国工商银行',
    custodian: null,
    directPartyId: null,
    bankCategory: PartyBankCategoryEnum.Direct,
    domesticFlag: PartyDomesticFlagEnum.Domestic,
    partySts: YesNo.Yes,
    effectiveDate: '2026-01-01',
    status: PartyBusinessStatusEnum.Enabled,
    loginSts: PartyLoginStatusEnum.LoggedIn,
    createTime: '2025-12-01T09:00:00',
    updateTime: '2026-01-01T09:00:00',
  },
  {
    partyId: 'CIPS000002',
    bankBic: 'CCBQCNBJ',
    bankLei: 'LEI-CN-002',
    endName: 'China Construction Bank',
    chsName: '中国建设银行',
    custodian: null,
    directPartyId: null,
    bankCategory: PartyBankCategoryEnum.Direct,
    domesticFlag: PartyDomesticFlagEnum.Domestic,
    partySts: YesNo.Yes,
    effectiveDate: '2026-01-01',
    status: PartyBusinessStatusEnum.Enabled,
    loginSts: PartyLoginStatusEnum.LoggedOut,
    createTime: '2025-12-02T09:00:00',
    updateTime: '2026-01-01T09:00:00',
  },
  {
    partyId: 'CIPS000003',
    bankBic: 'CMBCCNBS',
    bankLei: 'LEI-CN-003',
    endName: 'China Merchants Bank',
    chsName: '招商银行',
    custodian: 'CIPS000001',
    directPartyId: 'CIPS000001',
    bankCategory: PartyBankCategoryEnum.Indirect,
    domesticFlag: PartyDomesticFlagEnum.Domestic,
    partySts: YesNo.Yes,
    effectiveDate: '2026-02-01',
    status: PartyBusinessStatusEnum.Disabled,
    loginSts: PartyLoginStatusEnum.LoggedOut,
    createTime: '2026-01-15T09:00:00',
    updateTime: '2026-02-01T09:00:00',
  },
  {
    partyId: 'CIPS000004',
    bankBic: 'HSBCHKHH',
    bankLei: 'LEI-HK-001',
    endName: 'Hang Seng Bank',
    chsName: '恒生银行',
    custodian: 'CIPS000002',
    directPartyId: 'CIPS000002',
    bankCategory: PartyBankCategoryEnum.Indirect,
    domesticFlag: PartyDomesticFlagEnum.Overseas,
    partySts: YesNo.Yes,
    effectiveDate: '2026-03-01',
    status: PartyBusinessStatusEnum.Enabled,
    loginSts: PartyLoginStatusEnum.LoggedIn,
    createTime: '2026-02-01T09:00:00',
    updateTime: '2026-03-01T09:00:00',
  },
  {
    partyId: 'CIPS000005',
    bankBic: 'CITIUS33',
    bankLei: 'LEI-US-001',
    endName: 'Citibank',
    chsName: '花旗银行',
    custodian: 'CIPS000001',
    directPartyId: 'CIPS000001',
    bankCategory: PartyBankCategoryEnum.Indirect,
    domesticFlag: PartyDomesticFlagEnum.Overseas,
    partySts: YesNo.No,
    effectiveDate: '2026-06-01',
    status: PartyBusinessStatusEnum.Disabled,
    loginSts: PartyLoginStatusEnum.LoggedOut,
    createTime: '2026-05-01T09:00:00',
    updateTime: '2026-06-01T09:00:00',
  },
];

/** 按全部页面筛选条件返回参与行数组 */
const handlePartyList = ({ body }: MockRequestOption<PartyQueryConditions>) => {
  const conditions = body ?? {};
  const filtered = parties.filter((party) => matchesParty(party, conditions)).map((party) => ({ ...party }));
  return { returnCode: ResCode.Success, body: filtered };
};

/** 新增或修改参与行 */
const handlePartySave = ({ body: request }: MockRequestOption<PartySaveRequest>) => {
  if (!isPartySaveRequestValid(request)) {
    return {
      returnCode: 'ERR0400',
      errorMsg: 'Party ID, effective date, category and domestic flag are required.',
    };
  }

  const partyId = request.partyId.trim();
  const existingIndex = parties.findIndex((party) => matchesPartyPrimaryKey(party, { ...request, partyId }));
  const now = new Date().toISOString();
  const createTime = existingIndex >= 0 ? parties[existingIndex].createTime : now;
  const saved = buildPartyRecord({ ...request, partyId }, createTime, now);
  if (existingIndex >= 0) {
    parties[existingIndex] = saved;
  } else {
    parties.push(saved);
  }
  return { returnCode: ResCode.Success };
};

/** 按参与机构行号和变更生效日期删除参与行 */
const handlePartyDelete = ({ body: request }: MockRequestOption<PartyDeleteRequest>) => {
  if (!request?.partyId || !request.effectiveDate) {
    return { returnCode: 'ERR0400', errorMsg: 'Party ID and effective date are required.' };
  }

  const index = parties.findIndex((party) => matchesPartyPrimaryKey(party, request));
  if (index < 0) return { returnCode: 'ERR0404', errorMsg: 'Party not found.' };

  parties.splice(index, 1);
  return { returnCode: ResCode.Success };
};

export default [
  { url: '/pssst/manager/party/list', method: 'post', response: handlePartyList },
  { url: '/pssst/manager/party/save', method: 'post', response: handlePartySave },
  { url: '/pssst/manager/party/delete', method: 'post', response: handlePartyDelete },
];

/** 参与行保存必填字段校验 */
const isPartySaveRequestValid = (request?: PartySaveRequest): request is PartySaveRequest => {
  if (!request) return false;
  return [request.partyId?.trim(), request.effectiveDate, request.bankCategory, request.domesticFlag].every(Boolean);
};

/** 参与行保存记录由服务端维护创建时间和更新时间 */
const buildPartyRecord = (
  request: PartySaveRequest,
  createTime: PartyRecord['createTime'],
  updateTime: string,
): PartyRecord => ({
  ...request,
  bankBic: request.bankBic ?? null,
  bankLei: request.bankLei ?? null,
  endName: request.endName ?? null,
  chsName: request.chsName ?? null,
  custodian: request.custodian ?? null,
  directPartyId: request.directPartyId ?? null,
  partySts: request.partySts ?? null,
  status: request.status ?? null,
  loginSts: request.loginSts ?? null,
  createTime,
  updateTime,
});

/** 参与行联合主键匹配 */
const matchesPartyPrimaryKey = (party: PartyRecord, primaryKey: PartyDeleteRequest) =>
  party.partyId === primaryKey.partyId && party.effectiveDate === primaryKey.effectiveDate;

/** 同时应用参与行文本条件与枚举条件 */
const matchesParty = (party: PartyRecord, conditions: PartyQueryConditions) => {
  const textFields: Array<[string | null, string | undefined]> = [
    [party.partyId, conditions.partyId],
    [party.bankBic, conditions.bankBic],
    [party.bankLei, conditions.bankLei],
    [party.chsName, conditions.chsName],
    [party.endName, conditions.endName],
    [party.directPartyId, conditions.directPartyId],
    [party.custodian, conditions.custodian],
  ];
  if (!textFields.every(([value, filter]) => matchesText(value, filter))) return false;

  const enumFields = [
    [party.bankCategory, conditions.bankCategory],
    [party.domesticFlag, conditions.domesticFlag],
    [party.partySts, conditions.partySts],
    [party.status, conditions.status],
    [party.loginSts, conditions.loginSts],
  ];
  return enumFields.every(([value, filter]) => !filter || value === filter);
};

const matchesText = (value: string | null, filter?: string) =>
  !filter || Boolean(value?.toLocaleLowerCase().includes(filter.toLocaleLowerCase()));
