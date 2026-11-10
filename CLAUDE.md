# HybridRaceCo

Independent content site about HYROX and hybrid racing: training, races and news, gear. The main goal is that a visitor reads another article. Newsletter signup is secondary.

## Design source of truth

`design/home.html` and `design/article.html` are the approved mockups as plain static HTML with inline styles. Open them in a browser. Match them; do not restyle. Port the inline styles into components and shared tokens rather than copying inline styles into the build.

Bracketed text such as `[AUTHOR NAME]`, `[PHOTO: ...]`, `[NEXT RACE CITY]` is a placeholder for real content. Never replace a placeholder with invented facts.

## Stack

- Astro, static output, Markdown/MDX content collections
- Plain CSS with custom properties (no UI framework)
- Deploy: AWS Amplify Hosting, build on push to `main`

## Design tokens

| Token | Value | Use |
|---|---|---|
| `--ground` | `#F3F4F1` | page background |
| `--ink` | `#101214` | text, dark sections, rules |
| `--accent` | `#C6F432` | tags, highlights, newsletter band; only ink text on top of it |
| `--muted` | `#555B63` | meta text on ground |
| `--body-soft` | `#3D434A` | deks, placeholder labels |
| `--rule` | `#C4C9C1` | hairlines on ground |
| `--muted-dark` | `#B4BAC0` | secondary text on ink |
| `--rule-dark` | `#4A5058` | borders on ink |
| `--placeholder` | `#D5D9D2` | image placeholder fill |

Accent is never used as text colour on the light ground (fails contrast). It is fine as text on ink.

Fonts (Google Fonts): Barlow Condensed 700/800 for headlines, uppercase at display sizes; Inter 400-700 for body and UI; IBM Plex Mono 400-600 for labels, numbers and meta.

Layout: 1240px max-width container, 24px side padding, square corners, 2px ink rules for section heads, 1px hairlines between items. No shadows, no gradients, no rounded cards.

## Site structure

- `/` homepage: next-race strip, header, lead story + numbered Latest list, Start Here (3 steps), station grid (8), three pillar columns, newsletter band, footer
- `/training/`, `/races-news/`, `/gear/` pillar listing pages (content mix is an even split across the three)
- `/stations/<slug>/` one guide per station: SkiErg, Sled Push, Sled Pull, Burpee Broad Jumps, Rowing, Farmers Carry, Sandbag Lunges, Wall Balls
- `/<pillar>/<slug>/` article page: breadcrumb, tag, headline, dek, byline, hero, sidebar (table of contents + short version), body, Read Next inline card, tags, Next in pillar, More like this
- `/start-here/`, `/about/`, `/contact/`, `/privacy/`

## Content model (article frontmatter)

`title`, `dek`, `pillar` (training | races-news | gear), `tags[]`, `author`, `publishDate`, `heroImage`, `heroAlt`, `summary[]` (the short version, 3 bullets), `next` (slug of the next article in the pillar), `draft`.

Read time is computed from the body. Table of contents is generated from h2 headings. Related articles: same pillar or shared tags, newest first, three items.

## Rules

- Accessibility: real links and buttons, labelled inputs, 44px minimum touch targets, 4.5:1 text contrast.
- Responsive: layouts wrap with flex/grid as in the mockups; test at 375px.
- SEO: unique title and description per page, canonical URLs, Open Graph tags, sitemap, RSS, Article structured data.
- Keep the footer disclaimer: not affiliated with or endorsed by HYROX.
- Wall Balls rep count is intentionally omitted until checked against the current rulebook.
- Newsletter form and search are UI only until a provider is chosen. Do not wire them to anything.
- No analytics, trackers or third-party scripts without being asked.

## Build order

1. Scaffold Astro, tokens, fonts, base layout, header and footer
2. Homepage with content from collections
3. Article layout and one real article (the sample in `design/article.html`)
4. Pillar listings and station guides
5. SEO, sitemap, RSS
6. Amplify deploy
