# CIES 前端开发任务清单

> 每项任务独立可验证，完成后勾选 `[x]`。随时中断，下次从第一个 `[ ]` 继续。

---

## 约定

- **Mock 数据**统一放 `src/mock/`，通过 `vite-plugin-mock` 挂载
- **状态管理**用 Zustand，仅存当前用户信息（模拟登录角色）
- **组件**按页面目录组织，公共部分提取到 `src/components/`
- **验证**：每项任务完成后，按"验证步骤"手动过一遍，通过再勾选

---

## 阶段 0：基础搭建

### T-01 Mock 服务配置

- [ ] 检查 `vite.config.ts` 中已引入 `vite-plugin-mock`；如未引入则配置
- [ ] 创建 `src/mock/index.ts` 作为 mock 入口
- [ ] 创建 `src/mock/tasks.ts`：5 条任务列表数据（含 Pending/Return/Done 状态，2 条到期天数 ≤2）
- [ ] 创建 `src/mock/taskDetail.ts`：1 条完整任务详情（含客户信息、账户、可编辑字段、附件列表、modifiedFields）
- [ ] 创建 `src/mock/users.ts`：4 条用户数据（含 maker/checker/admin 权限字段）

**验证：** 启动 `npm run dev`，浏览器访问 `/api/tasks`、`/api/task/T0001`、`/api/users` 均返回 JSON 数据

---

### T-02 路由结构

- [ ] 在 `src/router/index.tsx` 配置 4 条路由：
  - `/` → TaskPool
  - `/task/:id/maker` → MakerPage
  - `/task/:id/checker` → CheckerPage
  - `/admin/permissions` → PermissionAdmin
- [ ] 创建 4 个页面的空壳组件（只显示页面标题）
- [ ] `App.tsx` 引入路由，删除原有 Home/About 路由

**验证：** 手动在地址栏输入 4 条路由，每个页面显示对应标题，不报错

---

### T-03 当前用户 Store

- [ ] 创建 `src/store/useAuthStore.ts`，存储 `{ id, name, roles }`
- [ ] 初始值为 `{ id: 'U003', name: '王五', roles: ['maker', 'checker'] }`
- [ ] 页面右上角加角色切换下拉（开发用）：可在 U001(maker)/U002(checker)/U003(maker+checker)/U004(admin) 间切换

**验证：** 切换到 U001，roles 只有 `['maker']`；切换到 U004，roles 只有 `['admin']`

---

### T-04 Layout 与菜单

- [ ] 左侧 Sider 菜单：**Task Pool**（所有角色可见）、**权限配置**（仅 admin 可见）
- [ ] 顶部显示当前用户名 + 角色切换下拉
- [ ] 点击菜单项跳转对应路由

**验证：** 切换为非 admin 角色，侧边栏不显示"权限配置"菜单项；切换为 admin 则显示

---

## 阶段 1：Task Pool

### T-05 任务列表表格

- [ ] 用 `axios` 请求 `/api/tasks`，用 Ant Design `Table` 渲染
- [ ] 列：Ref No / Customer Name / 发起日期 / 状态（Badge 区分颜色）/ 到期天数
- [ ] 到期天数 ≤2 时，该列文字显示红色

**验证：** 页面显示 5 条数据，2 条到期天数红色；状态列颜色：Pending=蓝、Return=橙、Done=绿

---

### T-06 状态筛选 + 日期筛选

- [ ] 表格上方加：Select（全部/Pending/Return/Done）+ DatePicker.RangePicker
- [ ] 前端过滤，不重新请求接口

**验证：** 选"Return"只显示 Return 状态行；选日期范围只显示范围内任务；重置后恢复全部

---

### T-07 到期提醒弹窗

- [ ] 页面加载后检查到期天数 ≤2 的任务
- [ ] 有则弹 Modal，标题"任务即将到期"，列出对应 Ref No
- [ ] 点击确认后关闭，当次会话不再弹（`sessionStorage` 标记）

**验证：** 刷新页面弹窗出现，列出到期任务 Ref No；点确认关闭；同一会话内再刷新不再弹

---

### T-08 双击跳转任务详情

- [ ] 表格行 `onRow` 绑定 `onDoubleClick`
- [ ] 当前用户 roles 含 `maker` → 跳 `/task/:id/maker`
- [ ] 当前用户 roles 仅含 `checker` → 跳 `/task/:id/checker`

**验证：** 切换为 U001(maker) 双击 → maker 页；切换为 U002(checker) 双击 → checker 页；U003(双角色) → maker 页

---

## 阶段 2：Maker 处理页面

### T-09 页面布局

- [ ] 左侧：客户信息 + 表单；右侧：附件区域
- [ ] 顶部：`← 返回` 按钮 + 任务编号标题
- [ ] 底部固定：`[Cancel]` `[Submit]` 按钮

**验证：** 页面布局与简图一致，返回按钮可跳回 Task Pool

---

### T-10 只读客户信息区域

- [ ] 请求 `/api/task/:id`，展示 Customer Type / Name / DOB / CIF / 4 个账户号
- [ ] 全部使用 `Input` 组件设 `disabled`

**验证：** 字段展示 mock 数据，点击无法输入

---

### T-11 可编辑字段表单

- [ ] 使用 Ant Design `Form`，字段：Our Ref / Your Ref / AIP Date / AIP Expiry Date / FA Date / CIES Termination Date / Transferred 3M（Radio Y/N）
- [ ] AIP Expiry Date 设为 `disabled`（系统计算）
- [ ] 初始值从接口数据填入

