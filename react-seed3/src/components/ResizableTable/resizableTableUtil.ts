interface TablePaginationOptions {
  defaultPageSize?: number;
  pageSizeOptions?: Array<string | number>;
}

type TableStorage = Pick<Storage, 'key' | 'length' | 'removeItem'>;

const ANTD_DEFAULT_PAGE_SIZE = 10;

/** 解析设置面板重置时应恢复的有效分页大小。 */
export const resolveResetPageSize = (pagination: TablePaginationOptions): number => {
  const pageSizeOptions = (pagination.pageSizeOptions ?? [])
    .map(Number)
    .filter((pageSize) => Number.isInteger(pageSize) && pageSize > 0);
  const defaultPageSize = pagination.defaultPageSize;

  if (
    defaultPageSize &&
    Number.isInteger(defaultPageSize) &&
    (pageSizeOptions.length === 0 || pageSizeOptions.includes(defaultPageSize))
  ) {
    return defaultPageSize;
  }
  return pageSizeOptions[0] ?? ANTD_DEFAULT_PAGE_SIZE;
};

/** 清除指定表格命名空间下的全部本地缓存。 */
export const clearTableStorage = (storageKey?: string, storage: TableStorage = localStorage): void => {
  if (!storageKey) return;

  const cachePrefix = `${storageKey}-`;
  const cacheKeys = Array.from({ length: storage.length }, (_, index) => storage.key(index)).filter(
    (key): key is string => key === storageKey || Boolean(key?.startsWith(cachePrefix)),
  );
  cacheKeys.forEach((key) => storage.removeItem(key));
};
