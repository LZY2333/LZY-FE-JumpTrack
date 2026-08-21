/** 删除表单对象中的空值字段。 */
export const omitEmptyValues = <T extends Record<string, unknown>>(data: T) => {
  const entries = Object.entries(data).filter(([, value]) => !isEmptyValue(value));
  return Object.fromEntries(entries) as Partial<T>;
};

/** 判断表单字段值是否为空。 */
const isEmptyValue = (value: unknown) =>
  value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0);
