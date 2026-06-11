# Animation Concepts — ALL IMPLEMENTED (July 2026)

> Status: every concept below is now live on the site. D1 and D2 were combined
> into a single transition (green veil + gold rally streak). This file remains
> as the design reference for tuning or removing individual effects.

A curated menu of motion ideas for the site, distilled from three design passes
(entrance choreography / micro-interactions / badminton-signature moments).
Style bar throughout: restrained, Omega/Wimbledon-grade, no bounce, no gimmicks.
Every concept degrades to "instantly visible, no motion" under
`prefers-reduced-motion` and without JavaScript. No libraries needed — all
vanilla CSS/JS.

Tick the ones you want and they can be implemented in one pass.

---

## A. The Opening Ceremony (home page load-up)

One coordinated ~2.4s sequence — each piece is separate, but they're designed
to play as a single directed shot. Master rules: nothing animates until the
serif font is ready (no mid-swap); the sequence is skipped entirely if the page
opens deep-linked or mid-scroll; one thing happens at a time.

**A1. The Court Draws First** · medium
The gold court lines draw themselves before any text appears — outer boundary
first, then sidelines and service lines, the dashed net line last (~1.4s).
Drawn bright (30% opacity) so the moment reads, then settles back to today's
quiet 12% as the title rises. The groundskeeper lines the lawn; then the
players walk on. *This was independently proposed by two of the three passes —
the strongest single idea in the set.*

**A2. Rising from the Baseline** · medium
The three title lines (The / Badminton / Project) rise from behind an invisible
baseline mask — no fade; the letters are simply revealed as they come up, like
a name being raised on an honours board. Tight 120ms cascade so it reads as one
gesture. This is the canonical luxury-serif entrance (Omega, Cartier).

**A3. Tracked-In Overline** · small
"Badminton · Community · Excellence" condenses into place — letter-spacing
eases from extra-wide to resting while fading in. The quietest entrance that
exists; reads as the caption being set by hand.

**A4. The Rules Unfurl** · small
The ornament assembles centre-outward: shuttlecock mark first, then the two
gold hairlines grow out from it. Engraver's logic — the hallmark is struck,
then the rule is drawn away from it.

**A5. Aperture Settle** · small
The background video starts at 104.5% scale and eases to 100% over 2.4s under
everything else — the establishing-shot slow push that makes looping footage
feel composed. Barely conscious; compounds with the existing fade-in.

**A6. The Header Takes Its Seat** · small
Navigation arrives last (brand → links left-to-right at 50ms intervals → the
gold Join button), once per session only, so it never becomes a tic while
browsing between pages. Ushers seat you after you've seen the court.

**A7. Sub-page Arrival, Abridged** · medium
Interior pages get a compressed ~1.1s edition of the same choreography — same
materials, shorter ceremony. Signature detail: the italic gold word in every
page title ("a project.", "courses.") lands one beat after its roman siblings,
like a flourish completing a letterhead. Becomes a recognisable brand tic
across all five pages.

---

## B. Scroll Moments (as sections come into view)

**B1. Chalk Lines** · medium
Every structural gold hairline on the site — the values row rules, course-row
dividers, coach achievement rules, the footer line — draws itself left-to-right
as it enters view, staggered down lists; the footer line draws centre-out as a
closing gesture. Extends the hero's court-lining ritual through the whole site.
Content never moves; only the line paints.

**B2. The Serve** · small
Site-wide ornament behaviour: when a rule–shuttle–rule divider scrolls into
view, the shuttle drops and settles like a shuttlecock landing on the T (one
soft overshoot, no bounce), then the hairlines extend outward. The same gesture
everywhere makes the crest feel alive.

**B3. Scoreboard Roll** · medium
The program card numerals (01 / 02 / 03) roll up into place like plates on an
old manual scoreboard — one restrained roll in Cormorant italic, timed to land
as each card settles. Pure Wimbledon heritage; no slot-machine spinning.

**B4. The Darkroom Print** · medium
Photos "develop" inside their ivory mats — easing from slightly pale/desaturated
to full colour on load, instead of popping in. Converts lazy-load pop (the
cheapest-feeling artifact on any site) into the most expensive-feeling moment.
Plus a barely-there 1.025 zoom on hover: the print breathes, the frame doesn't.

**B5. Framing the Moment** · medium
Each photo's gold frame draws itself clockwise around the print as it reveals —
every photograph formally framed like an exhibit. Rhymes with the court-line
draw so the whole site shares one "drawn in gold" motif.

---

## C. Micro-interactions (hand-finish details)

**C1. Cufflink Polish** · small
On button hover: after the existing colour fill, a single pass of light sweeps
across the surface — the watch-case glint from Omega product pages. Once per
hover, never loops. Plus a 1px press on click for tactility.

**C2. The Ledger Line** · small
Inside the program cards on hover: the short gold rule extends (34px → 60px)
and deepens in colour, the numeral shifts toward green — a ledger line extending
under an entry as you consider it. Chips on the programs page get a quiet ink
acknowledgment (border deepens, faint gold tint).

**C3. The Steward's Stamp** · small
The quote band's "THE BADMINTON PROJECT" signature settles inward
(letter-spacing 0.5em → 0.34em while fading in) — the club's name pressing into
the page like a foil stamp.

---

## D. Page Transitions (the biggest single upgrade)

Right now every navigation is a hard white flash — the least premium moment on
the site. Two options, from safe to signature:

**D1. Changing Ends** · large
A brief dim to deep green (~180ms out, ~300ms in) when moving between pages,
via the modern View Transitions API with a small JS fallback. Composed, ritual,
brand-coloured; also masks font repaint on arrival.

**D2. Rally Handoff** · large
The signature version: on navigation, a single gold hairline with a bright head
— the exact visual language of the hero rally line — streaks off the right edge
of the page; on the next page it streaks in from the left and dissolves into
the header's scroll-progress hairline. The rally continues across pages.
(Recommend shipping D1 first; D2 can replace it later.)

---

## Recommended first pass

If choosing, this order gives the most felt quality per effort:

1. **A1 + A2 + A3 + A4** — the hero opening ceremony (the "load-up" ask)
2. **A7** — abridged sub-page arrivals so interior pages match
3. **B1 + B2** — chalk lines + the serve (site-wide texture)
4. **C1** — button polish
5. **D1** — page transitions
6. Then B3/B4/B5, C2/C3, A5/A6 as garnish, and D2 if the rally streak proves
   itself worth it.

Every item is independent — any subset can be implemented without the others.
