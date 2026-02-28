# videoDetail 变量流转（v/[id]/_blocks/Detail/index.tsx:164）

## 1.路径流转（video-detail.vo.ts → Page）

1. **字段定义**：`server/interface/vo/video-detail.vo.ts` 定义 `VideoDetailVo`（后端返回结构）。
2. **tRPC 路由**：`server/router/routes/video.ts` 的 `getVideoDetail` 调用 `getVideoDetailV2`。
3. **SSR Helper**：`web/src/pages/pollo.ai/v/[id]/_helpers/video.ts` 调用 tRPC 获取 `video`。
4. **Page Props**：`web/src/pages/pollo.ai/v/[id]/index.page.tsx` 接收 `videoData`。
5. **Detail 组件**：`<Detail videoDetail={matchedVideoData} />` 进入详情模块。

**路径直达：**
- [`server/interface/vo/video-detail.vo.ts`](file:///Users/a111111/demo/test-ai-video-collection/server/interface/vo/video-detail.vo.ts)
- [`server/router/routes/video.ts`](file:///Users/a111111/demo/test-ai-video-collection/server/router/routes/video.ts)
- [`web/src/pages/pollo.ai/v/[id]/_helpers/video.ts`](file:///Users/a111111/demo/test-ai-video-collection/web/src/pages/pollo.ai/v/%5Bid%5D/_helpers/video.ts)
- [`web/src/pages/pollo.ai/v/[id]/index.page.tsx`](file:///Users/a111111/demo/test-ai-video-collection/web/src/pages/pollo.ai/v/%5Bid%5D/index.page.tsx)

## 2.在 v/[id]/_blocks/Detail/index.tsx 内部的层层流转

1. **Page → Detail**：`videoData` 通过 `matchedVideoData` 传入 `<Detail />`。
2. **Detail 本地 state**：`videoDetail` 进入 `_videoDetail`，作为 hook 入参。
3. **useUpdateVideoDetail**：返回新的 `videoDetail` 与 `onUpdateVideoDetail`。
4. **派生数据**：`selectedGeneration`、`menuOptionsData` 从 `videoDetail` 计算出来（第 164 行附近）。
5. **Context 下发**：`DetailPrimitive.Root` 将 `videoDetail` 等注入 Context，子组件消费。
6. **更新链路**：`handleUpdateVideo → onUpdateVideoDetail → videoDetailEmitter` 更新并广播。

**路径直达：**
- [`web/src/pages/pollo.ai/v/[id]/_blocks/Detail/index.tsx#L164`](file:///Users/a111111/demo/test-ai-video-collection/web/src/pages/pollo.ai/v/%5Bid%5D/_blocks/Detail/index.tsx#L164)

## 对象字段流转

[123](file:///Users/a111111/Projects/LZY-FE-JumpTrack/skills/variable-flow/SKILL.md)

```js
// 作用：前端实际使用的 VideoDetailVo 字段集合（定义层）
// 出现位置：server/interface/vo/video-detail.vo.ts:312
// 默认标记：[inherit]（除特别标注外）
const videoDetailVo = {
  videoId: ,                // 详情路由/唯一 ID
  videoUrl: ,               // 原始视频地址
  mediaType: ,              // 媒体类型
  createdDate: null,          // 创建时间展示
  publishDate: null,          // 发布时间
  publishStatus: ,          // 发布状态
  protectionMode: false,      // 版权保护开关
  starNum: 0,                 // 点赞数
  isLike: false,              // 当前用户是否点赞
  videoMeta: {
    hasAudio: false,          // 是否有音轨
  },
  user: {
    id: ,                   // 作者内部 ID
    uuid: ,                 // 作者展示 ID
    name: ,                 // 作者昵称
    firstName: ,            // 作者名
    lastName: ,             // 作者姓
    image: ,                // 作者头像
  },
  generateRecord: {
    id: 0,                    // 生成记录 ID
    status: ,               // 生成状态
    type: ,                 // 生成类型
    entryCode: ,            // 入口来源
    processType: ,          // 工具流程
    projectId: ,            // 项目 ID
    projectType: ,          // 项目类型
    toolCode: ,             // 详情表单选择
    enableExtend: false,      // 是否允许扩展
    processConfig: {
      mode: ,               // 模式配置
    },
    generationConfig: {
      configType: ,         // 配置类型
      videoModel: ,         // 模型标识
    },
    generationLoras: [
      {
        status: 0,            // LoRA 状态
        title: ,            // LoRA 标题
      },
    ],
  },
  generations: [
    {
      videoId: ,            // 子结果 ID
      mediaUrl: ,           // 子结果媒体地址
      videoUrl: ,           // 子结果视频地址
      cover: ,              // 子结果封面
      favorite: false,        // 子结果收藏状态
      videoMeta: {
        seed: 0,              // Seed 展示
        width: 0,             // 输出宽
        height: 0,            // 输出高
        hasAudio: false,      // 子结果音轨
      },
      oldTags: [],            // 旧标签
      useNewTagSystem: false, // 是否使用新标签系统
      tagInfos: [
        {
          id: 0,              // 标签 ID
          name: ,           // 标签名称
          path: ,           // 标签路径
          i18n: { en:  },   // 标签多语言
        },
      ],
    },
  ],
}

// 作用：SSR getVideoDetail 的返回结果
// 出现位置：web/src/pages/pollo.ai/v/[id]/_helpers/video.ts:16
// 默认标记：[inherit]（除特别标注外）
const video = {
  ...videoDetailVo,           // 继承定义层
}

// 作用：PageProps 中的 videoData
// 出现位置：web/src/pages/pollo.ai/v/[id]/index.page.tsx:23
// 默认标记：[inherit]（除特别标注外）
const videoData = {
  ...video,                   // 继承 SSR 结果
}

// 作用：Page 内 match 命中的 matchedVideoData
// 出现位置：web/src/pages/pollo.ai/v/[id]/index.page.tsx:96
// 默认标记：[inherit]（除特别标注外）
const matchedVideoData = {
  ...videoData,               // 继承 PageProps
}

// 作用：Detail 组件的 props.videoDetail
// 出现位置：web/src/pages/pollo.ai/v/[id]/_blocks/Detail/index.tsx:35
// 默认标记：[inherit]（除特别标注外）
const videoDetail = {
  ...matchedVideoData,        // 继承 match 结果
}

// 作用：Detail 内部本地 state
// 出现位置：web/src/pages/pollo.ai/v/[id]/_blocks/Detail/index.tsx:81
// 默认标记：[inherit]（除特别标注外）
const _videoDetail = {
  ...videoDetail,             // 本地 state 复制
}

// 作用：useUpdateVideoDetail 返回的最新详情
// 出现位置：web/src/pages/pollo.ai/v/[id]/_hooks/useVideoDetail.ts:11
// 默认标记：[inherit]（除特别标注外）
const videoDetailFromHook = {
  ..._videoDetail,            // 可能被 refetch/更新覆盖
}

// 作用：当前选中的 generation
// 出现位置：web/src/pages/pollo.ai/v/[id]/_blocks/Detail/index.tsx:107
// 默认标记：[inherit]（除特别标注外）
const selectedGeneration = {
  videoId: ,                // 当前选中的子结果 ID
  mediaUrl: ,               // 当前媒体地址
  videoUrl: ,               // 兜底媒体地址
  cover: ,                  // 封面
  favorite: false,            // 收藏状态
  videoMeta: {
    seed: 0,                  // Seed 展示
    width: 0,                 // 输出宽
    height: 0,                // 输出高
    hasAudio: false,          // 音轨判断
  },
  oldTags: [],                // 旧标签
  useNewTagSystem: false,     // 新标签系统开关
  tagInfos: [
    {
      id: 0,                  // 标签 ID
      name: ,               // 标签名称
      path: ,               // 标签路径
      i18n: { en:  },       // 标签多语言
    },
  ],
}

// 作用：右侧菜单所需的合并数据（index.tsx:164）
// 出现位置：web/src/pages/pollo.ai/v/[id]/_blocks/Detail/index.tsx:149
const menuOptionsData = {
  ...videoDetailFromHook,     // 合并基础详情 [inherit]
  videoId: selectedGeneration?.videoId || ,      // 当前 generation 的 videoId [override]
  videoUrl: selectedGeneration?.videoUrl || ,    // 当前 generation 的 videoUrl [override]
  mediaUrl: selectedGeneration?.mediaUrl || ,    // 当前 generation 的 mediaUrl [override]
  reallyVideoId: videoDetailFromHook.videoId || ,// 原始记录 ID [add]
  reallyVideoUrl: videoDetailFromHook.videoUrl || ,// 原始记录 URL [add]
  favorite: Boolean(selectedGeneration?.favorite), // 当前 generation 收藏状态 [override]
  published: !!videoDetailFromHook.publishDate,    // publishDate 反算发布态 [add]
  protectionMode: videoDetailFromHook.protectionMode ?? false, // 保护开关兜底 [override]
  // temp?.imageUrl | temp?.image | temp?.images?.[0]（若上游提供）
  // reallyMediaUrl（若上游提供）
}

// 作用：DetailContext 下发给子组件的上下文
// 出现位置：web/src/pages/pollo.ai/v/[id]/_blocks/Detail/primitive/context.ts:8
const detailContext = {
  videoDetail: videoDetailFromHook,              // 详情主体 [inherit]
  menuOptionsData,                               // 菜单合并数据 [inherit]
  currentSelectedGenerationIndex: 0,             // 当前选中序号 [add]
  isMySelf: true,                                // 是否本人 [add]
  isImage: false,                                // 是否图片 [add]
  isFromCanvas: false,                           // 是否来自画布 [add]
  entryCode: videoDetailFromHook.generateRecord.entryCode, // 入口标识 [add]
  projectDetail: {},                             // 项目详情 [add]
}
```

**路径直达：**
- [`server/interface/vo/video-detail.vo.ts#L312`](file:///Users/a111111/demo/test-ai-video-collection/server/interface/vo/video-detail.vo.ts#L312)
- [`web/src/pages/pollo.ai/v/[id]/_helpers/video.ts#L16`](file:///Users/a111111/demo/test-ai-video-collection/web/src/pages/pollo.ai/v/%5Bid%5D/_helpers/video.ts#L16)
- [`web/src/pages/pollo.ai/v/[id]/index.page.tsx#L23`](file:///Users/a111111/demo/test-ai-video-collection/web/src/pages/pollo.ai/v/%5Bid%5D/index.page.tsx#L23)
- [`web/src/pages/pollo.ai/v/[id]/index.page.tsx#L96`](file:///Users/a111111/demo/test-ai-video-collection/web/src/pages/pollo.ai/v/%5Bid%5D/index.page.tsx#L96)
- [`web/src/pages/pollo.ai/v/[id]/_blocks/Detail/index.tsx#L35`](file:///Users/a111111/demo/test-ai-video-collection/web/src/pages/pollo.ai/v/%5Bid%5D/_blocks/Detail/index.tsx#L35)
- [`web/src/pages/pollo.ai/v/[id]/_blocks/Detail/index.tsx#L81`](file:///Users/a111111/demo/test-ai-video-collection/web/src/pages/pollo.ai/v/%5Bid%5D/_blocks/Detail/index.tsx#L81)
- [`web/src/pages/pollo.ai/v/[id]/_blocks/Detail/index.tsx#L107`](file:///Users/a111111/demo/test-ai-video-collection/web/src/pages/pollo.ai/v/%5Bid%5D/_blocks/Detail/index.tsx#L107)
- [`web/src/pages/pollo.ai/v/[id]/_blocks/Detail/index.tsx#L149`](file:///Users/a111111/demo/test-ai-video-collection/web/src/pages/pollo.ai/v/%5Bid%5D/_blocks/Detail/index.tsx#L149)
- [`web/src/pages/pollo.ai/v/[id]/_hooks/useVideoDetail.ts#L11`](file:///Users/a111111/demo/test-ai-video-collection/web/src/pages/pollo.ai/v/%5Bid%5D/_hooks/useVideoDetail.ts#L11)
- [`web/src/pages/pollo.ai/v/[id]/_blocks/Detail/primitive/context.ts#L8`](file:///Users/a111111/demo/test-ai-video-collection/web/src/pages/pollo.ai/v/%5Bid%5D/_blocks/Detail/primitive/context.ts#L8)

