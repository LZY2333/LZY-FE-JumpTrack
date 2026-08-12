import { describe, expect, it } from 'vitest';
import type { Customer, InvestmentAccount, SubActIntr } from '@/types';
import { CiesFlag, InvestType, YesNo } from '@/types/enums';
import { buildCustomerChange, getInterestCurrencies, toCustomerFormModel } from '@/pages/task-detail/customerFormUtil';

const createCustomer = (investmentAccounts: InvestmentAccount[], subActIntrs: SubActIntr[]): Customer => ({
  cusId: 'C0001',
  cusPrmAct: '622xxxxxxx1',
  ciesFlag: CiesFlag.Cies20,
  cusEnName: 'Test',
  cusCnName: '测试',
  cusBirthDate: '2000-01-01',
  govCusRef: 'GOV',
  bankCusRef: 'BANK',
  investmentAccounts,
  subActIntrs,
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
  },
  {
    investAct: 'F1',
    investType: InvestType.Funds,
  },
  {
    investAct: 'C1',
    investType: InvestType.Custody,
  },
];

const subActIntrs: SubActIntr[] = [
  { subAct: 'S1', withdrawnIntr: 100, transferIntr: 0, currency: 'HKD' },
  { subAct: 'F1', withdrawnIntr: 0, transferIntr: 30, currency: 'USD' },
  { subAct: 'C1', withdrawnIntr: 100, transferIntr: 20, currency: 'HKD' },
];

describe('task detail customer form', () => {
  it('converts Customer into account groups and currency interests', () => {
    const customer = createCustomer(accounts, subActIntrs);
    const form = toCustomerFormModel(customer);

    expect(form.securityAct).toEqual(['S1']);
    expect(form.fundAct).toEqual(['F1']);
    expect(form.custodianAct).toEqual(['C1']);
    expect(form.withdrawnIntr).toEqual({ HKD: 100, USD: 0 });
    expect(form.transferIntr).toEqual({ USD: 30, HKD: 20 });
    expect(getInterestCurrencies(form)).toEqual(['USD', 'HKD']);
  });

  it('builds a complete Customer change without mutating the original Customer', () => {
    const customer = createCustomer(accounts, subActIntrs);
    const baseline = toCustomerFormModel(customer);
    const current = {
      ...baseline,
      bankCusRef: 'BANK-NEW',
      withdrawnIntr: { ...baseline.withdrawnIntr, HKD: 120 },
    };

    const change = buildCustomerChange(customer, baseline, current);

    expect(change?.bankCusRef).toBe('BANK-NEW');
    expect(change?.cusPrmAct).toBe('622xxxxxxx1');
    expect(change?.subActIntrs?.filter((intr) => intr.currency === 'HKD')).toEqual([
      { ...subActIntrs[0], withdrawnIntr: 120 },
      { ...subActIntrs[2], withdrawnIntr: 120 },
    ]);
    expect(customer.bankCusRef).toBe('BANK');
    expect(customer.investmentAccounts).toEqual(accounts);
    expect(customer.subActIntrs).toEqual(subActIntrs);
  });

  it('treats null, undefined and empty string as the same empty value', () => {
    const customer = {
      ...createCustomer(accounts, subActIntrs),
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
    const customer = createCustomer(accounts, subActIntrs);
    const baseline = toCustomerFormModel(customer);

    expect(buildCustomerChange(customer, baseline, { ...baseline })).toBeNull();
  });
});
