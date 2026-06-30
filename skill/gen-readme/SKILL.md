---
name: gen-readme
description: 为 Java(Maven/Gradle) 项目生成或更新中文 README。当用户要生成/更新/补全 README、项目说明、项目文档时使用。产出偏业务与功能介绍,功能与工作流用真实的函数/类调用链佐证。
---

# gen-readme — Java 项目 README 生成器

为 **Java(Maven/Gradle)** 项目生成一份偏业务、偏功能介绍的中文 `README.md`。
读者是能力较弱的 AI。逐 Step 执行,不跳步。

---

## 0. 铁律(违反即失败)

1. 写进 README 的类/方法/命令/配置/依赖都先用工具命中、带 `路径:行号`,命不中标 `<!-- TODO: 需人工确认 -->`,不编造。
2. 模板每个二级标题都保留,空板块写 `> 暂无 <!-- TODO -->`。
3. 更新已有 README 用 Edit 只增不删,不 Write 整体覆盖。

---

## 1. 总流程总览

```
Step 1  识别构建工具
Step 2  勘察项目,抓事实记笔记,每条带 路径:行号
Step 3  写技术栈表格
Step 4  写功能地图,每条挂调用链
Step 5  写主要工作流
Step 6  写目录结构,AUTO 锚点包裹
Step 7  判定 新建/刷新/融合
Step 8  写入 README.md
Step 9  跑自检清单
```

---

## Step 1 · 识别构建工具

- Glob 找 `pom.xml` → Maven;`build.gradle(.kts)` → Gradle。
- 根 `pom.xml` 有 `<modules>` 或 `settings.gradle` 有多个 `include` → 多模块:功能地图、目录结构里每个模块各自成段。

---

## Step 2 · 勘察项目

只扫 `src/main`,忽略 `src/test`、`target`、`build`、`out`、`*/generated*`、`.mvn`、`.idea`。

用 Grep(glob 限 `*.java`/`pom.xml`/`*.gradle*`)依次抓,每条结果记 `路径:行号`:

| 要抓的事实 | Grep 模式 |
|---|---|
| 程序入口 | `@SpringBootApplication`、`public static void main` |
| Web 入口/路由 | `@RestController`、`@Controller`、`@RequestMapping`、`@(Get\|Post\|Put\|Delete)Mapping` |
| 业务服务 | `@Service`、`@Component` |
| 数据访问 | `@Repository`、`@Mapper`、`extends JpaRepository` |
| 定时/异步任务 | `@Scheduled`、`@Async` |
| 消息/事件 | `@KafkaListener`、`@RabbitListener`、`@EventListener` |
| JDK 版本 | `pom.xml` 的 `maven.compiler.source`/`java.version`;Gradle `sourceCompatibility` |
| 框架与依赖 | `pom.xml` 的 `<dependency>` / Gradle `dependencies {}` |
| 配置项 | Glob `**/application*.yml`/`*.properties`,读端口、数据源、关键开关 |

Step 3–6 只引用这份笔记,不重新猜。

---

## Step 3 · 写技术栈表格

只写确认存在的依赖,从真实依赖与版本提取,版本读不到写 `-`。列名固定:

```markdown
## 技术栈

| 类别 | 技术 | 版本 | 说明 |
|------|------|------|------|
| 语言 | Java | 17 | — |
| 构建 | Maven | 3.9 | — |
| 框架 | Spring Boot | 3.2.0 | Web/自动装配 |
| 持久层 | MyBatis-Plus | 3.5.5 | — |
| 数据库 | MySQL | 8.0 | — |
```

---

## Step 4 · 功能地图(只列页面级/模块级功能,每条挂代表性调用链)

**粒度铁律:层级拉高,只列「页面级」功能,不拿小功能凑数。**
类比前端项目——只介绍页面级组件,不会把每个按钮、每个小弹窗都列出来。后端对应:

- **一条功能 = 一个业务模块 / 一块完整能力**,通常对应一个 Controller(或一组紧密相关的路由),如「订单管理」「用户认证」「商品库存」。
- **不要逐接口、逐方法列**:同一模块下的增删改查、导入导出、分页查询等下属操作,**合并进同一条功能**用一句话概述,不各自单列。
- **宁缺毋滥**:模块少就少写几条,严禁把小操作拆出来凑数。

**来源**:以 `@RestController`/`@Controller` 类(及其 `@RequestMapping` 根路径)为单位聚合,一个 Controller 归纳成一条功能;多个 Controller 同属一个业务域时可再上提合并。

