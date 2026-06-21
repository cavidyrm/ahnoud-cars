# Handoff: Ahnoud Cars — Dealership Website + Inventory CMS

## Overview
Ahnoud Cars is a premium used/new car dealership based on Sheikh Zayed Road, Dubai (est. 2021). This package contains two design references:

1. **AhnoudCars** — the public marketing website: a dark, editorial, "spec-sheet" themed single page (hero, stats band, filterable car collection, why-us, reviews, contact) with a light/dark theme toggle.
2. **Inventory CMS** — an internal admin panel to add, edit, search, and remove cars from the collection (same data model as the public car detail modal).

The aesthetic is **automotive-editorial**: deep-gray dark canvas, a single hot-orange accent, monospaced technical labels, large display headings, fine hairline dividers, and viewfinder/spec-sheet motifs.

## About the Design Files
The files in this bundle are **design references created in HTML** — working prototypes that show the intended look, layout, and behavior. They are **not production code to ship directly.**

They are authored as "Design Components" (`.dc.html`) — a streaming-template format that depends on the bundled `support.js` runtime. **Do not port `support.js`, the `.dc.html` template syntax (`{{ }}`, `<sc-for>`, `<sc-if>`, `<x-dc>`), or the `data-props`/Tweaks mechanism into production.** Those are prototyping scaffolding.

Your task is to **recreate these designs in the target codebase's environment** (React, Vue, Svelte, Next.js, etc.) using its established patterns, component library, router, and data layer. If no codebase exists yet, choose an appropriate modern stack (e.g. React + a CSS solution) and implement there. Wire the inventory to a real data source/API instead of the in-memory array used in the prototype.

To preview the prototypes: open `AhnoudCars.dc.html` or `Inventory CMS.dc.html` directly in a browser (they self-bootstrap via `support.js`). An internet connection is required — fonts load from Google Fonts and car photography is hotlinked from Unsplash.

## Fidelity
**High-fidelity (hifi).** Final colors, typography, spacing, radii, interactions, and copy are all specified. Recreate the UI pixel-accurately using the codebase's libraries. Exact hex values, font families, and measurements are listed in **Design Tokens** below.

---

## Screens / Views

### A. Public Website (`AhnoudCars.dc.html`)

A single scrolling page. A floating pill **navigation bar** is fixed to the bottom-center and **reveals on scroll** (hidden at the very top). Sections, in order:

#### 1. Floating Nav (fixed, bottom-center)
- Pill bar, charcoal translucent (`rgba(43,43,45,0.92)`) with blur, `--r-card` radius.
- Contents (flex row, 6px gap, 7px padding): logo tile (36px, dark `#1C1C1E`, contains the cream logo mark) → "Collection" (active-pill style) → "Why Us" → "Reviews" → "Contact" (solid orange `#E8410E`, white text) → theme-toggle button (36px, sun/moon icon).
- Links are mono-free sans (Plus Jakarta Sans / Inter), 14.5px, weight 500–600.
- The active link gets a moving highlight (subtle white fill + hairline border) that follows clicks.
- Hides (fades + slides down 24px) when the footer begins to reveal; reappears on scroll up.
- Mobile (≤620px): condensed padding, smaller logo (34px), all four links remain with side margins so nothing clips.

#### 2. Hero (full-viewport)
- **Full-bleed background image** (static, cover) of a showroom/car, with a darkening legibility veil (radial + linear gradient over it).
- **Top bar**: left = logo mark + "AHNOUD CARS" wordmark with "EST. 2021 · DUBAI" beneath, plus a hairline-separated vertical credentials list "INSPECTED / DOCUMENTED / DELIVERED"; right = "● SHOWROOM" indicator (orange dot + mono label).
- **Center**: a giant two-word display headline split left/right of a central **viewfinder** column. Left word and right word are `clamp(30px,5cqi,80px)`, weight 800, display font.
- **Viewfinder** (the "spotlight"): a portrait framed image with corner brackets, a "01 — SPOTLIGHT" mono label with ‹ › circular arrows, and a bottom caption line `01.  ⟨Car name⟩  .23`. It is an **auto-advancing slideshow** (every ~5.2s) of 5 featured cars, with manual ‹ › arrows and clickable dots. Each slide left-to-right slides in (transform translateX + slight scale, ~1.05s) once its image preloads. The background does NOT change with the slideshow (static).
- **Bottom bar**: left = "© 2026" + "Grid" link; right = a **live timecode clock** (HH:MM:SS, ticks every second, with a pulsing orange dot).

