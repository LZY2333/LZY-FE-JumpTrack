---
name: variable-flow
description: Generate variable flow and field inheritance documentation for a feature/module. Use when asked for “变量流转解析”, “字段继承关系”, “生成流转文档”, or to trace variables across components/hooks and summarize layers in a single JS code block with inline comments.
---

# Variable Flow

## Overview
Produce a three-layer flow summary using the exact section formats below with renamed headings:
1) **起点到页面链路** (file path flow),
2) **组件内传递链路** (code pass-through flow),
3) **对象字段演进** (object field flow),
4) **路径直达链接** (add clickable links at the end of each `##` section).

Only **对象字段演进** may use a JavaScript code block. The other two sections must be plain text lists.

## 起点到页面链路
Use the same format as `___zee_videoDetail` path flow:
- Heading must be `## 起点到页面链路（... → Page）` (adapt the left side to the real source, e.g., `video-detail.vo.ts → Page`).
- Use a numbered list.
- Each item follows: **短标签**：`path` 说明。
- Keep paths repo-relative and wrap them in backticks.
- At the end of this section, add a `**路径直达：**` list with clickable links for all paths mentioned in this section.

## 组件内传递链路
Use the same format as `___zee_videoDetail` internal flow:
- Heading must be `## 组件内传递链路（<target-file>）` (replace `<target-file>` with the real file path).
- Use a numbered list.
- Each item uses **步骤标题**：描述，并用箭头描述变量传递路径。
- At the end of this section, add a `**路径直达：**` list with clickable links for all paths mentioned in this section.

## 对象字段演进
Use the same format as `___zee_videoDetail4` with the additions below:
- Output **one** JavaScript code block only.
- Above each object, include two comment lines:
  - `// 作用：...`
  - `// 出现位置：path:line` (must be clickable; include line number).
- If most keys share the same tag, put a **single summary tag** above the object:
  - Example: `// 默认标记：[inherit]（除特别标注外）`
- **Per-key tag placement**:
  - If a key needs a different tag, put it **at the end** of the inline comment.
  - If no per-key tag is needed, omit it and rely on the summary tag.
- Inline comment format:
  - `field: value, // 含义/作用 [tag]`
- Keep inline comments **left-aligned** as much as possible (pad spaces before `//` within the same object).
- Use placeholders: ``, `null`, `0`, `false`.
- Only list fields actually accessed in the frontend.
- After the JavaScript code block, add a `**路径直达：**` list with clickable links for all `出现位置` paths in this section.

### Required Layers (对象字段演进)
- VO/type definition
- API/SSR result
- Page props
- Intermediate matched data (if any)
- Component props
- Local state
- Hook-returned state
- Derived objects (e.g., selectedGeneration, menuOptionsData)
- Context value

### Hard Rules
- Do **not** output any extra code blocks outside “对象字段演进”.
- Keep headings and list styles consistent with the reference files.
- Every `##` section must end with `**路径直达：**` and clickable markdown links.
- For links, use `file:///absolute/path` targets; if a line is known, append `#L<line>`.
