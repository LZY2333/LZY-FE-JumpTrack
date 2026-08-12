import type { Customer } from '@/types';
import { InvestType } from '@/types/enums';

export type InterestAmountsByCurrency = Record<string, number | undefined>;

/** 详情页表单模型，不暴露后端 investmentAccounts 的行结构。 */
export type CustomerFormModel = Omit<Customer, 'investmentAccounts' | 'subActIntrs'> & {
  securityAct: string[];
  fundAct: string[];
  custodianAct: string[];
  withdrawnIntr: InterestAmountsByCurrency;
  transferIntr: InterestAmountsByCurrency;
};

type MutableCustomerField =
  | 'bankCusRef'
  | 'govCusRef'
  | 'principleAppDate'
  | 'principleExpDate'
  | 'formalAppDate'
  | 'annualReportDate'
  | 'terminationDate'
  | 'capitalInvestFlag';

const MUTABLE_CUSTOMER_FIELDS: MutableCustomerField[] = [
  'bankCusRef',
  'govCusRef',
  'principleAppDate',
  'principleExpDate',
  'formalAppDate',
  'annualReportDate',
  'terminationDate',
  'capitalInvestFlag',
];

/** converterA：后端 Customer 转为详情页统一表单模型。 */
export const toCustomerFormModel = (customer: Customer): CustomerFormModel => {
  const { investmentAccounts, subActIntrs, ...customerFields } = customer;
  const securityAct: string[] = [];
  const fundAct: string[] = [];
  const custodianAct: string[] = [];
  const withdrawnIntr: InterestAmountsByCurrency = {};
  const transferIntr: InterestAmountsByCurrency = {};

  investmentAccounts?.forEach((account) => {
    if (account.investType === InvestType.Securities) addUniqueAccount(securityAct, account.investAct);
    if (account.investType === InvestType.Funds) addUniqueAccount(fundAct, account.investAct);
    if (account.investType === InvestType.Custody) addUniqueAccount(custodianAct, account.investAct);
  });
  subActIntrs?.forEach((intr) => {
    assignAmount(withdrawnIntr, intr.currency, intr.withdrawnIntr);
    assignAmount(transferIntr, intr.currency, intr.transferIntr);
  });

  return {
    ...customerFields,
    securityAct,
    fundAct,
    custodianAct,
    withdrawnIntr,
    transferIntr,
  };
};

/**
 * 以原始 Customer 为模板，将表单中确实发生的业务变化写回后端结构；无变化时返回 null。
 */
export const buildCustomerChange = (
  customer: Customer,
  customerForm: CustomerFormModel,
  customerFormNew: CustomerFormModel,
): Customer | null => {
  const customerChange = cloneCustomer(customer);
  let changed = false;

  const applyScalarChange = <K extends MutableCustomerField>(field: K): void => {
    if (isSemanticallyEqual(customerForm[field], customerFormNew[field])) return;
    customerChange[field] = customerFormNew[field];
    changed = true;
  };

  MUTABLE_CUSTOMER_FIELDS.forEach(applyScalarChange);

  const applyInterestChanges = (
    formField: 'withdrawnIntr' | 'transferIntr',
    dtoField: 'withdrawnIntr' | 'transferIntr',
  ): void => {
    getInterestCurrencies(customerForm, customerFormNew).forEach((currency) => {
      const baselineAmount = customerForm[formField][currency];
      const currentAmount = customerFormNew[formField][currency];
      if (isSemanticallyEqual(baselineAmount, currentAmount)) return;

      customerChange.subActIntrs?.forEach((intr) => {
        if (intr.currency !== currency) return;
        intr[dtoField] = currentAmount ?? 0;
        changed = true;
      });
    });
  };

  applyInterestChanges('withdrawnIntr', 'withdrawnIntr');
  applyInterestChanges('transferIntr', 'transferIntr');

  return changed ? customerChange : null;
};

export const getInterestCurrencies = (...forms: CustomerFormModel[]): string[] =>
  Array.from(
    new Set(
      forms.flatMap((form) => [...Object.keys(form.withdrawnIntr ?? {}), ...Object.keys(form.transferIntr ?? {})]),
    ),
  ).sort((a, b) => {
    const currencyOrder = ['USD', 'HKD', 'CNY', 'EUR', 'GBP', 'JPY'];
    const indexA = currencyOrder.indexOf(a);
    const indexB = currencyOrder.indexOf(b);

    return (indexA === -1 ? Infinity : indexA) - (indexB === -1 ? Infinity : indexB);
  });

/** null、undefined、空字符串仅在两侧都为空时视为相同。 */
export const isSemanticallyEqual = (left: unknown, right: unknown): boolean => {
  if (isEmpty(left) && isEmpty(right)) return true;
  if (Object.is(left, right)) return true;
  if (!isObject(left) || !isObject(right)) return false;

  const leftKeys = Object.keys(left).filter((key) => left[key] !== undefined);
  const rightKeys = Object.keys(right).filter((key) => right[key] !== undefined);
  if (leftKeys.length !== rightKeys.length) return false;

  return leftKeys.every(
    (key) => Object.prototype.hasOwnProperty.call(right, key) && isSemanticallyEqual(left[key], right[key]),
  );
};

const addUniqueAccount = (accounts: string[], investAct: unknown): void => {
  if (investAct && !accounts.includes(`${investAct}`)) {
    accounts.push(`${investAct}`);
  }
};

const assignAmount = (amounts: InterestAmountsByCurrency, currency: unknown, amount: unknown): void => {
  // 同一币种可能随多个账号重复返回；币种级金额保留首个有效值。
  if (currency && !amounts[`${currency}`]) {
    amounts[`${currency}`] = Number(amount);
  }
};

const cloneCustomer = (customer: Customer): Customer => ({
  ...customer,
  investmentAccounts: customer.investmentAccounts?.map((account) => ({ ...account })),
  subActIntrs: customer.subActIntrs?.map((intr) => ({ ...intr })),
});

const isEmpty = (value: unknown): boolean => value === '' || value === null || value === undefined;

const isObject = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;
