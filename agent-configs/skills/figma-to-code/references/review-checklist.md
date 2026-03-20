# Figma Review Checklist

Use this checklist when the task is to compare an implementation against a Figma node or when visual parity is especially important.

## Before Comparing

- Confirm the exact node id and state being reviewed.
- Fetch design data and screenshot from Figma MCP for the same node.
- **Set up Chrome DevTools MCP viewport** to match the design:
  - Call `resize_page` for exact pixel dimensions, or
  - Call `emulate` with `viewport` for device emulation (e.g. `390x844x3,mobile,touch` for iPhone 14 Pro).
- Capture a fresh screenshot from the local development environment using Chrome DevTools MCP `take_screenshot` in the same state and viewport. The review is not complete until a Figma screenshot and a local screenshot are compared directly.
- Normalize data-driven inputs before comparing visuals: auth state, region, feature flags, reward status, content counts, and any dynamic copy or imagery.
- If needed, use `evaluate_script` to change local state, mocked data, or inject query params so the browser state matches the Figma scenario first.
- Align page position and UI state before comparing: same scroll position, same tab or carousel item, same expanded or collapsed state, same selected filters, same modal or sheet visibility. Use `click`, `hover`, or `evaluate_script` to manipulate state.
- Use `take_snapshot` to detect and then `click` to dismiss blockers such as cookie banners, update modals, or onboarding layers.
- Open the exact implementation state that corresponds to the design node.

## Compare These First

- Layout: container width, height, padding, gap, alignment
- Positioning: fixed/sticky placement, offsets, safe-area handling
- Typography: font family, size, weight, line height, letter spacing, casing
- Color: background, text, borders, overlays, gradients
- Shape: border radius, shadows, blur, strokes
- Media: image size, crop, aspect ratio, icon sizing
- Actions: button size, label weight, hover/active/disabled states
- Layering: z-index, scrim, modal stacking, close buttons, floating elements
- Motion: enter/exit direction, duration, spring feel, drag behavior

## High-Risk Misses

- Font loading: verify the actual rendered font is correct, not a fallback with similar metrics.
- Text wrapping: verify line breaks, truncation, uppercase rules, punctuation, and numeric formatting.
- Asset fidelity: verify the image or icon is the same resource, with the same crop and without visible compression artifacts.
- Safe areas and overlays: verify floating buttons, bottom sheets, and fixed bars are not being clipped or covered by mobile chrome or in-page navigation.
- Interaction end states: verify drag end position, snap result, open or close result, and hidden or shown elements after interaction.
- Responsive drift: verify the design viewport first, then quickly sanity-check a narrower and taller mobile viewport for overflow or clipping.
- Visual hierarchy: verify emphasis order still matches Figma after implementation, especially when gradients, shadows, or opacity are involved.

## Useful Measurements (via Chrome DevTools MCP)

- `take_screenshot` for Figma vs local side-by-side as the primary comparison artifacts
- `evaluate_script` with `getBoundingClientRect()` for size and placement
- `evaluate_script` with `getComputedStyle()` for typography, color, radius, shadows, and opacity
- `take_screenshot` with `uid` parameter for element-level captures at each critical interaction state
- `list_console_messages` with `types: ["error", "warn"]` for runtime error detection
- `list_network_requests` to verify no failed resource loads (fonts, images, API calls)
- Measurements only to explain or resolve screenshot deltas, not to replace screenshot comparison

## Reporting

- Lead with concrete mismatches, not summaries.
- Include measured values when they explain the difference clearly.
- Exclude pure data-state differences from implementation findings once the visual state has been normalized.
- Separate true implementation bugs from probable Figma-source issues such as typos.
- Distinguish static visual diffs from interaction-state diffs so the next fix pass is scoped correctly.
- If parity is already strong, say that explicitly and only list remaining deltas.
- After fixing deltas, use Chrome DevTools MCP to capture the local screenshot again and rerun the checklist in a `validate → fix → revalidate` loop until the normalized local screenshot matches the Figma screenshot or the user explicitly accepts the remaining gap.
