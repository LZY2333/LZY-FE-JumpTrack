---
name: gen-plan
description: 为 Java(Maven/Gradle) 项目把一个"改动需求"沿调用链遍历成"由底向顶、无遗漏"的有序改动计划,只规划不改代码,产出 _plan/PLAN.md(plan 按调用链拓扑层级分层、自带改动原因/范围/回归判定;task 是一行具体改动)。当用户要求"评估改动影响面、拆改动计划/任务、做改造方案、列出某个改动要动哪些地方、规划重构步骤"时使用,调用名 /gen-plan。首次调用带需求原文;空参调用自动探测未冻结的 _plan/PLAN.md 并续接。所有符号必须用工具命中并带 路径:行号,严禁臆造。
---

# gen-plan — Java 改动计划生成器(只规划,不改代码)

为 **Java(Maven/Gradle)** 项目,把一句"改动需求"展开成一份 **`_plan/PLAN.md`**:沿调用链遍历出**全部受影响方法**,按**由底向顶**排成有序、可中断续接的改动计划,交给后续执行者(人或另一个 AI)去改。
**读者/执行者是能力较弱的 AI**。本 skill 面向弱模型,下面是**强制流程**:逐 Step 执行,不跳步,不凭印象写。

> 根目录若有 `spec.md`,优先拿它的调用链当起点(见 Step 2)。

---

## 0. 铁律(违反任意一条即视为失败)

1. **绝不改源码**:只读项目,只写 `_plan/PLAN.md`。碰 `src/` 即越界,立即停手。
2. **不臆造**:每个类/方法/字段/调用关系都要 Grep/Read 命中并带 `(路径:行号)`;命不中标 `[!]`,绝不编。
3. **由底向顶不遗漏**:调用链做**双向闭包**(调用方 + 被调方)追到无新方法;漏一个调用方 = 失败。
4. **不写补丁**:task 只一行说清"改哪、改成啥";要贴整段新代码 = 该改动小到该直接改,停下来提醒用户。
5. **回归纯静态**:不跑 `mvn`/编译/单测;只用 Grep/Read 核对调用方齐、签名一致、无游离旧引用。
6. **勤写盘**:每展开一个符号、每写一个 task 立即写回文件,绝不攒批。中断后靠文件续接。
7. **拿不准就停**:种子/调用关系/改动方向有疑义标 `[!]` 给人工,绝不替用户决定业务。

---

## 何时**不该**用 `/gen-plan`

满足任一条 → **直接告诉用户"这个改动建议直接改,不必生成计划"**,不要硬拆:

- 影响面一眼可数,只涉及 **1–2 个文件**。
- 改动是纯文案/常量/配置,无调用链扩散。
- 用户其实想"看懂项目"(那是 `/gen-spec`)而不是"规划改动"。

值得用的信号:**影响闭包大、跨多文件多层、需要先让人审改动方向、需要分多次新对话续接着做**。

---

## 调用约定

| 调用方式 | 含义 | 怎么做 |
|---|---|---|
| `/gen-plan <改动需求原文>` 且无 `_plan/PLAN.md` | **新建计划** | 走 Step 1 → 7 |
| `/gen-plan`(空参)且有 `_plan/PLAN.md` 且 `phase` 是 `closure`/`tasks` | **续接**(上次没做完) | 走 Step 0.5,接着没做完的阶段往下 |
| `/gen-plan <新需求>` 且旧计划 `phase` 已是 `frozen`/`complete` | **新需求** | 先把旧文件移到 `_plan/archive/<日期>-<旧需求摘要>.md`,再新建 |

> "执行计划"指的是**执行"把计划生成完"这件事**(弱 AI 上下文小,可能跨多次新对话才拆完);本 skill **永远不改代码**。

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

**先恢复上下文再动手**:把「需求原文」「待展开队列」「已生成的 plan/task」读进来,**绝不重新猜需求**。某个 plan 的具体改动只填了一半,先把它补全再继续,避免半成品被跳过。

---

## Step 1 · 识别构建工具 + 锁存需求

- Glob 找 `pom.xml`(Maven)/`build.gradle(.kts)`(Gradle);根 `pom.xml` 有 `<modules>` 或多 `include` → **多模块**(闭包要跨模块,别漏)。
- 把**用户需求原文逐字**写进 frontmatter `requirement:`。这是续接时唯一的真相,绝不改写、不"优化措辞"。

---

## Step 2 · 定种子符号(把需求落到代码起点)

需求多是自然语言(如"给订单加优惠券核销"),**先落成 2–5 个真实代码起点**,否则后面全错。