**验证：** 各字段可正常输入/选择；AIP Expiry Date 不可操作

---

### T-12 AIP Expiry Date 自动计算

- [ ] 监听 AIP Date 变化，CIES 2.0 类型：自动加 180 天，用 `moment` 计算并 `setFieldValue`

**验证：** AIP Date 选 `2024-12-01`，Expiry 自动显示 `2025-05-30`

---

### T-13 字段修改高亮

- [ ] 维护 `changedFields` Set，字段 onChange 时加入
- [ ] 通过 `Form.Item` 的 `className` 给变更字段加黄色边框（Tailwind `ring-2 ring-yellow-400` 或内联样式）

**验证：** 修改 Our Ref 后该字段出现黄色边框；未修改的字段无变化；AIP Expiry Date 自动计算触发也高亮

---

### T-14 利息字段

- [ ] Withdrawable Interests：HKD / USD 两行 `InputNumber`
- [ ] Transferred Interests：HKD / USD 两行 `InputNumber`
- [ ] 修改后同样高亮

**验证：** 可输入数字，修改后出现高亮

---

### T-15 附件列表展示

- [ ] 右侧面板展示 mock 附件列表（文件名 + 文件图标）
- [ ] 使用 Ant Design `List` 组件

**验证：** 显示 3 条 mock 附件（Cover Letter / Statement / Transaction）

---

### T-16 上传附件

- [ ] Ant Design `Upload` 组件，`beforeUpload` 阻止真实上传，手动追加到附件列表本地状态

**验证：** 选择本地任意文件，附件列表出现新条目

---

### T-17 删除附件

- [ ] 每条附件右侧加删除图标
- [ ] 点击弹 `Modal.confirm`，提示 "Confirm Delete"
- [ ] 确认后从列表移除，取消不操作

**验证：** 点删除 → 弹窗出现；取消 → 列表不变；确认 → 对应条目消失

---

### T-18 Submit / Cancel

- [ ] **Cancel**：直接 `navigate(-1)` 回 Task Pool，不保存
- [ ] **Submit**：调用 `/api/task/:id/submit`（mock 接口），成功后 `message.success`，跳回 Task Pool
- [ ] Task Pool 中该任务状态更新为 `Pending Checker`（mock 接口在内存中更新状态）

**验证：** Cancel 后 Task Pool 任务状态不变；Submit 后任务状态变为 `Pending Checker`，有成功提示

---

## 阶段 3：Checker 复核页面

### T-19 复用表单组件（只读模式）

- [ ] 将 Maker 的表单区域提取为 `src/components/TaskForm/index.tsx`，接受 `readonly?: boolean` prop
- [ ] `readonly=true` 时所有字段 disabled，隐藏 Upload/Delete 按钮
- [ ] Checker 页面使用 `<TaskForm readonly />`

**验证：** Checker 页面所有字段不可编辑，附件区域无上传/删除按钮

---

### T-20 高亮 Maker 修改过的字段

- [ ] mock 数据中 `modifiedFields: ['ourRef', 'yourRef']` 标记 Maker 改过的字段
- [ ] TaskForm 接受 `modifiedFields` prop，readonly 模式下对应字段加黄色背景高亮

**验证：** Checker 页中 Our Ref / Your Ref 有黄色背景，其余字段无

---

### T-21 Return 按钮

- [ ] 调用 `/api/task/:id/return`（mock），更新状态为 `Return`，跳回 Task Pool
- [ ] Task Pool 中任务状态变为 Return

**验证：** Return 后 Task Pool 状态变为橙色 Return

---

### T-22 Approve + 同人校验

- [ ] 从 mock 任务详情取 `makerId`，与当前用户 `id` 比较
- [ ] 相同：`message.error('Maker 与 Checker 不能为同一人')`，阻止提交
- [ ] 不同：调用 `/api/task/:id/approve`（mock），状态变 `Done`，跳回 Task Pool

**验证：**

- 切换为 mock 任务的 makerId 对应用户（U001），点 Approve → 报错提示
- 切换为其他用户（U002），点 Approve → 状态变 Done

---

## 阶段 4：权限配置页面

### T-23 用户权限表格

- [ ] 请求 `/api/users`，Ant Design Table 展示
- [ ] 列：工号 / 姓名 / Maker（Checkbox）/ Checker（Checkbox）/ 管理员（Checkbox）
- [ ] Checkbox onChange 只更新本地 state，不立即请求接口

**验证：** 展示 4 条用户，Checkbox 可点击，切换后状态反映在界面上

---

### T-24 保存权限

- [ ] 表格下方 `[保存]` 按钮
- [ ] 点击后调用 `/api/users/save`（mock），返回成功后 `message.success('保存成功')`

**验证：** 修改权限后点保存，出现成功提示

---

### T-25 管理员路由守卫

- [ ] 创建 `src/router/PrivateRoute.tsx`，检查当前用户 roles 是否包含 `admin`
- [ ] 不含则 `<Navigate to="/" replace />`
- [ ] `/admin/permissions` 路由包裹此守卫

**验证：** 切换为非 admin 角色，直接访问 `/admin/permissions` → 自动跳转到 Task Pool

---

## 完成统计

阶段 0（基础）：T-01 ~ T-04，共 4 项  
阶段 1（Task Pool）：T-05 ~ T-08，共 4 项  
阶段 2（Maker 页）：T-09 ~ T-18，共 10 项  
阶段 3（Checker 页）：T-19 ~ T-22，共 4 项  
阶段 4（权限配置）：T-23 ~ T-25，共 3 项  
**合计：25 项**
