---
name: figma-to-code
description: Translate Figma designs into production-ready code using Figma MCP and Chrome DevTools MCP browser validation. Use when a task includes a Figma URL or node id, requires fetching design context, screenshots, or assets from Figma, comparing an implementation against localhost or a deployed page, or applying Figma-driven UI fixes in an existing codebase.
metadata:
  author: Leon
---

# Figma To Code

Implement or review UI from exact Figma nodes instead of approximating from memory. Fetch structured design data first, adapt it to the target stack and conventions, then validate the rendered result in the user's real Chrome browser via Chrome DevTools MCP.

## Workflow

0. Check MCP readiness.
   - Verify **Figma MCP** is available by calling `get_figma_data` (Framelink) or `get_design_context` (official Figma MCP) with a lightweight probe. If the call fails or the server is not listed, stop and tell the user which Figma MCP needs to be configured in Cursor settings.
   - Verify **Chrome DevTools MCP** is available by calling `list_pages`. If it fails, tell the user to open Chrome with DevTools MCP enabled and ensure the MCP server is configured in Cursor.
   - Do not proceed to any write or implementation step until both MCPs respond successfully.

1. Discover or load project conventions.
   - Check whether `{{project_root}}/.claude/figma-to-code-conventions.md` exists in the target project root.
   - If it exists, read it and use it as the project conventions reference for this session. Skip the rest of this step.
   - If it does not exist, scan the project to fill in the template [project-conventions.template.md]({{skill_path}}/references/project-conventions.template.md), using [example-conventions-pollo-ai.md]({{skill_path}}/references/example-conventions-pollo-ai.md) as a filled example:
     - Read `package.json` for project name, dependencies (hooks libraries, font tools), and dev scripts.
     - Glob for theme/token files (`**/theme.*`, `**/tokens.*`, `**/variables.css`) and font config files (`**/font*.*`) in the target area.
     - Sample 3-5 existing components near the target to identify image components, module structure, utility class patterns, and callback conventions.
     - Check `.env*` files or dev scripts for the local dev URL.
     - Omit any `<!-- OPTIONAL_SECTION -->` block entirely if no matching pattern is found in the project.
     - Limit discovery to roughly 10-15 files for efficiency.
   - Write the filled result to `{{project_root}}/.claude/figma-to-code-conventions.md`.
   - Briefly tell the user that conventions were discovered (or loaded from cache).

2. Resolve the exact target.
   - Use the exact Figma link or node id the user gave.
   - If the user provided a precise `node-id`, go directly to Step 3.
   - If the user only provided a file or page URL without a specific node, run the **Node Exploration** sub-flow:
     a. Call `get_figma_data` (or `get_design_context`) for the file/page scope.
     b. Flatten the returned node tree into a human-readable inventory table. See [node-exploration-format.md]({{skill_path}}/references/node-exploration-format.md) for the standard format.
     c. Present the table to the user and ask them to select target nodes by index or `nodeId`.
     d. Wait for a non-empty selection before proceeding. Do not guess or auto-select.
     e. Only selected nodes participate in implementation or mutation; unselected nodes are read-only context.
   - Identify the target page, route, component, and viewport that should match the node.
   - If the request is only a review, keep the existing implementation unchanged until you have concrete findings.

3. Fetch design data from Figma MCP.
   - Call `get_figma_data` (Framelink) or `get_design_context` (official) for the exact node.
   - If the MCP provides a screenshot capability (e.g. `get_screenshot`), capture the design screenshot before making visual claims.
   - Call `get_metadata` only when the node is too large or you need child ids before narrowing the scope.
   - Call `get_variable_defs` when colors, typography, spacing, or token names need to be verified.
   - Treat the generated React/Tailwind from Figma as design evidence, not as final code style.

4. Prepare required assets before coding.
   - Right after the Figma node has been fetched, decide whether the implementation needs a new image asset, icon asset, or can reuse an existing repo or CDN resource.
   - If the node includes a new image or icon that is not already available in the project, use [figma-asset-pipeline](../figma-asset-pipeline/SKILL.md) at this stage, before reading or editing the implementation code.
   - If `figma-asset-pipeline` is not installed in the current environment, tell the user to install it first:
     ```bash
     npx skills add https://cnb.cool/awesomeaicode/ai/skills.git --skill figma-asset-pipeline
     ```
     If the user chooses not to install, fall back to Framelink `download_figma_images` to export assets directly to the local project directory. Note that this fallback skips compression and CDN upload steps that `figma-asset-pipeline` provides.
   - Continue only after the asset pipeline has returned a stable asset path or reusable icon result that the code can reference.

5. Read the target codebase before editing.
   - Inspect the current component, styling system, and any design-token conventions already used by the project.
   - Reuse existing components, icons, hooks, and motion patterns when possible instead of rebuilding them.
   - Adapt Figma assets and structure to the project instead of copying the generated code verbatim.
   - Follow the project conventions discovered in Step 1 for styling, typography, components, and state management.

