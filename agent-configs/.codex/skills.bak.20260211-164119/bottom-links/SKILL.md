---
name: bottom-links
description: Add a bottom-of-response file link list in `path:line` format and keep file paths concise. Use whenever you output any file path in a response (any conversation).
---

# Bottom Links

## Overview

Use short workspace-relative paths in the prose and add a jump list of all file paths at the end of each response for quick navigation.

## Response Guidelines

- Use **workspace-relative paths** from the workspace root for files inside the repo (strip absolute prefixes like `/Users/...`).
- If a file is **outside the workspace**, use an **absolute path**.
- **Never use `..` segments** in the jump list; they often break clickability.
- **Require clickable format**: use `path:line` (or `path:line:col`) only.
- If a line number is unknown, use `:1` and mention in prose that the exact line is unknown.
- De-duplicate paths; keep the first-seen order.
- When summarizing terminal output that includes file paths, restate those paths in relative (or absolute, if outside workspace) form in the response.

## Jump Links Block

At the very end of the response, output each mentioned file path once in Cursor-clickable format:

```
path/to/file.ts:42
path/to/other.tsx:10:5
```

Requirements:

- One path per line.
- No extra text on the same line as the path.
- Include only the paths that appeared in the response.
