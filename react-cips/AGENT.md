# 全局规范

## 实现原则

**理解整体逻辑，使用最佳实践，而不是打补丁**

## 技术栈

| 类别       | 技术                              |
| ---------- | --------------------------------- |
| 框架       | React 18 + TypeScript             |
| 构建       | Vite 4                            |
| 路由       | React Router v6                   |
| 状态管理   | Zustand                           |
| HTTP       | Axios                             |
| UI 组件    | Ant Design 5                      |
| 样式       | Tailwind CSS                      |
| 日期处理   | Day.js                            |
| Keep Alive | react-activation                  |
| Mock       | vite-plugin-mock（仅 dev server） |

## 分层与目录职责

| 路径/模块                              | 职责                                                                                                                  |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `src/main.tsx`                         | 创建 React 根节点并挂载 `App`；非 Mock 模式下触发用户登录初始化                                                       |
| `src/App.tsx`                          | 统一挂载主题、Router、全局 Loading、Keep Alive 等应用级 Provider                                                       |
| `src/router/routes.tsx`                | 作为路由配置的唯一来源，集中维护 `RoutePath`、页面组件、标题、角色和 Keep Alive；新增页面统一在此注册                   |
| `src/router/index.tsx`                 | 根据路由配置生成路由结构，并统一接入默认 Layout、权限校验和兜底跳转                                                   |
| `src/pages/`                           | 承载具体页面的业务流程、UI 组合和页面级状态，不放置跨页面通用能力                                                     |
| `src/components/`                      | 放置跨页面复用的展示与交互组件，不承载具体页面流程                                                                    |
| `src/components/MainLayout/index.tsx`  | 承载页面共用结构和行为，例如标题、公共工具及 `Outlet`；特殊页面结构应单独封装 Layout                                   |
| `src/components/ResizableTable/`       | 统一封装列宽、拖拽、显隐、顺序和持久化；页面只提供业务列与表格数据                                                     |
| `src/api/`                             | 按业务领域定义接口地址、请求参数和响应类型，不重复实现通用请求处理                                                    |
| `src/api/request.ts`                   | 统一维护 Axios 实例、响应体解包以及业务错误和网络错误处理                                                             |
| `src/store/useUserStore.ts`            | 统一负责登录、用户信息和权限管理；页面禁止自行解析 token 或直接调用用户接口                                           |
| `src/store/useGlobalLoadingStore.ts`   | 统一管理支持并发计数的全局 Loading；业务侧通过 `startGlobalLoading()` 获取对应的清理函数                               |
| `src/store/useTaskPoolStore.ts`        | 作为跨页面触发表格刷新的实现示例；其他表格按相同模式建立独立 Store                                                    |
| `src/types/`                           | 放置跨页面共享的业务模型、枚举和常量类型                                                                              |
| `mock/`                                | 提供仅供本地开发使用的接口和可变示例数据，并复用正式接口类型                                                          |

## 页面与组件职责

- **复杂 Page 结构**：复杂 Page 组件必须至少包含一个 Hook 和一个 Util；Page 负责控制 UI（JSX），Hook 负责编排业务逻辑，不同业务逻辑拆分为不同 Hook
- **逻辑抽离优先级**：优先使用 Util 工具函数（纯函数），其次是 Hook（使用 React Hooks），最后是组件（包含 JSX）
- **就近内聚**：不要将所有抽象都放入公共文件夹；仅在当前组件使用或与其强相关的变量、type、Util、Hook 和子组件统一放在当前组件目录

## 业务逻辑规范

- **组件原生能力**：功能实现优先使用或顺应组件原生特性
- **函数逻辑顺序**：使用 error-first 编码模式，优先处理错误、空值及非法状态并提前返回，再执行正常业务逻辑
- **判断条件**：`if` 中的判断条件应基于业务语义收敛到单点，禁止随意叠加判断条件
- **派生值**：保持只读，不反向修改原始值；能够直接使用原始值时，不额外创建派生变量
- **函数声明方式**：统一使用函数表达式，例如 `const fn = (...) => { ... }`，适用于组件、Hook 和普通工具函数
- **函数组织顺序**：type及常量放顶部，核心函数前置，内部辅助函数按调用顺序集中后置，每个函数必须有简短注释说明用途。

