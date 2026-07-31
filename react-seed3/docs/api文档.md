# 接口文档

## 通用约定

### 统一响应体

除附件下载外，JSON 接口统一返回如下结构（对应 `ApiResult<T>`）：

| 字段         | 类型   | 必填 | 说明                                     |
| ------------ | ------ | ---- | ---------------------------------------- |
| `returnCode` | string | 是   | 状态码，`SUC0000` 为成功，其余为业务错误 |
| `body`       | T      | 否   | 业务数据，失败时为空                     |
| `errorMsg`   | string | 否   | 异常信息，失败时返回                     |

附件下载接口直接返回 Blob，不使用 `ApiResult` 包装。

### 统一分页

分页接口的 `body` 在业务数据基础上附带分页信息（对应 `Pagination`）：

| 字段       | 类型   | 必填 | 说明     |
| ---------- | ------ | ---- | -------- |
| `current`  | number | 是   | 当前页码 |
| `pageSize` | number | 是   | 页容量   |
| `total`    | number | 是   | 总数     |

---

## 接口列表

| \# | 方法 | 路径 | 说明 | 前端方法 |
|---|----|--------------------|--------------|----------------------|
| 1 | POST | `/api/cies/v1/task/getTasks` | 分页查询任务列表 | `getTasks` |
| 2 | GET | `/api/cies/v1/task/{taskId}` | 查询任务信息 | `getTask` |
| 3 | GET | `/api/cies/v1/task/detail/{taskId}` | 查询明细页聚合数据 | `getTaskPageData` |
| 4 | GET | `/api/cies/v1/customer/{cusId}` | 查询客户信息 | `getCustomer` |
| 5 | GET | `/api/cies/v1/task/customer-change/{taskId}` | 查询任务保存的客户变更信息 | `getCustomerChange` |
| 6 | GET | `/api/cies/v1/task/attachments/{taskId}` | 查询任务附件列表 | `getAttachments` |
| 7 | POST | `/api/cies/v1/task/attachment/{taskId}` | 上传任务附件 | `uploadAttachment` |
| 8 | GET | `/api/cies/v1/task/attachment/download/{fileId}` | 下载附件 | `downloadAttachment` |
| 9 | POST | `/api/cies/v1/task/status` | 变更任务状态（提交/退回/批准/撤销） | `submitTask` / `returnTask` / `approveTask` / `cancelTask` |

---

## 1\. 分页查询任务列表

- **方法与路径**：`POST /api/cies/v1/task/getTasks`
- **说明**：按条件分页查询任务列表。

### 请求体

