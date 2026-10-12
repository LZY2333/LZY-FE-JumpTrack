import { post } from './request';
import type {
  PartyBankCategoryEnum,
  PartyBusinessStatusEnum,
  PartyDomesticFlagEnum,
  PartyLoginStatusEnum,
  YesNo,
} from '@/types/enums';

/** 参与行接口基础 URL */
export const API_BASE_PARTY = '/pssst/manager/party';

/** 查询 */
export const API_PARTY_LIST = `${API_BASE_PARTY}/list`;
export const getParties = (conditions: PartyQueryConditions) => post<PartyRecord[]>(API_PARTY_LIST, conditions);

/** 新增 修改 */
export const API_PARTY_SAVE = `${API_BASE_PARTY}/save`;
export const saveParty = (request: PartySaveRequest) => post<undefined>(API_PARTY_SAVE, request);

/** 删除 */
export const API_PARTY_DELETE = `${API_BASE_PARTY}/delete`;
export const deleteParty = (request: PartyDeleteRequest) => post<undefined>(API_PARTY_DELETE, request);

/** 新增与修改共用的参与行数据 */
export interface PartySaveRequest {
  /** CIPS 参与机构行号：PARTY_ID */
  partyId: string;
  /** 变更生效日期：EFFECTIVE_DATE */
  effectiveDate: string;
  /** 参与者资格标识：BANK_CATEGORY */
  bankCategory: PartyBankCategoryEnum;
  /** 境内外标识：DOMESTICFLAG */
  domesticFlag: PartyDomesticFlagEnum;
  /** 银行 BIC：BANK_BIC */
  bankBic?: string | null;
  /** 清算机构 ID：BANK_LEI */
  bankLei?: string | null;
  /** 机构英文名称：END_NAME */
  endName?: string | null;
  /** 机构中文名称：CHS_NAME */
  chsName?: string | null;
  /** 资金托管行：CUSTODIAN */
  custodian?: string | null;
  /** 所属直参行：DIRECT_PARTY_ID */
  directPartyId?: string | null;
  /** 生效状态：PARTY_STS */
  partySts?: YesNo | null;
  /** 办理业务状态 */
  status?: PartyBusinessStatusEnum | null;
  /** 登录状态 */
  loginSts?: PartyLoginStatusEnum | null;
}

/** 删除参与行请求 */
export interface PartyDeleteRequest {
  /** CIPS 参与机构行号：PARTY_ID */
  partyId: string;
  /** 变更生效日期：EFFECTIVE_DATE */
  effectiveDate: string;
}

/** 参与行查询条件 */
export interface PartyQueryConditions {
  /** CIPS 参与机构行号：PARTY_ID */
  partyId?: string;
  /** 银行BIC：BANK_BIC */
  bankBic?: string;
  /** 清算机构ID：BANK_LEI */
  bankLei?: string;
  /** 机构中文名：CHS_NAME */
  chsName?: string;
  /** 机构英文名：END_NAME */
  endName?: string;
  /** 资金托管行：CUSTODIAN */
  custodian?: string;
  /** 所属直参行：DIRECT_PARTY_ID */
  directPartyId?: string;
  /** 参与者资格标识：BANK_CATEGORY */
  bankCategory?: PartyBankCategoryEnum;
  /** 境内外标识：DOMESTIC_FLAG */
  domesticFlag?: PartyDomesticFlagEnum;
  /** 生效状态：PARTY_STS */
  partySts?: YesNo;
  /** 办理业务状态 */
  status?: PartyBusinessStatusEnum;
  /** 登录状态 */
  loginSts?: PartyLoginStatusEnum;
}

/** 参与行列表记录 */
export interface PartyRecord {
  /** CIPS参与机构行号：PARTY_ID */
  partyId: string;
  /** 银行BIC：BANK_BIC */
  bankBic: string | null;
  /** 清算机构ID：BANK_LEI */
  bankLei: string | null;
  /** 机构中文名称：CHS_NAME */
  chsName: string | null;
  /** 机构英文名称：END_NAME */
  endName: string | null;

  /** 资金托管行：CUSTODIAN */
  custodian: string | null;
  /** 所属直参行：DIRECT_PARTY_ID */
  directPartyId: string | null;
  /** 参与者资格标识：BANK_CATEGORY */
  bankCategory: PartyBankCategoryEnum;
  /** 境内外标识：DOMESTIC_FLAG */
  domesticFlag: PartyDomesticFlagEnum;

  /** 生效状态：PARTY_STS */
  partySts: YesNo | null;
  /** 变更生效日期：EFFECTIVE_DATE */
  effectiveDate: string;

  /** 办理业务状态 */
  status: PartyBusinessStatusEnum | null;
  /** 登录状态 */
  loginSts: PartyLoginStatusEnum | null;
  /** 记录创建时间：CREATE_TIME */
  createTime: string | null;
  /** 记录更新时间：UPDATE_TIME */
  updateTime: string | null;
}
