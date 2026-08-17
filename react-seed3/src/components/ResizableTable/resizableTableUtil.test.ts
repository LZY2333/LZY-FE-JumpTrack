import { describe, expect, it } from 'vitest';
import {
  resolveFluidColumnId,
  resolveResizedWidth,
  resolveResizeStartWidth,
} from '@/components/ResizableTable/resizableTableUtil';

describe('ResizableTable utilities', () => {
  it('uses the deterministic declared width and only falls back to DOM measurement', () => {
    expect(resolveResizeStartWidth(120, 180)).toBe(120);
    expect(resolveResizeStartWidth(undefined, 180)).toBe(180);
    expect(resolveResizeStartWidth(undefined, 0)).toBe(50);
  });

  it('resizes a column from its right edge and enforces the minimum width', () => {
    expect(resolveResizedWidth(120, 30)).toBe(150);
    expect(resolveResizedWidth(60, -30)).toBe(50);
  });

  it('uses the last non-fixed column as the only fluid column', () => {
    expect(
      resolveFluidColumnId([{ columnId: 'taskId' }, { columnId: 'status' }, { columnId: 'action', fixed: 'right' }]),
    ).toBe('status');
    expect(resolveFluidColumnId([{ columnId: 'action', fixed: 'right' }])).toBeUndefined();
  });
});
