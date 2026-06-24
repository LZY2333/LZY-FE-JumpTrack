---
name: gen-readme
description: 为 Java(Maven/Gradle) 项目生成或更新中文 README。当用户要求“生成/更新/补全 README、项目说明、项目文档”时使用,调用名 /gen-readme。产出偏业务与功能介绍,包含 环境与启动、功能地图、主要工作流、技术栈表格、目录结构 等板块;所有功能与工作流必须用真实的函数/类调用链佐证,严禁臆造。
---

# gen-readme — Java 项目 README 生成器

为 **Java(Maven/Gradle)** 项目生成一份**偏业务、偏功能介绍**的中文 `README.md`。
本 skill 面向能力较弱的模型,因此下面的步骤是**强制流程**:逐 Step 执行,不要跳步,不要凭印象写。

---

## 0. 铁律(违反任意一条即视为失败)

1. **不臆造**:README 里出现的每一个类、方法、命令、配置项、依赖,都必须在项目文件里**用工具命中过**。命中不到 → 写 `<!-- TODO: 需人工确认 -->`,绝不编造。
2. **调用链必须带出处**:功能地图、主要工作流里写到的每个方法,后面必须挂 `(相对路径:行号)`。没有出处的调用链不许写。
3. **命令必须真实**:构建/运行/测试命令必须来自 `pom.xml` / `build.gradle` 的真实配置,不许照抄本模板里的 Demo 命令。
4. **不遗漏**:模板里的每个板块都要处理;某板块确实无内容,保留标题并写一行 `> 暂无(<!-- TODO -->)`,不要整段删掉。
5. **不破坏已有内容**:更新已有 README 时,无法对应模板的已有板块**原样保留**,只增不删(见 Step 7)。

---

## 1. 总流程总览

```
Step 1  识别构建工具(Maven / Gradle / 多模块)
Step 2  勘察项目(用 Glob/Grep 把事实抓出来,记成笔记)
Step 3  提取技术栈        → 技术栈表格
Step 4  提取功能地图      → 功能地图(每条挂调用链)
Step 5  提取主要工作流    → 主要工作流(核心流程调用链)
Step 6  生成目录结构      → 目录结构(AUTO 锚点包裹)
Step 7  判断是 新建 / 刷新 / 融合
Step 8  按模板写入 README.md
Step 9  逐条跑自检清单
```

逐步说明如下。

---

## Step 1 · 识别构建工具

按顺序用 Glob 找:

- `pom.xml`            → Maven
- `build.gradle` / `build.gradle.kts` → Gradle
- `settings.gradle*` 里若有多个 `include` / 根 `pom.xml` 里有 `<modules>` → **多模块项目**

> 多模块:每个模块在「功能地图」「目录结构」里**各自成段**,不要混在一起。

---

## Step 2 · 勘察项目(只读,先把事实抓全)

**范围**:只扫 `src/main`。**忽略** `src/test`、`target`、`build`、`out`、`*/generated*`、`.mvn`、`.idea`。

依次执行(用 Grep 工具,glob 限定 `*.java` / `pom.xml` / `*.gradle*`),把结果记成笔记:

| 要抓的事实 | 怎么抓(Grep 模式) |
|---|---|
| 程序入口 | `@SpringBootApplication` 和 `public static void main` |
| Web 入口/路由 | `@RestController`、`@Controller`、`@RequestMapping`、`@(Get\|Post\|Put\|Delete)Mapping` |
| 业务服务 | `@Service`、`@Component` |
| 数据访问 | `@Repository`、`@Mapper`、`extends JpaRepository` |
| 定时/异步任务 | `@Scheduled`、`@Async` |
| 消息/事件 | `@KafkaListener`、`@RabbitListener`、`@EventListener` |
| JDK 版本 | 读 `pom.xml` 的 `maven.compiler.source`/`java.version`;Gradle 的 `sourceCompatibility` |
| 框架与依赖 | 读 `pom.xml` 的 `<dependency>` / Gradle 的 `dependencies {}` |
| 配置项 | Glob `**/application*.yml`、`**/application*.properties`,读端口、数据源、关键开关 |

**笔记里每条事实都要带 `路径:行号`**,Step 3–6 直接引用,不重新猜。

---

## Step 3 · 技术栈(输出 md-table)

只写**确认存在**的依赖。从 `pom.xml`/`gradle` 的真实依赖与版本提取,版本读不到写 `-`。

格式严格如下(列名固定):

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

## Step 4 · 功能地图(每条功能必须挂调用链)

来源优先级:Controller 路由 > Service 公共方法 > 入口 main。把它们翻译成**业务语言**,但每条后面挂代码出处。

**写法规范见下方「调用链写法规范」。** 推断不出业务含义的,功能名留类名/方法名,并标 `<!-- TODO: 业务含义需人工确认 -->`。

