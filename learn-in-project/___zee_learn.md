# 学习

## 预备skill -------------------------------

## skill: 业务功能生成

更内聚: 不要过于通用(暴露过多props),或将部分逻辑交于外部处理再传入使用,应当更内聚

规划组件边界: 各个组件职责边界,逻辑边界,要清晰

复用: 原有业务是否有可以复用

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
