import { describe, expect, it } from 'vitest';
import { resolveResizedWidth, resolveResizeStartWidth } from '@/components/ResizableTable/resizableTableUtil';

describe('ResizableTable utilities', () => {
  it('starts resizing from the rendered width instead of the declared width', () => {
    expect(resolveResizeStartWidth(180, 120)).toBe(180);
    expect(resolveResizeStartWidth(0, 120)).toBe(120);
  });

  it('resizes a column from its right edge and enforces the minimum width', () => {
    expect(resolveResizedWidth(120, 30)).toBe(150);
    expect(resolveResizedWidth(60, -30)).toBe(50);
  });

});
