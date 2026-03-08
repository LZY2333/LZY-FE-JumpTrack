# 学习

## 预备skill -------------------------------

## skill: 业务功能生成

更内聚: 不要过于通用(暴露过多props),或将部分逻辑交于外部处理再传入使用,应当更内聚

规划组件边界: 各个组件职责边界,逻辑边界,要清晰

复用: 原有业务是否有可以复用

**文档记录修改**
以代码块(内含:顶部注释文件名和简单路径,内部含 代码行数, ...省略非修改代码,)的方式展示需要修改文件的内容,每个文件一个代码块, 底部统一给出具体路径.

## skill: 项目代码分析当前产品

通过项目代码，快速了解当前产品。有哪些板块，其术语，其展示位置，其文件位置，其产品职责，最后其引用位置，文件位置（距离）。有哪些页面，同上。

## 功能实现 -------------------------------

## 如何做到忽略url语言前缀

核心是 Next.js 的 i18n 处理，项目并没有手动“剥离”语言前缀，而是把它交给框架拆分成 locale + pathname。

- i18n 配置在 web/config/next/custom.ts:7-34，defaultLocale: 'en' + localeDetection: false，并在 web/next.config.ts:33-44 挂到 Next 配置里；因此默认语言（en）不带前缀，语言前缀由 Next 识别成 locale 而不是路由的一部分。

- 中间件/重定向逻辑用 request.nextUrl.locale 读语言、用 request.nextUrl.pathname 做路径匹配/跳转，等价于“忽略语言前缀”。见 web/src/proxy.page.ts:25-39、web/src/helpers/proxy/redirect.ts:33-40。

- 前端构建 canonical 时也按 locale === 'en' ? '' : /${locale} 拼接，默认语言不加前缀。见 web/src/hooks/routes.ts:79-96。

    如果你是在某处想“忽略语言前缀”，项目里的做法就是用 router.locale/request.nextUrl.locale 取语言，用 router.pathname/request.nextUrl.pathname 取路径；不要用带原始前缀的
    asPath。

## 代码问题 -------------------------------

## 解耦的太多了，该内聚的没有内聚

## 大量使用props透传，无法理解组件

阅读代码必须 调用方 组件，两者来回切换，调用方传入了过多信息，且很多无层级划分，没有使用props对象收束区分
非通用组件 却暴露了太多props，将控制权交给外部
props 长链路传递但终点未消费4.组件 hooks文件组织 摆放混乱，存在多个公用组件层级，职责不清晰.

## web/src/pages/pollo.ai/v/[id]/\_blocks/Detail/index.tsx

多次储存 video detail

`useState<VideoDetailVo>(firstVideoDetail)`
`useUpdateVideoDetail`

web/src/pages/pollo.ai/v/[id]/\_hooks/useVideoDetail.ts

`useEffect(() => { setVideoDetail(videoData) }, [videoData])`
useUpdateVideoDetail

直接props 内的video detail 传入 useUpdateVideoDetail,该hooks暴露set函数,由该hooks统一控制videodetail

## web/src/pages/pollo.ai/\_components/MenuOptions/PureMenuOptionUI.tsx

`<OptionButton {...target}` 为什么组件会设计成要解耦传入,props 属性浅比较过多,是否应该限定pick字段，或不解构target

`<OptionButton {...target}` 传入业务字段, 随后内部 `{...restProps}` 透传到 antd <Button>

```tsx
// OptionButton 第 53 行
  <Button {...restProps}>
  // restProps 包含了 onSuccess, onFavoriteSuccess, sourceType, onCreate 等
  // 这些全部会被 antd Button 转发到 <button> DOM 元素上
```

## web/src/pages/pollo.ai/\_layout/Header/HeaderMenu/index.tsx:40

/Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/\_layout/Header/HeaderMenu/index.tsx:40

PCMenu 与 MobileMenu 通过CSS隐藏避免响应式的水合问题
但 showHeaderMenu:false 不存在该问题，应该通过JS避免DOM渲染

## web/src/pages/pollo.ai/\_layout/Header/HeaderMenu/\_block/PCMenu/index.tsx:1

/Users/a111111/code/ai-video-collection/web/src/pages/pollo.ai/\_layout/Header/HeaderMenu/\_block/PCMenu/index.tsx:1

