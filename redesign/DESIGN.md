# MedTrack — Redesign Design Language (v0, exploration)

Goal: award-site *soul* (dark.design / supahero / durves register) applied to a **data-dense study tool**.
Steal the language — near-black depth, editorial type, mono micro-labels, one confident accent, motion
that reacts — but keep dashboard ergonomics (glanceable, scannable, fast).

## Non-negotiables (carried from the current app)
- All 11 pages, all data, all features stay. This is a *reskin + re-architecture of layout*, not a feature cut.
- 8 themes stay — and **motion intensity becomes a property of the theme** (`--motion` / `data-motion`).
- `prefers-reduced-motion` is a hard override that kills transitions/animation everywhere.
- Zero new runtime dependencies by default (Chart.js / KaTeX / Supabase already present stay). Motion is
  hand-coded: one `pointermove` + one `requestAnimationFrame` lerp loop + CSS. No GSAP/Lenis unless approved.

## Layout principles (the dashboard "brain")
- **Establish hierarchy.** Today the page is a uniform grid of same-weight cards. New rule: one **hero band**
  (the single most urgent countdown + today's intent), then progressively quieter tiers below.
- **Editorial rhythm, not a spreadsheet.** Generous vertical spacing between sections; mono eyebrow labels
  ("EXAM COUNTDOWN", "TODAY") instead of bold headers everywhere.
- **Hairline borders + depth**, not heavy boxes. Cards read via subtle elevation/gradient, not thick outlines.
- **One accent does the shouting.** Numbers and the single call-to-action carry the accent; everything else
  is ink/muted. (Current app spreads violet + green + amber + red across everything → flat.)

## Type
- Display: an editorial grotesk/condensed (Familjen Grotesk / condensed serif) — for big countdown numerals.
- Body: clean grotesk (Hanken Grotesk).
- **Mono for eyebrows, dates, stat units** (JetBrains Mono / Space Mono) — the "technical label" tell.
- Avoid Inter/Arial as the star. Big numerals are the visual anchor of a study countdown app.

## Motion (theme-scoped)
- `--motion: 1` (full) … `0` (still). Each theme sets it. Reduced-motion forces `0`.
- Entrance: sections rise+fade on load (staggered). Numbers roll up (counter) once.
- Pointer life: subtle parallax on the hero, magnetic primary button, 3D tilt+glare on the hero card only
  (not every card — that would be noise in a tool).
- Easing: `cubic-bezier(.2,.8,.2,1)` everywhere, never linear.

## Two directions shown in mockups
1. **"Meridian" — Cinematic Noir.** #08090c, single volt-lime accent, editorial+mono, sharp hairlines,
   high-contrast, high motion. The award-site register, most literal.
2. **"Aurora" — Deep Glass.** Indigo-black base, aurora gradient accents (violet→cyan), glassmorphism cards
   with backdrop-blur, softer and warmer, medium motion. More "premium product" than "agency showcase".

Both are dark. Pick one as the north-star, or mix (e.g. Meridian layout + Aurora's glass depth).

## What happens after a direction is chosen
North-star Dashboard built for real in the app → you approve → propagate the system (tokens, card, motion,
type) across the other 10 pages, folding in bug-fixes + cleanup. Everything on this `redesign` branch until ship.
