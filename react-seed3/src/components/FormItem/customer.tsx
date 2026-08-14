import { useEffect } from 'react';
import { DatePicker, Form, Input, InputNumber, Radio } from 'antd';
import type { FormItemProps } from 'antd';
import type { Moment } from 'moment';
import moment from 'moment';
import { CiesFlag as CiesFlagValue, YesNo } from '@/types/enums';

/**
 * Customer DTO 字段组件：
 * - 导出组件名是后端 lowerCamelCase 字段名的 PascalCase 形式；
 * - Form.Item name 与后端字段名完全一致；
 * - 展示标签沿用现有界面文案。
 */

type CustomerFormItemProps = Omit<FormItemProps, 'label' | 'name'>;
type CustomerDateProps = CustomerFormItemProps & { disabled?: boolean };
type PrincipleExpDateProps = CustomerFormItemProps & {
  disableAutoCalculate?: boolean;
};

const CUSTOMER_DATE_FORMAT = 'YYYY-MM-DD';

// 日期字段共用转换：DatePicker 使用 Moment，Form 内始终保存 YYYY-MM-DD 字符串。
const dateItemProps = {
  getValueProps: (value?: string) => ({
    value: value ? moment(value, CUSTOMER_DATE_FORMAT, true) : null,
  }),
  getValueFromEvent: (value: Moment | null) => (value ? value.format(CUSTOMER_DATE_FORMAT) : ''),
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
    <Form.Item {...props} name='cusId' label='Customer ID (CIF)'>
      <Input disabled />
    </Form.Item>
  );
}

export function CusPrmAct(props: CustomerFormItemProps) {
  return (
    <Form.Item {...props} name='cusPrmAct' label='CIES Account'>
      <Input disabled />
    </Form.Item>
  );
}

export function SecurityAct(props: CustomerFormItemProps) {
  return (
    <Form.Item {...props} name='securityAct' label='Securities Account'>
      <AccountListInput />
    </Form.Item>
  );
}

export function FundAct(props: CustomerFormItemProps) {
  return (
    <Form.Item {...props} name='fundAct' label='Fund Account'>
      <AccountListInput />
    </Form.Item>
  );
}

export function CustodianAct(props: CustomerFormItemProps) {
  return (
    <Form.Item {...props} name='custodianAct' label='Custodian Account'>
      <AccountListInput />
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
      <DatePicker
        className='w-full'
        format={CUSTOMER_DATE_FORMAT}
        disabled={disabled}
        disabledDate={disableFutureDate}
      />
    </Form.Item>
  );
}

// AIP Expiry Date：只读；AIP Date 可编辑时监听其变化并自动计算到期日。
export function PrincipleExpDate({ disableAutoCalculate = false, ...props }: PrincipleExpDateProps) {
  return (
    <>
      {!disableAutoCalculate && <PrincipleExpDateAutoCalculator />}
      <Form.Item {...dateItemProps} {...props} name='principleExpDate' label='AIP Expiry Date'>
        <DatePicker className='w-full' format={CUSTOMER_DATE_FORMAT} disabled />
      </Form.Item>
    </>
  );
}

function PrincipleExpDateAutoCalculator() {
  const form = Form.useFormInstance();
  const principleAppDate = Form.useWatch('principleAppDate', form) as string | undefined;
  const ciesFlag = Form.useWatch('ciesFlag', form) as CiesFlagValue | undefined;

  useEffect(() => {
    let principleExpDate = '';

    if (principleAppDate && ciesFlag === CiesFlagValue.Cies10) {
      principleExpDate = moment(principleAppDate).add(6, 'months').format(CUSTOMER_DATE_FORMAT);
    }
    if (principleAppDate && ciesFlag === CiesFlagValue.Cies20) {
      principleExpDate = moment(principleAppDate).add(180, 'days').format(CUSTOMER_DATE_FORMAT);
    }

    form.setFieldsValue({ principleExpDate });
  }, [ciesFlag, form, principleAppDate]);

  return null;
}

// FA Date：原始 formalAppDate 非空时不可修改，disabled 由调用方计算。
export function FormalAppDate({ disabled, ...props }: CustomerDateProps) {
  return (
    <Form.Item {...dateItemProps} {...props} name='formalAppDate' label='FA Date'>
      <DatePicker
        className='w-full'
        format={CUSTOMER_DATE_FORMAT}
        disabled={disabled}
        disabledDate={disableFutureDate}
      />
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
      <DatePicker className='w-full' format={CUSTOMER_DATE_FORMAT} disabled={disabled} />
    </Form.Item>
  );
}

export function TerminationDate(props: CustomerFormItemProps) {
  return (
    <Form.Item {...dateItemProps} {...props} name='terminationDate' label='CIES Termination Date'>
      <DatePicker className='w-full' format={CUSTOMER_DATE_FORMAT} />
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

export type InterestFieldName = 'withdrawnIntr' | 'transferIntr';
// 当前 DTO 保持 number；按两位小数限制到“金额 × 100”仍不超过 JS 安全整数的范围。
const MAX_SAFE_INTEREST_AMOUNT = Number.MAX_SAFE_INTEGER / 100;

interface InvestmentInterestsProps extends Omit<CustomerFormItemProps, 'children' | 'className'> {
  currencies: string[];
  getFieldClassName?: (fieldName: InterestFieldName, currency: string) => string;
}

export function InvestmentInterests({ currencies, getFieldClassName, ...props }: InvestmentInterestsProps) {
  return (
    <div className='flex flex-col gap-2 text-sm'>
      <div className='flex items-center gap-8 text-center'>
        <div className='w-12 font-medium'>Currency</div>
        <div className='flex-1 font-medium'>Withdrawable Interests</div>
        <div className='flex-1 font-medium'>Transferred Interests</div>
      </div>

      {currencies.map((currency) => (
        <div key={currency} className='flex items-center gap-8'>
          <div className='w-12 pt-1.5'>{currency}</div>

          <Form.Item
            {...props}
            name={['withdrawnIntr', currency]}
            className={`mb-0 flex-1 ${getFieldClassName?.('withdrawnIntr', currency) ?? ''}`}
            wrapperCol={{ span: 24 }}
            normalize={(value: number | null) => value ?? undefined}
          >
            <InputNumber className='w-full' min={0} max={MAX_SAFE_INTEREST_AMOUNT} precision={2} step={0.01} />
          </Form.Item>

          <Form.Item
            {...props}
            name={['transferIntr', currency]}
            className={`mb-0 flex-1 ${getFieldClassName?.('transferIntr', currency) ?? ''}`}
            wrapperCol={{ span: 24 }}
            normalize={(value: number | null) => value ?? undefined}
          >
            <InputNumber className='w-full' min={0} max={MAX_SAFE_INTEREST_AMOUNT} precision={2} step={0.01} />
          </Form.Item>
        </div>
      ))}
    </div>
  );
}
