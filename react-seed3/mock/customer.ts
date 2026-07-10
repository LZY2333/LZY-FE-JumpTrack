import type { Customer } from '@/types';
import { ResCode, YesNo } from '@/types/enums';

// 模块级可变数组：dev server 进程存活期间状态持久，submit 时直接 Object.assign 更新
export const mockCustomers: Customer[] = [
  {
    cusId: 'C0001',
    cusType: 'CIES 2.0',
    cusCnName: '陈文',
    cusEnName: 'Chen Wen',
    cusBirthDate: '2000-12-01',
    bankCusRef: 'CIES2.0:NCIES001',
    govCusRef: 'AA-100001-24',
    cusPrmAct: ['622xxxxxxx1', '622xxxxxxx2'],
    securityAct: ['300xxxxxxx1', '300xxxxxxx2'],
    fundAct: ['688xxxxxxx1', '688xxxxxxx2'],
    custodianAct: ['200xxxxxxx1', '200xxxxxxx2'],
    aipDate: '2024-12-01',
    aipExpiryDate: '2025-05-30',
    faDate: '2024-12-01',
    AnnualReportDate: '2025-12-01',
    terminationDate: '',
    transferred3M: YesNo.Yes,
    withdrawableInterests: { HKD: 100000, USD: 0 },
    transferredInterests: { HKD: 50000, USD: 0 },
  },
];

// '/api/customer/C0001' → split → ['', 'api', 'customer', 'C0001'] → [3]
function extractId(url: string): string {
  return url.split('/')[3];
}

export default [
  {
    url: '/api/customer/:id',
    method: 'get',
    response: (opt: { url: string }) => ({
      returnCode: ResCode.Success,
      body: mockCustomers.find((item) => item.cusId === extractId(opt.url)),
    }),
  },
];
