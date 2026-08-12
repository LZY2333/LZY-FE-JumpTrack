import { describe, expect, it } from 'vitest';
import { clearTableStorage, resolveResetPageSize } from '@/components/ResizableTable/resizableTableUtil';

describe('ResizableTable utilities', () => {
  it('uses a configured default page size included in the options', () => {
    expect(resolveResetPageSize({ defaultPageSize: 20, pageSizeOptions: [10, 20, 50] })).toBe(20);
  });

  it('uses the first option when the configured default is unavailable', () => {
    expect(resolveResetPageSize({ defaultPageSize: 10, pageSizeOptions: [20, 50] })).toBe(20);
  });

  it('supports string page-size options', () => {
    expect(resolveResetPageSize({ pageSizeOptions: ['25', '50'] })).toBe(25);
  });

  it('falls back to the Ant Design default when no pagination default is configured', () => {
    expect(resolveResetPageSize({})).toBe(10);
  });

  it('clears only the current table cache namespace', () => {
    const cache = new Set(['task-pool', 'task-pool-page-size', 'task-pool-tabs', 'customer-table']);
    const storage = {
      get length() {
        return cache.size;
      },
      key: (index: number) => Array.from(cache)[index] ?? null,
      removeItem: (key: string) => cache.delete(key),
    };

    clearTableStorage('task-pool', storage);

    expect(Array.from(cache)).toEqual(['customer-table']);
  });
});
