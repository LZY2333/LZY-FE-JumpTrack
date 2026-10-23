import { DatePicker, Form, Input, Select } from 'antd';
import type { FormItemProps } from 'antd';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import { getSelectValueProps } from '@/utils';
import {
  PartyBankCategoryEnum,
  PartyChangeTypeEnum,
  PartyBusinessStatusEnum,
  PartyDomesticFlagEnum,
  PartyLoginStatusEnum,
} from '@/types/enums';

/** 参与行查询字段布局属性 */
type PartyFilterProps = Omit<FormItemProps, 'label' | 'name'>;

/** 变更类型字段属性 */
type PartyChangeTypeProps = PartyFilterProps & {
  /** 是否作为查询字段 */
  filter?: boolean;
};

/** 变更生效日期字段属性 */
interface PartyEffectiveDateProps {
  /** 修改时锁定变更生效日期 */
  disabled?: boolean;
}

/** 所属直参行号字段属性 */
interface PartyRelationDirectPartyIdProps {
  /** 是否作为查询字段 */
  filter?: boolean;
  /** 修改时锁定联合主键 */
  disabled?: boolean;
}

/** 关系参与机构行号字段属性 */
interface PartyRelationPartyIdProps {
  /** 是否作为查询字段 */
  filter?: boolean;
  /** 修改时锁定联合主键 */
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
/** 变更类型选项 */
const changeTypeOptions = Object.entries(PartyChangeTypeEnum).map(([label, value]) => ({ label, value }));
const DATE_FORMAT = 'YYYY-MM-DD';

/* ==================== 参与行信息：查询过滤字段 ==================== */

/** 银行 BIC：BANK_BIC */
export const BankBicFilter = (props: PartyFilterProps) => (
  <Form.Item {...props} name='bankBic' label='Bank BIC'>
    <Input allowClear maxLength={35} placeholder='Enter bank BIC' />
  </Form.Item>
);

/** 机构英文名称：END_NAME */
export const EndNameFilter = (props: PartyFilterProps) => (
  <Form.Item {...props} name='endName' label='English Name'>
    <Input allowClear maxLength={140} placeholder='Enter English name' />
  </Form.Item>
);

/** 参与者资格标识：BANK_CATEGORY */
export const BankCategoryFilter = (props: PartyFilterProps) => (
  <Form.Item {...props} name='bankCategory' label='Bank Category' getValueProps={getSelectValueProps}>
    <Select className='w-40' allowClear placeholder='All' options={bankCategoryOptions} />
  </Form.Item>
);

/** 境内外标识：DOMESTIC_FLAG */
export const DomesticFlagFilter = (props: PartyFilterProps) => (
  <Form.Item {...props} name='domesticFlag' label='Domestic Flag' getValueProps={getSelectValueProps}>
    <Select className='w-40' allowClear placeholder='All' options={domesticFlagOptions} />
  </Form.Item>
);

/** 办理业务状态 */
export const StatusFilter = (props: PartyFilterProps) => (
  <Form.Item {...props} name='status' label='Status' getValueProps={getSelectValueProps}>
    <Select className='w-40' allowClear placeholder='All' options={statusOptions} />
  </Form.Item>
);

/** 登录状态 */
export const LoginStsFilter = (props: PartyFilterProps) => (
  <Form.Item {...props} name='loginSts' label='Login Status' getValueProps={getSelectValueProps}>
    <Select className='w-40' allowClear placeholder='All' options={loginStsOptions} />
  </Form.Item>
);

/* ==================== 参与行信息：新增修改字段 ==================== */

/** 银行 BIC：BANK_BIC */
export const BankBic = () => (
  <Form.Item name='bankBic' label='Bank BIC'>
    <Input allowClear maxLength={35} placeholder='Enter bank BIC' />
  </Form.Item>
);

/** 清算机构 ID：BANK_LEI */
export const BankLei = () => (
  <Form.Item name='bankLei' label='Bank LEI'>
    <Input allowClear maxLength={35} placeholder='Enter bank LEI' />
  </Form.Item>
);

/** 机构中文名称：CHS_NAME */
export const ChsName = () => (
  <Form.Item name='chsName' label='Chinese Name'>
    <Input allowClear maxLength={140} placeholder='Enter Chinese name' />
  </Form.Item>
);

/** 机构英文名称：END_NAME */
export const EndName = () => (
  <Form.Item name='endName' label='English Name'>
    <Input allowClear maxLength={140} placeholder='Enter English name' />
  </Form.Item>
);

/** 参与者资格标识：BANK_CATEGORY */
export const BankCategory = () => (
  <Form.Item name='bankCategory' label='Bank Category' getValueProps={getSelectValueProps} rules={[{ required: true }]}>
    <Select className='w-40' placeholder='Select bank category' options={bankCategoryOptions} />
  </Form.Item>
);

/** 境内外标识：DOMESTIC_FLAG */
export const DomesticFlag = () => (
  <Form.Item name='domesticFlag' label='Domestic Flag' getValueProps={getSelectValueProps} rules={[{ required: true }]}>
    <Select className='w-40' placeholder='Select domestic flag' options={domesticFlagOptions} />
  </Form.Item>
);

/** 资金托管行：CUSTODIAN */
export const Custodian = () => (
  <Form.Item name='custodian' label='Custodian'>
    <Input allowClear maxLength={35} placeholder='Enter custodian' />
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
    <DatePicker className='w-40' disabled={disabled} format={DATE_FORMAT} placeholder='Select effective date' />
  </Form.Item>
);

/** 办理业务状态 */
export const Status = () => (
  <Form.Item name='status' label='Status' getValueProps={getSelectValueProps} rules={[{ required: true }]}>
    <Select className='w-40' placeholder='Select status' options={statusOptions} />
  </Form.Item>
);

/** 登录状态 */
export const LoginSts = () => (
  <Form.Item name='loginSts' label='Login Status' getValueProps={getSelectValueProps} rules={[{ required: true }]}>
    <Select className='w-40' placeholder='Select login status' options={loginStsOptions} />
  </Form.Item>
);

/* ==================== 共用变更字段 ==================== */

/** 变更类型 */
export const ChangeType = ({ filter, ...props }: PartyChangeTypeProps) => (
  <Form.Item {...props} name='changeType' label='Change Type' getValueProps={getSelectValueProps}>
    <Select
      className='w-40'
      allowClear
      placeholder={filter ? 'All' : 'Select change type'}
      options={changeTypeOptions}
    />
  </Form.Item>
);

/** 变更期数 */
export const ChangeNumber = (props: PartyFilterProps) => (
  <Form.Item
    {...props}
    name='changeNumber'
    label='Change Number'
    getValueProps={(value) => ({ value: value ?? '' })}
    rules={[{ pattern: /^[1-9]\d{0,9}$/, message: 'Enter a positive integer (up to 10 digits)' }]}
  >
    <Input allowClear maxLength={10} placeholder='Enter change number' />
  </Form.Item>
);

/* ==================== 直间参关系 ==================== */

/** 所属直参行号 */
export const RelationDirectPartyId = ({ filter, disabled }: PartyRelationDirectPartyIdProps) => (
  <Form.Item
    name='directPartyId'
    label='Direct Party ID'
    normalize={(value: string) => value.trim()}
    getValueProps={(value) => ({ value: value ?? '' })}
    rules={filter ? [] : [{ required: true, whitespace: true }]}
  >
    <Input allowClear disabled={disabled} maxLength={35} placeholder='Enter direct party ID' />
  </Form.Item>
);

/** CIPS 参与机构行号 */
export const PartyId = ({ filter, disabled }: PartyRelationPartyIdProps) => (
  <Form.Item
    name='partyId'
    label='Party ID'
    normalize={(value: string) => value.trim()}
    getValueProps={(value) => ({ value: value ?? '' })}
    rules={filter ? [] : [{ required: true, whitespace: true }]}
  >
    <Input allowClear={filter} disabled={disabled} maxLength={35} placeholder='Enter party ID' />
  </Form.Item>
);
