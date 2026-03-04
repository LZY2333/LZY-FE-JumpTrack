---
name: stash-comment
description: 储存/还原项目注释的工作流。使用 git stash 保存代码注释，导出 patch 文件备份，支持跨电脑还原。
user_invocable: true
trigger: (储存项目注释|stash项目注释|还原项目注释|apply项目注释)
arguments:
    - name: action
      description: '储存(stash) 或 还原(apply)'
      required: true
---

# Git Stash 注释工作流

管理项目中的理解性注释，不污染 git 提交历史，支持跨电脑恢复。

## 通用规则

- stash message 和 log 标题使用**英文组件名**列举涉及的组件
- 变更记录文件为项目根目录的 `.comment-stash-log.md`

## patch 文件路径

- 主路径：`/Users/a111111/demo/LZY-FE-JumpTrack/data-in-project/`
- 如果主路径不存在，执行 fallback 查找：

```bash
find ~ -maxdepth 4 -type d -path "*/LZY-FE-JumpTrack/data-in-project" 2>/dev/null | head -1
```

## patch 文件名格式

`{简略项目名(不超过两个单词)}-{YYYYMMDD-HHmm}-{stash_message_关键词}.patch`

示例：`ai-video-20260304-1430-HeaderActions-UserInfo.patch`

---

## 储存项目注释（stash）

当用户说「储存项目注释」或「stash项目注释」时执行以下流程：

### 步骤 1：检查工作区并展示变更摘要

```bash
git status --porcelain
git diff --stat
git diff -U0
```

**阻断检查：**
- 如果没有任何变更，提示「工作区没有修改，无需储存」并退出。
- 如果存在已暂存（staged）的修改，提示「工作区存在已暂存的修改，请先提交或取消暂存后再储存注释」并退出。

**展示变更摘要**给用户确认储存范围。

**代码修改检测：** 分析 `git diff -U0` 输出，判断每个变更块（hunk）：
- **纯注释变更**：新增/修改的行仅包含 `//`、`/* */`、`{/* */}`、`<!-- -->`、`#` 等注释语法
- **代码修改**：如果发现非注释的代码变更（新增逻辑、修改变量、删除代码行等），**必须警告用户**：

> ⚠️ 检测到以下文件包含非注释的代码修改，stash 后这些代码变更也会被一并保存：
>
> - `path/to/file.tsx` (第 xx 行: 非注释修改)
>
> 是否继续？

等待用户确认后再继续。

### 步骤 2：生成 stash message

基于 `git diff --name-only` 的变更文件，提取组件名/文件名，生成 stash message：

格式：`[项目注释] {组件名1}, {组件名2}, ...`

示例：`[项目注释] HeaderActions, UserInfo, FormGenerate`

- 组件名取自文件路径中最能代表组件的目录名或文件名（去掉 index.tsx 等）
- 如果组件过多（>5 个），保留前 5 个并加 `等{N}个组件`

### 步骤 3：创建/更新变更记录文件

在项目根目录创建或更新 `.comment-stash-log.md`，追加一条记录：

```md
---

## HeaderActions, UserInfo, FormGenerate

- **Stash Message:** `[项目注释] HeaderActions, UserInfo, FormGenerate`
- **时间:** 2026-03-04 14:30
- **变更统计:** 5 files changed, 45 insertions(+), 2 deletions(-)
- **变更组件:**
    - `/Users/xxx/code/project/web/src/pages/pollo.ai/_components/HeaderActions/index.tsx:1`
    - `/Users/xxx/code/project/web/src/pages/pollo.ai/_components/UserInfo/index.tsx:1`
```

如果文件不存在，先创建文件头：

```md
# 项目注释变更记录
```

然后追加记录。变更组件使用**绝对路径**，格式 `path:1`。

### 步骤 4：执行 stash

```bash
# 先将 log 文件也加入暂存
git add .comment-stash-log.md
# 执行 stash（包含未跟踪的 log 文件）
git stash push -m "[项目注释] HeaderActions, UserInfo, FormGenerate"
```

### 步骤 5：导出 patch 文件

```bash
# 找到刚才的 stash（通常是 stash@{0}）
git stash show -p stash@{0} > "{patch文件路径}"
```

如果目标路径已存在同名 patch 文件，在文件名末尾追加 `-v2`、`-v3` 等后缀。

### 步骤 6：完成报告

输出操作摘要：

- stash message
- patch 文件完整路径
- 变更文件数量

---

## 还原项目注释（apply）

当用户说「还原项目注释」或「apply项目注释」时执行以下流程：

### 步骤 1：检查工作区

```bash
git status --porcelain
```

如果有未提交的修改（staged 或 unstaged），提示「工作区存在未提交的修改，请先提交或 stash 当前修改后再还原注释」并退出。

### 步骤 2：查找注释来源

按优先级查找：

**优先级 1：本地 stash**

```bash
git stash list | grep "\[项目注释\]"
```

**优先级 2：patch 文件**

到 patch 存储目录中，按当前项目的简略名匹配 patch 文件。

如果两个来源都找到了匹配项，列出所有选项让用户选择：

> 找到以下注释来源：
>
> 1. [stash] stash@{0}: `[项目注释] HeaderActions, UserInfo`
> 2. [patch] ai-video-20260304-1430-HeaderActions-UserInfo.patch
>
> 请选择要还原的来源。

如果只有一个来源且只有一条匹配，直接使用。

### 步骤 3：冲突预检

从 stash 还原：

```bash
git stash apply --check stash@{N} 2>&1
```

从 patch 还原：

```bash
git apply --check "{patch文件路径}" 2>&1
```

如果预检失败，报告冲突文件并询问用户是否强制还原（`--3way`）。

### 步骤 4：执行还原

从 stash 还原：

```bash
git stash apply stash@{N}
```

从 patch 还原：

```bash
git apply "{patch文件路径}"
```

### 步骤 5：完成报告

输出操作摘要：

- 还原来源（stash 或 patch）
- 还原的文件数量

