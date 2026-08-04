# CIES 任务分页查询服务

这是根据《任务分页查询后端最佳实践》落地的可运行示例项目，提供：

- Spring Boot 2.7.18、Java 8、MyBatis、PageHelper。
- adapter、application、domain、infrastructure 四层结构。
- H2 内存数据库、建表 SQL 和 6 条任务示例数据。
- 参数校验、统一响应、统一异常处理和接口集成测试。
- `POST /api/cies/v1/task/getTasks` 分页、筛选和白名单排序。

## 启动

要求 JDK 8 或更高版本。项目包含 Maven Wrapper，可直接执行：

```powershell
.\mvnw.cmd spring-boot:run
```

也可以使用 Docker：

```powershell
docker build -t cies-task-service .
docker run --rm -p 8080:8080 cies-task-service
```

服务启动后：

- API：`http://localhost:8080/api/cies/v1/task/getTasks`
- H2 控制台：`http://localhost:8080/h2-console`
- JDBC URL：`jdbc:h2:mem:cies`
- 用户名：`sa`，密码为空。

## 调用示例

```powershell
$body = @{
    current = 1
    pageSize = 10
    status = 'S01'
    createTimeFrom = '2026-08-01'
    createTimeTo = '2026-08-03'
    sortField = 'transactionTime'
    sortOrder = 'asc'
} | ConvertTo-Json

Invoke-RestMethod `
    -Method Post `
    -Uri 'http://localhost:8080/api/cies/v1/task/getTasks' `
    -ContentType 'application/json' `
    -Body $body
```

也可以直接使用根目录的 `requests.http`。

## 测试

```powershell
.\mvnw.cmd test
```

集成测试覆盖默认分页、状态筛选、结束日期半开区间、排序白名单和非法参数。

## 生产数据库切换

当前配置使用 H2，仅用于本地开箱运行。接入真实 MySQL 时需要：

1. 在 `pom.xml` 中用 MySQL 驱动替换 H2。
2. 修改 `application.yml` 的数据源和 `pagehelper.helper-dialect`。
3. 生产环境关闭 H2 控制台和 SQL 自动初始化。
4. 确认交易日期字段。当前按现有数据库文档使用 `CIES_TRN_REPO_INFO.CREATE_TIME`。

排序 SQL 使用 MyBatis `<choose>` 白名单，没有使用 `${sortField}` 拼接。