showLoginUserInfo Props多层透传
Header(props.showLoginUserInfo) // 第 1 层：解构
→ HeaderMenu(showLoginUserInfo) // 第 2 层：传入
→ PCMenu(showLoginUserInfo) // 第 3 层：传入
→ AiList(showLoginUserInfo) // 第 4 层：最终使用

```jsx
// 当前写法 - 不必要的 CSS 隐藏
  <div className={cls`${showHeaderMenu ? '' : 'xl:hidden'}`}>
    <PCMenu ... />      {/* 即使隐藏也会渲染 */}
    <MobileMenu ... />
  </div>

  // ✅ 更合理的写法
  <div>
    {showHeaderMenu && <PCMenu ... />}
    <MobileMenu ... />
  </div>
```

## 周报 -------------------------------

## 开发

1. 去除 home 和 effects自测(涉及页面多) 自测及上线
2. 后管 categoryCode 接口修改方案沟通(这周对接).

## Pollo 2.0

1. 学习 产品框架 资源
2. 梳理 改版2.0 需求文档
3. 顶部导航栏 模块代码熟悉, 修改plan文档准备.

## AI编码率探索

1. custom skills: 4 -> 8
有两个skills对于新人理解项目比较友好,准备分享出来

2. 提高 AI编码率 探索
两个skill(优化中):
temp-ai-spec(解决prd → spec): 当前需求的 同时面向开发/AI 的规格文档
temp-ai-plan(解决spec → plan/task): plan list, 代码修改细项

痛点:
AI编码: 提高 AI Coding 一次性成功率
反复 prompt 与 review, 是AI体验不好 以及 AI编码 心慌的主要问题

业内成熟方案:
[GitHub Spec Kit] 四阶段门控: prd -> spec -> plan -> tasks -> Implement
输出太重,review困难
输出格式与我们团队不符
定制成本高
使用麻烦,要下载cli,要习惯其指令
深度绑定项目,生成spec

重构/新项目/大模块 多加一步:
skill0: discuss → prd
ad的 discuss-before-plan / brainstorming

discuss 参考
<https://skills.sh/obra/superpowers/brainstorming>
<https://skills.sh/adonis0123/adonis-skills/discuss-before-plan>
spec 参考
<https://skills.sh/github/awesome-copilot/create-specification>
[GitHub Spec Kit](https://github.com/github/spec-kit)
[Addy Osmani: How to write a good spec for AI agents](https://addyo.substack.com/p/how-to-write-a-good-spec-for-ai-agents)
plan 参考
<https://skills.sh/obra/superpowers/writing-plans>

## Skill工厂 -------------------------------

**需求文档(产品) -> 需求文档(开发+AI) -> 详设文档+伪代码(AI） -> 详设评审(开发) -> 编码(AI) -> Review(开发)**

关于「需求文档(开发+AI)」skill：

- 输入是什么？产品的 PRD 文本 / 飞书链接 / 粘贴内容？

> emmm就是一个特别大的需求，需要拆分为多个步骤，想清楚想明白的拆分，拆分下来每完成一个步骤需要归档完成内容以及任何进度

1. 当前工作目录下生成一个 产品文档模板,内涵
   ## 基本数据: 产品文档
   ## 非目标

- 产出格式是什么？需要包含哪些固定章节（如背景、功能点、接口约定、影响范围等）？

    给出你的建议，参照市面最佳事件
    格式要求精简，顶部有修改总览，
    修改总览:
    排序，且有编号(123)，顺序即代码修改plan
    要有产品文档章节对应，例如 5.1(1/5), 要能知道是否覆盖了所有需求文档内容
    有

- 是否需要结合当前代码库分析影响范围？
  需要

关于「详设文档+伪代码」skill：

- 输入是上一步产出的开发需求文档？
- 详设需要细化到什么程度？（组件拆分、数据流、状态管理、API 调用链？）
- 伪代码是写在详设文档内，还是单独文件？
- 是否需要自动分析现有代码库来生成方案？

探索 程序员负责翻译文档 AI执行生成修改计划 AI修改代码 程序员Review
文档理解 产品理解 代码理解 产品会
