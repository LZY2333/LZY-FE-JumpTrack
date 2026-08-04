import { DatePicker, Form, Input, InputNumber, Radio } from 'antd';
import type { FormItemProps } from 'antd';
import type { Moment } from 'moment';
import moment from 'moment';
import type { InvestmentAccount } from '@/types';
import { InvestType, YesNo } from '@/types/enums';

/**
 * Customer DTO 字段组件：
 * - 导出组件名是后端 lowerCamelCase 字段名的 PascalCase 形式；
 * - Form.Item name 与后端字段名完全一致；
 * - 展示标签沿用现有界面文案。
 */

type CustomerFormItemProps = Omit<FormItemProps, 'label' | 'name'>;
type CustomerDateProps = CustomerFormItemProps & { disabled?: boolean };

// 日期字段共用转换：表单保存 YYYY-MM-DD 字符串，DatePicker 使用 Moment。
const dateItemProps = {
  getValueProps: (value: string) => ({ value: value ? moment(value) : null }),
  normalize: (value: Moment | null) => (value ? value.format('YYYY-MM-DD') : ''),
};

const removeChineseCharacters = (value: string) => value.replace(/[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]/g, '');
const disableFutureDate = (current: Moment) => current.isAfter(moment(), 'day');

// 账户号可能为空数组或包含多个号码；逐行只读展示，无值时显示“-”。
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

export function CiesFlag(props: CustomerFormItemProps) {
  return (
    <Form.Item {...props} name='ciesFlag' label='Customer Type'>
      <Input disabled />
    </Form.Item>
  );
}

export function CusCnName(props: CustomerFormItemProps) {
  return (
    <Form.Item {...props} name='cusCnName' label='Customer Name (CN)'>
      <Input disabled />
    </Form.Item>
  );
}

export function CusEnName(props: CustomerFormItemProps) {
  return (
    <Form.Item {...props} name='cusEnName' label='Customer Name (EN)'>
      <Input disabled />
    </Form.Item>
  );
}

export function CusBirthDate(props: CustomerFormItemProps) {
  return (
    <Form.Item {...props} name='cusBirthDate' label='Date of Birth'>
      <Input disabled />
    </Form.Item>
  );
}

export function CusId(props: CustomerFormItemProps) {
  return (
    <Form.Item {...props} name='cusId' label='CIF'>
      <Input disabled />
    </Form.Item>
  );
}

export function CusPrmAct(props: CustomerFormItemProps) {
  return (
    <Form.Item {...props} name='cusPrmAct' label='CIES Account'>
      <AccountListInput />
    </Form.Item>
  );
}

type InvestmentAccountsProps = Omit<CustomerFormItemProps, 'children'>;

interface InvestmentAccountGroupsProps {
  value?: InvestmentAccount[];
  formItemProps: InvestmentAccountsProps;
}

interface InvestmentAccountDisplayGroups {
  securityAct: string[];
  fundAct: string[];
  custodianAct: string[];
}

/**
 * investmentAccounts 只在 FormItem 展示层按 investType 分为三组。
 * securityAct / fundAct / custodianAct 是局部展示变量，不进入 DTO 或 Form 字段。
 */
function InvestmentAccountGroups({ value, formItemProps }: InvestmentAccountGroupsProps) {
  const { securityAct, fundAct, custodianAct } = (value ?? []).reduce<InvestmentAccountDisplayGroups>(
    (groups, account) => {
      if (account.investType === InvestType.Securities) groups.securityAct.push(account.investAct);
      if (account.investType === InvestType.Funds) groups.fundAct.push(account.investAct);
      if (account.investType === InvestType.Custody) groups.custodianAct.push(account.investAct);
      return groups;
    },
    { securityAct: [], fundAct: [], custodianAct: [] },
  );

  return (
    <>
      <Form.Item {...formItemProps} label='Securities Account'>
        <AccountListInput value={securityAct} />
      </Form.Item>
      <Form.Item {...formItemProps} label='Fund Account'>
        <AccountListInput value={fundAct} />
      </Form.Item>
      <Form.Item {...formItemProps} label='Custodian Account'>
        <AccountListInput value={custodianAct} />
      </Form.Item>
    </>
  );
}

export function InvestmentAccounts(props: InvestmentAccountsProps) {
  return (
    <Form.Item name='investmentAccounts' noStyle>
      <InvestmentAccountGroups formItemProps={props} />
    </Form.Item>
  );
}

/* ---------- 可修改字段 ---------- */

