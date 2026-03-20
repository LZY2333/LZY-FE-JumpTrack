# Node Exploration Format

When the user provides a Figma file or page URL without specifying an exact node, flatten the node tree into this human-readable table so the user can select targets.

## Table Format

Present nodes in a numbered table with both technical and human-readable fields:

```text
Index | nodeId   | Name          | Type     | Page      | Parent Path             | Visible | Size      | Children | Text Preview   | Style Tags
1     | 12:34    | Hero Section  | FRAME    | Landing   | Page:Landing/Main       | yes     | 390×360   | 18       | —              | typo/title, color/primary
2     | 56:78    | Get Started   | TEXT     | Landing   | Page:Landing/Hero       | yes     | 180×32    | 0        | 点击开始设计    | typo/body, space/x16
3     | 90:21    | Feature Card  | FRAME    | Landing   | Page:Landing/Features   | yes     | 320×160   | 5        | 功能说明        | —
```

### Column Definitions

| Column | Description |
|--------|-------------|
| **Index** | Sequential number for easy selection |
| **nodeId** | Figma node ID (e.g. `12:34`) |
| **Name** | Human-readable node name from Figma |
| **Type** | Figma node type (`FRAME`, `TEXT`, `RECTANGLE`, `COMPONENT`, `INSTANCE`, etc.) |
| **Page** | Which page the node belongs to |
| **Parent Path** | Ancestor chain from page root to parent |
| **Visible** | Whether the node is currently visible |
| **Size** | Width × Height in design pixels |
| **Children** | Number of direct child nodes |
| **Text Preview** | First ~20 chars of text content, or `—` if none |
| **Style Tags** | Notable style references (typography, color, spacing tokens) |

## Detailed JSON Format (optional)

When the user needs more context for a specific node, provide the detailed format:

```json
{
  "index": 1,
  "nodeId": "12:34",
  "name": "Hero Section",
  "type": "FRAME",
  "humanType": "容器区块",
  "page": "Landing",
  "parentChain": ["Page:Landing", "Main Frame"],
  "visible": true,
  "size": { "width": 390, "height": 360 },
  "childrenCount": 18,
  "textPayload": "",
  "styleRefs": ["Typography/Title/XL", "Color/Primary"],
  "summary": "主视觉区块，含标题和 CTA 按钮区域"
}
```

## Selection Protocol

1. Present the table and ask the user to choose by index or `nodeId` (supports multi-select).
2. Store the selection as a list: `selection: ["12:34", "56:78"]`.
3. If the selection is empty, **stop and wait**. Do not auto-select or guess.
4. Only selected nodes participate in implementation or mutation steps.
5. Unselected nodes serve as read-only context for the current session.
