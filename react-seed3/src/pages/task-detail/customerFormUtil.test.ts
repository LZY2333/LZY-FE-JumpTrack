import { describe, expect, it } from 'vitest';
import type { Customer, InvestmentAccount } from '@/types';
import { CiesFlag, InvestType, YesNo } from '@/types/enums';
import { buildCustomerChange, getInterestCurrencies, toCustomerFormModel } from '@/pages/task-detail/customerFormUtil';

const createCustomer = (investmentAccounts: InvestmentAccount[]): Customer => ({
  cusId: 'C0001',
  cusPrmAct: [],
  ciesFlag: CiesFlag.Cies20,
  cusEnName: 'Test',
  cusCnName: '测试',
  cusBirthDate: '2000-01-01',
  govCusRef: 'GOV',
  bankCusRef: 'BANK',
  investmentAccounts,
  principleAppDate: '',
  principleExpDate: '',
  formalAppDate: '',
  annualReportDate: '2026-01-01',
  terminationDate: '',
  capitalInvestFlag: YesNo.No,
});

const accounts: InvestmentAccount[] = [
  {
    investAct: 'S1',
    investType: InvestType.Securities,
    withdrawnIntr: 100,
    TransferIntr: undefined as unknown as number,
    currency: 'HKD',
  },
  {
    investAct: 'F1',
    investType: InvestType.Funds,
    withdrawnIntr: undefined as unknown as number,
    TransferIntr: 30,
    currency: 'USD',
  },
  {
    investAct: 'C1',
    investType: InvestType.Custody,
    withdrawnIntr: 100,
    TransferIntr: 20,
    currency: 'HKD',
  },
];

describe('task detail customer form', () => {
  it('converts Customer into account groups and currency interests', () => {
    const customer = createCustomer(accounts);
    const form = toCustomerFormModel(customer);

    expect(form.securityAct).toEqual(['S1']);
    expect(form.fundAct).toEqual(['F1']);
    expect(form.custodianAct).toEqual(['C1']);
    expect(form.withdrawnIntr).toEqual({ HKD: 100 });
    expect(form.transferIntr).toEqual({ USD: 30, HKD: 20 });
    expect(getInterestCurrencies(form)).toEqual(['HKD', 'USD']);
  });

  it('builds a complete Customer change without mutating the original Customer', () => {
    const customer = createCustomer(accounts);
    const baseline = toCustomerFormModel(customer);
    const current = {
      ...baseline,
      bankCusRef: 'BANK-NEW',
      withdrawnIntr: { ...baseline.withdrawnIntr, HKD: 120 },
    };

    const change = buildCustomerChange(customer, baseline, current);

    expect(change?.bankCusRef).toBe('BANK-NEW');
    expect(change?.investmentAccounts?.filter((account) => account.currency === 'HKD')).toEqual([
      { ...accounts[0], withdrawnIntr: 120 },
      { ...accounts[2], withdrawnIntr: 120 },
    ]);
    expect(customer.bankCusRef).toBe('BANK');
    expect(customer.investmentAccounts).toEqual(accounts);
  });

  it('treats null, undefined and empty string as the same empty value', () => {
    const customer = {
      ...createCustomer(accounts),
      terminationDate: null,
    } as unknown as Customer;
    const baseline = toCustomerFormModel(customer);
    const current = {
      ...baseline,
      terminationDate: undefined as unknown as string,
    };

    expect(baseline.terminationDate).toBeNull();
    expect(buildCustomerChange(customer, baseline, current)).toBeNull();
  });

  it('returns null when the validated form has no semantic change', () => {
    const customer = createCustomer(accounts);
    const baseline = toCustomerFormModel(customer);

    expect(buildCustomerChange(customer, baseline, { ...baseline })).toBeNull();
  });
});
