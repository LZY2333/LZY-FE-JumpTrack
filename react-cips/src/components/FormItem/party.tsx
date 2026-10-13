import { DatePicker, Form, Input, Select } from 'antd';
import type { FormItemProps } from 'antd';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import {
  PartyBankCategoryEnum,
  PartyBusinessStatusEnum,
  PartyDomesticFlagEnum,
  PartyLoginStatusEnum,
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

/** 参与者资格标识选项 */
export const bankCategoryOptions = Object.entries(PartyBankCategoryEnum).map(([label, value]) => ({ label, value }));
/** 境内外标识选项 */
export const domesticFlagOptions = Object.entries(PartyDomesticFlagEnum).map(([label, value]) => ({ label, value }));
/** 办理业务状态选项 */
export const statusOptions = Object.entries(PartyBusinessStatusEnum).map(([label, value]) => ({ label, value }));
/** 登录状态选项 */
export const loginStsOptions = Object.entries(PartyLoginStatusEnum).map(([label, value]) => ({ label, value }));
const DATE_FORMAT = 'YYYY-MM-DD';

/* ==================== 查询过滤字段 ==================== */

/** 银行 BIC：BANK_BIC */
export const BankBicFilter = (props: PartyFilterProps) => (
  <Form.Item {...props} name='bankBic' label='Bank BIC' normalize={trimWhitespace}>
    <Input allowClear maxLength={35} placeholder='Enter bank BIC' />
  </Form.Item>
);

/** 机构英文名称：END_NAME */
export const EndNameFilter = (props: PartyFilterProps) => (
  <Form.Item {...props} name='endName' label='English Name' normalize={trimWhitespace}>
    <Input allowClear maxLength={140} placeholder='Enter English name' />
  </Form.Item>
);

/** 参与者资格标识：BANK_CATEGORY */
export const BankCategoryFilter = (props: PartyFilterProps) => (
  <Form.Item {...props} name='bankCategory' label='Bank Category'>
    <Select className='w-40' allowClear placeholder='All' options={bankCategoryOptions} />
  </Form.Item>
);

/** 境内外标识：DOMESTICFLAG */
export const DomesticFlagFilter = (props: PartyFilterProps) => (
  <Form.Item {...props} name='domesticFlag' label='Domestic Flag'>
    <Select className='w-40' allowClear placeholder='All' options={domesticFlagOptions} />
  </Form.Item>
);

/** 办理业务状态 */
export const StatusFilter = (props: PartyFilterProps) => (
  <Form.Item {...props} name='status' label='Status'>
    <Select className='w-40' allowClear placeholder='All' options={statusOptions} />
  </Form.Item>
);

/** 登录状态 */
export const LoginStsFilter = (props: PartyFilterProps) => (
  <Form.Item {...props} name='loginSts' label='Login Status'>
    <Select className='w-40' allowClear placeholder='All' options={loginStsOptions} />
  </Form.Item>
);

/** 所属直参行：DIRECT_PARTY_ID */
export const DirectPartyIdFilter = (props: PartyFilterProps) => (
  <Form.Item {...props} name='directPartyId' label='Direct Bank BIC' normalize={trimWhitespace}>
    <Input allowClear maxLength={35} placeholder='Enter direct bank BIC' />
  </Form.Item>
);

/* ==================== 新增修改字段 ==================== */

/** CIPS 参与机构行号：PARTY_ID */
export const PartyId = ({ disabled }: PartyIdProps) => (
  <Form.Item name='partyId' label='Party ID' normalize={trimWhitespace} rules={[{ required: true, whitespace: true }]}>
    <Input disabled={disabled} maxLength={35} />
  </Form.Item>
);

/** 银行 BIC：BANK_BIC */
export const BankBic = () => (
  <Form.Item name='bankBic' label='Bank BIC' normalize={trimWhitespace}>
    <Input allowClear maxLength={35} />
  </Form.Item>
);

/** 清算机构 ID：BANK_LEI */
export const BankLei = () => (
  <Form.Item name='bankLei' label='Bank LEI' normalize={trimWhitespace}>
    <Input allowClear maxLength={35} />
  </Form.Item>
);

/** 机构中文名称：CHS_NAME */
export const ChsName = () => (
  <Form.Item name='chsName' label='Chinese Name' normalize={trimWhitespace}>
    <Input allowClear maxLength={140} />
  </Form.Item>
);

/** 机构英文名称：END_NAME */
export const EndName = () => (
  <Form.Item name='endName' label='English Name' normalize={trimWhitespace}>
    <Input allowClear maxLength={140} />
  </Form.Item>
);

/** 参与者资格标识：BANK_CATEGORY */
export const BankCategory = () => (
  <Form.Item name='bankCategory' label='Bank Category' rules={[{ required: true }]}>
    <Select className='w-40' options={bankCategoryOptions} />
  </Form.Item>
);

/** 境内外标识：DOMESTIC_FLAG */
export const DomesticFlag = () => (
  <Form.Item name='domesticFlag' label='Domestic Flag' rules={[{ required: true }]}>
    <Select className='w-40' options={domesticFlagOptions} />
  </Form.Item>
);

/** 所属直参行：DIRECT_PARTY_ID */
export const DirectPartyId = () => (
  <Form.Item name='directPartyId' label='Direct Bank BIC' normalize={trimWhitespace}>
    <Input allowClear maxLength={35} />
  </Form.Item>
);

/** 资金托管行：CUSTODIAN */
export const Custodian = () => (
  <Form.Item name='custodian' label='custodian' normalize={trimWhitespace}>
    <Input allowClear maxLength={35} />
  </Form.Item>
);

/** 变更生效日期：EFFECTIVE_DATE */
export const EffectiveDate = ({ disabled }: PartyEffectiveDateProps) => (
  <Form.Item
    name='effectiveDate'
    label='Effective Date'
    initialValue={disabled ? undefined : dayjs().format(DATE_FORMAT)}
    rules={[{ required: true }]}
    getValueFromEvent={(date: Dayjs | null) => date?.format(DATE_FORMAT) ?? null}
    getValueProps={(value?: string | null) => ({ value: value ? dayjs(value) : null })}
  >
    <DatePicker className='w-40' disabled={disabled} format={DATE_FORMAT} />
  </Form.Item>
);

/** 办理业务状态 */
export const Status = () => (
  <Form.Item name='status' label='Status' rules={[{ required: true }]}>
    <Select className='w-40' options={statusOptions} />
  </Form.Item>
);

/** 登录状态 */
export const LoginSts = () => (
  <Form.Item name='loginSts' label='Login Status' rules={[{ required: true }]}>
    <Select className='w-40' options={loginStsOptions} />
  </Form.Item>
);

const trimWhitespace = (value?: string) => value?.trim() ?? '';
