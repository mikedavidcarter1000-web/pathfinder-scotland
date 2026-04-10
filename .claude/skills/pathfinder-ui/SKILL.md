# Pathfinder Scotland -- Design Skill

## Brand

**Personality:** Calm authority. A trusted guide, not a pushy salesperson. Think "the reassuring teacher who actually explains things clearly."

**Audience:** Scottish secondary school students (13-18), their parents, and guidance teachers. The design must feel trustworthy to parents while remaining engaging for teenagers.

**Reference sites (include in every task prompt):**
- Wise.com -- information hierarchy, teal palette, trust signals
- Stripe.com/docs -- data presentation, typography, structured content layout

---

## Colour Tokens

Define ALL colours as CSS custom properties in :root. NEVER hardcode hex values in components.

```css
:root {
  /* Primary -- teal/green */
  --pf-teal-900: #0C4A42;   /* Nav, footer, dark sections */
  --pf-teal-700: #0F6B5E;   /* Primary buttons, active states */
  --pf-teal-500: #14907E;   /* Links, accents */
  --pf-teal-100: #E6F5F2;   /* Light backgrounds, card highlights */
  --pf-teal-50:  #F0FAF8;   /* Page backgrounds */

  /* Neutral */
  --pf-white:    #FFFFFF;    /* Card backgrounds, content areas */
  --pf-grey-900: #1A1A2E;   /* Body text -- NEVER use pure black */
  --pf-grey-600: #4A4A5A;   /* Secondary text */
  --pf-grey-300: #D1D1DB;   /* Borders, dividers */
  --pf-grey-100: #F4F4F6;   /* Alternate section backgrounds */

  /* Status */
  --pf-amber-500: #F59E0B;  /* Warning states, widening access badges */
  --pf-green-500: #10B981;  /* Success states, eligibility confirmed */
  --pf-red-500:   #EF4444;  /* Error states, ineligible */
}
```

## Curricular Area Colours

Used for subject cards, badges, and category indicators. Apply consistently everywhere.

| Area | Token | Value |
|------|-------|-------|
| Languages | --pf-area-languages | #3B82F6 |
| Mathematics | --pf-area-mathematics | #6366F1 |
| Sciences | --pf-area-sciences | #10B981 |
| Social Studies | --pf-area-social | #F59E0B |
| Expressive Arts | --pf-area-expressive | #8B5CF6 |
| Technologies | --pf-area-technologies | #64748B |
| Religious and Moral Education | --pf-area-rme | #F43F5E |
| Health and Wellbeing | --pf-area-health | #14B8A6 |

---

## Typography

Install via @fontsource packages (self-hosted, no privacy issues).

```
npm install @fontsource/space-grotesk @fontsource/inter
```

| Element | Font | Weight | Size |
|---------|------|--------|------|
| h1 | Space Grotesk | 700 | 2rem (32px) |
| h2 | Space Grotesk | 600 | 1.5rem (24px) |
| h3 | Space Grotesk | 600 | 1.25rem (20px) |
| Body | Inter | 400 | 1rem (16px) |
| Small / captions | Inter | 400 | 0.875rem (14px) |
| Buttons | Space Grotesk | 600 | 0.9375rem (15px) |
| Data / numbers | Space Grotesk | 500 | varies |

**Rules:**
- Maximum 2 font weights per element
- Line height: 1.6 for body, 1.2 for headings
- NEVER use Inter for headings
- NEVER use system fonts or Arial

---

## Component Patterns

### Cards
- Background: var(--pf-white)
- Shadow: 0 1px 3px rgba(0, 0, 0, 0.08)
- Border radius: 8px
- No visible border (shadow provides edge definition)
- Hover: shadow lifts to 0 4px 12px rgba(0, 0, 0, 0.1)
- Padding: 24px
- NEVER use rounded-full on cards (only on badges/pills)

### Buttons
- Primary: var(--pf-teal-700) background, white text, 8px radius, no uppercase
- Secondary: white background, 1px var(--pf-teal-700) border, var(--pf-teal-700) text
- Ghost: transparent background, var(--pf-teal-500) text
- All buttons: 12px 24px padding, Space Grotesk 600
- Hover: darken background 10%

### Badges / Pills
- Border radius: rounded-full
- Font size: 0.75rem
- Padding: 4px 12px
- Style: light background with darker text (e.g. var(--pf-teal-100) bg + var(--pf-teal-700) text)
- Curricular area badges use their assigned area colour at 10% opacity bg + full colour text

### Links
- Colour: var(--pf-teal-500)
- Underline on hover only
- NEVER use blue (#0000FF) or browser default link colour

### Form Inputs
- Border: 1px solid var(--pf-grey-300)
- Border radius: 8px
- Focus: 2px solid var(--pf-teal-500) outline
- Background: var(--pf-white)
- Padding: 12px 16px

---

## Layout

- Maximum content width: 1200px
- Card grid gap: 24px
- Section vertical padding: 64px (48px on mobile)
- Maximum gap between page header and first content: 32px
- Page background: var(--pf-teal-50) or var(--pf-white)

### Section Rhythm
Alternate section backgrounds to create visual flow:
1. White
2. var(--pf-grey-100)
3. White
4. var(--pf-teal-900) (dark section with white text)

### Responsive Breakpoints
- Mobile: < 640px (1 column)
- Tablet: 640px - 1024px (2 columns)
- Desktop: > 1024px (3 columns for cards, 2 columns for detail layouts)

---

## Navigation

- Background: var(--pf-teal-900)
- Text: white
- Active link: white with underline or bottom border
- Height: 64px
- Logo: white version on dark background
- Sticky on scroll

## Footer

- Background: var(--pf-teal-900)
- Text: white / rgba(255,255,255,0.7) for secondary
- Padding: 48px vertical
- Include: branding, nav links, legal links, "Built for Scottish students" tagline

---

## Hero Sections

- NEVER text-only. Always include a visual element (illustration, geometric art, SVG, or data visualisation)
- Background: var(--pf-teal-50) or var(--pf-teal-900) for dark variant
- Maximum height: 500px
- CTA buttons prominent with clear hierarchy (primary + secondary)

---

## Status and Feedback

| State | Colour | Use |
|-------|--------|-----|
| Success | var(--pf-green-500) | Eligibility confirmed, grade achieved, saved |
| Warning | var(--pf-amber-500) | Widening access eligible, approaching limits |
| Error | var(--pf-red-500) | Ineligible, missing requirements, form errors |
| Info | var(--pf-teal-100) bg + var(--pf-teal-700) text | Tips, recommendations, breadth advice |

---

## Do NOT

- Use gradients on backgrounds
- Use rounded-full on cards (only on badges/pills)
- Use more than 2 font weights per element
- Use pure black (#000000) for text -- always var(--pf-grey-900)
- Use hero sections with text only -- always include a visual element
- Use Inter or system fonts for headings
- Hardcode hex values in components -- always use CSS custom properties
- Use uppercase text on buttons or headings
- Use full card borders -- rely on shadow for edge definition
- Use more than 80px gap between any elements