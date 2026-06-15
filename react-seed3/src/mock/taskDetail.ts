export const mockTaskDetail = {
  id: 'T0001',
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
  transferred3M: 'Y',
  withdrawableInterests: { HKD: 100000, USD: 0 },
  transferredInterests: { HKD: 50000, USD: 0 },
  attachments: [
    { name: 'Cover_Letter_T0001.pdf', uid: '1' },
    { name: 'Statement_T0001.pdf', uid: '2' },
    { name: 'Transaction_T0001.pdf', uid: '3' },
  ],
  modifiedFields: ['ourRef', 'yourRef'],
  makerId: 'U001',
};

export default [
  {
    url: '/api/task/:id',
    method: 'get',
    response: () => ({ code: 0, data: mockTaskDetail }),
  },
];