**每条功能**:功能名(业务语言)+ 一句话能力概述 + **一条代表性主链路调用链**(挑该模块最核心的入口方法,从 Controller 到落库/返回,不必把模块下每个接口都挂)。

**写法规范见下方「调用链写法规范」。** 推断不出业务含义的,功能名留类名,并标 `<!-- TODO: 业务含义需人工确认 -->`。

```markdown
## 功能地图

- **用户认证**:登录签发 Token、登出、Token 刷新等账号鉴权能力
  - 代表链路:`AuthController#login` (src/main/java/com/demo/web/AuthController.java:42)
    → `AuthService#authenticate` (src/main/java/com/demo/service/AuthService.java:30)
    → `UserMapper#selectByUsername` (src/main/java/com/demo/mapper/UserMapper.java:18)
- **订单管理**:订单的创建、查询、取消等全生命周期管理
  - 代表链路:`OrderController#create` (.../web/OrderController.java:55)
    → `OrderService#create` (.../service/OrderService.java:40)
```

---

## Step 5 · 写主要工作流

挑 1–3 条最核心的业务主流程,画从入口到落库/返回的完整链路,每个节点挂 `(路径:行号)`。

````markdown
## 主要工作流

### 下单流程

```
HTTP POST /api/orders
  → OrderController#create            (.../web/OrderController.java:55)
  → OrderService#create              (.../service/OrderService.java:40)
      → StockService#deduct          (.../service/StockService.java:22)   # 扣库存
      → OrderMapper#insert           (.../mapper/OrderMapper.java:12)      # 落库
  ← 返回 OrderVO
```
````

---

## Step 6 · 写目录结构

只画 `src/main` 到包/模块级,过深则省略,不列到每个 .java。多模块逐模块画。用锚点包裹,刷新时才能精确替换:

````markdown
## 目录结构

<!-- AUTO:tree start -->
```
src/main/java/com/demo
├── web/         # 控制器,HTTP 入口
├── service/     # 业务逻辑
├── mapper/      # 数据访问
├── domain/      # 实体/VO/DTO
└── config/      # 配置类
```
<!-- AUTO:tree end -->
````

---

## Step 7 · 判定 新建/刷新/融合

先看项目根有没有 `README.md`:

```
没有 README.md
   └─→【新建】按完整模板写入。

有 README.md(只比二级标题文字集合,忽略大小写与首尾空格)
   ├─ 提取已有 README 全部二级标题 →「已有标题集合」
   ├─ 取模板二级标题 →「模板标题集合」
   │
   ├─ 模板标题集合 ⊆ 已有标题集合 → 【刷新】本 skill 生成过:
   │     只更新动态内容——重跑 Step 6 替换 <!-- AUTO:tree --> 锚点内目录树,
   │     重跑 Step 4/5 更新调用链行号,其余文字板块不动。
   │
   └─ 否则(有模板缺的板块) → 【融合】:
         已有板块原样保留;模板有、已有没有的板块用 Edit 新增;不整体重写。
```

---

## Step 8 · 写入 README.md

- 新建:用 Write 写完整文件。
- 刷新/融合:用 Edit 局部修改,不 Write 整体覆盖。
- 直接写入,无需事先确认。

---

## 完整空白模板(板块顺序固定)

````markdown
# <项目名>

> 一句话说明这个项目是做什么的(从入口类注释 / pom 的 <description> / 业务推断,推不出标 TODO)。

## 项目简介

<2–4 句:解决什么业务问题、面向谁。无依据则标 TODO。>

## 功能地图

<见 Step 4:只列页面级/模块级功能,一个 Controller/业务模块归纳成一条,挂一条代表性主链路;不逐接口、逐方法凑数>

## 主要工作流

<见 Step 5>

## 技术栈

| 类别 | 技术 | 版本 | 说明 |
|------|------|------|------|
| ... | ... | ... | ... |

## 环境与启动

**环境要求**
- JDK <版本>
- <Maven/Gradle> <版本>
- <数据库/中间件,从配置推断>

**构建**
```bash
<真实命令,如 mvn clean package / ./gradlew build>
```

**运行**
```bash
<真实命令,如 mvn spring-boot:run / java -jar target/xxx.jar / ./gradlew bootRun>
```

**测试**
```bash
<真实命令,如 mvn test>
```

## 目录结构

<!-- AUTO:tree start -->
```
<src/main 包级目录树>
```
<!-- AUTO:tree end -->

## 配置说明

| 配置项 | 默认值 | 说明 |
|--------|--------|------|
| server.port | 8080 | 服务端口 |
| ... | ... | ... |
````

---

## 调用链写法规范

格式:`类名#方法名` + 空格 + `(相对路径:行号)`。多级用 `→` 缩进表示调用方向。

