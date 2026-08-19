export const omitEmptyValues = <T extends Record<string, unknown>>(data: T) => {
  const entries = Object.entries(data).filter(([, value]) => !isEmptyValue(value));
  return Object.fromEntries(entries) as Partial<T>;
};

const isEmptyValue = (value: unknown) =>
  value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0);
