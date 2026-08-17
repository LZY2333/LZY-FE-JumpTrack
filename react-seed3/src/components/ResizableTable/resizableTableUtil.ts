// 防止调宽后列内容和手柄完全不可用。
const MIN_COLUMN_WIDTH = 50;

/** 根据实际渲染结果确定拖拽起始宽度，声明宽度只在无法测量 DOM 时兜底。 */
export const resolveResizeStartWidth = (renderedWidth?: number, declaredWidth?: number): number => {
  // DOM 宽度反映浏览器最终布局，优先于源码声明值。
  if (renderedWidth && renderedWidth > 0) return renderedWidth;
  // 无法测量 DOM 时回退到声明值，二者都缺失则使用最小宽度。
  return declaredWidth ?? MIN_COLUMN_WIDTH;
};

/** 根据右边界的拖拽距离计算列宽。 */
export const resolveResizedWidth = (startWidth: number, pointerDelta: number): number => {
  return Math.max(MIN_COLUMN_WIDTH, startWidth + pointerDelta);
};