| 字段             | 类型   | 必填 | 说明                                                               |
| ---------------- | ------ | ---- | ------------------------------------------------------------------ |
| `current`        | number | 是   | 页码                                                               |
| `pageSize`       | number | 是   | 每页条数                                                           |
| `status`         | string | 否   | 任务状态过滤，见 [TaskStatus](#taskstatus)                         |
| `taskId`         | string | 否   | 任务 ID 模糊过滤                                                   |
| `cusId`          | string | 否   | 客户号 CIF 模糊过滤                                                |
| `createTimeFrom` | string | 否   | `createTime` 过滤起始日期，YYYY-MM-DD                              |
| `createTimeTo`   | string | 否   | `createTime` 过滤结束日期，YYYY-MM-DD                              |
| `transactionTimeFrom` | string | 否   | `transactionTime` 过滤起始日期，YYYY-MM-DD                    |
| `transactionTimeTo`   | string | 否   | `transactionTime` 过滤结束日期，YYYY-MM-DD                    |
| `updateTimeFrom` | string | 否   | `updateTime` 过滤起始日期，YYYY-MM-DD                              |
| `updateTimeTo`   | string | 否   | `updateTime` 过滤结束日期，YYYY-MM-DD                              |
| `sortField`      | string | 否   | 排序字段：`taskId`、`createTime`、`transactionTime` 或 `updateTime` |
| `sortOrder`      | string | 否   | 排序方向：`asc` 或 `desc`；仅在同时传入 `sortField` 时执行服务端排序 |

### 响应参数

**响应**：`ApiResult<PagedTasks>`，`body.list` 为 [Task](#task)\[\]，分页字段见[统一分页](#%E7%BB%9F%E4%B8%80%E5%88%86%E9%A1%B5)。

### 成功示例

```json {"data-theme":"githubLight"}
{
  "returnCode": "SUC0000",
  "body": {
    "list": [
      {
        "taskId": "T0001",
        "tranType": "T01",
        "taskStatus": "S01",
        "cusId": "C0001",
        "cusEnName": "Chen Wen",
        "cusCnName": "陈文",
        "makerId": "",
        "checkerId": "",
        "createTime": "2026-06-28",
        "transactionTime": "2026-05-28",
        "updateTime": "2026-07-27",
        "taskRemark": ""
      }
    ],
    "current": 1,
    "pageSize": 10,
    "total": 38
  }
}
```

### 失败示例

```json {"data-theme":"githubLight"}
{
  "returnCode": "ERR0001",
  "errorMsg": "参数错误"
}
```

---

## 2\. 查询任务信息

- **方法与路径**：`GET /api/cies/v1/task/{taskId}`
- **说明**：根据任务 ID 查询两张任务相关表联查后的精简任务信息。

**路径参数**

| 参数     | 类型   | 必填 | 说明    |
| -------- | ------ | ---- | ------- |
| `taskId` | string | 是   | 任务 ID |

**响应**：`ApiResult<Task>`，`body` 为 [Task](#task)。

---

## 3\. 查询明细页聚合数据

- **方法与路径**：`GET /api/cies/v1/task/detail/{taskId}`
- **说明**：一次返回明细页初始化需要的任务信息、原始客户信息、客户变更信息和附件元数据。该接口是页面查询模型，不扩充基础 [Task](#task) DTO。

**路径参数**

| 参数     | 类型   | 必填 | 说明    |
| -------- | ------ | ---- | ------- |
| `taskId` | string | 是   | 任务 ID |

**响应**：`ApiResult<TaskPageData>`，`body` 为 [TaskPageData](#taskpagedata)。

> 尚未保存客户变更时，`customerChange` 返回 `null`；附件仅返回元数据，文件内容仍通过下载接口获取。

---

## 4\. 查询客户信息

- **方法与路径**：`GET /api/cies/v1/customer/{cusId}`
- **说明**：根据客户号 CIF 查询客户信息。

**路径参数**

| 参数    | 类型   | 必填 | 说明       |
| ------- | ------ | ---- | ---------- |
| `cusId` | string | 是   | 客户号 CIF |

**响应**：`ApiResult<Customer>`，`body` 为 [Customer](#customer)。

---

## 5\. 查询客户变更信息

- **方法与路径**：`GET /api/cies/v1/task/customer-change/{taskId}`
- **说明**：查询任务保存的完整客户变更信息。有变更时返回结构与客户信息一致，明细页以此作为表单初始值，并与原始客户信息比较生成高亮。

**路径参数**

| 参数     | 类型   | 必填 | 说明    |
| -------- | ------ | ---- | ------- |
| `taskId` | string | 是   | 任务 ID |

**响应**：`ApiResult<Customer | null>`。有已保存变更时，`body` 为完整 [Customer](#customer)；尚未保存时为 `null`。

---

## 6\. 查询任务附件列表

- **方法与路径**：`GET /api/cies/v1/task/attachments/{taskId}`
- **说明**：查询任务关联的附件；[Task](#task) 本身不携带附件。

**路径参数**

| 参数     | 类型   | 必填 | 说明    |
| -------- | ------ | ---- | ------- |
| `taskId` | string | 是   | 任务 ID |

**响应**：`ApiResult<Attachment[]>`。

---

## 7\. 上传任务附件

- **方法与路径**：`POST /api/cies/v1/task/attachment/{taskId}`
- **说明**：上传任务附件并返回落库后的附件信息。

**路径参数**

| 参数     | 类型   | 必填 | 说明    |
| -------- | ------ | ---- | ------- |
| `taskId` | string | 是   | 任务 ID |

**请求体**

| 字段       | 类型   | 必填 | 说明               |
| ---------- | ------ | ---- | ------------------ |
| `fileName` | string | 是   | 附件文件名         |
| `fileSize` | string | 是   | 附件大小，单位字节 |

**响应**：`ApiResult<Attachment>`。

---

## 8\. 下载附件

- **方法与路径**：`GET /api/cies/v1/task/attachment/download/{fileId}`
- **说明**：根据附件 ID 下载原始文件。

**路径参数**

| 参数     | 类型   | 必填 | 说明    |
| -------- | ------ | ---- | ------- |
| `fileId` | string | 是   | 附件 ID |

**响应**：原始 Blob，不使用 `ApiResult`。前端使用 `Attachment.fileName` 保存文件。

---

## 9\. 变更任务状态

- **方法与路径**：`POST /api/cies/v1/task/status`
- **说明**：任务状态变更统一入口，提交 / 退回 / 批准 / 撤销均走此接口，通过 `taskStatus` 区分动作。

**请求体（TaskStatusChange）**

| 字段         | 类型                      | 必填 | 说明                               |
| ------------ | ------------------------- | ---- | ---------------------------------- |
| `taskId`     | string                    | 是   | 任务 ID                            |
| `taskStatus` | [TaskStatus](#taskstatus) | 是   | 目标状态                           |
| `makerId`    | string                    | 否   | Maker 柜员 ID，提交 / 撤销时携带   |
| `checkerId`  | string                    | 否   | Checker 柜员 ID，批准 / 退回时携带 |
| `taskRemark` | string                    | 否   | 任务备注，退回时用于填写退回原因   |
| `payload`    | TaskStatusPayload         | 否   | 提交时携带的业务数据               |

**TaskStatusPayload**

| 字段             | 类型                          | 说明                       |
| ---------------- | ----------------------------- | -------------------------- |
| `customerChange` | [Customer](#customer)         | 完整客户变更信息           |
| `attachments`    | [Attachment](#attachment)\[\] | 当前附件列表，每次全量提交 |

**前端派生方法**

| 方法                                        | 目标状态 | 携带字段                  |
| ------------------------------------------- | -------- | ------------------------- |
| `submitTask(taskId, payload, makerId)`      | `S02`    | `makerId`、`payload`      |
| `returnTask(taskId, checkerId, taskRemark)` | `S04`    | `checkerId`、`taskRemark` |
| `approveTask(taskId, checkerId)`            | `S03`    | `checkerId`               |
| `cancelTask(taskId, makerId)`               | `S05`    | `makerId`                 |

**响应**：`ApiResult`（仅关注 `returnCode`）。

> 同一任务的 `makerId` 与 `checkerId` 不得相同；Returned 任务只能由原 `makerId` 对应的 Maker 重新提交或撤销。

---

## 数据模型

### TaskPageData

| 字段             | 类型                          | 说明                                          |
| ---------------- | ----------------------------- | --------------------------------------------- |
| `task`           | [Task](#task)                 | 精简任务信息                                  |
| `customer`       | [Customer](#customer)         | 数据仓中的原始客户信息，用于高亮比较          |
| `customerChange` | [Customer](#customer) \| null | 任务保存的完整客户变更；尚未保存时返回 `null` |
| `attachments`    | [Attachment](#attachment)\[\] | 当前任务的附件元数据                          |

> `TaskPageData` 只用于明细页聚合查询，不是数据库实体，也不替代基础接口的独立返回类型。

### Task

| 字段         | 类型                      | 说明                     |
| ------------ | ------------------------- | ------------------------ |
| `taskId`     | string                    | 任务流水号               |
| `tranType`   | [TranType](#trantype)     | 交易类型（报送报表类型） |
| `taskStatus` | [TaskStatus](#taskstatus) | 任务状态                 |
| `cusId`      | string                    | 客户号                   |
| `cusEnName`  | string                    | 客户英文名               |
| `cusCnName`  | string                    | 客户中文名               |
| `makerId`    | string                    | 操作柜员号（Maker）      |
| `checkerId`  | string                    | 授权柜员号（Checker）    |
| `createTime` | string                    | Task Date，格式 `YYYY-MM-DD` |
| `transactionTime` | string               | Transaction Date，格式 `YYYY-MM-DD` |
| `updateTime` | string                    | Update Date，格式 `YYYY-MM-DD` |
| `taskRemark` | string                    | 任务备注（退回原因）     |

> `Task` 由任务信息表、申报交易表与客户信息联表查询返回；任务与交易通过 `REF_ID = TRAN_ID` 关联，客户信息通过 `CUS_ID` 关联。`createTime`、`transactionTime`、`updateTime` 由后端统一转换为 `YYYY-MM-DD`，前端直接展示。当前页面不使用的数据库字段不返回；数据库可空字段统一由接口转换为空字符串。

### Customer

| 字段                 | 类型                                        | 可改动   | 必填 | 说明                                       |
| -------------------- | ------------------------------------------- | -------- | ---- | ------------------------------------------ |
| `cusId`              | string                                      | 否       | —    | 客户号                                     |
| `cusPrmAct`          | string\[\]                                  | 否       | —    | 客户投资移民主账户                         |
| `ciesFlag`           | [CiesFlag](#ciesflag)                       | 否       | —    | CIES 客户标记                              |
| `cusEnName`          | string                                      | 否       | —    | 英文名                                     |
| `cusCnName`          | string                                      | 否       | —    | 中文名                                     |
| `cusBirthDate`       | string                                      | 否       | —    | 出生日期，格式 `YYYY-MM-DD`                |
| `govCusRef`          | string                                      | 是       | 是   | 投资推广署参考编号                         |
| `bankCusRef`         | string                                      | 是       | 是   | 本行参考编号                               |
| `investmentAccounts` | [InvestmentAccount](#investmentaccount)\[\] | 否       | —    | 投资账户列表；前端按 `investType` 分组显示 |
| `principleAppDate`   | string                                      | 条件允许 | 否   | 原则上批准日期；原始值为空时可修改         |
| `principleExpDate`   | string                                      | 否       | —    | 原则上批准到期日期                         |
| `formalAppDate`      | string                                      | 条件允许 | 否   | 正式批准日期；原始值为空时可修改           |
| `annualReportDate`   | string                                      | 条件允许 | 是   | 年度报告日期；原始值为空时可修改           |
| `terminationDate`    | string                                      | 是       | 否   | 终止委托日期                               |
| `capitalInvestFlag`  | [YesNo](#yesno)                             | 是       | 是   | 资本投资要求是否已满足                     |
| `withdrawnIntr`      | Record&lt;string, number&gt;                | 是       | 否   | 可支取利息，键为币种                       |
| `transferIntr`       | Record&lt;string, number&gt;                | 是       | 否   | 已转出利息，键为币种                       |

### InvestmentAccount

| 字段         | 类型                      | 说明         |
| ------------ | ------------------------- | ------------ |
| `investAct`  | string                    | 投资账户号   |
| `investType` | [InvestType](#investtype) | 投资账户类型 |

### Attachment

| 字段         | 类型   | 说明               |
| ------------ | ------ | ------------------ |
| `fileId`     | string | 附件 ID            |
| `fileName`   | string | 附件文件名         |
| `fileSize`   | string | 附件大小，单位字节 |
| `createTime` | string | 附件上传时间       |
| `createUser` | string | 上传该附件的用户   |

---

## 枚举

### TaskStatus

| 枚举值      | 字符串 | 说明   |
| ----------- | ------ | ------ |
| `Pending`   | `S01`  | 待处理 |
| `Submitted` | `S02`  | 已提交 |
| `Approved`  | `S03`  | 已批准 |
| `Returned`  | `S04`  | 已退回 |
| `Cancelled` | `S05`  | 已撤销 |

### TranType

| 枚举值                 | 字符串 | 说明                 |
| ---------------------- | ------ | -------------------- |
| `DailyReport`          | `T01`  | NCIES 日报           |
| `AnnualReport`         | `T02`  | NCIES 年报           |
| `AdHocReport`          | `T03`  | NCIES 特别报送       |
| `AipReport`            | `T04`  | NCIES 原则上批准报送 |
| `InformationAmendment` | `T05`  | NCIES 信息变更       |

### CiesFlag

| 枚举值   | 字符串    | 说明          |
| -------- | --------- | ------------- |
| `Cies10` | `CIES1.0` | CIES 1.0 客户 |
| `Cies20` | `CIES2.0` | CIES 2.0 客户 |

### InvestType

| 枚举值       | 字符串       | 说明     |
| ------------ | ------------ | -------- |
| `Securities` | `SECURITIES` | 证券账户 |
| `Funds`      | `FUNDS`      | 基金账户 |
| `Custody`    | `CUSTODY`    | 托管账户 |

### YesNo

| 枚举值 | 字符串 | 说明 |
| ------ | ------ | ---- |
| `Yes`  | `Y`    | 是   |
| `No`   | `N`    | 否   |

### Audit Type 事件详细内容

| 枚举值 | 字符串                     |
| ------ | -------------------------- |
| `D01`  | 生成日结单，创建任务       |
| `D02`  | `经办提交任务`             |
| D03    | 经办取消任务               |
| D04    | 复核同意任务，发送邮件失败 |
| D05    | 复核同意任务，发送邮件成功 |
| D06    | 复核拒绝任务               |
