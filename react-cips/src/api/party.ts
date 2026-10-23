import type { Pagination } from './request';
import { post } from './request';
import type {
  PartyBankCategoryEnum,
  PartyChangeTypeEnum,
  PartyBusinessStatusEnum,
  PartyDomesticFlagEnum,
  PartyLoginStatusEnum,
} from '@/types/enums';

/** 参与行接口基础 URL */
export const API_BASE_PARTY = '/pssst/manager/party';

/* ==================== 参与行信息 ==================== */

/** 查询 */
export const API_PARTY_LIST = `${API_BASE_PARTY}/list`;
export const getParties = (params: PartyQuery) => post<PartyQueryResult>(API_PARTY_LIST, params);

/** 新增 修改 */
export const API_PARTY_SAVE = `${API_BASE_PARTY}/save`;
export const saveParty = (request: PartySaveRequest) => post<undefined>(API_PARTY_SAVE, request);

/* ==================== 直间参关系 ==================== */

/** 查询 */
export const getPartyRelations = (params: PartyRelationQuery) =>
  post<PartyRelationResult>(`${API_BASE_PARTY}/relations/list`, params);

/** 新增 修改 */
export const savePartyRelation = (params: PartyRelationSaveRequest) =>
  post<undefined>(`${API_BASE_PARTY}/relations/save`, params);

/** 新增与修改共用的参与行数据 */
export interface PartySaveRequest {
  /** 变更类型：CHANGE_TYPE */
  changeType?: PartyChangeTypeEnum;
  /** 变更期数：CHANGE_NUMBER */
  changeNumber?: string;
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
  /** 办理业务状态 */
  status: PartyBusinessStatusEnum;
  /** 登录状态 */
  loginSts: PartyLoginStatusEnum;
  /** 创建人：CREATE_USER，新增时传当前登录用户 ID */
  createUser?: string;
  /** 创建人部门号：CREATE_BRNO，新增时传当前登录用户机构 ID */
  createBrno?: string;
}

/** 参与行查询条件 */
export interface PartyQueryConditions {
  /** 变更类型：CHANGE_TYPE */
  changeType?: PartyChangeTypeEnum;
  /** 变更期数：CHANGE_NUMBER */
  changeNumber?: string;
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
  /** 参与者资格标识：BANK_CATEGORY */
  bankCategory?: PartyBankCategoryEnum;
  /** 境内外标识：DOMESTIC_FLAG */
  domesticFlag?: PartyDomesticFlagEnum;
  /** 办理业务状态 */
  status?: PartyBusinessStatusEnum;
  /** 登录状态 */
  loginSts?: PartyLoginStatusEnum;
}

/** 带分页的参与行查询请求 */
export interface PartyQuery extends PartyQueryConditions {
  /** 当前页码 */
  current: number;
  /** 每页记录数 */
  pageSize: number;
}

/** 参与行分页查询结果 */
export interface PartyQueryResult extends Pagination {
  /** 当前页参与行列表 */
  list: PartyRecord[];
}

/** 参与行列表记录 */
export interface PartyRecord {
  /** 变更类型：CHANGE_TYPE */
  changeType?: PartyChangeTypeEnum;
  /** 变更期数：CHANGE_NUMBER */
  changeNumber?: string;
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
  /** 参与者资格标识：BANK_CATEGORY */
  bankCategory: PartyBankCategoryEnum;
  /** 境内外标识：DOMESTIC_FLAG */
  domesticFlag: PartyDomesticFlagEnum;

  /** 变更生效日期：EFFECTIVE_DATE */
  effectiveDate: string;

  /** 办理业务状态 */
  status: PartyBusinessStatusEnum;
  /** 登录状态 */
  loginSts: PartyLoginStatusEnum;
  /** 记录创建时间：CREATE_TIME */
  createTime: string;
  /** 记录更新时间：UPDATE_TIME */
  updateTime: string;
  /** 创建人：CREATE_USER */
  createUser: string;
  /** 创建人部门号：CREATE_BRNO */
  createBrno: string;
}

/** 直间参关系查询条件 */
export interface PartyRelationConditions {
  /** CIPS 参与机构行号 */
  partyId?: string;
  /** 银行 BIC */
  bankBic?: string;
  /** 所属直参行号 */
  directPartyId?: string;
  /** 变更类型 */
  changeType?: PartyChangeTypeEnum;
  /** 变更期数 */
  changeNumber?: string;
}

/** 直间参关系保存请求 */
export interface PartyRelationSaveRequest {
  /** CIPS 参与机构行号 */
  partyId: string;
  /** 所属直参行号 */
  directPartyId: string;
  /** 银行 BIC */
  bankBic?: string | null;
  /** 变更类型 */
  changeType?: PartyChangeTypeEnum;
  /** 变更期数 */
  changeNumber?: string;
  /** 变更生效日期 */
  effectiveDate: string;
}

/** 直间参关系记录：PSSST_CFG_CIPS_DIRT_PRT */
export interface PartyRelationRecord extends PartyRelationSaveRequest {
  /** 记录创建时间 */
  createTime: string;
  /** 记录更新时间 */
  updateTime: string;
}

/** 直间参关系分页查询 */
export interface PartyRelationQuery extends PartyRelationConditions {
  /** 当前页码 */
  current: number;
  /** 每页条数 */
  pageSize: number;
}

/** 直间参关系分页结果 */
export interface PartyRelationResult extends Pagination {
  /** 关系记录 */
  list: PartyRelationRecord[];
}
