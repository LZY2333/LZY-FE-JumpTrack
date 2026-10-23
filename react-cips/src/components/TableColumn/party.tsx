import type { TableColumnType, TableColumnsType } from 'antd';
import type { PartyRecord, PartyRelationRecord } from '@/api/party';
import {
  PartyBankCategoryEnum,
  PartyChangeTypeEnum,
  PartyBusinessStatusEnum,
  PartyDomesticFlagEnum,
  PartyLoginStatusEnum,
} from '@/types/enums';
import { renderMessageDate, renderMessageDateTime, renderMessageText } from './messageColumnUtil';

/* ==================== 参与行信息 ==================== */

/** 机构中文名称：CHS_NAME */
export const chsName: TableColumnType<PartyRecord> = {
  title: 'Chinese Name',
  dataIndex: 'chsName',
  width: 210,
  render: renderMessageText,
};

/** 机构英文名称：END_NAME */
export const endName: TableColumnType<PartyRecord> = {
  title: 'English Name',
  dataIndex: 'endName',
  width: 240,
  render: renderMessageText,
};

/** 银行 BIC：BANK_BIC */
export const bankBic: TableColumnType<PartyRecord> = {
  title: 'Bank BIC',
  dataIndex: 'bankBic',
  width: 150,
  render: renderMessageText,
};

/** 清算机构 ID：BANK_LEI */
export const bankLei: TableColumnType<PartyRecord> = {
  title: 'Bank LEI',
  dataIndex: 'bankLei',
  width: 180,
  render: renderMessageText,
};

/** 参与者资格标识：BANK_CATEGORY */
export const bankCategory: TableColumnType<PartyRecord> = {
  title: 'Bank Category',
  dataIndex: 'bankCategory',
  width: 120,
  render: (value: PartyRecord['bankCategory']) => renderPartyEnumKey(PartyBankCategoryEnum, value),
};

/** 境内外标识：DOMESTIC_FLAG */
export const domesticFlag: TableColumnType<PartyRecord> = {
  title: 'Domestic Flag',
  dataIndex: 'domesticFlag',
  width: 120,
  render: (value: PartyRecord['domesticFlag']) => renderPartyEnumKey(PartyDomesticFlagEnum, value),
};

/** 资金托管行：CUSTODIAN */
export const custodian: TableColumnType<PartyRecord> = {
  title: 'Custodian',
  dataIndex: 'custodian',
  width: 180,
  render: renderMessageText,
};

/** 变更生效日期：EFFECTIVE_DATE */
export const effectiveDate: TableColumnType<PartyRecord> = {
  title: 'Effective Date',
  dataIndex: 'effectiveDate',
  width: 150,
  render: renderMessageDate,
};

/** 办理业务状态 */
export const status: TableColumnType<PartyRecord> = {
  title: 'Status',
  dataIndex: 'status',
  width: 88,
  render: (value: PartyRecord['status']) => renderPartyEnumKey(PartyBusinessStatusEnum, value),
};

/** 登录状态 */
export const loginSts: TableColumnType<PartyRecord> = {
  title: 'Login Status',
  dataIndex: 'loginSts',
  width: 108,
  render: (value: PartyRecord['loginSts']) => renderPartyEnumKey(PartyLoginStatusEnum, value),
};

/** 记录创建时间：CREATE_TIME */
export const partyCreateTime: TableColumnType<PartyRecord> = {
  title: 'Created Time',
  dataIndex: 'createTime',
  width: 180,
  render: renderMessageDateTime,
};

/** 记录更新时间：UPDATE_TIME */
export const partyUpdateTime: TableColumnType<PartyRecord> = {
  title: 'Updated Time',
  dataIndex: 'updateTime',
  width: 180,
  render: renderMessageDateTime,
};

/** 创建人：CREATE_USER */
export const partyCreateUser: TableColumnType<PartyRecord> = {
  title: 'Created By',
  dataIndex: 'createUser',
  width: 150,
  render: renderMessageText,
};

/** 创建人部门号：CREATE_BRNO */
export const partyCreateBrno: TableColumnType<PartyRecord> = {
  title: 'Creator Department',
  dataIndex: 'createBrno',
  width: 180,
  render: renderMessageText,
};

/** 变更类型 */
export const changeType: TableColumnType<PartyRecord> = {
  title: 'Change Type',
  dataIndex: 'changeType',
  width: 112,
  render: (value: PartyRecord['changeType']) => renderPartyEnumKey(PartyChangeTypeEnum, value),
};
/** 变更期数 */
export const changeNumber: TableColumnType<PartyRecord> = {
  title: 'Change Number',
  dataIndex: 'changeNumber',
  width: 132,
  render: renderMessageText,
};

/* ==================== 直间参关系 ==================== */

/** 直间参关系字段 */
export const partyRelationColumns: TableColumnsType<PartyRelationRecord> = [
  /** 银行 BIC */
  { title: 'Bank BIC', dataIndex: 'bankBic', width: 150, render: renderMessageText },
  /** CIPS 参与机构行号 */
  { title: 'Party ID', dataIndex: 'partyId', width: 180, render: renderMessageText },
  /** 所属直参行号 */
  { title: 'Direct Party ID', dataIndex: 'directPartyId', width: 180, render: renderMessageText },
  /** 变更类型 */
  {
    title: 'Change Type',
    dataIndex: 'changeType',
    width: 112,
    render: (value: PartyRelationRecord['changeType']) =>
      renderMessageText(Object.entries(PartyChangeTypeEnum).find(([, code]) => code === value)?.[0] ?? value),
  },
  /** 变更期数 */
  { title: 'Change Number', dataIndex: 'changeNumber', width: 132, render: renderMessageText },
  /** 变更生效日期 */
  { title: 'Effective Date', dataIndex: 'effectiveDate', width: 150, render: renderMessageDate },
  /** 记录创建时间 */
  { title: 'Created Time', dataIndex: 'createTime', width: 180, render: renderMessageDateTime },
  /** 记录更新时间 */
  { title: 'Updated Time', dataIndex: 'updateTime', width: 180, render: renderMessageDateTime },
];

/* ==================== 展示辅助函数 ==================== */

/** 参与行枚举字段展示枚举 key，未知值保留原文 */
const renderPartyEnumKey = (enumValues: Record<string, string>, value: string | null | undefined) => {
  if (!value) return renderMessageText(value);

  const enumKey = Object.entries(enumValues).find(([, enumValue]) => enumValue === value)?.[0];
  return renderMessageText(enumKey ?? value);
};
