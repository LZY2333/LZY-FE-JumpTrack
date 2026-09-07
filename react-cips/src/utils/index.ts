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
