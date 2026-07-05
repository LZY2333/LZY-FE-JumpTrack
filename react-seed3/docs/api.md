# 接口文档

> 本文档描述任务池（Task Pool）相关业务接口，来源于 `src/api/tasks.ts`。
> 用户相关接口（`src/api/users.ts`）不在本文档范围内。

## 通用约定

### 请求封装

所有请求经 `src/api/request.ts`（Axios 实例）统一处理：

- `baseURL` 为空，路径即完整相对路径（如 `/api/tasks`）。
- 超时时间 `timeout: 10000`（10 秒）。

### 统一响应体

后端统一返回 `ApiResult<T>` 结构，响应拦截器会剥离 HTTP 外壳，调用方直接拿到业务体：

```ts
interface ApiResult<T = unknown> {
  code: number;   // 0 表示成功，非 0 为业务错误
  data: T;        // 业务数据
  total?: number; // 分页场景返回总条数
  msg?: string;   // 错误提示信息
}
```

### 错误处理

- `code !== 0`：拦截器弹出 `message.error(msg)` 并 reject Promise 链。
- 网络层 / HTTP 状态码错误：统一兜底提示 `请求失败（<status>）` 或 `网络异常，请稍后重试`。

---

## 接口列表

| # | 方法 | 路径 | 说明 | 前端方法 |
|---|---|---|---|---|
| 1 | POST | `/api/tasks` | 分页查询任务列表 | `getTasks` |
| 2 | GET | `/api/task/{id}` | 查询任务详情 | `getTask` |
| 3 | GET | `/api/customer/{cusId}` | 查询客户信息 | `getCustomer` |
| 4 | POST | `/api/task/{taskId}/attachment` | 上传任务附件 | `uploadAttachment` |
| 5 | POST | `/api/task/status` | 变更任务状态（提交/退回/批准/撤销） | `submitTask` / `returnTask` / `approveTask` / `cancelTask` |

---

### 1. 分页查询任务列表

- **方法与路径**：`POST /api/tasks`
- **说明**：按条件分页查询任务列表。