```markdown
## 功能地图

- **用户登录**:校验账号密码并签发 Token
  - `AuthController#login` (src/main/java/com/demo/web/AuthController.java:42)
    → `AuthService#authenticate` (src/main/java/com/demo/service/AuthService.java:30)
    → `UserMapper#selectByUsername` (src/main/java/com/demo/mapper/UserMapper.java:18)
- **订单创建**:校验库存并落库
  - `OrderController#create` (.../web/OrderController.java:55)
    → `OrderService#create` (.../service/OrderService.java:40)
```

---

## Step 5 · 主要工作流(核心业务流程的端到端调用链)

挑 1–3 条**最核心**的业务主流程,画从入口到落库/返回的完整链路。每个节点同样挂 `(路径:行号)`。

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

## Step 6 · 目录结构(用 AUTO 锚点包裹)

只画 `src/main` 到**包/模块级**(不要列到每个 .java 文件,过深则省略)。多模块逐模块画。
**必须用锚点包裹**,这样 Step 7「刷新」时能精确替换:

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

## Step 7 · 新建 / 刷新 / 融合 判定

先看项目根有没有 `README.md`:

```
没有 README.md
   └─→【新建】按完整模板写入。

有 README.md
   ├─ 提取已有 README 的全部二级标题(## ...)组成「已有标题集合」
   ├─ 取模板的二级标题组成「模板标题集合」
   │
   ├─ 模板标题集合 ⊆ 已有标题集合(模板板块都在)
   │     →【刷新】判定为本 skill 生成过。
   │        只更新动态内容:重跑 Step 6 替换 <!-- AUTO:tree --> 锚点内的目录树;
   │        重跑 Step 4/5 更新调用链(行号会变)。
   │        其余文字板块不动。
   │
   └─ 否则(有模板缺的板块)
         →【融合】
            · 已有板块:原样保留,不覆盖、不删。
            · 模板里有、已有里没有的板块:用 Edit 在合适位置「新增」。
            · 不要整体重写文件。
```

> 判定只比**二级标题文字集合**,忽略大小写与首尾空格。

---

## Step 8 · 写入 README.md

- 新建:用 Write 写完整文件。
- 刷新/融合:用 Edit 局部修改,**禁止 Write 整体覆盖**(防止误删已有内容)。
- 直接写入,不需要事先征求确认(除非用户另有要求)。

---

## 完整空白模板(板块顺序固定)

````markdown
# <项目名>

> 一句话说明这个项目是做什么的(从入口类注释 / pom 的 <description> / 业务推断,推不出标 TODO)。

## 项目简介

<2–4 句:解决什么业务问题、面向谁。无依据则标 TODO。>

## 功能地图

<见 Step 4,每条挂调用链>

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

## 调用链写法规范(给弱模型的硬模板)

**格式**:`类名#方法名` + 空格 + `(相对路径:行号)`。多级用 `→` 缩进表示调用方向。

**正确示例 ✅**
```
OrderController#create (src/main/java/com/demo/web/OrderController.java:55)
  → OrderService#create (src/main/java/com/demo/service/OrderService.java:40)
```

**错误示例 ❌(出现以下情况立即改正)**
- `OrderService 处理订单逻辑` —— ❌ 没有方法名、没有出处。
- `→ 调用数据库保存` —— ❌ 没有类#方法、没有 `路径:行号`。
- 写了 `PaymentService#pay`,但 Grep 在项目里**找不到** `PaymentService` —— ❌ 这是臆造,必须删掉或标 TODO。

**自检**:写完每条调用链,反问一句「这个 `路径:行号` 是我刚才用工具看到的吗?」不是 → 删。

---

## 填好的 Demo(展示成品长什么样)

> 下面是一个**虚构**的 `demo-order` 项目生成结果,仅作格式参考。**真实项目的内容必须来自真实勘察,不要照抄这里的类名和命令。**

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

## Step 9 · 写入前自检清单(逐条打勾,任意不过则修正后再写)

- [ ] 模板每个二级标题都在,空板块用 `> 暂无` 占位,未遗漏。
- [ ] 功能地图/工作流里**每个方法**都带 `(路径:行号)`。
- [ ] 每个调用链里的类/方法,我都**亲自用 Grep 命中过**,没有凭空写的。
- [ ] 构建/运行/测试命令来自真实 `pom.xml`/`gradle`,不是抄 Demo。
- [ ] 技术栈表格里的依赖都在真实依赖列表里。
- [ ] 目录结构被 `<!-- AUTO:tree start/end -->` 锚点包裹。
- [ ] 若为更新:用了 Edit 而非整体 Write;已有非模板板块原样保留。
- [ ] 拿不准的地方都标了 `<!-- TODO: 需人工确认 -->`,没有硬编。
