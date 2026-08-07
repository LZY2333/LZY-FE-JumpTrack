import type { Customer } from '@/types';
import { CiesFlag, InvestType, ResCode, YesNo } from '@/types/enums';

// 模块级可变数组：dev server 进程存活期间状态持久，任务批准时更新客户主数据。
export const mockCustomers: Customer[] = [
  {
    cusId: 'C0001',
    cusPrmAct: ['622xxxxxxx1', '622xxxxxxx2'],
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
        withdrawnIntr: 100000,
        TransferIntr: 50000,
        currency: 'HKD',
      },
      {
        investAct: '300xxxxxxx2',
        investType: InvestType.Securities,
        withdrawnIntr: 0,
        TransferIntr: 0,
        currency: 'USD',
      },
      {
        investAct: '688xxxxxxx1',
        investType: InvestType.Funds,
        withdrawnIntr: 100000,
        TransferIntr: 50000,
        currency: 'HKD',
      },
      {
        investAct: '688xxxxxxx2',
        investType: InvestType.Funds,
        withdrawnIntr: 0,
        TransferIntr: 0,
        currency: 'USD',
      },
      {
        investAct: '200xxxxxxx1',
        investType: InvestType.Custody,
        withdrawnIntr: 100000,
        TransferIntr: 50000,
        currency: 'HKD',
      },
      {
        investAct: '200xxxxxxx2',
        investType: InvestType.Custody,
        withdrawnIntr: 0,
        TransferIntr: 0,
        currency: 'USD',
      },
    ],
    principleAppDate: '2024-12-01',
    principleExpDate: '2025-05-30',
    formalAppDate: '2024-12-01',
    annualReportDate: '2025-12-01',
    terminationDate: '',
    capitalInvestFlag: YesNo.Yes,
  },
];

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
