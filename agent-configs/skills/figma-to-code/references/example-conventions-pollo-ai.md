# Pollo AI Web Conventions

> This is an example of a filled project conventions file for Pollo AI. See [project-conventions.template.md](project-conventions.template.md) for the blank template.

Use this reference when the target lives under `web/src/pages/pollo.ai/**` in this repository.

## Styling

- Use `web/src/pages/pollo.ai/_styles/figma-theme.ts` as the source of truth for colors.
- Prefer `var(--f-...)` tokens and `text-f-*`, `bg-f-*`, `border-f-*` utility classes where available.
- Do not introduce Tailwind default gray/zinc/slate/neutral classes or hardcoded hex values when an `f-` token exists.
- Preserve the existing visual language in `pollo.ai`; do not restyle components beyond what the Figma node requires.

## Typography

- Reuse fonts from `web/src/styles/next-font.ts` instead of introducing new font-loading code.
- `Inter` and `Roboto Condensed` are already available there and should cover common Figma typography in this area.
- Match Figma typography with computed values: family, weight, size, line height, letter spacing, casing, and italics.

## Component Patterns

- Prefer existing repo components before creating new primitives.
- Do not rebuild buttons, modals, images, icons, or motion wrappers if an existing repo component already covers the use case.
- Reuse `LazyImage` for simple image rendering in `pollo.ai` pages.
- Keep component structure modular when the UI has distinct parts such as badge, sheet, and controller logic.
- Split large components by responsibility instead of leaving state control, view rendering, and reusable subparts in one file.
- When a component is split by responsibility, create separate files for those parts instead of stacking multiple substantial components in one file.
- Prefer one primary component per file whenever practical, and keep file length under control so review and maintenance stay manageable.
- Preserve existing business gating and analytics behavior unless the Figma task explicitly requires behavior changes.

## Hooks And State

- Prefer `ahooks` helpers already used in this repo, especially `useMemoizedFn` for stable callbacks.
- When local persistence is needed, prefer `useLocalStorageState` if that pattern is already in use nearby.
- Keep browser-only logic guarded behind existing environment helpers like `isBrowser`.

## Asset Hand-Off

- If the implementation needs a new image asset or icon instead of an existing repo or CDN resource, hand that work to [figma-asset-pipeline](../../figma-asset-pipeline/SKILL.md) immediately after fetching the Figma node.
- Finish asset preparation before reading or editing the implementation code, then continue `figma-to-code` with the returned stable asset path or reusable icon result.

## Browser Verification

- Use the mobile localhost route `http://dev.pollo.ai.localhost:3000` when verifying `pollo.ai` page work unless the user gives a different route.
- If that localhost route fails to open, start or restart the local dev service with `nr dev` or `pnpm run dev`, then retry the page before reporting an access problem.
- Match the viewport to the Figma node before comparing screenshots.
- The core acceptance check is always `Figma screenshot vs local development screenshot`. Do not treat the task as passed until those two screenshots match in the same state and viewport.
- Align all data-driven conditions that affect the screen before deciding there is a UI mismatch: login state, geo gating, feature flags, reward status, counts, localized copy, and similar runtime inputs.
- Also align non-data UI state before comparing: scroll position, selected tab, open drawer or sheet state, hover or pressed state, carousel position, and any drag-end location that changes layout.
- If the observed difference is caused by data, remove that variable first and rerun the comparison instead of reporting it as an implementation bug.
- Dismiss blocking layers such as cookie banners, update modals, and sign-in prompts before collecting screenshots or measuring DOM styles.
- When reviewing parity, capture both:
  - A screenshot of the rendered state from the local development environment
  - The matching Figma screenshot for side-by-side comparison
  - Measured DOM values for key elements when a mismatch is subtle
- Recheck the common failure points explicitly: font fallback, wrong line break, cropped image mismatch, safe-area overlap, layering issues, and post-interaction final state.
- After every UI change, repeat the `verify -> fix -> verify again` cycle until data-side noise has been removed and the local development screenshot matches the Figma screenshot, or the user explicitly accepts the remaining gap.

## Reporting

- Call out exact file paths for implementation differences.
- Report concrete visual deltas first: layout, typography, tokens, spacing, layering, motion.
- Distinguish between implementation bugs and probable Figma-source content mistakes.
