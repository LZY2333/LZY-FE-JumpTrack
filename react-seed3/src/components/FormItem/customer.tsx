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
  getValueProps: (v: string) => ({ value: v ? moment(v) : null }),
  normalize: (v: Moment | null) => (v ? v.format('YYYY-MM-DD') : ''),
};

/* ---------- 客户信息（只读，值由 Form initialValues 注入） ---------- */

export function CustomerType(props: FormItemProps) {
  return (
    <Form.Item name='customerType' label='Customer Type' {...props}>
      <Input disabled />
    </Form.Item>
  );
}

export function CustomerName(props: FormItemProps) {
  return (
    <Form.Item name='customerName' label='Customer Name' {...props}>
      <Input disabled />
    </Form.Item>
  );
}

export function DateOfBirth(props: FormItemProps) {
  return (
    <Form.Item name='dateOfBirth' label='Date of Birth' {...props}>
      <Input disabled />
    </Form.Item>
  );
}

export function Cif(props: FormItemProps) {
  return (
    <Form.Item name='cif' label='CIF' {...props}>
      <Input disabled />
    </Form.Item>
  );
}

export function SavingsAccount(props: FormItemProps) {
  return (
    <Form.Item name='savingsAccount' label='Savings Account' {...props}>
      <Input disabled />
    </Form.Item>
  );
}

export function SecuritiesAccount(props: FormItemProps) {
  return (
    <Form.Item name='securitiesAccount' label='Securities Account' {...props}>
      <Input disabled />
    </Form.Item>
  );
}

export function FundAccount(props: FormItemProps) {
  return (
    <Form.Item name='fundAccount' label='Fund Account' {...props}>
      <Input disabled />
    </Form.Item>
  );
}

export function CustodianAccount(props: FormItemProps) {
  return (
    <Form.Item name='custodianAccount' label='Custodian Account' {...props}>
      <Input disabled />
    </Form.Item>
  );
}

/* ---------- 可修改字段 ---------- */

export function OurRef(props: FormItemProps) {
  return (
    <Form.Item name='ourRef' label='Our Ref' rules={[{ required: true, message: '请输入 Our Ref' }]} {...props}>
      <Input />
    </Form.Item>
  );
}

export function YourRef(props: FormItemProps) {
  return (
    <Form.Item name='yourRef' label='Your Ref' rules={[{ required: true, message: '请输入 Your Ref' }]} {...props}>
      <Input />
    </Form.Item>
  );
}

export function AipDate(props: FormItemProps) {
  return (
    <Form.Item name='aipDate' label='AIP Date' {...dateItemProps} {...props}>
      <DatePicker className='w-full' />
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

export function FaDate(props: FormItemProps) {
  return (
    <Form.Item name='faDate' label='FA Date' {...dateItemProps} {...props}>
      <DatePicker className='w-full' />
    </Form.Item>
  );
}

export function CiesTerminationDate(props: FormItemProps) {
  return (
    <Form.Item name='ciesTerminationDate' label='CIES Termination Date' {...dateItemProps} {...props}>
      <DatePicker className='w-full' />
    </Form.Item>
  );
}

export function Transferred3M(props: FormItemProps) {
  return (
    <Form.Item name='transferred3M' label='Transferred 3M' rules={[{ required: true, message: '请选择是否已转出 3M' }]} {...props}>
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
