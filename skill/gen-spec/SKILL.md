---
name: gen-spec
description: 为 Java(Maven/Gradle) 项目生成或更新 AI 可读的项目说明 spec.md,目的是让能力较弱的 AI 快速“看懂”当前项目。当用户要求“生成/更新项目 spec、项目说明书、给 AI 看的项目上下文、让 AI 理解项目”时使用,调用名 /gen-spec。产出包含 如何阅读本项目、项目身份、技术栈与启动、架构总览、术语表、核心数据模型、核心流程调用链、目录结构、外部依赖与配置;所有结论必须用真实代码佐证(类/方法带 路径:行号),严禁臆造。
---

# gen-spec — Java 项目 AI 理解说明书生成器

为 **Java(Maven/Gradle)** 项目生成一份 `spec.md`,**读者是能力较弱的 AI**,目标是让它**快速看懂项目**(不要求能改代码)。
本 skill 面向弱模型,下面是**强制流程**:逐 Step 执行,不跳步,不凭印象写。

---

## 0. 铁律(违反任意一条即视为失败)

1. **不臆造**:spec 里的每个类、方法、命令、配置项、依赖、实体,都必须在项目文件里**用工具命中过**。命中不到 → 写 `<!-- TODO: 需人工确认 -->`,绝不编造。
2. **必带出处**:术语表、数据模型、调用链里写到的每个类/方法/实体,后面必须挂 `(相对路径:行号)`。没有出处不许写。
3. **命令真实**:构建/运行/测试命令必须来自真实 `pom.xml`/`build.gradle`,不许照抄本文 Demo。
4. **不遗漏**:模板的每个二级标题都要处理;无内容的板块保留标题并写 `> 暂无(<!-- TODO -->)`。
5. **不破坏已有内容**:更新已有 `spec.md` 时,无法对应模板的已有板块原样保留,只增不删(见 Step 8)。
6. **看懂导向,不臆测业务**:推断不出的业务含义,留代码事实(类名/方法名)并标 TODO,不要脑补"这大概是做什么的"。

---

## 1. 总流程总览

```
Step 1  识别构建工具(Maven / Gradle / 多模块)
Step 2  勘察项目(用 Glob/Grep 抓事实,记笔记,每条带 路径:行号)
Step 3  写「如何阅读本项目」(入口 + 阅读顺序)
Step 4  写「项目身份」(定位 / 解决什么 / 边界)
Step 5  写「技术栈与启动」「架构总览」「目录结构」
Step 6  写「术语表」「核心数据模型」(业务⇄代码映射)
Step 7  写「核心流程调用链」(主干故事线)
Step 8  判断 新建 / 刷新 / 融合,并写入 spec.md
Step 9  逐条跑自检清单
```

---

## Step 1 · 识别构建工具

用 Glob 找:`pom.xml` → Maven;`build.gradle(.kts)` → Gradle。
根 `pom.xml` 有 `<modules>` 或 `settings.gradle` 有多个 `include` → **多模块**:架构总览、目录结构、术语表里每个模块**各自成段**。

---

## Step 2 · 勘察项目(只读,先把事实抓全)

**范围**:只扫 `src/main`。**忽略** `src/test`、`target`、`build`、`out`、`*/generated*`、`.mvn`、`.idea`。

用 Grep(glob 限定 `*.java`/`pom.xml`/`*.gradle*`)依次抓,**每条结果记 `路径:行号`**:

| 要抓的事实 | Grep 模式 | 用在哪个板块 |
|---|---|---|
| 程序入口 | `@SpringBootApplication`、`public static void main` | 如何阅读、架构 |
| Web 路由 | `@RestController`、`@Controller`、`@(Get\|Post\|Put\|Delete\|Request)Mapping` | 术语表、调用链 |
| 业务服务 | `@Service`、`@Component` | 架构、调用链 |
| 数据访问 | `@Repository`、`@Mapper`、`extends JpaRepository` | 架构、调用链 |
| 领域实体 | `@Entity`、`@TableName`、`@Table`、domain/entity 包下的类 | 数据模型、术语表 |
| 实体关系 | `@OneToMany`、`@ManyToOne`、`@JoinColumn`、外键字段命名 | 数据模型 |
| 定时/异步/消息 | `@Scheduled`、`@Async`、`@KafkaListener`、`@RabbitListener` | 架构、调用链 |
| JDK 版本 | `maven.compiler.source`/`java.version`;Gradle `sourceCompatibility` | 技术栈 |
| 框架与依赖 | `pom.xml` 的 `<dependency>` / Gradle `dependencies {}` | 技术栈 |
| 配置与外部依赖 | Glob `**/application*.yml`/`*.properties`,读端口、数据源、Redis、MQ | 外部依赖与配置 |

