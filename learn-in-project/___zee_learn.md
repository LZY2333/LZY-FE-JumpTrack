# 学习

## 预备prompt -------------------------------

## 生成业务功能

很多组件做得过于通用,暴露过多props,或将部分逻辑交于外部处理再传入使用,应当更内聚

### 区分好组件职责边界,逻辑边界

### 是否有类似功能实现

## 注释
给当前文件源码加上注释,需要注释的源码为: 自定义函数 自定义变量 JSX内每个自定义组件 解构的变量,注释内容为: 注释对象的作用/功能

## 变量流转
videoDetail变量 数据怎么层层传递的,在组件和hooks之间的流转, 并在文件末尾打印出 videoDetail内含哪些字段,字段作用,videoDetail最初创建的
  文件位置
路径流转请补充 video-detail.vo.ts 到Page的部分,字段展示部分改成按流转状态每层的变量展示,且只考虑前端使用到的出现过的字段,且需要考虑继承关系,使用js格式代码块打印其字
  段及字段注释说明,例如 2中_videoDetail用到了非自己新增的b属性,代表1中videoDetail 及 videoData 已经具有b属性,需要标出,假设2中_videoDetail还新增了c属性,则 videoDetail:

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
## web/src/pages/pollo.ai/v/[id]/_blocks/Detail/index.tsx
`useState<VideoDetailVo>(firstVideoDetail)`
`useUpdateVideoDetail`

## web/src/pages/pollo.ai/v/[id]/_hooks/useVideoDetail.ts
`useEffect(() => { setVideoDetail(videoData) }, [videoData])`
useUpdateVideoDetail

## web/src/pages/pollo.ai/_components/MenuOptions/PureMenuOptionUI.tsx
`<OptionButton {...target}` 为什么组件会设计成要解耦传入

## 周报

nextjs

tailwind css

1. 试用平台功能, 熟悉整理平台业务功能模块全景

- 主页侧边栏各个模块的 定位与职责
- 理清了 创作区 娱乐区 社区 的产品分层。

1. 理清文生图链路, /app?target=text-to-image 与 /ai-image-generator 表单展示逻辑

- 从左侧 Txt2Img 点击一路追到 表单render(TextToImageFormGenerate)。
- 明确 app 页与 ai-image-generator 页共享同一套表单生成逻辑(FormGenerate)与 Context/Store 体系

1. Video Detail 详情页 及 字段流转

- 从后端 VideoDetailVo 到前端 Page/Detail/hooks/context 的完整字段流转。
- 掌握了 videoDetail、selectedGeneration、menuOptionsData 的继承与覆盖关系。
