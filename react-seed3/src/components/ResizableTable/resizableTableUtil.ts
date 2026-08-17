// 防止调宽后列内容和手柄完全不可用。
const MIN_COLUMN_WIDTH = 50;

/** 使用列宽模型中的确定宽度作为拖拽起点，DOM 测量只为无声明宽度的兼容场景兜底。 */
export const resolveResizeStartWidth = (declaredWidth?: number, renderedWidth?: number): number => {
  if (declaredWidth !== undefined && declaredWidth > 0) return declaredWidth;
  if (renderedWidth !== undefined && renderedWidth > 0) return renderedWidth;
  return MIN_COLUMN_WIDTH;
};

/** 根据右边界的拖拽距离计算列宽。 */
export const resolveResizedWidth = (startWidth: number, pointerDelta: number): number => {
  return Math.max(MIN_COLUMN_WIDTH, startWidth + pointerDelta);
};

export interface FluidColumnCandidate {
  columnId: string;
  fixed?: boolean | 'left' | 'right';
}

/** 最右侧普通列作为唯一流体列，集中吸收表格剩余空间。 */
export const resolveFluidColumnId = (columns: FluidColumnCandidate[]): string | undefined => {
  for (let index = columns.length - 1; index >= 0; index -= 1) {
    if (!columns[index].fixed) return columns[index].columnId;
  }
  return undefined;
};