**请求体（TaskQuery）**

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `page` | number | 是 | 页码 |
| `pageSize` | number | 是 | 每页条数 |
| `status` | string | 否 | 任务状态过滤，见 [TaskStatus](#taskstatus) |
| `cusId` | string | 否 | 客户号 CIF 过滤 |
| `dateFrom` | string | 否 | 起始日期 |
| `dateTo` | string | 否 | 结束日期 |

**响应**：`ApiResult<Task[]>`，其中 `data` 为 [Task](#task) 数组，`total` 为总条数。

前端 `getTasks` 会将其整理为 `{ data: Task[]; total: number }`。

---

### 2. 查询任务详情

- **方法与路径**：`GET /api/task/{id}`
- **说明**：根据任务 ID 查询任务详情。

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `id` | string | 是 | 任务 ID（`taskId`） |

**响应**：`ApiResult<Task>`，`data` 为 [Task](#task)。

---

### 3. 查询客户信息

- **方法与路径**：`GET /api/customer/{cusId}`
- **说明**：根据客户号 CIF 查询客户信息。

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `cusId` | string | 是 | 客户号 CIF |

**响应**：`ApiResult<Customer>`，`data` 为 [Customer](#customer)。

---

### 4. 上传任务附件

- **方法与路径**：`POST /api/task/{taskId}/attachment`
- **说明**：上传附件，成功后由后端直接返回落库的附件信息（`fileId` / `filePath` 等）。

**路径参数**

| 参数 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `taskId` | string | 是 | 任务 ID |

**请求体**

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `fileName` | string | 是 | 文件名（取自 `File.name`） |
| `fileSize` | string | 是 | 文件大小，字节数字符串（取自 `File.size`） |

**响应**：`ApiResult<Attachment>`，`data` 为 [Attachment](#attachment)。

---

### 5. 变更任务状态

- **方法与路径**：`POST /api/task/status`
- **说明**：任务状态变更统一入口，提交 / 退回 / 批准 / 撤销均走此接口，通过 `status` 区分动作。

**请求体（TaskStatusChange）**

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `id` | string | 是 | 任务 ID |
| `status` | [TaskStatus](#taskstatus) | 是 | 目标状态 |
| `inputId` | string | 否 | 发起（Maker）柜员 ID，提交时携带 |
| `payload` | TaskStatusPayload | 否 | 提交时携带的业务数据 |

**TaskStatusPayload**

| 字段 | 类型 | 说明 |
|---|---|---|
| `customer` | [Customer](#customer) | 客户信息 |
| `attachments` | [Attachment](#attachment)[] | 附件列表 |

**前端派生方法**

| 方法 | 目标状态 | 携带字段 |
|---|---|---|
| `submitTask(id, payload, inputId)` | `submitted` | `inputId`、`payload` |
| `returnTask(id)` | `returned` | — |
| `approveTask(id)` | `approved` | — |
| `cancelTask(id)` | `cancelled` | — |

**响应**：`ApiResult`（仅关注 `code`）。

---

## 数据模型

### Task

| 字段 | 类型 | 说明 |
|---|---|---|
| `taskId` | string | 系统生成 ID（Task ID） |
| `taskName` | string | 任务名称（Task Name） |
| `taskType` | [TaskType](#tasktype) | 任务类型 |
| `taskStatus` | [TaskStatus](#taskstatus) | 任务状态（Status） |
| `cusId` | string | 客户号 CIF（Customer ID） |
| `newValue` | string | Maker 保存的草稿差异，JSON 字符串，反序列化为 `TaskNewValue`（相对 customer 变动字段，不含附件） |
| `inputId` | string | 发起（Maker）柜员 ID |
| `inputName` | string | 发起（Maker）柜员姓名 |
| `inputTime` | string | 发起（Maker）操作时间 |
| `inputBrNo` | string | 发起柜员所属分行编号 |
| `inputBrName` | string | 发起柜员所属分行名称 |
| `authoriserId` | string | 授权（Checker）柜员 ID |
| `authoriserName` | string | 授权（Checker）柜员姓名 |
| `authoriserTime` | string | 授权（Checker）操作时间 |
| `authoriserBrNo` | string | 授权柜员所属分行编号 |
| `authoriserBrName` | string | 授权柜员所属分行名称 |
| `createDate` | string | 创建日期（Created Date） |
| `lastUpdateTime` | string | 最后更新时间 |
| `remarkMsg` | string | 备注信息 |
| `attachments` | [Attachment](#attachment)[] | 附件列表（Attachments） |

> `TaskNewValue = Partial<Customer>`：`newValue` 反序列化后的结构，只包含相对 Customer 变动的字段，不含附件。

### Customer

| 字段 | 类型 | 可改动 | 必填 | 说明 |
|---|---|---|---|---|
| `cusId` | string | 否 | — | 客户号 CIF（CIF） |
| `cusCnName` | string | 否 | — | 客户姓名（中文，Customer Name CN） |
| `cusEnName` | string | 否 | — | 客户姓名（英文，Customer Name EN） |
| `cusType` | string | 否 | — | 客户类别（如 "CIES 2.0"，由是否含 Hold Code D98 决定） |
| `cusBirthDate` | string | 否 | — | 出生日期，YYYY-MM-DD（Date of Birth） |
| `bankCusRef` | string | 是 | 是 | 本行参考编号（Our Ref） |
| `govCusRef` | string | 是 | 是 | 政府机构参考编号（Your Ref） |
| `cusPrmAct` | string[] | 否 | — | 投资移民主账户（CIES Account） |
| `securityAct` | string[] | 否 | — | 证券账户（Securities Account） |
| `fundAct` | string[] | 否 | — | 基金账户（Fund Account） |
| `custodianAct` | string[] | 否 | — | 债券账户（Custodian Account） |
| `aipDate` | string | 是 | 否 | 原则上批准日期，YYYY-MM-DD（AIP Date） |
| `aipExpiryDate` | string | 否 | — | AIP 到期日期，系统按 aipDate+180 天自动计算 |
| `faDate` | string | 是 | 否 | 正式批准日期（FA Date） |
| `AnnualReportDate` | string | 条件 | 是 | 年度报告日期，原始值为空时可改、非空即锁定 |
| `terminationDate` | string | 是 | 是 | 终止委托日期，默认空字符串（界面显示 N/A） |
| `transferred3M` | [YesNo](#yesno) | 是 | 是 | 是否已转出 300 万投资额（Transferred 3M） |
| `withdrawableInterests` | Record\<string, number\> | 否 | 否 | 可支取利息，按币种分类，币种由接口动态决定 |
| `transferredInterests` | Record\<string, number\> | 是 | 否 | 已支取利息，按币种分类，币种由接口动态决定 |

### Attachment

| 字段 | 类型 | 说明 |
|---|---|---|
| `fileId` | string | 附件 ID |
| `fileName` | string | 附件文件名 |
| `filePath` | string | 附件存储路径 |
| `fileSize` | string | 附件大小，单位字节 |
| `createTime` | string | 附件上传时间 |
| `createTellerId` | string | 上传该附件的柜员 ID |

---

## 枚举

### TaskStatus

| 枚举值 | 字符串 | 说明 |
|---|---|---|
| `Pending` | `pending` | 待处理 |
| `Cancelled` | `cancelled` | 已撤销 |
| `Submitted` | `submitted` | 已提交 |
| `Returned` | `returned` | 已退回 |
| `Approved` | `approved` | 已批准 |

### TaskType

| 枚举值 | 字符串 | 说明 |
|---|---|---|
| `DailyReport` | `1` | 日报 |

### YesNo

| 枚举值 | 字符串 | 说明 |
|---|---|---|
| `Yes` | `Y` | 是 |
| `No` | `N` | 否 |
