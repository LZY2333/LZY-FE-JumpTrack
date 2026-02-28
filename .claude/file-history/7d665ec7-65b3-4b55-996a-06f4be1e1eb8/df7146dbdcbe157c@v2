---
name: custom-git
description: >
  Git 提交和创建新分支的工作流。当用户需要：
  (1) 执行 git commit 提交代码；
  (2) 创建新的 git 分支；
  时使用。必须先生成计划（列出将执行的命令），用户同意后再执行，同意即代表所有权限均已授权无需再次询问。
---

## 工作流规则

**执行前必须先生成计划**，列出将执行的所有 git 命令，等待用户同意后再执行。用户同意即代表上述内容所需权限均同意，无需再次询问。

---

## Git Commit

### 执行步骤

1. 运行 `git log --oneline -10` 查看当前分支已有 commit，分析用词和风格
2. 运行 `git status` 和 `git diff --staged` 查看变更内容
3. 根据变更生成符合规范的 commit message
4. 展示完整计划（含 `git add` + `git commit` 命令）
5. 等待用户同意后执行

### Commit Message 规范

- 遵循[约定式提交](https://www.conventionalcommits.org/zh-hans/v1.0.0/)格式
- **只写一行**，不写正文和 footer
- 参考当前分支已有 commit 的用词，**同一分支保持用词一致**
- 除 type tag（feat、fix、docs 等）、专业术语、组件名、英文专有名词外，**使用中文**描述
- emoji 由 git hook 自动添加，无需手动写

**格式：**

```
<type>(<scope>): <中文描述>
```

**示例：**

```
feat: 新增用户登录功能
fix: 修复视频列表加载失败问题
refactor: 重构支付模块逻辑
chore: 更新依赖版本
```

---

## 创建新分支

### 执行步骤

1. 运行 `git branch -a | head -20` 查看已有分支，分析命名风格
2. 根据任务内容生成符合规范的分支名
3. 展示完整计划（含 `git fetch` + `git checkout` 命令）
4. 等待用户同意后执行

### 分支命名规范

- 参考当前项目已有的分支名风格
- **最多四个单词**（用 `-` 连接）
- **基于最新 master** 创建

| 类型 | 格式 | 用途 |
|------|------|------|
| 功能开发 | `feat/xxx` | 功能模块开发，合并到 develop |
| 功能开发（发布） | `feat/YYYYMMDD_xxx` | 需发布到 feat 环境 |
| 多人协作 | `feat/xxx/:name` | 多人开发同一迭代，`:name` 替换为自己名字 |
| 紧急修复（日期） | `hotfix/YYYYMMDD` | 当天修复并发布，时效不超过次日 |
| 功能修复 | `hotfix/fix-xxx-xxx` | 修复具体功能 BUG |

**执行命令模板：**

```bash
git fetch origin
git checkout -b <branch-name> origin/master
```