#### 3. Stats Band (orange)
- Full-width 4-column grid, solid orange `#E8410E` background, dark hairline dividers `rgba(0,0,0,0.14)`.
- Each cell: a big white numeral `60px` weight 700 (with a hover lift+scale animation), and a mono uppercase label `13px` `rgba(255,255,255,0.82)` beneath.
- Cells: **120+** Cars in stock · **14** Years trading · **200pt** Inspection · **4.9** Google rating. ("+", "pt" suffixes are translucent white spans.)
- Cell padding `60px 52px`. Responsive `minmax(210px,1fr)`; numerals shrink to 44px on mobile.

#### 4. Collection (`#collection`)
- Header: mono kicker "02 — THE COLLECTION", display H2 "Every car, in the same light.", and a short paragraph.
- **Filter bar**: a row of pill buttons — **Make**, **Body**, **Budget** — each with a chevron and an orange count badge when active. Clicking a pill opens a **dropdown of rounded checkboxes** (orange-fill + white check when selected). Filters are **multi-select** and combine (AND across groups, OR within a group). Right side shows "{n} results" and a "Reset ✕" that appears only when filters are active. Budget bands: Under 300k / 300k–600k / 600k–1M / 1M+.
- **Card grid**: 3 columns desktop (`repeat(3, minmax(0,1fr))`, gap 26px), 2 on tablet, 1 on mobile. `minmax(0,1fr)` is required so all columns/photos are exactly equal width.
- **Car card** (aspect-ratio 31/41, `--r-card` radius, border `rgba(255,255,255,0.1)`):
  - Full-bleed car **photo** filling the top (zooms to 1.07× on card hover, 0.6s).
  - **Status banner** peeking underneath the card, full card width, `46px` tall, with a colored glow: green `#7CB518` Available / amber `#E0A92E` Reserved / gray `#34343A` Sold; centered mono label with a dot.
  - **Info panel**: model name (serif/display, fixed 2-line height so all cards align) + orange price top-right; a mono spec sub-line (body · engine · color); a 3-column **icon stat row** divided by hairlines — Year (calendar), Mileage (gauge), Power (bolt).
  - Hover: lifts `translateY(-4px)`, border brightens, soft shadow `0 14px 30px -20px rgba(0,0,0,0.6)`.
  - Click opens the **detail modal** (below).
- "Load more" outline button when results exceed the visible count (initial 8); "NO CARS MATCH THESE FILTERS — reset" empty state.

#### 5. Car Detail Modal
- Full-screen dimmed backdrop (blur). Centered panel max-width 1080px, `--r-card` radius, `#0C0C0E`.
- Two columns desktop (`1.25fr 1fr`), **stacks to one column on mobile** (image area on top, divider moves to bottom).
- **Left (media)**: large image area — the **first image is the car's actual photo** (the same one from its card); a thumbnail strip below with the real photo as the first thumb and the other angle slides (FRONT 3/4 / PROFILE / REAR 3/4 / INTERIOR) as labeled placeholders.
- **Right (detail)**: status · condition mono line, big model H2, price, a spec grid (year, mileage, fuel, transmission, engine, power, body, color), highlights chips, and a CTA that routes the car into the contact form.