- 从需求关键词(实体名、动作名)Grep(glob 限 `*.java`,只扫 `src/main`)找候选类/方法。
- 优先借 `spec.md`:若存在,先读它的「术语表」「核心流程调用链」,直接拿业务⇄代码映射,省一遍盲找。
- 每个候选写成:`类名#方法名 (路径:行号) — 为何认为它是起点`。
- **拿不准的标 `[!]`**,写入时一并列出请用户确认,不要自己拍板。

````markdown
## 种子符号(改动起点)

| 种子 | 出处 | 为何是起点 | 确认 |
|------|------|-----------|------|
| `OrderService#create` | src/.../service/OrderService.java:40 | "下单时核销优惠券",从下单主流程切入 | ✅ |
| `Coupon`(需新增?) | <!-- 项目无 Coupon 类 --> | 需求提到优惠券但代码未命中,可能需新建 | [!] 待人工确认 |
````

---

## Step 3 · 调用链闭包 BFS(阶段 closure,核心,不能漏)

从种子出发,**把所有会被波及的方法一个不漏地找全**。

```
队列 = [全部已确认种子];  已展开集 = {}
while 队列非空:
    取出 S
    1) 调用方:Grep S 的方法名/类名被谁引用、谁 new、谁注入 → 由底向顶它们也要改 → 入队
    2) 被调方:Read S 的方法体,看它调了哪些本项目方法/改了哪些字段 → 牵动契约的 → 入队
    3) 新发现且不在已展开集的 → 入队,记 (路径:行号) 与"因何被波及"
    S 放进 已展开集
队列空 → 闭包完成,phase: closure → tasks
```

**判漏自检**:每个方法问"它的调用方我 Grep 全了吗?"——Spring 调用方常通过 `@Autowired`/构造注入,别只搜 `new`。没命中调用方也记一笔"经 Grep 未发现外部调用方"。

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
````

---

## Step 4 · 建调用图 → 算层级 → 生成 plan 块(阶段 closure 收尾)

把闭包里的方法连成调用图(A 调 B 记一条边 A→B),然后:

- **算层级**:`层级(S) = max(S 在闭包内依赖的方法的层级) + 1`;不依赖闭包内任何方法的(叶子/最底层)= **层级 1**。
- **plan = 一个层级**,**P1 = 层级 1(最底层,先改)**,向上 P2、P3……执行 = plan 升序(由底向顶)。
- **同一 plan 内的方法之间一定无调用边**(同层定义保证)→ 层内 task 互不依赖、可任意顺序,这点写给执行者看。
- 图算不清(循环依赖、命不中调用方)→ 退化用**架构层粗分**(domain/util=底,mapper、service、web=顶)兜底,该处标 `[!]` 说明是近似。

**每个 plan 块:标题带状态勾 + 范围 + 改动原因 + 回归判定**(原因和回归集中在层级上,task 不再重复):

````markdown
## P2 · [ ] service 层(因 P1 扣减签名变更而同步)
- 范围:本层受影响 2 个方法
  - `OrderService#create` (src/.../service/OrderService.java:40)
  - `OrderService#cancel` (src/.../service/OrderService.java:88)
- 改动原因:P1 把 `StockService#deduct(id)` 改为 `deduct(id, whId)`,本层调用方不同步会编译失败。
- 回归判定(纯代码静态,逐条勾):
  - [ ] 本层每个方法的上游调用方都在 P3(或更上)有对应 task,无遗漏
  - [ ] 本层对下层方法的调用,传参与下层新签名一致(逐 路径:行号 核对)
  - [ ] Grep 本层旧写法,无游离残留
````

### closure 做完后,停在这里

所有 plan 块写完、`待展开队列` 已空,就把 `phase` 置为 `tasks` 并**存盘,然后停止本次任务**,别直接往 Step 5 冲。closure 最吃上下文,卸掉它再让 tasks 空脑子接力。给用户打印一句:

```
✅ 影响闭包已找全、分层完成,已存盘(phase: tasks)。
建议「新开对话」再调用 /gen-plan 继续拆具体改动,上下文更清爽;
若 closure 不长、也可直接说「继续」当场往下做。
```

用户重开后空参 `/gen-plan` 会自动从 `phase: tasks` 接着做(见 Step 0.5);用户当场说继续就直接进 Step 5。

---

## Step 5 · 给每个 plan 填一行行具体改动(阶段 tasks,可中断续接的主体)

**顺序:P1 → Pn(由底向顶)**;每个 plan 内逐方法。每写完一行**立即写盘**。

**task = 一行**,格式固定:

```
- [ ] <编号> · <路径:行号> — <一句话:把 X 改成 Y>
```

