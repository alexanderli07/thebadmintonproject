# The Badminton Project — Website

A Wimbledon-inspired site for The Badminton Project: deep green, ivory and gold,
elegant serif typography, generous whitespace. Built as plain HTML/CSS/JS —
no build step, no dependencies, nothing to install.

## How to view it

**Option A (quickest):** double-click `index.html`. It opens straight in your browser.

**Option B (recommended, behaves exactly like a real web server):**

```
cd the-badminton-project
py serve.py
```

Then open http://localhost:4173 in your browser. (`serve.py` is a tiny local
server that disables caching, so your edits always show up on refresh.)

> The fonts (Cormorant Garamond + Jost) load from Google Fonts, so the page looks
> best with an internet connection. Without one it falls back to Georgia/system fonts.

## Structure

| File | What it is |
| --- | --- |
| `index.html` | Home — four full-screen panels: hero, B.R. Sankeerth, Eesan Holtzman, the training pathway |
| `programs.html` | **The Academy** hub — the junior pathway, Adult Training, Locations (Agility Sports & BNM Badminton) |
| `academy-intro-development.html` | **Beginner Training** |
| `academy-intermediate.html` | **Intermediate Training** |
| `academy-competition.html` | **High Performance Team Training** |
| `academy-high-performance.html` | **National Team Elite Training** |
| `academy-athletic-development.html` | Retired program. Unlinked, out of the sitemap and `noindex` — kept only so old inbound links still land somewhere. |
| `signup.html` | Registration form — submits to the `submit-registration` Supabase Edge Function and stores entries in the private `registrations` table. Public connection values live in `js/supabase-config.js`. |
| `sankeerth.html`, `eesan.html` | Personal pages for the two coaches (story / achievements / news / vision) |
| `404.html` | Branded "Out of bounds" error page (picked up automatically by Netlify, GitHub Pages, Cloudflare Pages) |
| `about.html` | Who We Are — the Project, the values, and the two coach profiles |
| `gallery.html` | Gallery — real photos + labelled empty print slots |
| `journal.html` | Journal — empty state; the post-card template is in a comment |
| `css/styles.css` | All styling. Colors and fonts are defined once at the top under `:root` |
| `js/main.js` | Small enhancements: sticky header, mobile menu, scroll-reveal, dossier tabs, photo gallery |
| `assets/favicon.svg` | The court-lines browser-tab icon |
| `assets/photos/` | Website photos (see below); untouched originals in `originals/` |
| `assets/backdrops/` | Blurred hero backdrops for the sub-pages (stills from the hero footage) |
| `serve.py` | Optional local dev server with caching disabled |

## Atmosphere (what makes it feel alive)

- **Hero background video** — drop a badminton clip you own at
  `assets/video/hero.mp4` (see the note in that folder) and the home hero plays
  it automatically, tinted deep green to match the brand. Until then the hero
  shows an **animated gold rally line** — a shuttlecock tracing slow arcs over
  the court lines.
- **Parallax** — the hero title, court lines, quote band and photo grids drift
  at different speeds while scrolling.
- **Film grain** — a subtle texture over the dark green sections.
- **Scroll progress hairline** — the thin gold line under the header.
- **The full motion system** (see `ANIMATIONS.md` for every effect and how to
  tune or remove each): an entrance ceremony on load (court lines draw
  themselves, the title rises from a baseline mask, the header seats itself
  once per session), chalk-line rules and ornaments that assemble on scroll,
  scoreboard-roll numerals, photos that "develop" in with drawn gold frames, a
  light sweep across buttons, and a deep-green veil + gold rally streak between
  pages.

All motion is disabled automatically for visitors whose system asks for reduced
motion. To remove any effect, delete its block in `index.html` (hero video) or
the matching section in `css/styles.css` / `js/main.js` (each is labelled).

## What is still waiting on the client

All copy is final. Nothing bracketed renders to a visitor any more — every
remaining gap is **media** or **a fact nobody has confirmed yet**:

- **Headshots** — `assets/photos/sankeerth.jpg` and `eesan.jpg`, then swap the
  `.ph-media` tile for an `<img>` (a comment above each section shows how).
  Used on `about.html`, `sankeerth.html`, `eesan.html` and the two home panels.
- **Program photos and video** — each program page has an "Inside the Program"
  carousel of empty slots; the client's deck asks for "Photos n Videos" per
  program. Replace a placeholder `<figure>` with an `<img>`/`<video>` plus a
  real `<figcaption>`.
- **Career photos** — four slots on each coach profile.
- **Gallery** — four empty print slots, each labelled with the kind of shot it
  is waiting for.
- **Venue detail** — street address for Agility Sports and training days for
  both venues. The cards deliberately show only what is confirmed.

A comment at the top of each section explains exactly how to fill it.

## Adding photos

1. Save each photo into `assets/photos/` named `photo-01.jpg`, `photo-02.jpg`,
   `photo-03.jpg`, and so on.
2. The first two are already wired up in the MOMENTS section of `index.html` —
   they appear automatically once the files exist.
3. For each additional photo, copy one of the `<figure>` blocks in that section
   and update the filename and the `alt` description.

Photos whose file is missing are hidden automatically (the whole Moments section
hides if there are none), so the site never shows a broken image.

## Editing content

- All text lives in `index.html`, organized by clearly labelled comment blocks
  (`<!-- WHO WE ARE -->`, `<!-- WHAT WE DO -->`, etc.). Edit the text in place.
- To change colors or fonts, edit the CSS variables at the top of `css/styles.css`.

## Contact & domain

- All "Get in Touch" buttons email **thebadmintonproject@gmail.com**.
- The canonical domain is **https://thebadmintonproject.com** (used in the
  canonical tags, og:url, share-image URLs, sitemap.xml and robots.txt).
  The `.ca` domain and the `www.` variants should 301-redirect to it —
  most hosts do this automatically when they're added as domain aliases.

Nothing on the site claims a founding year, location, or credentials — those were
deliberately left out until you have the details you want to publish.

## Planned sections (not built yet, by design)

- **Where we are** — locations/venues (needs addresses & schedule)
- **Achievements** — results and milestones (needs real results)
- **Journal / blog** — updates (needs content)

The footer already teases these as "coming soon." When ready, each can become its own
page (e.g. `journal.html`) or a new section in `index.html`, plus a nav link.

## Link previews (social sharing)

`assets/og-image.png` is the branded card that appears when someone shares a
link to the site (WhatsApp, iMessage, Instagram DMs, X, Facebook, …). It's
wired into every page via `og:image` meta tags pointing at the full
`https://thebadmintonproject.com/...` address.

## Publishing

When you're ready to go live, this folder can be dropped as-is into any static host —
Netlify (drag-and-drop at app.netlify.com/drop), GitHub Pages, Vercel, or Cloudflare
Pages — and connected to a custom domain like `thebadmintonproject.com`.
