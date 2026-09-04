# Design System Specification — AETER Monitor Archetype & Clean Utilitarian Craft
**Project**: Smart City Energy & Environmental Telemetry
**Archetype**: `monitor.aeter.my.id` + `taste-minimalist` + `impeccable` + `frontend-ui-engineering`
**Audience**: Municipal Energy Directors, Infrastructure Engineers, Citizens

---

## 1. Design Philosophy
- **Authentic Materiality**: Premium frosted glass (`rgba(255, 255, 255, 0.72)` in light / `rgba(28, 29, 33, 0.85)` in dark card), multi-stop ambient lighting, subtle double-bezel hairline borders (`1px solid rgba(255, 255, 255, 0.85)`).
- **Anti-Slop Zero Tolerance**:
  - NO sci-fi / hacker gimmick badges (`CMD-01`, `GEO-02`, `v2.4-PRO`).
  - NO fake latency / simulated airflow metrics.
  - NO decorative blinking neon dots or animated radar pulse rings.
  - NO generic dark slate templates.
- **Quiet Confidence**: Macro-whitespace, high data density without visual friction, tactile interactive feedback.

## 2. Typography
- **Display & Interface**: `Plus Jakarta Sans`, sans-serif. Tight tracking (`-0.02em` on titles), high legibility, humane geometry.
- **Data, Telemetry & Timestamps**: `JetBrains Mono`, monospace. Strictly `tabular-nums` for continuous numeric scanning.

## 3. Color Tokens
- **Background Canvas**: Soft ambient warm-tinted light canvas or sleek obsidian glass substrate.
- **Surfaces**:
  - Glass Card: `rgba(255, 255, 255, 0.68)` (light) / `rgba(28, 29, 33, 0.85)` (dark)
  - Hairline Border: `rgba(255, 255, 255, 0.85)` (light) / `rgba(255, 255, 255, 0.08)` (dark)
  - Hairline Divider: `rgba(23, 24, 28, 0.08)` (light) / `rgba(255, 255, 255, 0.06)` (dark)
- **Ink**:
  - Primary: `#17181c` (light) / `#f4f4f5` (dark)
  - Soft: `#4b4f58` (light) / `#a1a1aa` (dark)
  - Mute: `#8a8e98` (light) / `#71717a` (dark)
- **Status Indicators (Subtle, purposeful)**:
  - OK / Active: `#00d68f` (Emerald Pip)
  - Warning / Elevated: `#d99a2b`
  - Critical / Alert: `#d4553f`
  - Accent / Telemetry: `#0284c7` (Sky-600)

## 4. Components Architecture
1. **Header**: Minimalist Linear Breadcrumb Strip (`SMART CITY / Energy Telemetry · Municipal Grid · Bandarlampung`), live 1.0s status chip with genuine green pip, live clock.
2. **Metrics & Gauges**: Arc gauges and progress tracks inspired by `monitor.aeter`, showing genuine aggregated energy consumption and solar yield.
3. **Map Experience**: CartoDB Positron / Dark Vector tiles with crisp, clean vector pin markers without distracting pulse halos.
4. **Data Visualizations**: Clean Recharts with single-stroke paths, soft gradients, and crisp tooltip popovers.
