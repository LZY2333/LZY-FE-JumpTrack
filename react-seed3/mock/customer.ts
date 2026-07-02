import type { Customer } from '@/types';
import { YesNo } from '@/types/enums';

// 模块级可变数组：dev server 进程存活期间状态持久，submit 时直接 Object.assign 更新
export const mockCustomers: Customer[] = [
  {
    id: 'C0001',
    customerType: 'CIES 2.0',
    customerName: 'Chen Wen 陈文',
    dateOfBirth: '2000-12-01',
    cif: '1000***',
    savingsAccount: '622xxxxxxx',
    securitiesAccount: '300xxxxxxx',
    fundAccount: '688xxxxxxx',
    custodianAccount: '200xxxxxxx',
    ourRef: 'CIES2.0:NCIES001',
    yourRef: 'AA-100001-24',
    aipDate: '2024-12-01',
    aipExpiryDate: '2025-05-30',
    faDate: '2024-12-01',
    ciesTerminationDate: '',
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
      code: 0,
      data: mockCustomers.find(item => item.id === extractId(opt.url)),
    }),
  },
];