**正确 ✅**
```
OrderController#create (src/main/java/com/demo/web/OrderController.java:55)
  → OrderService#create (src/main/java/com/demo/service/OrderService.java:40)
```

**错误 ❌(立即改正)**
- `OrderService 处理订单逻辑` —— 没方法名、没出处。
- `→ 调用数据库保存` —— 没 `类#方法`、没 `路径:行号`。
- 写了 `PaymentService#pay` 但 Grep 在项目里找不到 `PaymentService` —— 臆造,删掉或标 TODO。

写完每条反问一句「这个 `路径:行号` 是我刚用工具看到的吗?」不是就删。

---

## 填好的 Demo(展示成品长什么样)

> 下面是**虚构**的 `demo-order` 项目结果,仅作格式参考。真实内容必须来自真实勘察,不要照抄类名和命令。

````markdown
# demo-order

> 一个基于 Spring Boot 的订单服务,提供下单、库存扣减与订单查询接口。

## 项目简介

面向内部电商后台,负责订单的创建与状态管理。对外暴露 REST 接口,持久化到 MySQL。

## 功能地图

- **创建订单**:校验库存后生成订单并落库
  - `OrderController#create` (src/main/java/com/demo/web/OrderController.java:55)
    → `OrderService#create` (src/main/java/com/demo/service/OrderService.java:40)
    → `StockService#deduct` (src/main/java/com/demo/service/StockService.java:22)
- **查询订单**:按 ID 查询订单详情
  - `OrderController#get` (src/main/java/com/demo/web/OrderController.java:78)
    → `OrderService#getById` (src/main/java/com/demo/service/OrderService.java:66)

## 主要工作流

### 下单流程

```
HTTP POST /api/orders
  → OrderController#create   (.../web/OrderController.java:55)
  → OrderService#create      (.../service/OrderService.java:40)
      → StockService#deduct  (.../service/StockService.java:22)   # 扣库存
      → OrderMapper#insert   (.../mapper/OrderMapper.java:12)      # 落库
  ← 返回 OrderVO
```

## 技术栈

| 类别 | 技术 | 版本 | 说明 |
|------|------|------|------|
| 语言 | Java | 17 | — |
| 构建 | Maven | 3.9 | — |
| 框架 | Spring Boot | 3.2.0 | Web 服务 |
| 持久层 | MyBatis | 3.0.3 | — |
| 数据库 | MySQL | 8.0 | — |

## 环境与启动

**环境要求**
- JDK 17
- Maven 3.9+
- MySQL 8.0(库名 `demo_order`)

**构建**
```bash
mvn clean package -DskipTests
```

**运行**
```bash
java -jar target/demo-order-1.0.0.jar
```

**测试**
```bash
mvn test
```

## 目录结构

<!-- AUTO:tree start -->
```
src/main/java/com/demo
├── web/       # 控制器,HTTP 入口
├── service/   # 业务逻辑(下单、库存)
├── mapper/    # MyBatis 数据访问
├── domain/    # 实体与 VO
└── config/    # 配置类
```
<!-- AUTO:tree end -->

## 配置说明

| 配置项 | 默认值 | 说明 |
|--------|--------|------|
| server.port | 8080 | 服务端口 |
| spring.datasource.url | jdbc:mysql://localhost:3306/demo_order | 数据库地址 |
````

---

## Step 9 · 写入前自检(逐条打勾,不过就先改)

- [ ] 模板每个二级标题都在,空板块用 `> 暂无` 占位。
- [ ] 功能地图/工作流里每个方法都带 `路径:行号`,都是亲自 Grep 命中的。
- [ ] 构建/运行/测试命令来自真实 `pom.xml`/`gradle`,不是抄 Demo。
- [ ] 技术栈表格里的依赖都在真实依赖列表里。
- [ ] 目录结构被 `<!-- AUTO:tree start/end -->` 锚点包裹。
- [ ] 更新时用了 Edit 而非整体 Write,已有非模板板块原样保留。
- [ ] 拿不准处都标了 `<!-- TODO: 需人工确认 -->`。