#### 6. Why Ahnoud Cars (`#why`)
- Mono kicker "03 — WHY AHNOUD CARS", display H2.
- 4-item grid separated by hairlines (each: mono number, title, description). 2-up on tablet, 1-up mobile.

#### 7. Reviews (`#reviews`)
- Mono kicker "04 — WHAT THEY SAY", display H2, "4.9 / 5.0 · 280+ REVIEWS" rating line.
- Cards (`minmax(290px,1fr)`, gap 26px) with a **primary-tinted glass** treatment: orange-tinted gradient fill, blurred backdrop, soft orange border, inner highlight. Each: centered enlarged orange star row (★★★★★, 20px), quote (17px, weight 500), avatar + name + "bought" line.

#### 8. Contact (`#contact`)
- Mono kicker "05 — GET IN TOUCH", display H2 "Come see it in person.", paragraph.
- **Left = enquiry form**: First name + Last name (two columns), Phone, Car of interest (pre-fills when arriving from a card CTA), Message; orange submit button. On submit shows an "Enquiry received." success overlay with a reset button. (Prototype has no backend — wire to your form handler/API.)
- **Right = map panel**: a stylized dark map with a faux street grid, a highlighted road, a glassy "Showroom" logo badge, a pin labeled "AHNOUD CARS", and an address/contact overlay (Sheikh Zayed Road, Dubai · phone · email · "Open in Maps" link). Replace with a real embedded map (Google Maps / Mapbox) in production.

#### 9. Footer
- Fixed beneath the page; the scrolling content lifts to reveal it on desktop (a "reveal" effect). On tablet/mobile it flows normally at the end (the reveal is disabled because the footer is taller than a device frame).
- Large faded logo mark bottom-right aligned to the content margin; copyright row.

### B. Inventory CMS (`Inventory CMS.dc.html`)
Internal admin tool, same dark theme. Single screen:
- **Header**: logo tile + "Inventory CMS" / "Ahnoud Cars · Manage collection", and an **+ Add car** button (orange) on the right. On mobile it lays out as two rows.
- **Stats row**: 4 cells — Total cars / Available (green) / Reserved (amber) / Sold (gray).
- **Toolbar**: search field (filters by make or model) + a "{n} cars" count.
- **Car list**: column header (Vehicle / Specs / Price / Status / Actions) then one row per car: monogram tile (make initials), make+model, condition·color sub, spec line (body · year · mileage), formatted "AED ###,###" price, a colored **status pill** (Available/Reserved/Sold), and Edit (pencil) + Remove (trash) actions. Remove asks for **inline confirmation** (check / cancel). Empty-search state included.
- **Add/Edit drawer**: slides in from the right (`540px`, max 94vw), stacks on mobile. Sections:
  - *Identity*: Make*, Model*, Body type (select), Year, Condition (New/Used), Status (Available/Reserved/Sold).
  - *Pricing & specs*: Price (AED)*, Mileage (km), Fuel (Petrol/Hybrid/Electric/Diesel), Transmission, Engine, Power, Exterior color.
  - *Highlights*: chip editor — type + Enter (or Add) to append, ✕ to remove each chip.
  - *Photos*: upload/drag car photos (stored as resized data-URLs in the prototype).
  - Footer: Cancel + Save ("Add to inventory" / "Save changes"). Validation: Make, Model, and a numeric Price are required.

### C. 404 — Not Found (`404.dc.html`)
Error page in the same dark editorial theme. Faint grid + a tilted orange "road" line and a vignette behind. Top bar with the logo lockup and a pulsing "● ERROR" indicator. Center: mono "ERROR 404 — NOT FOUND" kicker, a giant `404` display numeral (Plus Jakarta Sans 800, with a subtle glitch + orange scan-sweep animation), an H1 "This road leads nowhere.", a one-line apology, and two CTAs — "← Back to showroom" (solid orange) and "Browse the collection" (outline, → `#collection`). Bottom strip: copyright + address. Wire the buttons to the real home/collection routes in production.

