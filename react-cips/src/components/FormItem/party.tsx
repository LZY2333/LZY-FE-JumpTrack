import { DatePicker, Form, Input, Select } from 'antd';
import type { FormItemProps } from 'antd';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import {
  PartyBankCategoryEnum,
  PartyBusinessStatusEnum,
  PartyDomesticFlagEnum,
  PartyLoginStatusEnum,
  YesNo,
} from '@/types/enums';

/** 参与行查询字段布局属性 */
type PartyFilterProps = Omit<FormItemProps, 'label' | 'name'>;

/** 参与机构行号字段属性 */
interface PartyIdProps {
  /** 修改时锁定参与机构行号 */
  disabled?: boolean;
}

/** 变更生效日期字段属性 */
interface PartyEffectiveDateProps {
  /** 修改时锁定变更生效日期 */
  disabled?: boolean;
}

export const bankCategoryOptions = [
  { label: `${PartyBankCategoryEnum.Direct} 直参`, value: PartyBankCategoryEnum.Direct },
  { label: `${PartyBankCategoryEnum.Indirect} 间参`, value: PartyBankCategoryEnum.Indirect },
];
export const domesticFlagOptions = [
  { label: `${PartyDomesticFlagEnum.Domestic} 境内参与者`, value: PartyDomesticFlagEnum.Domestic },
  { label: `${PartyDomesticFlagEnum.Overseas} 境外参与者`, value: PartyDomesticFlagEnum.Overseas },
];
export const partyStatusOptions = [
  { label: 'Yes', value: YesNo.Yes },
  { label: 'No', value: YesNo.No },
];
/** 办理业务状态选项 */
export const statusOptions = [
  { label: `${PartyBusinessStatusEnum.Enabled} 正常`, value: PartyBusinessStatusEnum.Enabled },
  { label: `${PartyBusinessStatusEnum.Disabled} 暂停`, value: PartyBusinessStatusEnum.Disabled },
];
/** 登录状态选项 */
export const loginStsOptions = [
  { label: `${PartyLoginStatusEnum.LoggedIn} 登录`, value: PartyLoginStatusEnum.LoggedIn },
  { label: `${PartyLoginStatusEnum.LoggedOut} 退出`, value: PartyLoginStatusEnum.LoggedOut },
];
const DATE_FORMAT = 'YYYY-MM-DD';

/* ==================== 查询过滤字段 ==================== */

/** CIPS 参与机构行号：PARTY_ID */
export const PartyIdFilter = (props: PartyFilterProps) => (
  <Form.Item
    {...props}
    name='partyId'
    label='Party ID'
    normalize={trimWhitespace}
    getValueProps={getPartyInputValueProps}
    rules={[{ max: 35 }]}
  >
    <Input allowClear maxLength={35} placeholder='Enter party ID' />
  </Form.Item>
);

/** 银行 BIC：BANK_BIC */
export const BankBicFilter = (props: PartyFilterProps) => (
  <Form.Item
    {...props}
    name='bankBic'
    label='Bank BIC'
    normalize={trimWhitespace}
    getValueProps={getPartyInputValueProps}
    rules={[{ max: 35 }]}
  >
    <Input allowClear maxLength={35} placeholder='Enter bank BIC' />
  </Form.Item>
);

/** 清算机构 ID：BANK_LEI */
export const BankLeiFilter = (props: PartyFilterProps) => (
  <Form.Item
    {...props}
    name='bankLei'
    label='Bank LEI'
    normalize={trimWhitespace}
    getValueProps={getPartyInputValueProps}
    rules={[{ max: 35 }]}
  >
    <Input allowClear maxLength={35} placeholder='Enter bank LEI' />
  </Form.Item>
);

/** 机构中文名称：CHS_NAME */
export const ChsNameFilter = (props: PartyFilterProps) => (
  <Form.Item
    {...props}
    name='chsName'
    label='Chinese Name'
    normalize={trimWhitespace}
    getValueProps={getPartyInputValueProps}
    rules={[{ max: 140 }]}
  >
    <Input allowClear maxLength={140} placeholder='Enter Chinese name' />
  </Form.Item>
);