Step 3–7 **只引用这份笔记**,不重新猜。

---

## Step 3 · 如何阅读本项目(放最前,给弱 AI 导航)

写两样东西:**入口类** + **推荐阅读顺序**。入口来自 Step 2 的 `main`/`@SpringBootApplication`。

````markdown
## 如何阅读本项目

- **入口类**:`DemoApplication` (src/main/java/com/demo/DemoApplication.java:12)
- **推荐阅读顺序**:
  1. 入口与配置:`DemoApplication`、`application.yml`
  2. 对外接口:`web/` 下的 Controller(看有哪些能力)
  3. 业务逻辑:`service/`
  4. 数据访问与实体:`mapper/`、`domain/`
- **本项目术语**见下方「术语表」,**主流程**见「核心流程调用链」。
````

---

## Step 4 · 项目身份

来源:入口类注释、`pom.xml` 的 `<description>`、README(若有)、模块名。推断不出的标 TODO。
**边界(不做什么)** 若无依据,直接写 `<!-- TODO: 需人工确认项目边界 -->`,不要编。

````markdown
## 项目身份

- **定位**:一句话说明这是什么系统。
- **解决的问题**:2–3 句,面向谁、解决什么。
- **边界(不做什么)**:明确不负责的范围,避免 AI 越界。无依据则标 TODO。
````

---

## Step 5 · 技术栈与启动 / 架构总览 / 目录结构

### 5.1 技术栈与启动

只写确认存在的依赖;命令来自真实配置。

````markdown
## 技术栈与启动

| 类别 | 技术 | 版本 | 说明 |
|------|------|------|------|
| 语言 | Java | 17 | — |
| 构建 | Maven | 3.9 | — |
| 框架 | Spring Boot | 3.2.0 | — |

**构建**：`mvn clean package`
**运行**：`java -jar target/xxx.jar`
**测试**：`mvn test`
````

### 5.2 架构总览(必须标依赖方向)

说明分层职责 + **谁能调谁**,并给一张简图。

````markdown
## 架构总览

分层与依赖方向(箭头表示“调用”):

```
web(Controller)  →  service(业务)  →  mapper(数据访问)  →  DB
                         │
                         └── domain(实体/VO/DTO,被各层引用)
```

- **web**:HTTP 入口,只做参数校验与转发,不写业务。
- **service**:业务逻辑所在。
- **mapper**:数据库读写。
- **domain**:数据载体,不含逻辑。
````

### 5.3 目录结构(用 AUTO 锚点包裹,便于刷新)

只画到**包/模块级**,每个包一句职责。多模块逐模块。

````markdown
## 目录结构

<!-- AUTO:tree start -->
```
src/main/java/com/demo
├── web/       # 控制器,HTTP 入口
├── service/   # 业务逻辑
├── mapper/    # 数据访问
├── domain/    # 实体/VO/DTO
└── config/    # 配置类
```
<!-- AUTO:tree end -->
````

---

## Step 6 · 术语表 / 核心数据模型(业务 ⇄ 代码映射)

### 6.1 术语表(★ 弱 AI 最需要的双向映射)

每个业务名词对应到代码实体,带出处。映射不确定的标 TODO。

````markdown
## 术语表

| 业务名词 | 对应代码实体 | 出处 | 说明 |
|----------|--------------|------|------|
| 订单 | `Order` | src/main/java/com/demo/domain/Order.java:10 | 订单主表实体 |
| 下单 | `OrderService#create` | src/main/java/com/demo/service/OrderService.java:40 | 创建订单的入口方法 |
````

### 6.2 核心数据模型(只列主干,关系拿不准标 TODO)

列核心实体 + 一句话职责;实体间关系**只在 Step 2 抓到 `@OneToMany` 等明确依据时才写**,否则标 TODO 让人工补。

````markdown
## 核心数据模型

| 实体 | 出处 | 职责 |
|------|------|------|
| `Order` | .../domain/Order.java:10 | 订单 |
| `OrderItem` | .../domain/OrderItem.java:8 | 订单明细 |

**实体关系**：
- `Order` 1 — N `OrderItem`（依据：OrderItem.java:15 `@ManyToOne Order`）
- 其余关系 <!-- TODO: 需人工确认 -->
````

---

## Step 7 · 核心流程调用链(主干故事线)

