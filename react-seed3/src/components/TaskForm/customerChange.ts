import type { Customer } from '@/types';

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isDeepEqual = (left: unknown, right: unknown): boolean => {
  if (Object.is(left, right)) return true;
  if (!isObject(left) || !isObject(right)) return false;

  // JSON 请求体不会保留值为 undefined 的字段，因此它与字段缺失视为相同。
  const leftKeys = Object.keys(left).filter((key) => left[key] !== undefined);
  const rightKeys = Object.keys(right).filter((key) => right[key] !== undefined);
  if (leftKeys.length !== rightKeys.length) return false;

  return leftKeys.every(
    (key) => Object.prototype.hasOwnProperty.call(right, key) && isDeepEqual(left[key], right[key]),
  );
};

/** 客户数据未发生变化时返回 undefined，使提交体省略 customerChange。 */
export const getCustomerChange = (customer: Customer, currentCustomer: Customer): Customer | undefined =>
  isDeepEqual(customer, currentCustomer) ? undefined : currentCustomer;