/** 机构英文名称：END_NAME */
export const EndNameFilter = (props: PartyFilterProps) => (
  <Form.Item
    {...props}
    name='endName'
    label='English Name'
    normalize={trimWhitespace}
    getValueProps={getPartyInputValueProps}
    rules={[{ max: 140 }]}
  >
    <Input allowClear maxLength={140} placeholder='Enter English name' />
  </Form.Item>
);

/** 生效状态：PARTY_STS */
export const PartyStsFilter = (props: PartyFilterProps) => (
  <Form.Item {...props} name='partySts' label='Effective Status' getValueProps={getPartySelectValueProps}>
    <Select className='w-40' allowClear placeholder='All' options={partyStatusOptions} />
  </Form.Item>
);

/** 参与者资格标识：BANK_CATEGORY */
export const BankCategoryFilter = (props: PartyFilterProps) => (
  <Form.Item {...props} name='bankCategory' label='Bank Category' getValueProps={getPartySelectValueProps}>
    <Select className='w-40' allowClear placeholder='All' options={bankCategoryOptions} />
  </Form.Item>
);

/** 境内外标识：DOMESTICFLAG */
export const DomesticFlagFilter = (props: PartyFilterProps) => (
  <Form.Item {...props} name='domesticFlag' label='Domestic Flag' getValueProps={getPartySelectValueProps}>
    <Select className='w-40' allowClear placeholder='All' options={domesticFlagOptions} />
  </Form.Item>
);

/** 所属直参行：DIRECT_PARTY_ID */
export const DirectPartyIdFilter = (props: PartyFilterProps) => (
  <Form.Item
    {...props}
    name='directPartyId'
    label='Direct Party ID'
    normalize={trimWhitespace}
    getValueProps={getPartyInputValueProps}
    rules={[{ max: 35 }]}
  >
    <Input allowClear maxLength={35} placeholder='Enter direct party ID' />
  </Form.Item>
);

/** 资金托管行：CUSTODIAN */
export const CustodianFilter = (props: PartyFilterProps) => (
  <Form.Item
    {...props}
    name='custodian'
    label='Custodian'
    normalize={trimWhitespace}
    getValueProps={getPartyInputValueProps}
    rules={[{ max: 35 }]}
  >
    <Input allowClear maxLength={35} placeholder='Enter custodian' />
  </Form.Item>
);

/** 办理业务状态 */
export const StatusFilter = (props: PartyFilterProps) => (
  <Form.Item {...props} name='status' label='Business Status' getValueProps={getPartySelectValueProps}>
    <Select className='w-40' allowClear placeholder='All' options={statusOptions} />
  </Form.Item>
);

/** 登录状态 */
export const LoginStsFilter = (props: PartyFilterProps) => (
  <Form.Item {...props} name='loginSts' label='Login Status' getValueProps={getPartySelectValueProps}>
    <Select className='w-40' allowClear placeholder='All' options={loginStsOptions} />
  </Form.Item>
);

/* ==================== 新增修改字段 ==================== */

/** CIPS 参与机构行号：PARTY_ID */
export const PartyId = ({ disabled }: PartyIdProps) => (
  <Form.Item
    name='partyId'
    label='Party ID'
    normalize={trimWhitespace}
    getValueProps={getPartyInputValueProps}
    rules={[{ required: true, whitespace: true }, { max: 35 }]}
  >
    <Input disabled={disabled} maxLength={35} />
  </Form.Item>
);

/** 银行 BIC：BANK_BIC */
export const BankBic = () => (
  <Form.Item
    name='bankBic'
    label='Bank BIC'
    normalize={trimWhitespace}
    getValueProps={getPartyInputValueProps}
    rules={[{ max: 35 }]}
  >
    <Input allowClear maxLength={35} />
  </Form.Item>
);

/** 清算机构 ID：BANK_LEI */
export const BankLei = () => (
  <Form.Item
    name='bankLei'
    label='Bank LEI'
    normalize={trimWhitespace}
    getValueProps={getPartyInputValueProps}
    rules={[{ max: 35 }]}
  >
    <Input allowClear maxLength={35} />
  </Form.Item>
);