挑 1–3 条**最核心**主流程,画从入口到落库/返回的端到端链路,每个节点挂 `(路径:行号)`。
**调用链写法见下方「调用链写法规范」。**

````markdown
## 核心流程调用链

### 下单流程

```
HTTP POST /api/orders
  → OrderController#create   (.../web/OrderController.java:55)
  → OrderService#create      (.../service/OrderService.java:40)
      → StockService#deduct  (.../service/StockService.java:22)   # 扣库存
      → OrderMapper#insert   (.../mapper/OrderMapper.java:12)      # 落库
  ← 返回 OrderVO
```
````

---

## Step 8 · 新建 / 刷新 / 融合 判定 + 写入

先看项目根有没有 `spec.md`:

```
没有 spec.md
   └─→【新建】按完整模板用 Write 写入。

有 spec.md
   ├─ 提取已有 spec.md 全部二级标题(## ...)→「已有标题集合」
   ├─ 取模板二级标题 →「模板标题集合」(忽略大小写与首尾空格)
   │
   ├─ 模板标题集合 ⊆ 已有标题集合(模板板块都在)
   │     →【刷新】判定为本 skill 生成过。
   │        只更新动态内容:重跑 Step 5.3 替换 <!-- AUTO:tree --> 锚点内目录树;
   │        重跑 Step 7 更新调用链行号。其余文字板块不动。用 Edit 修改。
   │
   └─ 否则(有模板缺的板块)
         →【融合】
            · 已有板块原样保留,不覆盖、不删。
            · 模板有、已有没有的板块用 Edit「新增」。
            · 禁止整体重写。
```

写入规则:新建用 Write;刷新/融合**只能用 Edit**,禁止 Write 整体覆盖。直接写入,无需事先确认(除非用户另有要求)。

---

## 完整空白模板(板块顺序固定)

````markdown
# <项目名> · 项目说明(给 AI 阅读)

> 本文件供 AI 快速理解本项目。所有类/方法均标注 `路径:行号` 出处。

## 如何阅读本项目

- **入口类**:`<类名>` (<路径:行号>)
- **推荐阅读顺序**:
  1. <入口与配置>
  2. <对外接口>
  3. <业务逻辑>
  4. <数据访问与实体>

## 项目身份

- **定位**:<一句话>
- **解决的问题**:<2–3 句>
- **边界(不做什么)**:<范围,无依据标 TODO>

## 技术栈与启动

| 类别 | 技术 | 版本 | 说明 |
|------|------|------|------|
| ... | ... | ... | ... |

**构建**：`<真实命令>`
**运行**：`<真实命令>`
**测试**：`<真实命令>`

## 架构总览

```
<分层与依赖方向简图>
```

- <各层职责说明>

## 术语表

| 业务名词 | 对应代码实体 | 出处 | 说明 |
|----------|--------------|------|------|
| ... | ... | ... | ... |

## 核心数据模型

| 实体 | 出处 | 职责 |
|------|------|------|
| ... | ... | ... |

**实体关系**：
- <有 @OneToMany 等明确依据才写,否则 TODO>

## 核心流程调用链

### <流程名>

```
<端到端调用链,每节点带 路径:行号>
```

## 目录结构

<!-- AUTO:tree start -->
```
<src/main 包级目录树,每包一句职责>
```
<!-- AUTO:tree end -->

## 外部依赖与配置

| 项 | 值/来源 | 说明 |
|----|---------|------|
| server.port | 8080 | 服务端口 |
| 数据库 | <jdbc url> | <说明> |
| <Redis/MQ等> | ... | ... |
````

---

## 调用链写法规范(给弱模型的硬模板)

**格式**:`类名#方法名` + 空格 + `(相对路径:行号)`。多级用 `→` 缩进表示调用方向。

**正确 ✅**
```
OrderController#create (src/main/java/com/demo/web/OrderController.java:55)
  → OrderService#create (src/main/java/com/demo/service/OrderService.java:40)
```

**错误 ❌(立即改正)**
- `OrderService 处理订单逻辑` —— 没方法名、没出处。
- `→ 调用数据库保存` —— 没 `类#方法`、没 `路径:行号`。
- 写了 `PaymentService#pay` 但 Grep 在项目里找不到 `PaymentService` —— 臆造,删掉或标 TODO。

**自检**:每条写完反问「这个 `路径:行号` 是我刚才用工具看到的吗?」不是 → 删。

---

## 填好的 Demo(展示成品长什么样)

> 下面是**虚构**的 `demo-order` 项目结果,仅作格式参考。**真实项目内容必须来自真实勘察,不要照抄类名和命令。**

