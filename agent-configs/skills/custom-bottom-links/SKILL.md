---
name: bottom-links
description: Add a bottom-of-response file link list in `path:line` format and keep file paths concise. Use whenever you output any file path in a response (any conversation).
---

# Bottom Links

## Overview

Every response that mentions file paths must end with a jump list for quick IDE navigation.

## Rules

1. **All paths must be absolute** (e.g. `/Users/a111111/code/project/src/index.tsx:42`).
2. Format: `path:line` or `path:line:col`. Line unknown → use `:1`.
3. One path per line, de-duplicate, keep first-seen order.
4. Jump list block must be preceded by one blank line, no other content on path lines.

## Demo

✅ Correct:

```
Here is the analysis of the rendering chain...

/Users/a111111/code/project/src/pages/_app.tsx:27
/Users/a111111/code/project/src/layouts/RootLayout/index.tsx:29
/Users/a111111/.claude/skills/custom-bottom-links/SKILL.md:1
```

❌ Wrong — relative path, IDE cannot resolve:

```
src/pages/_app.tsx:27
```

❌ Wrong — `---` touching paths, parsed as part of path:

```
---
/Users/a111111/code/project/src/pages/_app.tsx:27
```

❌ Wrong — extra text on same line:

```
/Users/a111111/code/project/src/pages/_app.tsx:27 ← entry file
```
