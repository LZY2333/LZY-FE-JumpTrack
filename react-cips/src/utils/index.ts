/** 报文金额展示保留后端返回的小数位并添加千分位 */
export const formatMessageAmount = (value: string) => {
  const amountMatch = /^([+-]?\d+)(\.\d+)?$/.exec(value);
  if (!amountMatch) return value;

  return amountMatch[1].replace(/\B(?=(\d{3})+(?!\d))/g, ',') + (amountMatch[2] ?? '');
};

/** 清除对象中的空字符串、null 和 undefined，保留 0、false 等有效值。 */
export const omitEmptyValues = <Values extends object>(values: Values) =>
  Object.fromEntries(
    Object.entries(values).filter(([, value]) => value !== undefined && value !== null && value !== ''),
  ) as {
    [Field in keyof Values as undefined extends Values[Field]
      ? never
      : null extends Values[Field]
      ? never
      : Field]: Values[Field];
  } & { [Field in keyof Values]?: NonNullable<Values[Field]> };

/** 下拉字段回填空值时显示占位提示，保留 0 等有效选项 */
export const getSelectValueProps = <Value>(value?: Value | null) => ({
  value: value === '' ? undefined : value ?? undefined,
});