````markdown
# demo-order · 项目说明(给 AI 阅读)

> 本文件供 AI 快速理解本项目。所有类/方法均标注 `路径:行号` 出处。

## 如何阅读本项目

- **入口类**:`DemoOrderApplication` (src/main/java/com/demo/DemoOrderApplication.java:12)
- **推荐阅读顺序**:
  1. 入口与配置:`DemoOrderApplication`、`application.yml`
  2. 对外接口:`web/OrderController`
  3. 业务逻辑:`service/OrderService`、`service/StockService`
  4. 数据访问与实体:`mapper/OrderMapper`、`domain/Order`

## 项目身份

- **定位**:内部电商的订单服务。
- **解决的问题**:负责订单创建、库存扣减与订单查询,对外提供 REST 接口。
- **边界(不做什么)**:不负责支付与物流。<!-- TODO: 需人工确认边界 -->

## 技术栈与启动

| 类别 | 技术 | 版本 | 说明 |
|------|------|------|------|
| 语言 | Java | 17 | — |
| 构建 | Maven | 3.9 | — |
| 框架 | Spring Boot | 3.2.0 | Web 服务 |
| 持久层 | MyBatis | 3.0.3 | — |
| 数据库 | MySQL | 8.0 | — |

**构建**：`mvn clean package -DskipTests`
**运行**：`java -jar target/demo-order-1.0.0.jar`
**测试**：`mvn test`

## 架构总览

```
web(OrderController)  →  service(OrderService/StockService)  →  mapper(OrderMapper)  →  MySQL
                                   │
                                   └── domain(Order/OrderItem)
```

- **web**:HTTP 入口,参数校验与转发。
- **service**:下单、库存等业务逻辑。
- **mapper**:MyBatis 数据库读写。
- **domain**:实体与 VO,不含逻辑。

## 术语表

| 业务名词 | 对应代码实体 | 出处 | 说明 |
|----------|--------------|------|------|
| 订单 | `Order` | src/main/java/com/demo/domain/Order.java:10 | 订单主表 |
| 订单明细 | `OrderItem` | src/main/java/com/demo/domain/OrderItem.java:8 | 订单中的商品行 |
| 下单 | `OrderService#create` | src/main/java/com/demo/service/OrderService.java:40 | 创建订单入口 |
| 扣库存 | `StockService#deduct` | src/main/java/com/demo/service/StockService.java:22 | 下单时扣减库存 |

## 核心数据模型

| 实体 | 出处 | 职责 |
|------|------|------|
| `Order` | src/main/java/com/demo/domain/Order.java:10 | 订单 |
| `OrderItem` | src/main/java/com/demo/domain/OrderItem.java:8 | 订单明细 |

**实体关系**：
- `Order` 1 — N `OrderItem`（依据：OrderItem.java:15 `@ManyToOne Order`）

## 核心流程调用链

### 下单流程

```
HTTP POST /api/orders
  → OrderController#create   (.../web/OrderController.java:55)
  → OrderService#create      (.../service/OrderService.java:40)
      → StockService#deduct  (.../service/StockService.java:22)   # 扣库存
      → OrderMapper#insert   (.../mapper/OrderMapper.java:12)      # 落库
  ← 返回 OrderVO
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

## 外部依赖与配置

| 项 | 值/来源 | 说明 |
|----|---------|------|
| server.port | 8080 | 服务端口 |
| 数据库 | jdbc:mysql://localhost:3306/demo_order | MySQL,库名 demo_order |
````

---

## Step 9 · 写入前自检清单(逐条打勾,任意不过则修正后再写)

- [ ] 模板每个二级标题都在,空板块用 `> 暂无` 占位,未遗漏。
- [ ] 术语表、数据模型、调用链里**每个类/方法/实体**都带 `(路径:行号)`。
- [ ] 每个出处都是我**亲自用 Grep 命中**过的,没有凭空写的。
- [ ] 构建/运行/测试命令来自真实 `pom.xml`/`gradle`,不是抄 Demo。
- [ ] 架构总览标了**依赖方向**;目录结构每包有一句职责。
- [ ] 实体关系只在有 `@OneToMany` 等明确依据时才写,其余标 TODO。
- [ ] 目录结构被 `<!-- AUTO:tree start/end -->` 锚点包裹。
- [ ] 若为更新:用了 Edit 而非整体 Write;已有非模板板块原样保留。
- [ ] 拿不准处都标了 `<!-- TODO: 需人工确认 -->`,没有硬编。
