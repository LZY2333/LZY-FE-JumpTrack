# 技术规范

## 技术栈

| 层级 | 技术 |
|---|---|
| 框架 | React 18 + TypeScript |
| 构建 | Vite 4 |
| UI 组件 | Ant Design 4 |
| 样式 | Tailwind CSS |
| 状态管理 | Zustand |
| 路由 | React Router v6 |
| HTTP | Axios |
| Mock | vite-plugin-mock（仅 dev server） |

## 路径别名

`@/` 指向 `src/`，所有跨目录引用使用别名，禁止使用 `../../` 相对路径。

```ts
import useAuthStore from '@/store/useAuthStore';
import type { TaskDetail } from '@/types/task';
```

## 样式规范

**优先级：Tailwind CSS > Ant Design 覆盖（index.css）> 禁止内联样式**

- 布局、间距、颜色、字体全部用 Tailwind class
- 样式优先级：antd 内置 prop（`size`、`type` 等）> Tailwind 标准档位（`w-40`、`w-44`…）
- 禁止内联样式 `style={{ ... }}`，禁止 Tailwind 任意值（`w-[180px]`），禁止自定义 CSS class
- **例外**：`Select` 必须指定 Tailwind 标准宽度（如 `w-40`），防止因选项内容长度不同导致宽度抖动
- Ant Design 全局主题覆盖写在 `src/index.css`，使用 CSS 变量（`--ant-primary-color` 等）或类选择器，不在组件内写覆盖

## 枚举规范

所有多处复用的字符串常量定义为 TypeScript enum，统一放在 `src/types/enums.ts`：

```ts
// 正确
import { TaskStatus, Role } from '@/types/enums';
task.status === TaskStatus.PendingChecker

// 禁止
task.status === 'Pending Checker'
```

当前已定义：`TaskStatus`、`Role`、`YesNo`

## 类型规范

- 接口/类型定义放 `src/types/`
- 枚举放 `src/types/enums.ts`
- Mock 数据的接口（如 `Task`）定义在对应 mock 文件中并 export，页面直接 `import type`

## 状态管理

使用 Zustand，store 文件放 `src/store/`，命名 `use[Name]Store.ts`。

## 路由与权限

- 路由配置在 `src/router/index.tsx`
- 受保护页面用 `<PrivateRoute role={Role.Admin}>` 包裹
- `PrivateRoute` 无权限时 `<Navigate to="/" replace />`，`replace` 防止返回被拒页

## Mock

- Mock 文件放 `src/mock/`，`vite.config.ts` 中配置 `localEnabled: command === 'serve'`
- build 产物不包含 mock 逻辑
- Mock 数组为模块单例，dev server 进程存活期间状态持久（适合模拟增删改）