## 类型及常量规范

- **跨页面共享类型**：统一放在 `src/types/`
- **接口请求与响应类型**：仅服务单个接口时，放在对应的 `src/api/` 文件中
- **状态、常量与枚举**：状态、常量和复用字面量统一放在 `src/types/enums.ts`
- **Mock 类型复用**：复用 `src/api/` 与 `src/types/` 中的接口类型，不重复定义业务模型

## 命名规范

- **页面目录**：`src/pages/` 下使用 kebab-case，例如 `task-pool/`
- **公共组件目录**：`src/components/` 下使用 PascalCase，例如 `MainLayout/`
- **Page/Component 主文件**：统一为 `index.tsx`，import 路径无需写文件名
- **其他文件**：统一使用 camelCase，并按业务拆分文件
- **组件函数**：始终使用 PascalCase
- **事件处理函数**：使用 `handle` 前缀，例如 `handlePointerDown`；JSX 通过 `on*` 属性绑定，例如 `onPointerDown={handlePointerDown}`
- **变量和参数**：禁止使用无语义的单字母，须使用简短的语义化单词，例如 `task`、`value`、`key`；`e`（事件对象）、`x`/`y`（坐标）、`i`（循环索引）等约定俗成的单字母命名除外

## 样式规范

- **样式优先级**：Ant Design 内置 prop > Tailwind CSS > Ant Design 样式覆盖（`src/index.css`）> 禁止内联样式
- **Ant Design 全局主题**：统一在根 `ConfigProvider` 的 `theme` 中使用 Design Token 配置，并开启 v5 CSS Variable 模式
- **Ant Design 样式覆盖**：仅当 Design Token 无法满足需求时写入 `src/index.css`；引用主题值时使用 v5 CSS 变量，例如 `--ant-color-primary`
- **禁止用法**：禁止内联样式 `style={{ ... }}`、Tailwind 任意值（如 `w-[180px]`）和自定义 CSS class
- **`Select` 宽度**：必须使用 Tailwind 标准宽度，例如 `w-40`

## 表单规范

- **空态职责**：控件自行兜底空态，页面不构造空 model
- **控件空值**：`Input`、`TextArea` 使用 `''`；`Select` 按业务含义使用 `''` 或 `undefined`；日期范围使用 `null`
- **提交清理**：提交前根据业务需要统一过滤 `''`、`null` 和 `undefined`，不直接提交原始表单值

## 【表单字段】FormItem 组件规范

- **核心目标**：字段业务规则高内聚、高复用，字段之间以及字段与 Form 之间保持低耦合
- **调用方职责**：直接放置字段或组合列，只负责布局、顺序和页面上下文，不负责字段规则
- **存放位置**：统一放在 `src/components/FormItem/`
- **文件拆分**：按业务领域拆分文件，例如任务字段放在 `task.tsx`
- **组件命名**：建议直接使用后端字段名
- **规则内聚**：组件负责该字段的所有业务规则，保证产出的数据直接是格式化好的，例如校验 rule、初始值、下拉 options、normalize 和字段联动
- **空态兜底**：组件必须自行处理空态；Page 只负责有数据时填充，不为避免表单报错而构造空 model
- **状态配置**：组件可通过 props 启用不同状态
- **字段联动**：组件可通过 `form.watch` 与依赖字段联动，同时保持解耦

## 【表格列】TableColumn 对象规范

- **核心目标**：字段业务规则高内聚、高复用，字段之间以及字段与 Table 之间保持低耦合
- **存放位置**：统一放在 `src/components/TableColumn/`
- **文件拆分**：按业务领域拆分文件

### FormItem 与 TableColumn 使用示例

```tsx
import { TaskDescription, TaskName } from '@/components/FormItem';
import { taskId, taskName, taskStatus } from '@/components/TableColumn';

<Form>
  <TaskName />
  <TaskDescription />
</Form>;

const columns = [taskId, taskName, taskStatus];
```
