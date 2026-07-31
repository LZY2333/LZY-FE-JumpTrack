import { describe, expect, it } from 'vitest';
import { migrateTableLayout, resolveColumnOrder } from './useTableLayout';

describe('resolveColumnOrder', () => {
  it('inserts a new column at its default position instead of appending it', () => {
    const sourceIds = ['taskId', 'createTime', 'transactionTime', 'updateTime', 'action'];
    const cachedOrder = ['taskId', 'createTime', 'updateTime', 'action'];

    expect(resolveColumnOrder(cachedOrder, sourceIds)).toEqual(sourceIds);
  });

  it('preserves the custom order of existing columns', () => {
    const sourceIds = ['taskId', 'createTime', 'transactionTime', 'updateTime'];
    const cachedOrder = ['updateTime', 'taskId', 'createTime'];

    expect(resolveColumnOrder(cachedOrder, sourceIds)).toEqual([
      'updateTime',
      'taskId',
      'createTime',
      'transactionTime',
    ]);
  });

  it('removes deleted and duplicate column ids', () => {
    expect(resolveColumnOrder(['taskId', 'removed', 'taskId'], ['taskId', 'createTime'])).toEqual([
      'taskId',
      'createTime',
    ]);
  });
});

describe('migrateTableLayout', () => {
  it('migrates a renamed column and makes its replacement visible by default', () => {
    const migrated = migrateTableLayout(
      {
        widths: { taskId: 120, transactionDate: 80 },
        order: ['taskId', 'createTime', 'transactionDate', 'updateTime'],
        hidden: ['transactionDate', 'updateTime'],
      },
      ['taskId', 'createTime', 'transactionTime', 'updateTime'],
    );

    expect(migrated).toEqual({
      widths: { taskId: 120 },
      order: ['taskId', 'createTime', 'transactionTime', 'updateTime'],
      hidden: ['updateTime'],
    });
  });
});