/** 机构中文名称：CHS_NAME */
export const ChsName = () => (
  <Form.Item
    name='chsName'
    label='Chinese Name'
    normalize={trimWhitespace}
    getValueProps={getPartyInputValueProps}
    rules={[{ max: 140 }]}
  >
    <Input allowClear maxLength={140} />
  </Form.Item>
);

/** 机构英文名称：END_NAME */
export const EndName = () => (
  <Form.Item
    name='endName'
    label='English Name'
    normalize={trimWhitespace}
    getValueProps={getPartyInputValueProps}
    rules={[{ max: 140 }]}
  >
    <Input allowClear maxLength={140} />
  </Form.Item>
);

/** 生效状态：PARTY_STS */
export const PartySts = () => (
  <Form.Item name='partySts' label='Effective Status' getValueProps={getPartySelectValueProps} rules={[{ len: 1 }]}>
    <Select className='w-40' allowClear options={partyStatusOptions} />
  </Form.Item>
);

/** 参与者资格标识：BANK_CATEGORY */
export const BankCategory = () => (
  <Form.Item
    name='bankCategory'
    label='Bank Category'
    getValueProps={getPartySelectValueProps}
    rules={[{ required: true }, { len: 4 }]}
  >
    <Select className='w-40' options={bankCategoryOptions} />
  </Form.Item>
);

/** 境内外标识：DOMESTICFLAG */
export const DomesticFlag = () => (
  <Form.Item
    name='domesticFlag'
    label='Domestic Flag'
    getValueProps={getPartySelectValueProps}
    rules={[{ required: true }, { len: 4 }]}
  >
    <Select className='w-40' options={domesticFlagOptions} />
  </Form.Item>
);

/** 所属直参行：DIRECT_PARTY_ID */
export const DirectPartyId = () => (
  <Form.Item
    name='directPartyId'
    label='Direct Party ID'
    normalize={trimWhitespace}
    getValueProps={getPartyInputValueProps}
    rules={[{ max: 35 }]}
  >
    <Input allowClear maxLength={35} />
  </Form.Item>
);

/** 资金托管行：CUSTODIAN */
export const Custodian = () => (
  <Form.Item
    name='custodian'
    label='Custodian'
    normalize={trimWhitespace}
    getValueProps={getPartyInputValueProps}
    rules={[{ max: 35 }]}
  >
    <Input allowClear maxLength={35} />
  </Form.Item>
);

/** 变更生效日期：EFFECTIVE_DATE */
export const EffectiveDate = ({ disabled }: PartyEffectiveDateProps) => (
  <Form.Item
    name='effectiveDate'
    label='Effective Date'
    rules={[{ required: true }]}
    getValueFromEvent={(date: Dayjs | null) => date?.format(DATE_FORMAT) ?? null}
    getValueProps={(value?: string | null) => ({ value: value ? dayjs(value) : null })}
  >
    <DatePicker className='w-40' disabled={disabled} format={DATE_FORMAT} />
  </Form.Item>
);

/** 办理业务状态 */
export const Status = () => (
  <Form.Item name='status' label='Business Status' getValueProps={getPartySelectValueProps} rules={[{ len: 4 }]}>
    <Select className='w-40' allowClear options={statusOptions} />
  </Form.Item>
);

/** 登录状态 */
export const LoginSts = () => (
  <Form.Item name='loginSts' label='Login Status' getValueProps={getPartySelectValueProps} rules={[{ len: 4 }]}>
    <Select className='w-40' allowClear options={loginStsOptions} />
  </Form.Item>
);

const trimWhitespace = (value?: string) => value?.trim() ?? '';

/** 参与行文本控件空值兜底 */
const getPartyInputValueProps = (value?: string | null) => ({ value: value ?? '' });

/** 参与行枚举控件空值兜底 */
const getPartySelectValueProps = <Value,>(value?: Value | null) => ({ value: value ?? undefined });
