# Project Conventions: {{PROJECT_NAME}}

> Auto-discovered by figma-to-code. Edit freely to correct or extend.

## Styling

- Theme / token source file: `{{THEME_FILE_PATH}}` (e.g., `src/styles/theme.ts`, `src/tokens/variables.css`)
- CSS custom property prefix: `{{TOKEN_PREFIX}}` (e.g., `--f-`, `--ui-`, or "none — uses standard Tailwind")
- Utility class pattern: `{{UTILITY_CLASS_PATTERN}}` (e.g., `text-f-*`, `bg-brand-*`, or "standard Tailwind defaults")
- Do not introduce colors or tokens outside the project's existing system.
- Preserve the existing visual language; do not restyle components beyond what the Figma node requires.

## Typography

- Font config file: `{{FONT_CONFIG_PATH}}` (e.g., `src/styles/next-font.ts`, `src/styles/fonts.css`, or global CSS `@font-face` declarations)
- Available fonts: {{AVAILABLE_FONTS}} (e.g., `Inter`, `Roboto Condensed`)
- Reuse fonts from the config file instead of introducing new font-loading code.
- Match Figma typography with computed values: family, weight, size, line height, letter spacing, casing, and italics.

<!-- OPTIONAL_SECTION: component-patterns — include only if the project has identifiable reusable UI components -->
## Component Patterns

- Key image component: `{{IMAGE_COMPONENT}}` (e.g., `LazyImage`, `next/image`, `NuxtImg`, or standard `<img>`)
- Module structure: {{MODULE_STRUCTURE}} (e.g., one component per file, co-located styles, barrel exports)
- Prefer existing repo components before creating new primitives.
- Do not rebuild buttons, modals, images, icons, or motion wrappers if an existing repo component already covers the use case.
- Split large components by responsibility instead of leaving state control, view rendering, and reusable subparts in one file.
- Prefer one primary component per file whenever practical.
- Preserve existing business gating and analytics behavior unless the Figma task explicitly requires changes.
<!-- /OPTIONAL_SECTION -->

<!-- OPTIONAL_SECTION: hooks-and-state — include only if the project uses React or Vue hooks / composables -->
## Hooks And State

- Preferred utility library: `{{HOOKS_LIBRARY}}` (e.g., `ahooks`, `react-use`, `@vueuse/core`, or "none")
- Stable callback pattern: `{{STABLE_CALLBACK}}` (e.g., `useMemoizedFn`, `useCallback`, or "none")
- Local persistence pattern: `{{PERSISTENCE_PATTERN}}` (e.g., `useLocalStorageState`, direct `localStorage`, or "none")
- Browser-only guard: `{{BROWSER_GUARD}}` (e.g., `isBrowser` helper, `typeof window !== 'undefined'`)
<!-- /OPTIONAL_SECTION -->

## Asset Hand-Off

- Asset pipeline: {{ASSET_PIPELINE}} (e.g., "use figma-asset-pipeline skill", "manual upload to CDN", or "commit to repo assets/")
- Preferred: use `figma-asset-pipeline` skill for compression + CDN upload. If not installed, run `npx skills add https://cnb.cool/awesomeaicode/ai/skills.git --skill figma-asset-pipeline`.
- Fallback: use Framelink `download_figma_images` to export assets directly (skips compression and CDN upload).
- If the implementation needs a new image asset or icon instead of an existing repo or CDN resource, finish asset preparation before editing the implementation code.

## Browser Verification

- Dev server command: `{{DEV_COMMAND}}` (e.g., `pnpm dev`, `npm run dev`, `nr dev`)
- Local dev URL: `{{LOCAL_DEV_URL}}` (e.g., `http://localhost:3000`, `http://dev.myapp.localhost:3000`)
- If the dev server is not running, start it with the command above before verifying.
- Match the viewport to the Figma node before comparing screenshots.
- Core acceptance check: Figma screenshot vs local development screenshot in the same state and viewport.
- Align all data-driven conditions before deciding there is a UI mismatch: login state, feature flags, locale, dynamic counts, and similar runtime inputs.
- Also align non-data UI state: scroll position, selected tab, open drawer or sheet, hover or pressed state, carousel position.
- Dismiss blocking layers (cookie banners, update modals, sign-in prompts) before collecting screenshots.
- After every UI change, repeat the `verify → fix → verify` cycle until the local screenshot matches the Figma screenshot or the user explicitly accepts the remaining gap.

## Reporting

- Call out exact file paths for implementation differences.
- Report concrete visual deltas first: layout, typography, tokens, spacing, layering, motion.
- Distinguish between implementation bugs and probable Figma-source content mistakes.
