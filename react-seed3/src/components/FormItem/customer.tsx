import { DatePicker, Form, Input, InputNumber, Radio } from 'antd';
import type { FormItemProps } from 'antd';
import type { Moment } from 'moment';
import moment from 'moment';
import { YesNo } from '@/types/enums';

// customer 业务字段：每个后端字段对应一个独立、通用的 Form.Item 包装组件。
// 组件只固定自己的 name / label / 录入控件 / 数据转换，其余（className、layout、
// 高亮、校验规则等）一律由调用方经 {...props} 注入，组件之间互不耦合。
// 类型统一用 antd 的 FormItemProps，可直接当作 <Form.Item> 透传任意属性。

// 日期字段共用的转换：表单存原始 YYYY-MM-DD 字符串，展示时转 Moment，选完转回字符串
const dateItemProps = {
  getValueProps: (value: string) => ({ value: value ? moment(value) : null }),
  normalize: (value: Moment | null) => (value ? value.format('YYYY-MM-DD') : ''),
};

// 账户号可能为空数组或多个号码，逐行只读展示，无值时显示 '-'
function AccountListInput({ value }: { value?: string[] }) {
  const accounts = value && value.length > 0 ? value : ['-'];
  return (
    <div className='space-y-1'>
      {accounts.map((account, index) => (
        <Input key={`${account}-${index}`} value={account} disabled />
      ))}
    </div>
  );
}

/* ---------- 客户信息（只读，值由 Form initialValues 注入） ---------- */

export function CustomerType(props: FormItemProps) {
  return (
    <Form.Item name='cusType' label='Customer Type' {...props}>
      <Input disabled />
    </Form.Item>
  );
}

export function CustomerCnName(props: FormItemProps) {
  return (
    <Form.Item name='cusCnName' label='Customer Name (CN)' {...props}>
      <Input disabled />
    </Form.Item>
  );
}

export function CustomerEnName(props: FormItemProps) {
  return (
    <Form.Item name='cusEnName' label='Customer Name (EN)' {...props}>
      <Input disabled />
    </Form.Item>
  );
}

export function DateOfBirth(props: FormItemProps) {
  return (
    <Form.Item name='cusBirthDate' label='Date of Birth' {...props}>
      <Input disabled />
    </Form.Item>
  );
}

export function CusId(props: FormItemProps) {
  return (
    <Form.Item name='cusId' label='CIF' {...props}>
      <Input disabled />
    </Form.Item>
  );
}

export function CusPrmAct(props: FormItemProps) {
  return (
    <Form.Item name='cusPrmAct' label='CIES Account' {...props}>
      <AccountListInput />
    </Form.Item>
  );
}

export function SecurityAct(props: FormItemProps) {
  return (
    <Form.Item name='securityAct' label='Securities Account' {...props}>
      <AccountListInput />
    </Form.Item>
  );
}

export function FundAct(props: FormItemProps) {
  return (
    <Form.Item name='fundAct' label='Fund Account' {...props}>
      <AccountListInput />
    </Form.Item>
  );
}

export function CustodianAct(props: FormItemProps) {
  return (
    <Form.Item name='custodianAct' label='Custodian Account' {...props}>
      <AccountListInput />
    </Form.Item>
  );
}

/* ---------- 可修改字段 ---------- */

export function BankCusRef(props: FormItemProps) {
  return (
    <Form.Item
      name='bankCusRef'
      label='Our Ref'
      rules={[{ required: true, message: 'Please enter Our Ref' }]}
      {...props}
    >
      <Input />
    </Form.Item>
  );
}

export function GovCusRef(props: FormItemProps) {
  return (
    <Form.Item
      name='govCusRef'
      label='Your Ref'
      rules={[{ required: true, message: 'Please enter Your Ref' }]}
      {...props}
    >
      <Input />
    </Form.Item>
  );
}

// AIP Date：非必填，originalCustomer 该字段非空时不可再修改，disabled 由调用方结合 originalCustomer 计算传入
export function AipDate({ disabled, ...props }: FormItemProps & { disabled?: boolean }) {
  return (
    <Form.Item name='aipDate' label='AIP Date' {...dateItemProps} {...props}>
      <DatePicker className='w-full' disabled={disabled} />
    </Form.Item>
  );
}

// AIP 到期日只读，其派生（CIES 2.0 = AIP Date + 180 天）由调用方在 onValuesChange 中处理
export function AipExpiryDate(props: FormItemProps) {
  return (
    <Form.Item name='aipExpiryDate' label='AIP Expiry Date' {...dateItemProps} {...props}>
      <DatePicker className='w-full' disabled />
    </Form.Item>
  );
}

// FA Date：非必填，originalCustomer 该字段非空时不可再修改，disabled 由调用方结合 originalCustomer 计算传入
export function FaDate({ disabled, ...props }: FormItemProps & { disabled?: boolean }) {
  return (
    <Form.Item name='faDate' label='FA Date' {...dateItemProps} {...props}>
      <DatePicker className='w-full' disabled={disabled} />
    </Form.Item>
  );
}

// 年度报告日期：originalCustomer 该字段非空时不可再修改，由调用方结合 originalCustomer 计算 disabled 传入
export function AnnualReportDate({ disabled, ...props }: FormItemProps & { disabled?: boolean }) {
  return (
    <Form.Item
      name='AnnualReportDate'
      label='Annual Report Date'
      rules={[{ required: true, message: 'Please select Annual Report Date' }]}
      {...dateItemProps}
      {...props}
    >
      <DatePicker className='w-full' disabled={disabled} />
    </Form.Item>
  );
}

export function TerminationDate(props: FormItemProps) {
  return (
    <Form.Item name='terminationDate' label='CIES Termination Date' {...dateItemProps} {...props}>
      <DatePicker className='w-full' />
    </Form.Item>
  );
}

export function Transferred3M(props: FormItemProps) {
  return (
    <Form.Item
      name='transferred3M'
      label='Transferred 3M'
      rules={[{ required: true, message: 'Please select Transferred 3M' }]}
      {...props}
    >
      <Radio.Group>
        <Radio value={YesNo.Yes}>Y</Radio>
        <Radio value={YesNo.No}>N</Radio>
      </Radio.Group>
    </Form.Item>
  );
}

/* ---------- 币种金额：name（嵌套路径）由调用方注入，组件只固定币种与控件 ---------- */

export function Hkd(props: FormItemProps) {
  return (
    <Form.Item label='HKD' {...props}>
      <InputNumber className='w-full' min={0} />
    </Form.Item>
  );
}

export function Usd(props: FormItemProps) {
  return (
    <Form.Item label='USD' {...props}>
      <InputNumber className='w-full' min={0} />
    </Form.Item>
  );
}

// 币种 → 组件 映射表：接口返回哪些币种就渲染哪些，未登记的币种忽略
export const CURRENCY_FIELDS: Record<string, (props: FormItemProps) => JSX.Element> = {
  HKD: Hkd,
  USD: Usd,
};
