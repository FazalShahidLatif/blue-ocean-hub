# Blue Ocean Hub — UI Theme Design Options

## Context
- **Site**: blueoceanhub.info (Blue Ocean Hub = strategic financial intelligence for South Asian professionals)
- **Tech**: React + Vite + Tailwind CSS v4 + React Router + Express (SSR→static prerender)
- **Brand assets**: `public/logo.svg` (compass + ocean waves), `public/favicon.svg`, `public/og-image.jpg`
- **Current theme**: Dark navy (#0a192f) + cyan (#64ffda) — glass-morphism, gradient glows
- **Requirement**: Light-background themes, full-width hero banner with image on main page, relative image banner per post page, must NOT disturb ads, 2-3 options to choose from

---

## Design Language (shared across all 3 options)

| Token | Value | Role |
|---|---|---|
| `--bg` | `#f0f9ff` or `#fafafa` | Page background (light) |
| `--panel` | `#ffffff` | Cards, panels |
| `--ink` | `#1e293b` or `#111827` | Primary text |
| `--ink-soft` | `#475569` or `#64748b` | Secondary text |
| `--line` | `#e2e8f0` | Dividers, borders |
| `--cyan` | `#64ffda` | Primary accent (from brand kit) |
| `--blue` | `#3b82f6` | Secondary accent |
| `--ink-950` | `#0a192f` | Hero banner dark overlay / footer |
| `--radius` | `6px` or `8px` | All corners |
| `--font-sans` | Inter | Body text |
| `--font-display` | Outfit / Space Grotesk | Headings |

**Toothpick motif**: The existing `<div class="ticks">` bottom border is kept in all options as the structural device (calculator markings) — not decoration.

---

## Option A — "Ocean Light"
**Visual**: Light blue/cyan theme. Open-sky backgrounds, cyan accents, professional financial-magazine feel. The ocean brand shines through.

### Color
```css
:root {
  --bg: #f0f9ff;
  --panel: #ffffff;
  --ink: #1e293b;
  --ink-soft: #475569;
  --line: #e2e8f0;
  --cyan: #64ffda;
  --blue: #3b82f6;
  --ink-950: #0a192f;
}
```

### Hero (main page)
- Full-width section, min-height 560px
- Left: eyebrow + H1 + lede + 2 CTA buttons
- Right: full-height image card (compass/ocean waves from `logo.svg` or Unsplash ocean) with cyan border
- Bottom border: `<div class="ticks">`

### Post pages (article, category, toolkit)
- `<section class="post-hero">`: relative image banner (120×90 or 160×600) — must not overlap the ad slot
- `.adslot` position: relative, z-index 10, so the image banner pushes it down visually

### Layout
- `.app-grid`: 3-column card grid (1.25fr 1fr 1fr)
- `.compact-grid`: 2-column
- `.article-grid`: 2-column blog posts
- `.calc-layout`: 220px side rail + content

### Pros
- Matches ocean brand identity
- Clean, professional, instantly readable
- Strong visual identity change from dark to light

### Cons
- Cyan on white has lower contrast than on dark — use for text sparingly

---

## Option B — "Navy & Gold"
**Visual**: Premium financial theme. White/lighter background with deep navy headers and gold accents. Sophisticated, authoritative feel — like a financial yearbook.

### Color
```css
:root {
  --bg: #fafafa;
  --panel: #ffffff;
  --ink: #111827;
  --ink-soft: #4b5569;
  --line: #e5e7eb;
  --navy: #0a192f;
  --gold: #d4af37;
  --cyan: #64ffda;
  --ink-950: #0a192f;
}
```

### Hero (main page)
- Full-width section, min-height 560px
- Dark navy banner with image (ocean depths, compass) OR light banner with gold border
- Left: eyebrow (gold) + H1 + lede + 2 CTA buttons (gold + outline)
- Right: full-height image card with gold/cyan border
- Bottom border: `<div class="ticks">`

### Post pages
- `<section class="post-hero">`: relative image banner (120×90) — positioned above the ad slot

### Layout
- Same 3-column / 2-column / 2-column grid system
- `.panel`: white cards with navy border

### Pros
- Sophisticated, memorable
- Gold + navy = premium financial feel
- Posts stand out on white background

### Cons
- Gold can feel warm/holiday-like if overused
- Navy headers can look heavy on long pages

---

## Option C — "White & Blue"
**Visual**: Clean modern theme. Pure white background with blue accents. Minimal, corporate, modern financial feel.

### Color
```css
:root {
  --bg: #ffffff;
  --panel: #f8fafc;
  --ink: #111827;
  --ink-soft: #64748b;
  --line: #e2e8f0;
  --blue: #3b82f6;
  --cyan: #64ffda;
  --ink-950: #0a192f;
}
```

### Hero (main page)
- Full-width section, min-height 520px
- White banner with blue image card
- Left: eyebrow + H1 + lede + 2 CTA buttons
- Right: full-height image card with blue border
- Bottom border: `<div class="ticks">`

### Post pages
- `<section class="post-hero">`: relative image banner (120×90) — positioned above the ad slot

### Layout
- Same 3-column / 2-column / 2-column grid system
- `.panel`: light shadow cards

### Pros
- Clean, fast, modern
- Easy to maintain and read
- Works well on all devices

### Cons
- Less distinctive than Option A or B
- Too close to generic corporate templates

---

## Shared HTML pattern (all options)

### Main page hero
```html
<section class="hero">
  <div class="hero-copy">
    <p class="eyebrow">Strategic Financial Intelligence for South Asian Professionals</p>
    <h1>Making capital allocation <span class="text-cyan">clear</span> for the South Asian founder</h1>
    <p class="hero-lede">Peer-reviewed financial intelligence on passive income, PSX trends, dollar exports, and systematic wealth protection.</p>
    <div className="flex gap-4">
      <button class="btn-primary">Explore Insights →</button>
      <button class="btn-outline">Strategic Toolkit →</button>
    </div>
  </div>
  <div class="hero-image"></div>
</section>
```

### Post page image banner + ad slot
```html
<section class="post-hero">
  <div class="post-image" style="background-image: url('/blog/how-compound-interest-works.jpg');"></div>
  <div class="adslot" style="margin-top: 20px;">
    <!-- ad code goes here -->
  </div>
</section>
```

### CSS rule for post image banner (each option)
```css
.post-hero { margin: 32px 0 8px; }
.post-image {
  width: 100%;
  height: 190px;
  background-size: cover;
  background-position: center;
  border-radius: var(--radius);
  margin-bottom: 20px;
}
.adslot {
  position: relative;
  z-index: 10;
}
```
**The `z-index: 10` on `.adslot` ensures the ad slot sits below/beside the image banner — not overlapping it.**

---

## Ad compatibility (critical)

| Concern | Solution |
|---|---|
| Ad slot overlap with banner | `.adslot { position: relative; z-index: 10; }` + `margin-top` on the section |
| Ad slot hidden behind dark hero | All options use light backgrounds — the existing `.adslot` styling is preserved |
| Images not loading | Use relative `url('../public/...')` or absolute `https://blueoceanhub.info/...` paths |
| Media queries | All options keep existing Tailwind `@media` rules |

---

## Recommendation

**Pick Option A (Ocean Light)** if you want to keep the ocean brand identity but make it readable and modern. This is the strongest brand fit.

**Pick Option B (Navy & Gold)** if you want a premium, authoritative financial-magazine feel that stands out from digital-native competitors.

**Pick Option C (White & Blue)** if you want a clean, fast, easy-to-maintain corporate template.

All three keep content and structure, use light backgrounds, full-width hero banners, relative post image banners (not disturbing ads), and match the Blue Ocean Hub brand kit.