export function BankCusRef(props: CustomerFormItemProps) {
  return (
    <Form.Item
      {...props}
      name='bankCusRef'
      label='Our Ref'
      rules={[{ required: true, message: 'Please enter Our Ref' }]}
      normalize={removeChineseCharacters}
    >
      <Input maxLength={30} showCount />
    </Form.Item>
  );
}

export function GovCusRef(props: CustomerFormItemProps) {
  return (
    <Form.Item
      {...props}
      name='govCusRef'
      label='Your Ref'
      rules={[{ required: true, message: 'Please enter Your Ref' }]}
      normalize={removeChineseCharacters}
    >
      <Input maxLength={30} showCount />
    </Form.Item>
  );
}

// AIP Date：原始 principleAppDate 非空时不可修改，disabled 由调用方计算。
export function PrincipleAppDate({ disabled, ...props }: CustomerDateProps) {
  return (
    <Form.Item {...dateItemProps} {...props} name='principleAppDate' label='AIP Date'>
      <DatePicker className='w-full' disabled={disabled} disabledDate={disableFutureDate} />
    </Form.Item>
  );
}

// AIP Expiry Date：只读；派生规则由 TaskForm 的 onValuesChange 处理。
export function PrincipleExpDate(props: CustomerFormItemProps) {
  return (
    <Form.Item {...dateItemProps} {...props} name='principleExpDate' label='AIP Expiry Date'>
      <DatePicker className='w-full' disabled />
    </Form.Item>
  );
}

// FA Date：原始 formalAppDate 非空时不可修改，disabled 由调用方计算。
export function FormalAppDate({ disabled, ...props }: CustomerDateProps) {
  return (
    <Form.Item {...dateItemProps} {...props} name='formalAppDate' label='FA Date'>
      <DatePicker className='w-full' disabled={disabled} disabledDate={disableFutureDate} />
    </Form.Item>
  );
}

// Annual Report Date：原始 annualReportDate 非空时不可修改，disabled 由调用方计算。
export function AnnualReportDate({ disabled, ...props }: CustomerDateProps) {
  return (
    <Form.Item
      {...dateItemProps}
      {...props}
      name='annualReportDate'
      label='Annual Report Date'
      rules={[{ required: true, message: 'Please select Annual Report Date' }]}
    >
      <DatePicker className='w-full' disabled={disabled} />
    </Form.Item>
  );
}

export function TerminationDate(props: CustomerFormItemProps) {
  return (
    <Form.Item {...dateItemProps} {...props} name='terminationDate' label='CIES Termination Date'>
      <DatePicker className='w-full' />
    </Form.Item>
  );
}

export function CapitalInvestFlag(props: CustomerFormItemProps) {
  return (
    <Form.Item
      {...props}
      name='capitalInvestFlag'
      label='Transferred 3M'
      rules={[{ required: true, message: 'Please select Transferred 3M' }]}
    >
      <Radio.Group>
        <Radio value={YesNo.Yes}>Y</Radio>
        <Radio value={YesNo.No}>N</Radio>
      </Radio.Group>
    </Form.Item>
  );
}

/* ---------- 按币种动态渲染的利息字段 ---------- */

type InterestFieldName = 'withdrawnIntr' | 'transferIntr';
// 当前 DTO 保持 number；按两位小数限制到“金额 × 100”仍不超过 JS 安全整数的范围。
const MAX_SAFE_INTEREST_AMOUNT = Number.MAX_SAFE_INTEGER / 100;

interface InterestFieldsProps extends Omit<CustomerFormItemProps, 'children' | 'className'> {
  currencies: string[];
  getFieldClassName?: (currency: string) => string;
}

interface InterestFieldsInternalProps extends InterestFieldsProps {
  fieldName: InterestFieldName;
  title: string;
}

function InterestFields({ fieldName, title, currencies, getFieldClassName, ...props }: InterestFieldsInternalProps) {
  return (
    <div className='space-y-3'>
      <div className='text-sm font-medium'>{title}</div>
      {currencies.map((currency) => (
        <Form.Item
          {...props}
          key={currency}
          name={[fieldName, currency]}
          label={currency}
          className={getFieldClassName?.(currency)}
          normalize={(value: number | null) => value ?? 0}
        >
          <InputNumber className='w-full' min={0} max={MAX_SAFE_INTEREST_AMOUNT} precision={2} step={0.01} />
        </Form.Item>
      ))}
    </div>
  );
}

export function WithdrawnIntr(props: InterestFieldsProps) {
  return <InterestFields {...props} fieldName='withdrawnIntr' title='Withdrawable Interests' />;
}

export function TransferIntr(props: InterestFieldsProps) {
  return <InterestFields {...props} fieldName='transferIntr' title='Transferred Interests' />;
}
