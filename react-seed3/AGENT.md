# 全局规范

## 技术栈

| 层级       | 技术                              |
| ---------- | --------------------------------- |
| 框架       | React 18 + TypeScript             |
| 构建       | Vite 4                            |
| UI 组件    | Ant Design 4                      |
| 样式       | Tailwind CSS                      |
| 状态管理   | Zustand                           |
| 路由       | React Router v6                   |
| Keep Alive | react-activation                  |
| HTTP       | Axios                             |
| Mock       | vite-plugin-mock（仅 dev server） |

## 路径别名

`@/` 指向 `src/`，所有跨目录引用使用别名，禁止使用 `../../` 相对路径。

```ts
import useUserStore from '@/store/useUserStore';
import type { TaskDetail } from '@/types/task';
```

## 环境变量

- Vite 配置读取 `.env.[mode]` 时统一使用 `loadEnv`；操作系统、启动命令或 CI 注入的变量通过 `process.env` 获取
- 浏览器端需要环境配置时，由 Vite 配置读取并通过 `define` 注入类型明确的常量
- `SERVER_` 前缀变量仅限 Vite 配置或 Node 脚本使用，禁止通过 `define` 注入浏览器

## 命名规范

| 目录              | 文件夹命名                 | 文件命名                           |
| ----------------- | -------------------------- | ---------------------------------- |
| `src/pages/`      | kebab-case（`task-pool/`） | `index.tsx`                        |
| `src/components/` | PascalCase（`TaskForm/`）  | `index.tsx`                        |
| `src/store/`      | —                          | camelCase（`useUserStore.ts`）     |
| `src/types/`      | —                          | camelCase（`task.ts`、`enums.ts`） |
| `src/mock/`       | —                          | camelCase（`tasks.ts`）            |

- `pages/` 用 kebab-case，与 URL 路径对应；`components/` 用 PascalCase，与组件名对应
- 每个页面/组件文件夹的主文件统一为 `index.tsx`，import 路径无需写文件名
- 非组件文件（hook、store、工具、类型）统一用 camelCase 单文件，不建文件夹
- 组件函数名始终用 PascalCase，与文件夹命名风格无关
- 事件处理函数用 `handle` 前缀命名（`handlePointerDown`），JSX 上通过 `on*` 属性绑定：`onPointerDown={handlePointerDown}`；禁止直接把处理函数命名为 `on*`
- 变量/参数禁止使用单字母命名，须使用简短的语义化单词（如 `task`、`value`、`key`）；例外：`e`（事件对象）、`x`/`y`（坐标）、`i`（循环索引）等约定俗成的单字母命名可保留
- 函数一律使用函数表达式声明（`const fn = (...) => { ... }`），禁止使用函数声明（`function fn() {}`），包括组件、hook、普通工具函数
- 使用 error-first 编码模式，优先处理错误、空值及非法状态并提前返回，再执行正常业务逻辑

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
task.status === TaskStatus.PendingChecker;

// 禁止
task.status === 'Pending Checker';
```

当前已定义：`TaskStatus`、`Role`、`YesNo`

## 类型规范

- 接口/类型定义放 `src/types/`
- 枚举放 `src/types/enums.ts`
- Mock 数据的接口（如 `Task`）定义在对应 mock 文件中并 export，页面直接 `import type`

## FormItem 与 TableColumn 复用规范

- 新增表单字段时，必须创建可复用的 `FormItem` 字段组件，并按业务类型放在 `src/components/FormItem/` 下；页面不得直接重复编写对应的 `<Form.Item>`。
- 新增表格字段时，必须创建可复用的 `TableColumn` 列配置，并按业务类型放在 `src/components/TableColumn/` 下；页面不得直接重复编写对应的列定义。
- 一个组件或列配置只对应一个业务字段。`FormItem` 组件名使用字段名的 PascalCase，`TableColumn` 导出名及 `dataIndex` 使用字段名。例如字段 `taskStatus` 对应组件 `TaskStatus` 和列配置 `taskStatus`。
- 字段自身的业务规则、校验、数据转换、展示逻辑以及下拉可选项必须内聚在对应的 `FormItem` 或 `TableColumn` 中；页面只负责组合、布局和传入上下文参数。
- 实现方式参考 `src/components/FormItem/` 与 `src/components/TableColumn/` 下的现有组件。

## 状态管理

使用 Zustand，store 文件放 `src/store/`，命名 `use[Name]Store.ts`。

## 路由与权限

- 路由配置在 `src/router/index.tsx`
- 受保护页面用 `<PrivateRoute role={Role.Admin}>` 包裹
- `PrivateRoute` 无权限时 `<Navigate to="/" replace />`，`replace` 防止返回被拒页

## Mock

- Mock 文件放 `mock/`；`npm run dev` 默认将 `/api` 代理到本地后端，`npm run dev:mock` 通过 `VITE_USE_MOCK=true` 启用 Mock
- build 产物不包含 mock 逻辑
- Mock 数组为模块单例，dev server 进程存活期间状态持久（适合模拟增删改）

## 后端代码生成规范

- 后端代码全部在 `react-seed3/spring-boot-src-generator/src` 下
- 生成或修改当前项目的后端代码前，必须先完整阅读 `react-seed3/spring-boot-src-generator/` 目录下的所有文档，并遵循其中的项目结构与编码规范。
