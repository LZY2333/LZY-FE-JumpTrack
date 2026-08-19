# 示例接口文档

本项目只保留任务列表、任务详情和任务更新三个业务接口，用于演示请求封装、分页查询、详情加载和状态流转。默认开发模式由本地 Mock 提供数据。

## 通用响应

```ts
interface ApiResult<T> {
  returnCode: string;
  body?: T;
  errorMsg?: string;
}
```

`returnCode = "SUC0000"` 表示成功，其余状态码由请求拦截器统一提示。

## 接口清单

| 方法 | 路径                             | 用途                   |
| ---- | -------------------------------- | ---------------------- |
| POST | `/api/example/v1/tasks/query`    | 分页查询任务           |
| GET  | `/api/example/v1/tasks/{taskId}` | 查询任务详情           |
| POST | `/api/example/v1/tasks/{taskId}` | 更新任务字段与状态     |
| GET  | `/api/example/v1/users/current`  | API 模式下获取当前用户 |

## 分页查询

`POST /api/example/v1/tasks/query`

请求体支持：

- `current`、`pageSize`：分页参数。
- `status`、`taskId`、`taskName`：精确或模糊筛选。
- `createTimeFrom`、`createTimeTo`、`updateTimeFrom`、`updateTimeTo`：日期范围。
- `sortField`、`sortOrder`：排序字段与方向。

响应体为 `PagedTasks`，包含 `list`、`current`、`pageSize` 和 `total`。

## 查询详情

`GET /api/example/v1/tasks/{taskId}`

响应体为单个 `Task`。不存在时返回 `ERR0404`。

## 更新任务

`POST /api/example/v1/tasks/{taskId}`

```ts
interface TaskUpdate {
  taskStatus: TaskStatus;
  operatorId: string;
  taskName?: string;
  description?: string;
  taskRemark?: string;
}
```

同一接口承载提交、退回、批准和取消，避免为每个动作拆分重复端点。