---

## Interactions & Behavior
- **Theme toggle** (nav): switches `.ahc-light` class on `<body>`; persists to `localStorage['ahnoud_theme']` ('light'|'dark'). All colors are CSS variables that flip with the class (see tokens).
- **Nav reveal**: nav hidden at scroll top; appears on scroll; hides again as the footer reveals. Active-link highlight follows clicks.
- **Hero slideshow**: auto-advance ~5.2s; ‹ › arrows and dots; left-to-right transform slide ~1.05s; images preloaded to avoid blank frames; background static.
- **Live clock**: hero timecode updates every second (HH:MM:SS, local time).
- **Card hover**: photo zoom 1.07×/0.6s; card lift + shadow.
- **Filters**: multi-select pill dropdowns; live result count; reset; combine AND-across / OR-within.
- **Modal**: open on card click; Esc to close; backdrop click to close; thumbnail switching; "enquire" routes the model name into the contact form's "Car of interest".
- **Contact form**: client-side success overlay only (no backend in prototype).
- **CMS CRUD**: add/edit via drawer; delete with inline confirm; search filter; all in-memory in the prototype (resets on reload). **Wire to a real persistence layer/API in production.**
- **Reveal-on-scroll**: elements with staggered fade/translate as they enter the viewport (IntersectionObserver in the prototype).
- **Reduced motion**: prototype respects `prefers-reduced-motion` by skipping scroll reveals.

## Responsive Behavior
- Both designs are fully responsive and additionally ship a **Device preview** (Desktop/Tablet/Mobile) that frames the page in a device — this is a *prototype preview aid only*; do not reproduce the device frame in production, just honor the breakpoints.
- Key breakpoints: collection grid 3→2→1; why grid 4→2→1; contact + name fields stack; modal two-col → one-col; nav condenses; hero stacks and the bottom/credential bars simplify on small widths.
- Layout uses container queries (`cqi`/`cqw` units) in the prototype; translate to standard responsive units/media queries or container queries as your stack prefers.

## State Management
**Public site:** `light` (theme, persisted), filter selections (`brandSel`, `bodySel`, `priceSel` arrays + which dropdown is `open`), `visible` (pagination count), `modalId` + `photoIdx` (open car + active thumbnail), contact `form` fields + `sent` flag + `contactCar`. Hero slideshow index + timer are component-local. Clock via 1s interval.

**CMS:** `cars` array (the inventory — replace with fetched data), `query` (search), `drawerOpen` + `editId` (add vs edit), `confirmId` (delete confirmation), `form` (draft car) + `hlInput` (highlight draft) + `formError`, `photoDrag`. Device/corner come from preview props.

**Data fetching (production):** the inventory should come from an API/DB. Each car object shape:
```
{ id, make, model, body, year, cond ('New'|'Used'), price (number, AED),
  km (number), fuel, trans, engine, power, color, status ('Available'|'Reserved'|'Sold'),
  hl: string[] /* highlights */, photos: string[] /* optional */ }
```

## Design Tokens

### Colors
| Token | Dark (default) | Light |
|---|---|---|
| Page background `--c-bg` | `#16161A` (deep gray) | `#F1EFE9` |
| Text `--c-text` | `#F2F2F0` | `#1A1714` |
| Nav background `--c-navbg` | `rgba(43,43,45,0.92)` | `rgba(250,249,245,0.95)` |
| Input/surface `--c-input` | `#141417` | `#FFFFFF` |
| Modal `--c-modal` | `#0C0C0E` | `#FFFFFF` |
| Hairline `--c-line` | `rgba(255,255,255,0.07)` | `rgba(0,0,0,0.10)` |
| Hairline 2 `--c-line2` | `rgba(255,255,255,~0.1)` | `rgba(0,0,0,0.13)` |
| Hairline 3 `--c-line3` | `rgba(255,255,255,0.12)` | (lighter) |

