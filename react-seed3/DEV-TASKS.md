# CIES 前端开发任务清单

> 每项任务独立可验证，完成后勾选 `[x]`。随时中断，下次从第一个 `[ ]` 继续。

---

## 约定

- **Mock 数据**统一放 `src/mock/`，通过 `vite-plugin-mock` 挂载
- **状态管理**用 Zustand，仅存当前用户信息（模拟登录角色）
- **组件**按页面目录组织，公共部分提取到 `src/components/`
- **验证**：每项任务完成后，按"验证步骤"手动过一遍，通过再勾选

---

## 阶段 0：基础搭建 ✓

### T-01 Mock 服务配置

- [x] `vite.config.ts` 引入 `vite-plugin-mock`
- [x] 创建 `src/mock/index.ts`、`tasks.ts`、`taskDetail.ts`、`users.ts`

**验证：** `/api/tasks`、`/api/task/T0001`、`/api/users` 均返回 JSON

---

### T-02 路由结构

- [x] `src/router/index.tsx` 配置 4 条嵌套路由（MainLayout 为父）
- [x] 创建 4 个页面空壳组件

---

### T-03 当前用户 Store

- [x] `src/store/useUserStore.ts`，存 `{ id, name, roles }`，默认 U003
- [x] Header 右上角角色切换下拉

---

### T-04 Layout 与菜单

- [x] `src/layouts/MainLayout.tsx`：Sider + Header + Outlet
- [x] Sider 菜单：Task Pool（全角色）/ 权限配置（仅 admin）
- [x] Sider 标题高度通过 `--header-height` CSS 变量与 Header 对齐

---

## 阶段 1：Task Pool ✓

### T-05 任务列表表格

- [x] axios 请求 `/api/tasks`，Table 渲染
- [x] 状态 Badge 颜色：Pending=蓝、Pending Checker=紫、Return=橙、Done=绿
- [x] 到期天数 ≤2 显示红色

---

### T-06 状态筛选 + 日期筛选

- [x] Select（全部/Pending/Pending Checker/Return/Done）+ DatePicker.RangePicker
- [x] 前端过滤

---

### T-07 到期提醒弹窗

- [x] 页面加载检查 daysUntilDue ≤2，弹 Modal 列出 Ref No
- [x] 确认后 sessionStorage 标记，同会话不再弹

---

### T-08 双击跳转

- [x] 状态为 `Pending Checker` 且有 checker 角色 → checker 页
- [x] 其余有 maker 角色 → maker 页；纯 checker → checker 页

---

## 阶段 2：MVP — 各页面可访问

> 目标：双击任务能进入各页面、看到数据、完成主流程操作。暂不做高亮/附件/自动计算等细节。

### T-09 Maker 页面布局 + TaskForm 组件

- [x] 创建 `src/components/TaskForm/index.tsx`，接受 `readonly?: boolean` 和 `modifiedFields?: string[]`
  - `readonly=false`（默认）：字段可编辑，显示 Upload / Delete 按钮
  - `readonly=true`：所有字段 disabled，隐藏 Upload / Delete，`modifiedFields` 中的字段黄色高亮
- [x] Maker 页：左侧 `<TaskForm />`，右侧附件占位区
- [x] 顶部 `← 返回` + 任务编号；底部固定 `[Cancel]` `[Submit]`

**验证：** 页面布局与简图一致，返回跳回 Task Pool

---

### T-10 只读客户信息

- [x] 请求 `/api/task/:id`，展示 Customer Type / Name / DOB / CIF / 4 个账户号
- [x] 全部 `Input disabled`

**验证：** 字段展示 mock 数据，点击无法输入

---

### T-11 可编辑字段表单

- [x] `Form` 字段：Our Ref / Your Ref / AIP Date / AIP Expiry Date（disabled）/ FA Date / CIES Termination Date / Transferred 3M（Radio Y/N）
- [x] 初始值从接口填入

**验证：** 各字段可正常输入/选择；AIP Expiry Date 不可操作

---

### T-18 Submit / Cancel

- [x] Cancel：`navigate(-1)`，不保存
- [x] Submit：POST `/api/task/:id/submit`，成功提示后跳回 Task Pool
- [x] Task Pool 中该任务状态变为 `Pending Checker`

