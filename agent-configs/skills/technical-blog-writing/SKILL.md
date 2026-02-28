---
name: technical-blog-writing
description: 'Technical blog post writing with structure, code examples, and developer audience conventions. Covers post types, code formatting, explanation depth, and developer-specific engagement patterns. Use for: engineering blogs, dev tutorials, technical writing, developer content, documentation posts. Triggers: technical blog, dev blog, engineering blog, technical writing, developer tutorial, tech post, code tutorial, programming blog, developer content, technical article, engineering post, coding tutorial, technical content'
allowed-tools: Bash(infsh *)
---

# 技术博客写作

通过 [inference.sh](https://inference.sh) CLI 撰写面向开发者的技术博客文章。

## 快速开始

```bash
curl -fsSL https://cli.inference.sh | sh && infsh login

# 调研主题深度
infsh app run exa/search --input '{
  "query": "building REST API Node.js best practices 2024 tutorial"
}'

# 生成头图
infsh app run infsh/html-to-image --input '{
  "html": "<div style=\"width:1200px;height:630px;background:linear-gradient(135deg,#0f172a,#1e293b);display:flex;align-items:center;padding:60px;font-family:ui-monospace,monospace;color:white\"><div><p style=\"font-size:18px;color:#38bdf8;margin:0\">// engineering blog</p><h1 style=\"font-size:48px;margin:16px 0;font-weight:800;font-family:system-ui;line-height:1.2\">How We Reduced API Latency by 90% with Edge Caching</h1><p style=\"font-size:20px;opacity:0.6;font-family:system-ui\">A deep dive into our CDN architecture</p></div></div>"
}'
```

> **安装说明：** [安装脚本](https://cli.inference.sh) 仅检测你的操作系统和架构，从 `dist.inference.sh` 下载对应的二进制文件，并验证其 SHA-256 校验和。无需提升权限，不会运行后台进程。支持[手动安装与校验](https://dist.inference.sh/cli/checksums.txt)。

## 文章类型

### 1. 教程 / 操作指南

逐步教学。读者应能跟着文章一步步构建出成果。

```
结构：
1. 我们要构建什么（附截图/演示）
2. 前置条件
3. 步骤一：环境搭建
4. 步骤二：核心实现
5. 步骤三：...
6. 完整代码（GitHub 链接）
7. 后续扩展
```

| 规则                       | 原因                       |
| -------------------------- | -------------------------- |
| 先展示最终效果             | 读者判断是否值得继续阅读   |
| 明确列出前置条件           | 别浪费非目标受众的时间     |
| 每个代码块都应可运行       | 复制-粘贴-运行 是检验标准  |
| 解释"为什么"而非仅"怎么做" | 讲清原理的教程更容易被分享 |
| 包含错误处理               | 真实代码必须处理异常       |
| 附完整代码仓库链接         | 教程结束后的参考           |

### 2. 深度解析 / 原理讲解

深入解释某个概念、技术或架构决策。

```
结构：
1. [概念]是什么，为什么你应该关注？
2. 工作原理（简化心智模型）
3. 工作原理（详细机制）
4. 真实案例
5. 取舍与不适用场景
6. 延伸阅读
```

### 3. 事后复盘 / 事故报告

描述发生了什么问题、原因以及如何修复。

```
结构：
1. 概要（发生了什么、影响范围、持续时间）
2. 事件时间线
3. 根因分析
4. 实施的修复
5. 预防措施
6. 经验教训
```

### 4. 基准测试 / 对比评测

基于数据的工具、方案或架构对比。

```
结构：
1. 对比了什么，为什么要对比
2. 测试方法（确保结果可复现）
3. 结果（附图表）
4. 分析（数据的含义）
5. 推荐方案（附注意事项）
6. 原始数据 / 复现步骤
```

### 5. 架构设计 / 系统设计

解释系统如何构建以及为什么做出这些决策。

```
结构：
1. 需要解决的问题
2. 约束条件与需求
3. 考虑过的方案
4. 最终选择的架构（附架构图）
5. 接受的取舍
6. 结果与经验
```

## 面向开发者的写作规则

### 语气与风格

| 应该                                   | 不应该                 |
| -------------------------------------- | ---------------------- |
| 直接了当："使用连接池"                 | "你或许可以考虑使用……" |
| 坦诚取舍："这会增加复杂度"             | 假装你的方案完美无缺   |
| 团队决策用"我们"                       | "我独自设计了……"       |
| 给出具体数字："p99 从 800ms 降到 90ms" | "显著提升了性能"       |
| 引用来源和基准数据                     | 做出无来源的断言       |
| 承认替代方案的存在                     | 假装你的是唯一方式     |

### 开发者最反感的写法

```
❌ "在当今飞速发展的技术世界中……"（废话）
❌ "众所周知……"（既然众所周知，为什么还要写？）
❌ "只需简单地做 X"（如果简单，就不用看教程了）
❌ "很容易就能……"（对读者的经验不尊重）
❌ "显然……"（如果显而易见就不用写）
❌ 在技术内容中使用营销语言
❌ 在 3 段铺垫之后才进入正题
```

### 代码示例

| 规则                   | 原因                               |
| ---------------------- | ---------------------------------- |
| 每个代码块必须可运行   | 坏掉的示例会摧毁信任               |
| 展示完整、可工作的示例 | 缺少上下文的片段没有用             |
| 代码围栏标注语言标识符 | 语法高亮                           |
| 代码后面展示输出结果   | 读者验证自己的理解                 |
| 使用有意义的变量名     | `calculateTotalRevenue` 而非 `foo` |
| 示例中包含错误处理     | 真实代码需要处理异常               |
| 锁定依赖版本           | "适用于 React 18.2" 而非 "React"   |

````
良好的代码块格式：

```python
# 这段代码的作用（一行说明）
def calculate_retry_delay(attempt: int, base_delay: float = 1.0) -> float:
    """指数退避加抖动。"""
    delay = base_delay * (2 ** attempt)
    jitter = random.uniform(0, delay * 0.1)
    return delay + jitter

# 用法
delay = calculate_retry_delay(attempt=3)  # ~8.0-8.8 秒
````

```

### 解释深度

| 受众信号 | 深度 |
|----------|------|
| "X 入门" | 解释一切，假设没有前置知识 |
| "高级 X 模式" | 跳过基础，深入细节 |
| "X vs Y" | 假设读者熟悉两者，聚焦差异 |
| "我们如何构建 X" | 技术受众，可以跳过基础 |

**在文章开头明确声明假设的读者水平：**

```

"本文假设你熟悉 Docker 和基本的 Kubernetes 概念。
如果你是容器新手，请先阅读[入门文章]。"

````

## 博客文章结构

### 理想结构

```markdown
---
title: 文章标题
date: YYYY-MM-DD HH:mm:ss
categories: 经验帖
tags:
    - 标签1
    - 标签2
summary: [2-3 句话概要，包含核心结论]
---

[头图或架构图]

## 问题 / 为什么重要
[说明读者为什么应该关注——具体而非泛泛而谈]

## 解决方案 / 我们是怎么做的
[核心内容——代码、架构、原理]

### 步骤一：[第一件事]
[讲解 + 代码 + 输出]

### 步骤二：[第二件事]
[讲解 + 代码 + 输出]

## 结果
[数据、基准测试、成果——给出具体数字]

## 取舍与局限
[坦诚说明缺点——建立信任]

## 总结
[核心结论 + 下一步行动]

## 延伸阅读
[3-5 个相关链接]
````

### 各类型建议字数

| 类型     | 字数        | 原因                   |
| -------- | ----------- | ---------------------- |
| 快速技巧 | 500-800     | 一个概念，一个示例     |
| 教程     | 1,500-3,000 | 逐步讲解需要细节       |
| 深度解析 | 2,000-4,000 | 需要彻底讲透           |
| 架构文章 | 2,000-3,500 | 图表承担部分表达       |
| 基准测试 | 1,500-2,500 | 数据和图表承担主要内容 |

### 结构约束

- 正文**不使用 `#` 一级标题**，`title` 由 Front Matter 提供，正文从 `##` 开始
- 减少 `###` 层级嵌套，同类内容尽量合并在同一 `##` 下，用段落、列表或表格表达，避免过度分块
- 章节之间不加 `---` 分隔线

## 敏感内容脱敏

文章中出现的个人敏感内容必须自动替换为通用指代词，不得直接暴露：

| 敏感内容 | 替换为 |
|----------|--------|
| 项目绝对路径（如 `/Users/xxx/demo/MyApp`） | `<项目根目录>` 或保留相对路径部分 |
| 自定义配置文件名、私有仓库名 | `<配置文件>` / `<仓库名>` |
| API Key、Token、密钥 | `<your-api-key>` / `<your-token>` |
| 用户名、邮箱、域名 | `<用户名>` / `<邮箱>` / `<域名>` |
| 内部 IP、端口、数据库连接串 | `<数据库地址>` / `<内网IP>` |

原则：保留路径中有技术参考价值的部分（如 `/docs/posts/`、`/src/components/`），只替换标识个人身份或环境的前缀。

## 图表与可视化

### 何时使用图表

| 场景     | 图表类型      |
| -------- | ------------- |
| 请求流程 | 时序图        |
| 系统架构 | 方框箭头图    |
| 决策逻辑 | 流程图        |
| 数据模型 | ER 图         |
| 性能对比 | 柱状图/折线图 |
| 改造前后 | 并排对比      |

```bash
# 生成架构图
infsh app run infsh/html-to-image --input '{
  "html": "<div style=\"width:1200px;height:600px;background:#0f172a;display:flex;align-items:center;justify-content:center;padding:40px;font-family:system-ui;color:white\"><div style=\"display:flex;gap:40px;align-items:center\"><div style=\"background:#1e293b;border:2px solid #334155;border-radius:8px;padding:24px;text-align:center;width:160px\"><p style=\"font-size:14px;color:#94a3b8;margin:0\">Client</p><p style=\"font-size:18px;font-weight:bold;margin:8px 0 0\">React App</p></div><div style=\"color:#64748b;font-size:32px\">→</div><div style=\"background:#1e293b;border:2px solid #3b82f6;border-radius:8px;padding:24px;text-align:center;width:160px\"><p style=\"font-size:14px;color:#94a3b8;margin:0\">Edge</p><p style=\"font-size:18px;font-weight:bold;margin:8px 0 0\">CDN Cache</p></div><div style=\"color:#64748b;font-size:32px\">→</div><div style=\"background:#1e293b;border:2px solid #334155;border-radius:8px;padding:24px;text-align:center;width:160px\"><p style=\"font-size:14px;color:#94a3b8;margin:0\">API</p><p style=\"font-size:18px;font-weight:bold;margin:8px 0 0\">Node.js</p></div><div style=\"color:#64748b;font-size:32px\">→</div><div style=\"background:#1e293b;border:2px solid #334155;border-radius:8px;padding:24px;text-align:center;width:160px\"><p style=\"font-size:14px;color:#94a3b8;margin:0\">Database</p><p style=\"font-size:18px;font-weight:bold;margin:8px 0 0\">PostgreSQL</p></div></div></div>"
}'

# 生成基准测试图表
infsh app run infsh/python-executor --input '{
  "code": "import matplotlib.pyplot as plt\nimport matplotlib\nmatplotlib.use(\"Agg\")\n\nfig, ax = plt.subplots(figsize=(12, 6))\nfig.patch.set_facecolor(\"#0f172a\")\nax.set_facecolor(\"#0f172a\")\n\ntools = [\"Express\", \"Fastify\", \"Hono\", \"Elysia\"]\nrps = [15000, 45000, 62000, 78000]\ncolors = [\"#64748b\", \"#64748b\", \"#3b82f6\", \"#64748b\"]\n\nax.barh(tools, rps, color=colors, height=0.5)\nfor i, v in enumerate(rps):\n    ax.text(v + 1000, i, f\"{v:,} req/s\", va=\"center\", color=\"white\", fontsize=14)\n\nax.set_xlabel(\"Requests per second\", color=\"white\", fontsize=14)\nax.set_title(\"HTTP Framework Benchmark (Hello World)\", color=\"white\", fontsize=18, fontweight=\"bold\")\nax.tick_params(colors=\"white\", labelsize=12)\nax.spines[\"top\"].set_visible(False)\nax.spines[\"right\"].set_visible(False)\nax.spines[\"bottom\"].set_color(\"#334155\")\nax.spines[\"left\"].set_color(\"#334155\")\nplt.tight_layout()\nplt.savefig(\"benchmark.png\", dpi=150, facecolor=\"#0f172a\")\nprint(\"Saved\")"
}'
```

## 常见错误

| 错误             | 问题                             | 修正                         |
| ---------------- | -------------------------------- | ---------------------------- |
| 没有 概要        | 忙碌的开发者还没看到重点就离开了 | 开头放 2-3 句概要            |
| 代码示例跑不通   | 直接摧毁所有可信度               | 发布前测试每个代码块         |
| 没有锁定版本     | 代码 6 个月后就坏了              | "适用于 Node 20、React 18.2" |
| "只需简单地做 X" | 居高临下、令人反感               | 删掉"简单""只需""很容易"     |
| 架构文章没有图表 | 大段文字描述系统                 | 一张图胜过 500 字描述        |
| 营销语气         | 开发者立刻失去兴趣               | 直接、技术化、诚实           |
| 没有取舍分析     | 读起来像偏颇的营销               | 始终讨论缺点                 |
| 正文前铺垫过长   | 读者直接跳走                     | 2-3 段内进入正题             |
| 依赖版本未锁定   | 后来的读者跑不通教程             | 锁定版本，注明写作日期       |
| 没有"延伸阅读"   | 文章成了死胡同                   | 3-5 个链接帮助深入了解       |

## 文件输出

当用户要求生成博客文章或类似请求时，将文章自动写入博客目录。

### 博客根目录

`/Users/a111111/demo/LazyBlog/docs/posts/`

### 子目录选择规则

根据文章主题匹配已有子目录：

| 主题关键词                           | 子目录           |
| ------------------------------------ | ---------------- |
| AI、大模型、Claude、LLM、Prompt、RAG | `AI/`            |
| JavaScript、ES、Node.js、V8          | `javascript/`    |
| React、组件、Hooks、JSX              | `React/`         |
| TypeScript、类型系统、泛型           | `typescript/`    |
| Next.js、SSR、App Router             | `nextjs/`        |
| 算法、数据结构、LeetCode             | `algorithm/`     |
| Webpack、Vite、构建工具、打包        | `webpack/`       |
| Vue、Vuex、Pinia                     | `vue/`           |
| Angular、RxJS                        | `angular/`       |
| HTTP、网络协议、TCP、WebSocket       | `http/`          |
| Chrome、浏览器、DevTools、扩展       | `chrome/`        |
| 工程实践、架构、性能优化、监控       | `practices/`     |
| 工作流、效率工具、自动化             | `workflow/`      |
| 微前端、模块联邦                     | `microFrontend/` |
| qiankun                              | `qiankun/`       |
| Zustand、状态管理                    | `zustand/`       |
| 生活、思考、随笔                     | `life/`          |

如果主题跨多个分类，选最核心的那个；完全不匹配时放根目录。

### 文件命名规范

- 小写英文字母 + 连字符
- 简洁描述文章核心内容
- 例：`claude-code-config.md`、`react-suspense-patterns.md`、`http2-push-vs-preload.md`

### 写入步骤

1. 根据文章主题确定子目录
2. 使用 Write 工具将文章写入 `[子目录]/[文件名].md`
3. 读取该子目录的 `_meta.json`，将新文件名（不含 `.md` 扩展名）追加到数组末尾
4. 使用 Edit 工具更新 `_meta.json`
5. 告知用户最终文件路径：`LazyBlog/docs/posts/[子目录]/[文件名].md`
