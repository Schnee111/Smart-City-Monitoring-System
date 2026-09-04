# Visual & Architectural Specification: Smart City Energy Command Deck (SCADA)

## 1. Objective & Design Philosophy
Transform generic dark glassmorphism slop into a military/municipal SCADA Command Deck (Palantir Foundry / Cybernetic Smart City Command inspired).

## 2. Design Tokens & Palette
- Background: Deep Void `#070A11`, Panel Surface `#0D1322`, Border Hairline `#1A253C`
- Accents:
  - Cyan Telemetry: `#06B6D4` / `#22D3EE` (Sensors & active streams)
  - Solar Clean Energy: `#F59E0B` / `#FBBF24` (Amber glow)
  - Grid Power: `#3B82F6` / `#60A5FA` (Electric cobalt)
  - Emergency/Offline: `#F43F5E` (Rose alert)
- Map Vector Layer:
  - Dark Carto Vector Tiles (`https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png`) replacing default bright OpenStreetMap.
  - Glowing radar pulse markers for IoT sensor nodes.
- Architecture / Tech Hygiene:
  - Eliminate visual dependency on Material UI (`@mui/material` & `@mui/x-date-pickers`) for date selection; replace with sleek native Tailwind/Radix date filter controls.
  - Telemetry HUD with real-time ping indicator, district status grid, and animated SVG sparklines.

## 3. Scope of Changes
- `src/app/globals.css`: SCADA grid overlay subtle background, cyber glass utilities, terminal scrollbar.
- `src/components/layout/DashboardLayout.tsx` & `Sidebar.tsx`: Modern cyber command sidebar, telemetry ping ("SYSTEM NOMINAL", "CASSANDRA SYNCED").
- `src/components/ui/StatsCards.tsx`: High-density metric telemetry cards with animated sparkline indicators.
- `src/components/map/MapContainer.tsx`: Dark CartoDB basemap tiles, custom glowing radar pulsing CSS markers.
- `src/components/ui/HistoricalEnergyChart.tsx`: Remove MUI dependency, implement custom clean dark date & range switcher with Recharts area chart with cyan-amber gradient fills.
- `src/components/ui/SolarSavingsCard.tsx`: SCADA efficiency telemetry panel.
