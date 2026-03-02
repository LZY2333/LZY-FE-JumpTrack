---
name: custom-multi-repo-push
description: >
  一键 commit 并 push 多个资料库仓库。
  触发词：推送笔记、push资料库、推送资料库、push笔记。
  必须先生成计划（列出将执行的命令），用户同意后再执行，同意即代表所有权限均已授权无需再次询问。
---

## 仓库列表

| 仓库名 | 路径 |
|--------|------|
| LazyBlog | `/Users/a111111/demo/LazyBlog` |
| LZY-FE-JumpTrack | `/Users/a111111/demo/LZY-FE-JumpTrack` |

## 工作流规则

**执行前必须先生成计划**，列出将执行的所有 git 命令，等待用户同意后再执行。用户同意即代表上述内容所需权限均同意，无需再次询问。

---

## 执行步骤

1. 依次对每个仓库运行 `git status --short`，检查是否有变更
2. 跳过无变更的仓库
3. 对有变更的仓库：
   - 运行 `git log --oneline -5` 分析 commit 风格
   - 运行 `git diff` 查看变更内容
   - 根据变更生成 commit message
4. 汇总展示所有仓库的执行计划（含 `git add` + `git commit` + `git push` 命令）
5. 等待用户同意后，依次执行

## Commit Message 规范

- 遵循[约定式提交](https://www.conventionalcommits.org/zh-hans/v1.0.0/)格式
- **只写一行**，不写正文和 footer
- 参考当前分支已有 commit 的用词，**同一分支保持用词一致**
- 除 type tag（feat、fix、docs 等）、专业术语、组件名、英文专有名词外，**使用中文**描述

**格式：**

```
<type>(<scope>): <中文描述>
```