- 编号 = `P<层>-<序>`,如 `P2-01`。
- **一行只说清"改哪、改成啥"**,不贴整段代码(触发铁律 4 就提醒用户该直接改)。
- 同一方法因同一原因的连带多处,**就近合并**成尽量少的行;多个调用方完全相同的机械改法,合并成一行带清单。
- 某行原因与本 plan 的统一原因不同 → 行尾挂 `(因:…)` 短注解。

**状态标记(执行时用,两级)**:

- **Plan(P 段标题)**:`[ ]` 没改 · `[~]` 这层改到一半 · `[✓]` 这层全改完 · `[!]` 受阻。plan 大、跨多条,需要中间态。
- **Task(单条改动)**:`[ ]` 没改 · `[✓]` 改完打勾 · `[!]` 受阻。task 小、改得快,**不设 `[~]` 中间态**。

> gen-plan 生成时,plan 标题和 task 一律 `[ ]`;`[~]`/`[✓]`/`complete` 由执行的 AI 维护。

````markdown
### 具体改动
- [ ] P2-01 · OrderService.java:42 — `deduct(id)` 改为 `deduct(id, order.getWhId())`
- [ ] P2-02 · OrderService.java:90 — `deduct(id)` 改为 `deduct(id, order.getWhId())` (因:cancel 回补库存)
````

---

## Step 6 · 收尾校验 task(防漏的最后一道闸)

在最顶层 plan 之后,固定追加一个全局校验 plan:

````markdown
## P99 · [ ] 收尾校验
- 改动原因:闭包可能漏掉 BFS 未命中的调用方,全部改完逐个回扫兜底。
- 回归判定(纯代码静态):
  - [ ] 对计划内每个已改方法名,全库 Grep 引用,逐条确认未受影响或已有对应 task
  - [ ] 所有 task 为 [✓] 或已解释的 [!]
  - [ ] 无任何 [!] 处于未决(未决项必须升级给人工)

### 具体改动
- [ ] P99-01 · 全库 — 重 Grep 每个已改方法,确认零漏改
````

---

## Step 7 · 写入前自检清单(逐条打勾,任意不过则修正后再写)

- [ ] 全程**没改过任何 `src/` 文件**,只写了 `_plan/PLAN.md`。
- [ ] 需求原文逐字进了 frontmatter,续接时没被改写。
- [ ] 种子、闭包、调用图里**每个方法/类**都带 `(路径:行号)`,且都是我**亲自 Grep/Read 命中**的。
- [ ] 闭包做了**双向追**(调用方 + 被调方),「待展开队列」已清空。
- [ ] plan 按**层级**分,P1=最底层;执行由底向顶;层内 task 互不依赖。
- [ ] 改动原因 + 回归判定([] 纯代码静态,不含 mvn/编译/单测)都在 **plan 层**;task 是一行 `路径:行号 — 改什么`,**没有任何整段补丁代码**。
- [ ] plan 标题和 task 生成时都是 `[ ]`;有 P99 收尾校验;所有 `[!]` 都已列给人工,无硬编脑补。
- [ ] phase 已正确推进(队列空且 task 齐 → `frozen`);写盘是 Edit 增量,不是整体覆盖续接中的文件。

### 全部完成后,打印这句

自检全过、`phase` 置 `frozen` 并存盘后,给用户打印(N = 改动总条数):