- **Primary / accent (both themes):** `#E8410E`; hover `#FF5A26`.
- **Card surface:** `#0E0E11`; secondary panels `#0D0D0F` / `#0C0C0E`.
- **Status:** Available green `#7CB518` (CMS pill text/dot uses `#5BD08A`/`#36B37E` accents), Reserved amber `#E0A92E` / `#E0A33E`, Sold gray `#34343A` / `#6E6E70`.
- **Muted text:** `#9A9A9E`, `#8C8C8E`, `#6E6E70`. **Selection:** bg `#E8410E`, text `#fff`.

### Typography
- **Display / headings** `--ahc-display`: **Plus Jakarta Sans** (700–800).
- **Card titles** `--ahc-serif`: **Plus Jakarta Sans** (400). (Prototype falls back to Newsreader/Georgia serif if unset.)
- **Body / UI** `--ahc-body`: **Inter** (400–600).
- **Mono labels / metadata** `--ahc-mono`: **JetBrains Mono** (400–600) — used for kickers, badges, timecodes, spec lines, all-caps technical labels (typically with `letter-spacing: 0.1–0.28em`, `text-transform: uppercase`).
- Display headings: `clamp(34–36px, 4.5–5cqi, 58–64px)`, weight 800, letter-spacing ≈ -0.02em.
- Stat numerals 60px/700; card title `clamp(18px,2.5cqi,23px)`; body 14.5–17px.

### Corner radius (two tokens)
- `--r-card` (cards, panels, nav bar, filter pills/dropdowns, modal): **16px** default.
- `--r-ui` (inputs, buttons, chips, nav items, logo tile): **8px** default.
- Both are theming presets in the prototype's Tweaks panel — **Sharp** (2/2), **Default** (16/8), **Rounded** (24/14), **Pill** (34/22). Pick one (Default) for production or expose as a setting.
- Circles (`50%`) and full pills (`999px`) are intentional and not tokenized.

### Spacing & misc
- Section vertical padding ≈ 110–140px; horizontal `clamp(40px, 6cqi, 88px)`.
- Grid gaps 26px (cards/reviews). Hairline borders 1px.
- Card hover shadow `0 28px→14px ...`; modal shadows deep. Transitions 0.2–0.65s, easing `cubic-bezier(.2,.7,.2,1)`.

## Assets
- **Logo mark** (provided in `assets/`): `ahnoud-mark-light.svg` (cream `#F2F0EC`, for dark backgrounds) and `ahnoud-mark-dark.svg` (dark `#1A0E07`, for the orange footer). A stylized monogram inside a square frame. `ahnoud-logo-tile.png` is a legacy raster tile (no longer used). Use the SVGs.
- **Car photography:** the prototype hotlinks real photos from **Unsplash** (`images.unsplash.com/photo-…`), matched per car by model. These are placeholders — **replace with the dealership's own licensed photography** in production. The card/hero/modal photo "slots" are drag-and-drop in the prototype (`image-slot.js`); in production use real `<img>`/upload fields.
- **Fonts:** Google Fonts — Plus Jakarta Sans, Inter, JetBrains Mono.
- **Map:** the contact map is a CSS illustration placeholder — swap for a real embed.

## Files
- `AhnoudCars.dc.html` — the public website prototype (template + logic).
- `404.dc.html` — the not-found error page (template only).
- `Inventory CMS.dc.html` — the admin CMS prototype.
- `assets/` — logo SVGs (`ahnoud-mark-light.svg`, `ahnoud-mark-dark.svg`) + legacy tile PNG.
- `support.js` — the Design-Component runtime that boots the `.dc.html` files **(prototyping scaffolding — do not port to production).**
- `image-slot.js` — the drag-and-drop image placeholder web component used in the prototypes **(do not port; use real image/upload components).**

> Note: the two `.dc.html` files share the same visual system (colors, type, radius tokens, status colors). Build them against one shared design-token source / theme in your codebase.
