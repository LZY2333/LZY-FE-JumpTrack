---
name: gen-plan
description: 为 Java(Maven/Gradle) 项目把一个改动需求沿调用链拆成由底向顶、无遗漏的有序改动计划,只规划不改代码,产出 _plan/PLAN.md。当用户要评估改动影响面、拆改动计划/任务、做改造方案、规划重构步骤时使用。首次调用带需求原文,空参调用自动续接未完成的 _plan/PLAN.md。
---

# gen-plan — Java 改动计划生成器(只规划,不改代码)

为 **Java(Maven/Gradle)** 项目,把一句"改动需求"展开成一份 **`_plan/PLAN.md`**:沿调用链找出全部受影响方法,按由底向顶排成有序、可中断续接的改动计划,交给后续执行者(人或另一个 AI)去改。
执行者是能力较弱的 AI。逐 Step 执行,不跳步。

---

## ⭐ 收到 `/gen-plan` 先做这步(最优先,不可跳过)

**第一件事:先看项目根有没有 `_plan/PLAN.md`——有就是续接,别从头生成。** 三种模式:

- **空参 `/gen-plan`** = 续接(最常见):打开 `_plan/PLAN.md`,按 **Step 0.5** 的 phase 接着没做完的往下做。
- **带需求 `/gen-plan <需求>` 且无旧文件** = 新建:走 Step 1 → 7。
- **带需求但旧计划已 `frozen`/`complete`** = 新需求:旧文件归档到 `_plan/archive/<日期>-<摘要>.md` 再新建。

---

## 0. 铁律(违反即失败)

1. 只读源码,只写 `_plan/PLAN.md`。
2. 写进计划的方法/类/字段都先 Grep/Read 命中、带 `路径:行号`,命不中标 `[!]`,不编造。
3. 只用 Grep/Read 核对,不编译、不跑测试。

---

## 1. 总流程总览

```
Step 0.5 续接判定(有 _plan/PLAN.md 就先读它,定位从哪接)
Step 1   识别构建工具 + 锁存需求原文
Step 2   定种子符号(把需求落到 2–5 个真实方法/类,带出处,拿不准标 [!])
─────────── 阶段 closure(先把"完整性"冻死)───────────
Step 3   调用链闭包 BFS(对每个符号追 调用方+被调方,入队,直到队空)
Step 4   建调用图 → 算拓扑层级 → 生成 plan 块(每块带 范围/原因/回归判定)
▶ closure 完成 → 置 phase: tasks → 停下,提示用户重开对话(也可直接续)
─────────── 阶段 tasks(逐行填具体改动,可中断续接)──────
Step 5   由底向顶(P1→Pn)给每个 plan 填一行行 task(路径:行号 — 改什么)
Step 6   生成收尾校验 task(重 Grep 每个已改方法确认零漏)
─────────────────────────────────────────────────────
Step 7   自检清单 → 队列空 + task 齐 → 置 phase: frozen
```

每完成一步 / 写一个 task,**立即写盘**。`phase` 四态:`closure` → `tasks` → `frozen` → `complete`。
前三态由本 skill 推进;`frozen`=计划做完待执行,`complete`=代码全改完(由执行的 AI 置,本 skill 不碰)。

---

## Step 0.5 · 续接判定(空参调用,或文件已存在时第一件事)

读 `_plan/PLAN.md`:

```
没有该文件 → 全新,走 Step 1。
有该文件:
  ├─ phase: frozen / complete → 已完成。带了新需求 → 归档旧文件后新建;否则告诉用户状态,不重复生成。
  ├─ phase: closure           → 阶段1没做完:回 Step 3,读「待展开队列」,非空就继续展开闭包。
  └─ phase: tasks             → 阶段2没做完:回 Step 5,找第一个还没填具体改动的 plan,接着往下填。
```

先把「需求原文」「待展开队列」「已生成的 plan/task」读进来再动手。某个 plan 只填了一半,先补全再往下走。

---

## Step 1 · 识别构建工具 + 锁存需求

- Glob 找 `pom.xml` 或 `build.gradle(.kts)`。根 `pom.xml` 有 `<modules>` 或多个 `include` → 多模块,闭包跨所有模块。
- 把用户需求原文逐字写进 frontmatter `requirement:`,一字不改。

---

## Step 2 · 定种子符号

把需求落成 2–5 个真实代码起点:

- 用需求里的实体名、动作名 Grep `*.java`(只扫 `src/main`)找候选类/方法。
- 有 `spec.md` 就先读它的「术语表」「核心流程调用链」,拿现成的业务⇄代码映射。
- 每个候选写成 `类名#方法名 (路径:行号) — 为何是起点`。
- 拿不准的标 `[!]`,列给用户确认。

````markdown
## 种子符号(改动起点)

| 种子 | 出处 | 为何是起点 | 确认 |
|------|------|-----------|------|
| `OrderService#create` | src/.../service/OrderService.java:40 | "下单时核销优惠券",从下单主流程切入 | ✅ |
| `Coupon`(需新增?) | <!-- 项目无 Coupon 类 --> | 需求提到优惠券但代码未命中,可能需新建 | [!] 待人工确认 |
````

---

## Step 3 · 调用链闭包 BFS(阶段 closure)

从种子出发,把**真正要改**的方法找全。只被牵连、本身不改的,记为上下文,不再往下追。

```
队列 = [全部已确认种子];  已展开集 = {}
while 队列非空:
    取出 S
    1) 调用方:Grep S 被谁调用/new/注入 → 入队,角色=调用方
    2) 多态:
       - S 是接口方法 → 入队 接口声明 + 全部 impl
       - S 是某 impl  → 入队 接口 + 兄弟 impl
       - S 是 @Mapper 方法 → 把它的 XML/注解 SQL 记进闭包
       - Grep `S方法名(` 命中的重载/同名,剔除不是同一个的
    3) 被调方:Read S 方法体,看它调了谁、改了哪些字段
       - 需求要改它的签名/语义 → 入队,角色=被调方
       - 只被调、本身不改     → 记一行,角色=仅上下文,不入队、不再展开
    4) 新发现不在已展开集的 → 入队,记 路径:行号 + 因何被波及
    S 放进 已展开集
队列空 → 闭包完成,phase: closure → tasks
```

**判漏自检**:每个方法都搜两类调用方——`new` 出来的、`@Autowired`/构造注入的;接口方法连 impl 一起搜。一个调用方都没搜到,就记一笔「经 Grep 未发现外部调用方」。

文件里维护:

````markdown
## 遍历进度(closure)— /gen-plan 自己续接用
- 待展开队列: [ `StockService#deduct`, `OrderMapper#insert` ]
- 已展开: [ `OrderService#create` ]
- 已发现受影响方法数: 6

## 影响闭包
| 方法 | 出处 | 因何被波及 | 角色 |
|------|------|-----------|------|
| `OrderService#create` | .../service/OrderService.java:40 | 种子 | 调用方 |
| `StockService#deduct` | .../service/StockService.java:22 | 被 create 调用,签名要变 | 被调方 |
| `OrderController#create` | .../web/OrderController.java:55 | 调用 create,需同步 | 调用方 |
| `StockMapper#selectById` | .../mapper/StockMapper.java:9 | deduct 读它,签名/语义不变 | 仅上下文(不改) |
````

角色=「仅上下文」的只留在本表,不进 plan、不进 task。

---

## Step 4 · 建调用图 → 算层级 → 生成 plan 块(阶段 closure 收尾)

把闭包里的方法连成调用图:A 调 B,记一条边 A→B。然后:

- 算层级:`层级(S) = max(S 依赖的闭包内方法的层级) + 1`;不依赖任何闭包内方法的 = 层级 1。
- 一个层级 = 一个 plan。P1 = 层级 1,最底层先改,向上 P2、P3……
- 同层方法之间没有调用边,层内 task 互不依赖、任意顺序。
- 图算不清就退化按架构层粗分:domain/util 在底,mapper/service/web 在顶,该处标 `[!]`。

每个 plan 块写四样:标题带状态勾、范围、改动原因、回归判定。

### 按改动类型写回归判定

每条都带**具体 token + 期望结果**,让弱执行 AI 照着 Grep 就能验。按本层改动类型从下面挑:

- **A. 签名/契约变更**:
  - `[ ]` 调用方清零:Grep `<旧调用 token>` 全库 → K 处都在 P≥本层有 task,无漏网
  - `[ ]` 实参对位:本层每处调用与下层新签名 `<新签名>` 个数/类型/顺序一致
  - `[ ]` 多态同步:`<S>` 属接口 → 接口声明 + 全部 impl 都已纳入;属 @Mapper → XML/注解 SQL 已纳入
  - `[ ]` 无误伤:Grep `<方法名(>` 命中的重载/同名,剔除非本方法的
- **B. 纯新增**:
  - `[ ]` 已接入:新符号 `<X>` 的调用点已在上层 task 写明
  - `[ ]` 落实:`<X>` 实现接口 → 接口已声明;新增 entity 字段 → 持久层 XML/注解已映射
- **C. 体内逻辑变更**:
  - `[ ]` 签名未变,写一句为何调用方无须改
  - `[ ]` 改了字段/共享状态就 Grep `<字段 token>` 其它读写点,确认不冲突

填好的层级样例(A 类签名变更):

````markdown
## P2 · [ ] service 层(因 P1 扣减签名变更而同步)
- 范围:本层受影响 2 个方法
  - `OrderService#create` (src/.../service/OrderService.java:40)
  - `OrderService#cancel` (src/.../service/OrderService.java:88)
- 改动原因:P1 把 `StockService#deduct(id)` 改为 `deduct(id, whId)`,本层调用方不同步会编译失败。
- 回归判定(纯代码静态,逐条勾):
  - [ ] 调用方清零:Grep `.deduct(` 全库 → 仅 create / cancel 两处,均在本层有 task
  - [ ] 实参对位:本层两处调用都传 `deduct(id, order.getWhId())`,与 P1 新签名 `deduct(id, whId)` 对位
  - [ ] 多态同步:`StockService` 是接口,impl 仅 `StockServiceImpl`,其 `deduct` 已在 P1 改签名
  - [ ] 无误伤:Grep `deduct(` 无其它同名重载
````

### closure 做完就停下存盘

plan 块写完、待展开队列已空,就把 `phase` 置为 `tasks`、存盘、停止本次任务,不要直接进 Step 5。给用户打印一句:

```
✅ 影响闭包已找全、分层完成,已存盘(phase: tasks)。
建议「新开对话」再调用 /gen-plan 继续拆具体改动,上下文更清爽;
若 closure 不长、也可直接说「继续」当场往下做。
```

用户重开后空参 `/gen-plan` 自动从 `phase: tasks` 接着做;当场说继续就直接进 Step 5。

---

## Step 5 · 给每个 plan 填一行行具体改动(阶段 tasks)

按 P1 → Pn 顺序,每个 plan 内逐方法填。每写完一行就存盘。

**task = 一行**,格式固定:

```
- [ ] <编号> · <路径:行号> — <一句话:把 X 改成 Y>
```

- 编号 = `P<层>-<序>`,如 `P2-01`。
- 一行只说清改哪、改成啥。需要整段代码就停下提醒用户。
- 同方法同原因的多处就近合并;多个调用方改法相同,合并成一行带清单。
- 某行原因和本 plan 不同,行尾挂 `(因:…)`。

**状态标记两级,gen-plan 生成时一律 `[ ]`,`[~]`/`[✓]` 由执行的 AI 维护**:

- Plan(P 段标题):`[ ]` 没改 · `[~]` 改到一半 · `[✓]` 全改完 · `[!]` 受阻。
- Task(单条改动):`[ ]` 没改 · `[✓]` 改完 · `[!]` 受阻。不设 `[~]`。

````markdown
### 具体改动
- [ ] P2-01 · OrderService.java:42 — `deduct(id)` 改为 `deduct(id, order.getWhId())`
- [ ] P2-02 · OrderService.java:90 — `deduct(id)` 改为 `deduct(id, order.getWhId())` (因:cancel 回补库存)
````

---

## Step 6 · 收尾校验 task

在最顶层 plan 之后,追加一个全局校验 plan。它换比建闭包更广的搜法:除了方法名,再搜接口名、Mapper XML、`Class.forName`/`@Value`/配置里的反射字符串。

````markdown
## P99 · [ ] 收尾校验
- 改动原因:闭包可能漏掉 BFS 未命中的调用方,全部改完逐个回扫兜底。
- 回归判定(纯代码静态):
  - [ ] 对计划内每个已改方法名,全库 Grep 引用,逐条确认未受影响或已有对应 task
  - [ ] 换广搜法补一遍:接口名、`*.xml` 里的 Mapper 语句、反射字符串(`forName`/`@Value`/配置)均已核
  - [ ] 所有 task 为 [✓] 或已解释的 [!]
  - [ ] 无任何 [!] 处于未决(未决项必须升级给人工)

### 具体改动
- [ ] P99-01 · 全库 — 重 Grep 每个已改方法 + 接口名 + XML + 反射字符串,确认零漏改
````

---

## Step 7 · 写入前自检(逐条打勾,不过就先改)

- [ ] 全程只写了 `_plan/PLAN.md`,没碰 `src/`。
- [ ] 需求原文逐字进了 frontmatter,续接时没改写。
- [ ] 种子、闭包、调用图里每个方法/类都带 `路径:行号`,都是亲自 Grep/Read 命中的。
- [ ] 闭包双向追(调用方 + 被调方)+ 多态命中(接口 impl / Mapper XML),待展开队列已空;只牵连不改的标 `仅上下文`、无 task。
- [ ] plan 按层级分,P1 最底层,层内 task 互不依赖。
- [ ] 改动原因和回归判定都在 plan 层;每条回归判定按 A/B/C 选写、带可 Grep 的 token;task 是一行 `路径:行号 — 改什么`,无整段代码。
- [ ] plan 和 task 生成时都是 `[ ]`;有 P99;所有 `[!]` 已列给人工。
- [ ] phase 已推进到 `frozen`;写盘用 Edit 增量,不整体覆盖。

### 全部做完后打印这句

自检全过、`phase` 置 `frozen` 并存盘后,给用户打印(N = 改动总条数):

```
✅ 计划已就绪(phase: frozen),共 N 条改动,见 _plan/PLAN.md。
下一步请「新开对话以清空上下文」,把下面整段原样发给 AI 作为指令:

  开始执行 plan:读取本仓库 `_plan/PLAN.md`,严格遵守该文件顶部「执行说明」协议,
  从 P1 起、由底向顶、每次只改一条;只修改计划内每条指定的 `路径:行号` 所述改动,
  禁止改动计划之外的任何代码;拿不准或计划未覆盖的一律标 [!] 停下问我。
```

---

## `_plan/PLAN.md` 骨架模板(板块顺序固定)

````markdown
---
requirement: |
  <用户改动需求,逐字原文>
phase: closure          # closure | tasks | frozen | complete（frozen=计划就绪待执行,complete=代码已全改完）
generated-by: gen-plan
---

# 改动计划 · <需求一句话摘要>

> 本文件由 /gen-plan 生成,是改动计划,**代码尚未修改**。必须严格按下列协议逐条执行:不跳步、不批处理、不扩大范围。
>
> **执行协议(每次只推进一条,改一条存一条):**
> 0. 找到第一个标题不是 `[✓]` 的 P 段,从它开始;P 段严格 P1→Pn 顺序,**禁止跳层**。
> 1. 进入该段:段标题 `[ ]` 改 `[~]`,**立即存盘**。
> 2. 顺序处理该段每条 `[ ]` 改动:
>    a. 只打开该条的 `路径:行号`,**只做"— 改什么"那一处**,不碰别的行、不顺手优化。
>    b. 改完该条 `[ ]` 立即改 `[✓]` 并**存盘**(task 无中间态)。
>    c. 真实行号与计划不符 → 按方法名定位真实位置;定位不到 → 标 `[!]` 停下问人,不猜。
> 3. 该段全部 `[✓]` 后,逐条执行该段「回归判定」(纯静态 Grep/Read,不编译/不测试):
>    全过 → 段标题改 `[✓]` 并存盘;有不过 → 补对应改动或标 `[!]`,**不得带病推进**。
> 4. 计划里没有的改动、或拿不准 → 标 `[!]`、**停止、交人**,**绝不擅自多改、绝不动计划外文件**。
> 5. 回到第 0 步做下一段,直到含 P99 所有段都 `[✓]` → 把 frontmatter 的 `phase` 改成 `complete` 并存盘。
>
> 续接:新对话重读本文件,跳过所有 `[✓]`,从第一个 `[ ]`/`[~]` 接着做。

## 种子符号(改动起点)

| 种子 | 出处 | 为何是起点 | 确认 |
|------|------|-----------|------|
| ... | <路径:行号> | ... | ✅ / [!] |

## 遍历进度(closure)— /gen-plan 自己续接用

- 待展开队列: [ ... ]        # 空 => 闭包完成
- 已展开: [ ... ]
- 已发现受影响方法数: <N>

## 影响闭包

| 方法 | 出处 | 因何被波及 | 角色 |
|------|------|-----------|------|
| ... | <路径:行号> | ... | ... |

## P1 · [ ] <最底层是什么>
- 范围:<本层受影响方法,各带 路径:行号>
- 改动原因:<为何这层因需求要动>
- 回归判定(纯代码静态):  # 按本层改动类型(A 签名/B 新增/C 体内)从 Step 4 菜单选条目,每条填死要 Grep 的 token
  - [ ] <如:调用方清零 — Grep `<旧token>` → K 处都在 P≥本层有 task>
  - [ ] <如:多态同步 — 接口声明+全部 impl / Mapper XML 已纳入>

### 具体改动
- [ ] P1-01 · <路径:行号> — <一行改动>

## P2 · [ ] ...
（同上结构,由底向顶递增）

## P99 · [ ] 收尾校验
- 改动原因:兜底 BFS 漏网的调用方。
- 回归判定:
  - [ ] 每个已改方法名全库 Grep,均已覆盖或确认无关
  - [ ] 换广搜法:接口名、Mapper XML、反射字符串(forName/@Value/配置)均已核
  - [ ] 所有 task 为 [✓] 或已解释的 [!],无未决 [!]

### 具体改动
- [ ] P99-01 · 全库 — 重 Grep 每个已改方法 + 接口名 + XML + 反射字符串,确认零漏改
````

---

## 填好的 Demo(展示成品长什么样)

> 下面是**虚构**的 `demo-order` 项目、虚构需求"下单时核销优惠券"的结果,仅作格式参考。**真实计划内容必须来自真实勘察,不要照抄类名。**

````markdown
---
requirement: |
  给下单流程加上优惠券核销:下单时若带 couponId,先校验再核销,核销失败则下单失败。
phase: frozen
generated-by: gen-plan
---

# 改动计划 · 下单时核销优惠券

> 本文件由 /gen-plan 生成,是改动计划,**代码尚未修改**。必须严格按下列协议逐条执行:不跳步、不批处理、不扩大范围。
>
> **执行协议(每次只推进一条,改一条存一条):**
> 0. 找到第一个标题不是 `[✓]` 的 P 段,从它开始;P 段严格 P1→Pn 顺序,**禁止跳层**。
> 1. 进入该段:段标题 `[ ]` 改 `[~]`,**立即存盘**。
> 2. 顺序处理该段每条 `[ ]` 改动:
>    a. 只打开该条的 `路径:行号`,**只做"— 改什么"那一处**,不碰别的行、不顺手优化。
>    b. 改完该条 `[ ]` 立即改 `[✓]` 并**存盘**(task 无中间态)。
>    c. 真实行号与计划不符 → 按方法名定位真实位置;定位不到 → 标 `[!]` 停下问人,不猜。
> 3. 该段全部 `[✓]` 后,逐条执行该段「回归判定」(纯静态 Grep/Read,不编译/不测试):
>    全过 → 段标题改 `[✓]` 并存盘;有不过 → 补对应改动或标 `[!]`,**不得带病推进**。
> 4. 计划里没有的改动、或拿不准 → 标 `[!]`、**停止、交人**,**绝不擅自多改、绝不动计划外文件**。
> 5. 回到第 0 步做下一段,直到含 P99 所有段都 `[✓]` → 把 frontmatter 的 `phase` 改成 `complete` 并存盘。
>
> 续接:新对话重读本文件,跳过所有 `[✓]`,从第一个 `[ ]`/`[~]` 接着做。

## 种子符号(改动起点)

| 种子 | 出处 | 为何是起点 | 确认 |
|------|------|-----------|------|
| `OrderService#create` | src/.../service/OrderService.java:40 | 下单主流程,核销在此切入 | ✅ |
| `CouponService#redeem` | src/.../service/CouponService.java:18 | 已有核销方法,被 create 复用 | ✅ |

## 遍历进度(closure)
- 待展开队列: [ ]
- 已展开: [ CouponMapper#decrement, CouponService#redeem, OrderService#create, OrderController#create ]
- 已发现受影响方法数: 4

## 影响闭包
| 方法 | 出处 | 因何被波及 | 角色 |
|------|------|-----------|------|
| `CouponMapper#decrement` | .../mapper/CouponMapper.java:14 | redeem 落库,需保证语义 | 被调方 |
| `CouponService#redeem` | .../service/CouponService.java:18 | create 新增对它的调用 | 被调方 |
| `OrderService#create` | .../service/OrderService.java:40 | 种子,新增核销逻辑 | 调用方 |
| `OrderController#create` | .../web/OrderController.java:55 | 入参需透传 couponId | 调用方 |

## P1 · [ ] mapper 层(核销链最底层)
- 范围:`CouponMapper#decrement` (src/.../mapper/CouponMapper.java:14)
- 改动原因:redeem 依赖它做"剩余量-1 且不为负";需确认有此语义,否则补条件。
- 回归判定(纯代码静态):  # A 类:签名/契约变更
  - [ ] 调用方清零:Grep `.decrement(` 全库 → 仅 `CouponService#redeem` 一处,已在 P2 覆盖
  - [ ] 实参对位:P2 调用与签名 `decrement(couponId):int` 个数/类型一致
  - [ ] 多态同步:`CouponMapper` 是 @Mapper,其 SQL 在 CouponMapper.xml:51,已由 P1-01 改
  - [ ] 无误伤:Grep `decrement(` 无其它同名重载

### 具体改动
- [ ] P1-01 · CouponMapper.xml:51 — decrement 的 SQL 补 `WHERE remain > 0`,返回影响行数

## P2 · [ ] service 层
- 范围:`CouponService#redeem` (src/.../service/CouponService.java:18)
- 改动原因:create 要复用它;需确认核销失败抛异常以便下单回滚。
- 回归判定(纯代码静态):  # A 类:签名/契约变更
  - [ ] 调用方清零:Grep `.redeem(` 全库 → 新增 `OrderService#create`(P3),无其它遗漏
  - [ ] 实参对位:P3 传 `redeem(couponId, order.getId())`,与签名 `redeem(Long couponId, Long orderId)` 对位
  - [ ] 多态同步:`CouponService` 接口 impl 仅 `CouponServiceImpl`,已含本改动
  - [ ] 无误伤:Grep `redeem(` 无其它同名重载

### 具体改动
- [ ] P2-01 · CouponService.java:20 — decrement 返回 0 时抛 `CouponException`

## P3 · [ ] service 层(下单主改动)
- 范围:`OrderService#create` (src/.../service/OrderService.java:40)
- 改动原因:本次需求主改动点,扣库存后核销优惠券,失败整单回滚。
- 回归判定(纯代码静态):  # A 类:create 加形参 couponId
  - [ ] 调用方清零:Grep `orderService.create(` 全库 → 仅 `OrderController#create`(P4),已覆盖
  - [ ] 实参对位:P4 传 `create(..., req.getCouponId())`,与新签名 `create(..., Long couponId)` 对位
  - [ ] 多态同步:`OrderService` 接口 impl 仅 `OrderServiceImpl`,已含本改动
  - [ ] 无误伤:Grep `create(` 命中的其它重载已确认非本方法

### 具体改动
- [ ] P3-01 · OrderService.java:40 — 方法签名加形参 `Long couponId`
- [ ] P3-02 · OrderService.java:55 — 扣库存成功后调 `couponService.redeem(couponId, order.getId())`,异常上抛

## P4 · [ ] web 层(顶层入口)
- 范围:`OrderController#create` (src/.../web/OrderController.java:55)
- 改动原因:把请求里的 couponId 透传给 service。
- 回归判定(纯代码静态):  # 入口层(无上游)+ B 类:DTO 新增字段
  - [ ] 入口确认:`OrderController#create` 为对外 @RequestMapping 入口,Grep 无项目内上游调用方
  - [ ] 实参对位:传给 `OrderService#create` 的实参与 P3 新签名一致
  - [ ] 已接入:新字段 `CreateOrderReq.couponId` 有 getter,已被 P4-02 读取,非悬空
  - [ ] 无误伤:Grep `CreateOrderReq` 其它使用处,新增字段不破坏既有反序列化/调用

### 具体改动
- [ ] P4-01 · CreateOrderReq.java:12 — DTO 增加字段 `Long couponId`
- [ ] P4-02 · OrderController.java:58 — 调用 service 时带上 `req.getCouponId()`

## P99 · [ ] 收尾校验
- 改动原因:兜底 BFS 漏网的调用方。
- 回归判定:
  - [ ] decrement / redeem / create(service) / create(controller) 逐个全库 Grep,引用均已覆盖或确认无关
  - [ ] 换广搜法:接口名(CouponService/OrderService)、`*.xml`(CouponMapper.xml)、反射字符串均已核
  - [ ] 全部 task 为 [✓] 或已解释的 [!],无未决 [!]

### 具体改动
- [ ] P99-01 · 全库 — 重 Grep 每个已改方法 + 接口名 + XML + 反射字符串,确认零漏改
````