**验证：** Cancel 不改状态；Submit 后状态变紫色 Pending Checker

---

### T-19 Checker 页面布局

- [x] 使用 `<TaskForm readonly modifiedFields={task.modifiedFields} />`
- [x] 顶部 `← 返回` + 任务编号（Checker）；底部固定 `[← Return]` `[Approve ✓]`

**验证：** 所有字段不可编辑，无上传/删除按钮

---

### T-21 Return 按钮

- [x] POST `/api/task/:id/return`，状态变 `Return`，跳回 Task Pool

**验证：** Task Pool 状态变橙色 Return

---

### T-22 Approve + 同人校验

- [x] 从接口取 `makerId`，与当前用户 id 比较
- [x] 相同 → `message.error`，阻止提交
- [x] 不同 → POST `/api/task/${id}/approve`，状态变 `Done`，跳回

**验证：** U001 点 Approve → 报错；U002 → 状态变绿色 Done

---

### T-23 权限配置表格

- [x] GET `/api/users`，Table 展示工号 / 姓名 / Maker / Checker / 管理员（Checkbox）
- [x] Checkbox 变更只更新本地 state

**验证：** 展示 4 条用户，Checkbox 可点击

---

## 阶段 3：细节完善

### T-12 AIP Expiry Date 自动计算

- [x] 监听 AIP Date 变化，CIES 2.0 类型加 180 天，`moment` 计算后 `setFieldsValue`

**验证：** AIP Date 选 `2024-12-01` → Expiry 自动显示 `2025-05-30`

---

### T-13 字段修改高亮（Maker）

- [x] 维护 `changedFields` Set，手动修改的字段 onChange 时加入（AIP Expiry Date 不加入）
- [x] 变更字段 `Form.Item` 加黄色边框（`ring-2 ring-yellow-400`）

**验证：** 修改 Our Ref 后出现黄色边框；AIP Expiry Date 自动计算时不高亮

---

### T-14 利息字段

- [x] Withdrawable Interests / Transferred Interests 各 HKD / USD 两行 `InputNumber`
- [x] 修改后同样高亮

**验证：** 可输入数字，修改后出现高亮

---

### T-15 附件列表展示

- [x] 右侧面板用 `List` 展示 mock 附件（文件图标 + 文件名）

**验证：** 显示 Cover Letter / Statement / Transaction 共 3 条

---

### T-16 上传附件

- [x] `Upload` 组件，`beforeUpload` 阻止真实上传，手动追加到本地附件列表

**验证：** 选择本地文件后列表新增条目

---

### T-17 删除附件

- [x] 每条附件右侧加删除图标，点击弹 `Modal.confirm("Confirm Delete")`
- [x] 确认后移除，取消不操作

**验证：** 弹窗出现 → 取消列表不变 → 确认条目消失

---

### T-20 Checker 高亮 Maker 修改字段

- [x] TaskForm `readonly` 模式下，`modifiedFields` 中的字段加黄色背景（逻辑已在 T-09 实现，此处验证）

**验证：** Checker 页 Our Ref / Your Ref 有黄色背景，其余无

---

### T-24 保存权限

- [x] 权限配置表格下方 `[保存]` 按钮，POST `/api/users/save`，成功提示

**验证：** 修改后点保存，出现成功提示

---

### T-25 管理员路由守卫

- [x] `src/router/PrivateRoute.tsx`：roles 不含 `admin` 则 `<Navigate to="/" replace />`
- [x] `/admin/permissions` 路由包裹此守卫

**验证：** 非 admin 直接访问 `/admin/permissions` → 自动跳转 Task Pool

---

## 完成统计

阶段 0（基础）：T-01 ~ T-04，共 4 项 ✓  
阶段 1（Task Pool）：T-05 ~ T-08，共 4 项 ✓  
阶段 2（MVP 各页面）：T-09 ~ T-11、T-18 ~ T-19、T-21 ~ T-23，共 8 项  
阶段 3（细节完善）：T-12 ~ T-17、T-20、T-24 ~ T-25，共 9 项  
**合计：25 项**