6. Implement or inspect.
   - For implementation tasks, preserve the existing app architecture and only change what is needed for parity.
   - Split UI into reasonable modules when the design contains distinct responsibilities such as state control, floating entry points, sheets, or reusable subparts.
   - When components are split, move them into separate files instead of leaving multiple substantial components in one file. Prefer one primary component per file and avoid file growth that makes review or reuse difficult.
   - For review tasks, compare the current rendering against the Figma screenshot and metadata before suggesting fixes.
   - Prefer exact measurements for typography, spacing, sizing, radius, layering, and motion.
   - If Figma copy appears to contain an obvious typo, call that out explicitly before changing user-facing text.

7. Validate in Chrome DevTools MCP (preferred) or browser tool.
   - **Preferred path — Chrome DevTools MCP:**
     a. Call `navigate_page` with the target URL (local dev URL from project conventions).
     b. If the page does not load, start or restart the local dev server using the dev command from project conventions before retrying.
     c. Call `resize_page` or `emulate` to match the design viewport. For mobile designs, use `emulate` with `viewport` set to the design dimensions plus `mobile,touch` flags.
     d. Dismiss blocking popups: use `take_snapshot` to detect cookie banners, modals, or onboarding layers, then `click` to dismiss them.
     e. Align the page state to match the Figma node: navigate to the correct route, select the right tab, open/close drawers, scroll to position.
     f. Call `take_screenshot` to capture the implemented state.
     g. Compare the local screenshot against the Figma design screenshot as the primary parity check.
     h. Use `evaluate_script` with `getBoundingClientRect()` and `getComputedStyle()` to measure specific elements when a mismatch needs quantification.
     i. Call `list_console_messages` with `types: ["error", "warn"]` to check for runtime errors.
     j. Call `list_network_requests` and look for failed requests (4xx/5xx).
   - **Fallback path — Playwright or other browser tool:**
     Use only when Chrome DevTools MCP is unavailable (detected in Step 0). Follow the same viewport-matching, state-alignment, and screenshot-comparison logic.
   - Treat `Figma screenshot vs local development screenshot` as the primary parity check. Capture both in the same state and viewport before declaring the UI correct.
   - Align data-dependent state before judging parity: locale, login state, feature flags, reward state, dynamic counts, and any other inputs that change the rendered UI.
   - If a mismatch is caused by data rather than implementation, normalize the state first and only then continue the visual comparison.

8. Report or finish.
   - If reviewing, list concrete mismatches first and include file refs or measured values when possible.
   - If implementing, run an explicit `validate → fix → revalidate` loop. Keep looping until data-side differences have been eliminated and the local development screenshot matches the Figma screenshot, or until the user explicitly accepts the remaining gap.
   - Mention which artifacts were used: Figma screenshot, local development screenshot, metadata, DOM measurements.

## Chrome DevTools MCP Quick Reference

Key tools for browser validation (server: `chrome-devtools`):

| Tool | Purpose |
|------|---------|
| `navigate_page` | Open a URL, go back/forward, or reload |
| `resize_page` | Set exact viewport width × height |
| `emulate` | Emulate device viewport, color scheme, network, user agent |
| `take_screenshot` | Capture page or element screenshot (png/jpeg/webp) |
| `take_snapshot` | A11y tree snapshot for structural inspection and uid lookup |
| `evaluate_script` | Run JS in page (measurements, computed styles, state checks) |
| `click` / `hover` / `drag` | Interact with elements by uid |
| `list_console_messages` | Check for console errors and warnings |
| `list_network_requests` | Check for failed network requests |
| `wait_for` | Wait for element, navigation, or network idle |

## Implementation Rules

- Preserve the target project's stack, code style, and design-system usage.
- Prefer existing codebase components over new primitives whenever they can satisfy the design.
- Use Figma-provided assets directly when MCP returns usable asset URLs.
- Prepare required new image assets and icons before coding begins, not midway through implementation.
- Do not add Tailwind or new UI libraries unless the target project already uses them or the user explicitly asks.
- Keep the scope tight to the referenced node and the UI it affects.
- Keep component boundaries clean and split large UI surfaces into reasonable modules.
- Prefer separate files for split components; avoid one file containing many components or growing unnecessarily large.
- Prefer exact parity over reinterpretation for spacing, typography, and hierarchy.
- Eliminate data-side noise before making visual parity claims.
- Use screenshot-to-screenshot comparison as the acceptance baseline; measured DOM values are supporting evidence only.
- Do not stop after the first implementation pass; keep the implement → validate → fix loop running until the remaining differences are gone or explicitly called out as accepted by the user.

## Review Mode

When the user asks to verify or compare an implementation:

- Fetch the Figma screenshot and metadata first.
- Use Chrome DevTools MCP to capture the local or deployed implementation in the same state and viewport, and compare that screenshot directly against the Figma screenshot.
- Normalize data-dependent state before reporting visual mismatches.
- Report visual mismatches in descending importance.
- Use `evaluate_script` with `getBoundingClientRect()` and `getComputedStyle()` for measured values when available.
- Treat textual typos in Figma as design-source issues unless the user explicitly wants the typo preserved.

Use [review-checklist.md]({{skill_path}}/references/review-checklist.md) when you need a tighter parity checklist for browser validation and visual review.
