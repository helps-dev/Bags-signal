# Design System Strategy: High-Velocity Intelligence

## 1. Overview & Creative North Star: "The Neon Architect"
This design system is built to transform complex Solana blockchain data into immediate, actionable intelligence. Our Creative North Star is **"The Neon Architect."** 

Unlike standard "SaaS dashboards" that rely on rigid borders and flat grey boxes, this system treats the UI as a high-precision instrument. We break the "template" look by utilizing **intentional asymmetry**—where data-heavy modules are balanced by expansive, breathable negative space—and **tonal depth**. We move away from the "flat web" by layering information like a heads-up display (HUD), using overlapping glass containers and "light-leak" glows to guide the trader’s eye toward high-probability signals.

---

## 2. Color & Surface Architecture
We do not build with lines; we build with light and depth.

### The Color Palette
- **Core Background:** `surface` (#131313). A deep, light-absorbent charcoal.
- **The Signal (Primary):** `primary_container` (#00FFA3). Use for "Success," "Buy Signals," and "Growth."
- **The Intelligence (Secondary):** `secondary_container` (#00E0FF). Reserved for AI-driven insights, bot activity, and technical indicators.
- **The Warning (Tertiary):** `tertiary_fixed_dim` (#FFBA20). Used for cautious alerts.
- **The Risk (Error):** `error` (#FFB4AB). For high-risk liquidity rugs or sell signals.

### Surface Hierarchy: The "No-Line" Rule
**Explicit Instruction:** Do not use 1px solid borders to section content.
Boundaries are defined through background shifts and nesting:
1.  **Base Layer:** `surface` (#131313) for the main application background.
2.  **Sectioning:** Use `surface_container_low` (#1C1B1B) to define major layout regions.
3.  **Module Layer:** Place `surface_container` (#201F1F) or `surface_container_high` (#2A2A2A) cards on top of the sectioning layer.
4.  **The "Glass & Gradient" Rule:** Main CTAs or active signal cards should use a linear gradient from `primary_fixed` to `primary_container`. For floating overlays, use a backdrop-blur (12px–20px) combined with `surface_variant` at 40% opacity.

---

## 3. Typography: Editorial Data
Our typography bridges the gap between high-end editorial and technical terminal.

- **Display & Headlines:** We use **Space Grotesk**. Its wide apertures and geometric construction feel "engineered." Use `display-lg` for portfolio totals and `headline-sm` for token names.
- **Body & Data:** We use **Inter**. It is the gold standard for readability. For data tables and token prices, utilize Inter’s tabular numbers feature to ensure decimals align perfectly.
- **Hierarchy as Signal:** Use `label-sm` in `on_surface_variant` for metadata (e.g., "Timestamp") to keep it secondary to the `title-md` price action.

---

## 4. Elevation & Depth: Tonal Layering
Traditional drop shadows are too "soft" for a high-tech platform. We use **Ambient Radiance**.

- **The Layering Principle:** Achieve lift by stacking. A `surface_container_highest` card sitting on a `surface` background creates a natural, sophisticated elevation without a single pixel of "ink."
- **Ambient Shadows:** For floating modals, use a shadow with a 32px blur, 0% spread, and 6% opacity. The shadow color must be derived from `primary_container` (for positive signals) or `secondary_container` (for AI insights) to create a subtle "glow" rather than a dark void.
- **The "Ghost Border" Fallback:** If a separator is required for accessibility, use the `outline_variant` token at **15% opacity**. It should be felt, not seen.

---

## 5. Components
Every component must feel like a precision-milled tool.

### Buttons & Interaction
- **Primary:** Gradient fill (`primary_fixed` to `primary_container`) with `on_primary_fixed` text. No border.
- **Secondary:** Transparent background with a "Ghost Border" (`outline_variant` at 20%). On hover, fill with `surface_bright`.
- **Tertiary/Ghost:** Pure text using `primary_fixed_dim`. Use for "View All" or "Settings."

### Cards & Data Lists
- **Forbid Divider Lines:** Use `8px` or `12px` of vertical white space (from the Spacing Scale) combined with a subtle shift to `surface_container_low` on hover to separate list items.
- **Glass Chips:** Use for "Token Tags" (e.g., #Solana, #Meme). Background: `surface_variant` at 30% opacity, Blur: 4px, Border: 1px `outline_variant` at 10%.

### Specialized Intelligence Components
- **Signal Pulse:** A small, 8px circular div using `primary` with a CSS "ripple" animation to indicate live AI scanning.
- **The Heatmap Cell:** Instead of borders, use varying saturations of `secondary_container` to represent data density.

---

## 6. Do's and Don'ts

### Do:
- **Use "Optical Purity":** Align elements to a strict 8px grid, but allow "hero" elements (like a signal chart) to break the grid slightly to create a bespoke, non-templated feel.
- **Embrace the Glow:** Use subtle, large-radius blurs of `primary` (at 5-10% opacity) in the background of the screen to simulate a high-tech monitor glow.
- **Prioritize Numbers:** Ensure `title-lg` is used for the most important data points; users are here for numbers, not marketing copy.

### Don't:
- **No Heavy Borders:** Never use a solid #000 or #FFF 1px border. It shatters the "Glassmorphism" illusion.
- **No Generic Icons:** Avoid rounded, "bubbly" icons. Use sharp-edged, 1.5pt stroke icons that match the precision of Space Grotesk.
- **No Pure Greys:** Ensure all "neutral" surfaces have a hint of "coolness" or "charcoal" to stay aligned with the high-tech Solana aesthetic.