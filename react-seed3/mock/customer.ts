import type { Customer } from '@/types';
import { CiesFlag, InvestType, ResCode, YesNo } from '@/types/enums';

const mockCustomerWithDates: Customer = {
  cusId: 'C0001',
  cusPrmAct: '622xxxxxxx1',
  ciesFlag: CiesFlag.Cies20,
  cusEnName: 'Chen Wen',
  cusCnName: '陈文',
  cusBirthDate: '2000-12-01',
  govCusRef: 'AA-100001-24',
  bankCusRef: 'CIES2.0:NCIES001',
  investmentAccounts: [
    {
      investAct: '300xxxxxxx1',
      investType: InvestType.Securities,
    },
    {
      investAct: '300xxxxxxx2',
      investType: InvestType.Securities,
    },
    {
      investAct: '688xxxxxxx1',
      investType: InvestType.Funds,
    },
    {
      investAct: '688xxxxxxx2',
      investType: InvestType.Funds,
    },
    {
      investAct: '200xxxxxxx1',
      investType: InvestType.Custody,
    },
    {
      investAct: '200xxxxxxx2',
      investType: InvestType.Custody,
    },
  ],
  subActIntrs: [
    {
      subAct: '300xxxxxxx1',
      withdrawnIntr: 100000,
      transferIntr: 50000,
      currency: 'HKD',
    },
    {
      subAct: '300xxxxxxx2',
      withdrawnIntr: 0,
      transferIntr: 0,
      currency: 'USD',
    },
    {
      subAct: '688xxxxxxx1',
      withdrawnIntr: 100000,
      transferIntr: 50000,
      currency: 'HKD',
    },
    {
      subAct: '688xxxxxxx2',
      withdrawnIntr: 0,
      transferIntr: 0,
      currency: 'USD',
    },
    {
      subAct: '200xxxxxxx1',
      withdrawnIntr: 100000,
      transferIntr: 50000,
      currency: 'HKD',
    },
    {
      subAct: '200xxxxxxx2',
      withdrawnIntr: 0,
      transferIntr: 0,
      currency: 'USD',
    },
  ],
  principleAppDate: '2024-12-01',
  principleExpDate: '2025-05-30',
  formalAppDate: '2024-12-01',
  annualReportDate: '2025-12-01',
  terminationDate: '',
  capitalInvestFlag: YesNo.Yes,
};

/** 供空值任务使用，AIP 及其到期日、FA、Annual Report 日期均为空。 */
export const mockCustomerWithEmptyDates: Customer = {
  ...mockCustomerWithDates,
  cusId: 'C0002',
  cusPrmAct: '622xxxxxxx2',
  cusEnName: 'Chen Wen Empty Dates',
  cusCnName: '陈文（日期为空）',
  bankCusRef: 'CIES2.0:NCIES002',
  investmentAccounts: mockCustomerWithDates.investmentAccounts?.map((account) => ({ ...account })),
  subActIntrs: mockCustomerWithDates.subActIntrs?.map((intr) => ({ ...intr })),
  principleAppDate: '',
  principleExpDate: '',
  formalAppDate: '',
  annualReportDate: '',
};

// 模块级可变数组：dev server 进程存活期间状态持久，任务批准时更新客户主数据。
export const mockCustomers: Customer[] = [mockCustomerWithDates, mockCustomerWithEmptyDates];

const extractId = (url: string): string => {
  const segments = url.split('?')[0].split('/').filter(Boolean);
  return decodeURIComponent(segments[segments.length - 1] || '');
};

export default [
  {
    url: '/api/cies/v1/customer/:id',
    method: 'get',
    response: (opt: { url: string }) => {
      const cusId = extractId(opt.url);
      const customer = mockCustomers.find((item) => item.cusId === cusId);
      return customer
        ? { returnCode: ResCode.Success, body: customer }
        : { returnCode: 'ERR0404', errorMsg: `Customer ${cusId} not found` };
    },
  },
];
