# CIPS Message Manager

面向 CIPS 报文接入、解析、查询和后续组报能力的 Java 8 后端。当前完成项目骨架、MySQL 连接配置、安全 StAX 解析基础设施，以及前端 `docs/api文档.md` 的第一个分页查询接口。

## 技术栈

- JDK 8、Maven、Spring Boot 2.7.18
- Spring MVC、Jackson、Tomcat、Logback、Validation、Spring Transaction
- MyBatis-Plus 3.5.17、`mybatis-plus-jsqlparser-4.9`（JSqlParser 4.9）
- MySQL Connector/J 8.0.33、HikariCP
- MapStruct 1.6.3
- JDK StAX

## CIPS 报文认知

CIPS 为跨境和离岸人民币支付、金融市场等业务提供清算结算服务。CIPS 报文标准基于 ISO 20022 方法编制，报文按支付清算、金融市场、账户及现金管理、流动性管理、系统管理和通用信息等领域组织。报文采用 UTF-8，生产解析必须禁用 DTD 与外部实体，并以具体 CIPS 版本的 XSD、栏位约束和业务实施指南作为校验依据。

本项目已经提供 `StaxCipsMessageParser`，用于流式提取命名空间、报文定义标识、`MsgId`、`CreDtTm` 和 `UETR`，并对 XML 大小、DTD、实体引用和外部实体做失败关闭。它是后续按报文类型注册专用解析器的基础，不代替 XSD 和业务规则校验。

## 分层

```text
adapter/web                 HTTP 适配与协议包装
application/api            应用服务接口及请求/响应 DTO
application/assembler      MapStruct 应用对象转换
application/service        用例编排、时区及输入规范化、只读事务
domain/message             报文领域模型与持久化端口
infrastructure/message     MyBatis 查询、PO、转换与端口实现
infrastructure/common      配置、错误码、异常处理
infrastructure/xml         安全 StAX 解析基础设施
```

未创建与当前用例无关的 `User`、Feign 和线程池样板类；后续出现实际业务用例时再沿相同边界增加，避免空抽象。

## 已实现接口

```http
POST /api/example/v1/messages/query
Content-Type: application/json
```

后端学习时可从代码中的 `【1:...】` 顺序注释开始阅读，完整调用链、各层职责和调试建议见
[`docs/message-query-call-chain.md`](docs/message-query-call-chain.md)。

最小请求：

```json
{
  "msgDirection": "IN",
  "current": 1,
  "pageSize": 10
}
```

主要约束：

- `msgDirection` 必填，且收报/发报状态及归属条件互斥。
- `tranId` 仅支持 `PAY`。
- `tranId`、金额或币种任一有值时，`businessType` 必填。
- `OTHER` 不支持金额和币种。
- `pageSize` 只允许 `10/20/50/100`；排序字段和方向均为枚举白名单。
- 前端提交的 UTC 日期边界会按 `cips.business-zone-id`（默认 `Asia/Shanghai`）还原为 MySQL `DATE` 自然日。

## 金额列表查询策略

不要求普通列表必须传 `businessType`。基础分页只查询 `PSSST_ENT_BASIC_INFO` 与方向对应的收/发主表；取到当前页后，再按 `PAY/BILL/QUERY` 分组批量查询最多三张金额来源表。单页最多 100 条，因此金额展示最多增加三次有界的主键批量查询，不会联查六张详情表，也不会造成一对多明细行膨胀。

只有传入金额、币种或 `tranId` 时，基础查询才通过 `EXISTS` 访问所选业务类型对应的一张表。`BILL_DETAIL`、`PAY_PARTY`、`QUERY_INFO` 不参与列表金额查询，它们只属于详情用例。

## 数据库连接

项目不包含建库和建表脚本。连接项通过环境变量覆盖：

```text
CIPS_DB_URL
CIPS_DB_USERNAME
CIPS_DB_PASSWORD
CIPS_DB_POOL_MAX_SIZE
CIPS_BUSINESS_ZONE_ID
```

示例启动：

```powershell
$env:CIPS_DB_URL = 'jdbc:mysql://127.0.0.1:3306/cips?useUnicode=true&characterEncoding=UTF-8&serverTimezone=Asia%2FShanghai&useSSL=false'
$env:CIPS_DB_USERNAME = 'cips'
$env:CIPS_DB_PASSWORD = 'replace-me'
mvn spring-boot:run
```

Hikari 使用 `initialization-fail-timeout=-1`，因此未建库时应用上下文和测试仍可装配；真正调用查询接口时必须有可用数据库。

## 建表前必须确认

1. 数据库文档的支付表物理名冲突：表清单是 `PSSST_ENT_PAY_INFO/PSSST_ENT_PAY_PARTY`，字段章节是 `PSSST_ENT_MSG_PAY_DTL/PSSST_ENT_MSG_PAY_PARTY`。当前 SQL 按表清单采用 `PSSST_ENT_PAY_INFO`；建表前必须统一物理名。
2. `PSSST_ENT_BASIC_INFO.BUSINESS_TYPE` 在表设计中非空，但前端 API 又定义“未分类为 null”。需要确定解析中的报文是否允许先入基本表、后分类；这会决定字段是否可空以及状态约束。
3. 发报状态 `S01-S04` 在前端文档中仍是临时枚举，需要业务确认。
4. CIPS 金额类型是最多 16 位整数、固定 2 位小数且不带正负号。现有表设计把金额设为 `VARCHAR(20)`，范围查询只能正则校验后 `CAST`，无法有效使用数值索引。建议建表时把 `REMIT_AMOUNT`、`NETTING_AMOUNT`、`GPI_AMOUNT` 统一改为 `DECIMAL(18,2)`，并确认账单轧差净额的借贷方向是否由独立字段表达。
5. 普通列表不应强制 `businessType`；真正影响大数据量性能的是“无日期、无精确编号却要求精确 total”的全量查询。建议确认是否在生产上要求最近三个月日期范围，或至少要求 `msgId/msgBusinessNo/UETR` 之一。

## 验证

```powershell
mvn test
mvn package
```

测试覆盖接口响应、跨字段规则、业务时区换算、MyBatis 动态 SQL 的业务表访问范围、Spring/MyBatis/MapStruct 装配，以及 StAX 正常解析与 XXE 拒绝。

## 官方参考

- [CIPS 服务与报文标准](https://www.cips.com.cn/kjjqgs/cipsfw/)
- [人民币跨境支付系统业务规则](https://www.cips.com.cn/eportal/ui?articleKey=35735e8044344ea1a73ab3fda1f555f8&columnId=43753&pageId=44397)
- [ISO 20022 报文目录](https://www.iso20022.org/catalogue-messages)
- [MyBatis-Plus 安装与 JDK 8/JSqlParser 4.9 依赖说明](https://baomidou.com/getting-started/install/)
- [MapStruct Maven 安装说明](https://mapstruct.org/documentation/installation/)
