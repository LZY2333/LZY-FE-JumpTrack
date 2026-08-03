import { useEffect, useState } from 'react';
import type { RefObject } from 'react';

// 表格底部到视窗底的留白（对应页面容器的下内边距）。
const DEFAULT_BOTTOM_GAP = 24;

// 计算 antd Table 的 scroll.y：视窗高 - 表格顶部 - 实测表头/分页器高 - 底部留白，
// 保证「表头 + 表体 + 分页器」落在视窗内，多余行走表格内部滚动，整页不出现滚动条。
// 表头/分页器高度实测（随浏览器缩放、字号自适应），比固定预留值在不同机器上更稳。
export default function useTableScrollY(ref: RefObject<HTMLElement>, bottomGap: number = DEFAULT_BOTTOM_GAP) {
  const [scrollY, setScrollY] = useState(400);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      // 以真正的表格（.ant-table）顶部为基准，wrap 内表格上方的工具栏高度会被自动计入
      const table = el.querySelector('.ant-table') as HTMLElement | null;
      const top = (table ?? el).getBoundingClientRect().top;
      const headH = (el.querySelector('.ant-table-thead') as HTMLElement | null)?.offsetHeight ?? 55;
      const pager = el.querySelector('.ant-pagination') as HTMLElement | null;
      let pagerH = 64;
      if (pager) {
        // 实测上下 margin 而非硬编码，随全局分页器样式覆盖（如去除底部间距）自动生效
        const { marginTop, marginBottom } = window.getComputedStyle(pager);
        pagerH = pager.offsetHeight + (parseFloat(marginTop) || 0) + (parseFloat(marginBottom) || 0);
      }
      setScrollY(Math.max(200, window.innerHeight - top - headH - pagerH - bottomGap));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener('resize', update);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', update);
    };
  }, [ref, bottomGap]);

  return scrollY;
}