```
✅ 计划已就绪(phase: frozen),共 N 条改动,见 _plan/PLAN.md。
下一步请新开对话,说一句:「开始执行 plan」
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

> 本文件由 /gen-plan 生成,只是计划,**代码还没改**。
>
> **执行说明(给负责改代码的 AI):一层一层来,从 P1 往上。**
> 1. 进入一个 P 段,把它标题的 `[ ]` 改成 `[~]`(这层在改)。
> 2. 这层下面每条 `[ ]` 改动:打开 `路径:行号`,照"— 改什么"那句改代码,改完把这条勾成 `[✓]`。
>    task 小、改得快,不设中间态,改完直接 `[✓]`。
> 3. 这层改动全 `[✓]` 后,逐条核对该段「回归判定」确认没漏,再把 P 段标题改成 `[✓]`。
> 4. plan 里没写的、或拿不准的改动 → 标 `[!]` 停下问人,**绝不擅自多改**。
> 5. 所有 P 段都 `[✓]` 后,把 frontmatter 的 `phase` 改成 `complete`。
>
> 顺序:P 编号从小到大(由底向顶);同一 P 段内各条互不依赖,谁先谁后都行。

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
- 回归判定(纯代码静态):
  - [ ] <调用方是否齐 / 签名是否一致 / 有无游离旧引用>

### 具体改动
- [ ] P1-01 · <路径:行号> — <一行改动>

## P2 · [ ] ...
（同上结构,由底向顶递增）

## P99 · [ ] 收尾校验
- 改动原因:兜底 BFS 漏网的调用方。
- 回归判定:
  - [ ] 每个已改方法名全库 Grep,均已覆盖或确认无关
  - [ ] 所有 task 为 [✓] 或已解释的 [!],无未决 [!]

### 具体改动
- [ ] P99-01 · 全库 — 重 Grep 每个已改方法,确认零漏改
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

> 本文件由 /gen-plan 生成,只是计划,**代码还没改**。
>
> **执行说明(给负责改代码的 AI):一层一层来,从 P1 往上。**
> 1. 进入一个 P 段,标题 `[ ]` 改成 `[~]`。
> 2. 这层每条 `[ ]`:打开 `路径:行号` 照"— 改什么"改,改完勾 `[✓]`(task 无中间态)。
> 3. 这层全 `[✓]` 后,核对该段「回归判定」,再把 P 段标题改 `[✓]`。
> 4. plan 里没写的/拿不准的 → 标 `[!]` 停下问人,绝不擅自多改。
> 5. 所有 P 段 `[✓]` 后,把 `phase` 改成 `complete`。
> 顺序:P 从小到大,同段内各条互不依赖。

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
- 回归判定(纯代码静态):
  - [ ] 调用方仅 `CouponService#redeem`,已在 P2 覆盖
  - [ ] 签名 `decrement(couponId):int` 与 P2 调用一致
  - [ ] 全库 Grep `decrement(` 无其它游离调用

### 具体改动
- [ ] P1-01 · CouponMapper.xml:51 — decrement 的 SQL 补 `WHERE remain > 0`,返回影响行数

## P2 · [ ] service 层
- 范围:`CouponService#redeem` (src/.../service/CouponService.java:18)
- 改动原因:create 要复用它;需确认核销失败抛异常以便下单回滚。
- 回归判定(纯代码静态):
  - [ ] 调用方新增 `OrderService#create`(P3),无其它遗漏
  - [ ] 签名 `redeem(Long couponId, Long orderId)` 与 P3 传参一致
  - [ ] Grep `redeem(` 现有调用均已知

### 具体改动
- [ ] P2-01 · CouponService.java:20 — decrement 返回 0 时抛 `CouponException`

## P3 · [ ] service 层(下单主改动)
- 范围:`OrderService#create` (src/.../service/OrderService.java:40)
- 改动原因:本次需求主改动点,扣库存后核销优惠券,失败整单回滚。
- 回归判定(纯代码静态):
  - [ ] 调用方 `OrderController#create`(P4)已覆盖
  - [ ] create 入参新增 couponId,与 P4 透传一致
  - [ ] Grep `orderService.create(` 调用处均已纳入计划

### 具体改动
- [ ] P3-01 · OrderService.java:40 — 方法签名加形参 `Long couponId`
- [ ] P3-02 · OrderService.java:55 — 扣库存成功后调 `couponService.redeem(couponId, order.getId())`,异常上抛

## P4 · [ ] web 层(顶层入口)
- 范围:`OrderController#create` (src/.../web/OrderController.java:55)
- 改动原因:把请求里的 couponId 透传给 service。
- 回归判定(纯代码静态):
  - [ ] 本方法为对外入口,无项目内上游调用方
  - [ ] 传给 `OrderService#create` 的参数与 P3 签名一致
  - [ ] Grep 请求 DTO 引用处,新增字段不破坏其它调用

### 具体改动
- [ ] P4-01 · CreateOrderReq.java:12 — DTO 增加字段 `Long couponId`
- [ ] P4-02 · OrderController.java:58 — 调用 service 时带上 `req.getCouponId()`

## P99 · [ ] 收尾校验
- 改动原因:兜底 BFS 漏网的调用方。
- 回归判定:
  - [ ] decrement / redeem / create(service) / create(controller) 逐个全库 Grep,引用均已覆盖或确认无关
  - [ ] 全部 task 为 [✓] 或已解释的 [!],无未决 [!]

### 具体改动
- [ ] P99-01 · 全库 — 重 Grep 每个已改方法,确认零漏改
````

---

## 续接小抄(弱 AI 每次空参 `/gen-plan` 先看这段)

1. 读 `_plan/PLAN.md`;没有就是全新 → Step 1。
2. `phase: frozen` / `complete` → 已完成,别重复生成(除非带了新需求)。
3. `phase: closure` → 去「待展开队列」,非空接着 Step 3 展开,空了进 Step 4 → tasks。
4. `phase: tasks` → 找第一个还没填具体改动的 plan,接着 Step 5 往下填。
5. 每动一步**立即写盘**,绝不在内存里攒着。
