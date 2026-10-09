import { DatePicker, Form, Input, Select } from 'antd';
import type { FormItemProps } from 'antd';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import { BankCategory as BankCategoryEnum, DomesticFlag as DomesticFlagEnum, YesNo } from '@/types/enums';

/** 参与行查询字段布局属性 */
type PartyFilterProps = Omit<FormItemProps, 'label' | 'name'>;

export const bankCategoryOptions = [
  { label: `${BankCategoryEnum.Direct} 直参`, value: BankCategoryEnum.Direct },
  { label: `${BankCategoryEnum.Indirect} 间参`, value: BankCategoryEnum.Indirect },
];
export const domesticFlagOptions = [
  { label: `${DomesticFlagEnum.Domestic} 境内参与者`, value: DomesticFlagEnum.Domestic },
  { label: `${DomesticFlagEnum.Overseas} 境外参与者`, value: DomesticFlagEnum.Overseas },
];
export const partyStatusOptions = [
  { label: 'Yes', value: YesNo.Yes },
  { label: 'No', value: YesNo.No },
];
const DATE_FORMAT = 'YYYY-MM-DD';

/* ==================== 查询过滤字段 ==================== */

/** CIPS 参与机构行号：PARTY_ID */
export const PartyIdFilter = (props: PartyFilterProps) => (
  <Form.Item {...props} name='partyId' label='Party ID' normalize={trimWhitespace}>
    <Input allowClear placeholder='Enter party ID' />
  </Form.Item>
);

/** 银行 BIC：BANK_BIC */
export const BankBicFilter = (props: PartyFilterProps) => (
  <Form.Item {...props} name='bankBic' label='Bank BIC' normalize={trimWhitespace}>
    <Input allowClear placeholder='Enter bank BIC' />
  </Form.Item>
);

/** 清算机构 ID：BANK_LEI */
export const BankLeiFilter = (props: PartyFilterProps) => (
  <Form.Item {...props} name='bankLei' label='Bank LEI' normalize={trimWhitespace}>
    <Input allowClear placeholder='Enter bank LEI' />
  </Form.Item>
);

/** 机构中文名称：CHS_NAME */
export const ChsNameFilter = (props: PartyFilterProps) => (
  <Form.Item {...props} name='chsName' label='Chinese Name' normalize={trimWhitespace}>
    <Input allowClear placeholder='Enter Chinese name' />
  </Form.Item>
);

/** 机构英文名称：END_NAME */
export const EndNameFilter = (props: PartyFilterProps) => (
  <Form.Item {...props} name='endName' label='English Name' normalize={trimWhitespace}>
    <Input allowClear placeholder='Enter English name' />
  </Form.Item>
);

/** 生效状态：PARTY_STS */
export const PartyStsFilter = (props: PartyFilterProps) => (
  <Form.Item {...props} name='partySts' label='Effective Status'>
    <Select className='w-full' allowClear placeholder='All' options={partyStatusOptions} />
  </Form.Item>
);

/** 参与者资格标识：BANK_CATEGORY */
export const BankCategoryFilter = (props: PartyFilterProps) => (
  <Form.Item {...props} name='bankCategory' label='Bank Category'>
    <Select className='w-full' allowClear placeholder='All' options={bankCategoryOptions} />
  </Form.Item>
);

/** 境内外标识：DOMESTICFLAG */
export const DomesticFlagFilter = (props: PartyFilterProps) => (
  <Form.Item {...props} name='domesticFlag' label='Domestic Flag'>
    <Select className='w-full' allowClear placeholder='All' options={domesticFlagOptions} />
  </Form.Item>
);

/** 所属直参行：DIRECT_PARTY_ID */
export const DirectPartyIdFilter = (props: PartyFilterProps) => (
  <Form.Item {...props} name='directPartyId' label='Direct Party ID' normalize={trimWhitespace}>
    <Input allowClear placeholder='Enter direct party ID' />
  </Form.Item>
);

/** 资金托管行：CUSTODIAN */
export const CustodianFilter = (props: PartyFilterProps) => (
  <Form.Item {...props} name='custodian' label='Custodian' normalize={trimWhitespace}>
    <Input allowClear placeholder='Enter custodian' />
  </Form.Item>
);

/* ==================== 新增修改字段 ==================== */

interface PartyIdProps {
  /** 修改时锁定参与机构行号 */
  disabled?: boolean;
}

/** CIPS 参与机构行号：PARTY_ID */
export const PartyId = ({ disabled }: PartyIdProps) => (
  <Form.Item name='partyId' label='Party ID' rules={[{ required: true, whitespace: true }]}>
    <Input disabled={disabled} />
  </Form.Item>
);

/** 银行 BIC：BANK_BIC */
export const BankBic = () => (
  <Form.Item name='bankBic' label='Bank BIC'>
    <Input />
  </Form.Item>
);

/** 清算机构 ID：BANK_LEI */
export const BankLei = () => (
  <Form.Item name='bankLei' label='Bank LEI'>
    <Input />
  </Form.Item>
);

/** 机构中文名称：CHS_NAME */
export const ChsName = () => (
  <Form.Item name='chsName' label='Chinese Name'>
    <Input />
  </Form.Item>
);

/** 机构英文名称：END_NAME */
export const EndName = () => (
  <Form.Item name='endName' label='English Name'>
    <Input />
  </Form.Item>
);

/** 生效状态：PARTY_STS */
export const PartySts = () => (
  <Form.Item name='partySts' label='Effective Status' rules={[{ required: true }]}>
    <Select className='w-full' options={partyStatusOptions} />
  </Form.Item>
);

/** 参与者资格标识：BANK_CATEGORY */
export const BankCategory = () => (
  <Form.Item name='bankCategory' label='Bank Category' rules={[{ required: true }]}>
    <Select className='w-full' options={bankCategoryOptions} />
  </Form.Item>
);

/** 境内外标识：DOMESTICFLAG */
export const DomesticFlag = () => (
  <Form.Item name='domesticFlag' label='Domestic Flag' rules={[{ required: true }]}>
    <Select className='w-full' options={domesticFlagOptions} />
  </Form.Item>
);

/** 所属直参行：DIRECT_PARTY_ID */
export const DirectPartyId = () => (
  <Form.Item name='directPartyId' label='Direct Party ID'>
    <Input />
  </Form.Item>
);

/** 资金托管行：CUSTODIAN */
export const Custodian = () => (
  <Form.Item name='custodian' label='Custodian'>
    <Input />
  </Form.Item>
);

/** 变更生效日期：EFFECTIVE_DATE */
export const EffectiveDate = () => (
  <Form.Item
    name='effectiveDate'
    label='Effective Date'
    getValueFromEvent={(date: Dayjs | null) => date?.format(DATE_FORMAT) ?? null}
    getValueProps={(value?: string | null) => ({ value: value ? dayjs(value) : null })}
  >
    <DatePicker className='w-full' format={DATE_FORMAT} />
  </Form.Item>
);

const trimWhitespace = (value?: string) => value?.trim() ?? '';
