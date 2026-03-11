# figma mcp ui skills

尽量减少请求评率

多个图片中 设计稿完全一致，检查是否为使用同一组件，合并修改。

重复item中某一item样式不同，注意 Figma 中 component properties 是否含 hover/active 等状态, 或 根据常用的状态 css规则，判断当前是否为 状态效果。

读取当前项目的 figma-theme，确认映射关系。

生成记录修改文档

注意页面元素的层级关系的变动, 如左右 上下 包裹等。

## 修改简报

⏺ 12 处修改全部完成：

AiList/index.tsx（11 处）：

- 面板(40)：bg-f-bg-base + p-4 + rounded-3xl
- 卡片(54)：text-f-text-secondary hover:text-f-primary + hover:bg-f-bg-layout + p-3 + rounded-xl
- 底部标题(80)：text-xs text-f-text-quaternary（去掉 font-semibold）
- 标签间距(91)：gap-0.5

ModelTag.tsx（1 处）：

- 添加(31) rounded-xl py-1 px-3 hover:bg-f-bg-layout

/Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/\_layout/Header/HeaderList/AiList/index.tsx:40
/Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/\_layout/Header/HeaderList/AiList/index.tsx:54
/Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/\_layout/Header/HeaderList/AiList/index.tsx:80
/Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/\_layout/Header/HeaderList/components/ModelTag.tsx:31

## 考虑和 spec 或 plan 合并

输出文档
