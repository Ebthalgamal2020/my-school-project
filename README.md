# Meridian

> A landing page for a student study-planner concept.
> Built with plain HTML, CSS, and JavaScript — no frameworks, no build step.

**Live site:** https://ebthalgamal2020.github.io/my-school-project/

---

## What this is

Meridian is a fictional study-planner product, and this repository is its
marketing landing page. It was built as a school project to practise semantic
HTML, responsive CSS, and DOM scripting without reaching for a framework.

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| Markup | Semantic HTML5 | Landmarks (`header`/`main`/`footer`) give screen readers a real structure to navigate. |
| Styling | Plain CSS with custom properties | The whole theme lives in `:root`. No build tooling needed to change it. |
| Behaviour | Vanilla JavaScript (ES6) | ~150 lines total. A framework would be more code than the site. |
| Fonts | Inter + Fraunces (Google Fonts) | A geometric sans for UI, a soft serif for headings. |
| Hosting | GitHub Pages | Serves the repo directly. Push to `main` → live in ~60 seconds. |

**Why not React?** This page has no application state — nothing re-renders in
response to data. React's strengths would go unused while adding a build step,
a `node_modules` folder, and a deploy pipeline to debug.

## File structure

```
my-school-project/
├── index.html        # All page content and structure
├── css/
│   └── style.css     # Design tokens → reset → layout → components → responsive
├── js/
│   └── main.js       # Nav, ripple, scroll reveal, counters, hero glow, form
├── assets/           # Images (currently empty; favicon is an inline SVG emoji)
├── .gitignore
└── README.md
```

## Design system

### Colour palette

Named **Meridian** — a deep ink base so the violet and aqua accents can glow.

| Token | Hex | Used for | Contrast |
|---|---|---|---|
| `--ink` | `#0B1020` | Page background | — |
| `--surface` | `#141A2E` | Cards, panels | — |
| `--line` | `#262F4D` | Borders, dividers | — |
| `--brand` | `#6A45F5` | Primary buttons | 5.55:1 with white text ✅ |
| `--brand-bright` | `#8B6DFF` | Links, hover states | 5.19:1 on ink ✅ |
| `--accent` | `#38E1C6` | Eyebrow, focus rings | 11.55:1 on ink ✅ |
| `--text` | `#EEF1F8` | Body copy | ~16:1 on ink ✅ |
| `--text-muted` | `#9AA4C0` | Secondary copy | 7.64:1 on ink ✅ |

Every pair above clears **WCAG AA (4.5:1)** for normal-size text. Note that
`--brand` is deliberately *darker* than a typical bright violet: white text on
`#7C5CFF` only reaches 4.35:1 and fails AA.

### Typography

- **Fraunces** (serif, 600) for `h1`/`h2` — gives the page a voice.
- **Inter** (sans, 400/500/600) for everything else — highly legible at small sizes.
- Headings use `clamp()` so they scale with the viewport without media queries.

### Accessibility

- **Skip link** as the first focusable element, jumping straight to `#main`.
- **One focus ring everywhere** — `:focus-visible` with a 3px aqua outline, so
  keyboard users always see where they are and mouse users never do.
- **`aria-expanded` on the mobile menu**, kept in sync in JS; CSS animates the
  hamburger from that same attribute.
- **`visibility: hidden` on the collapsed menu**, so its links leave the tab
  order. `max-height: 0` alone would leave them focusable but invisible.
- **`role="status"` on the form message**, announced without stealing focus.
- **`prefers-reduced-motion`** disables the reveal animations, ripple, counters,
  and pointer glow. Nothing is hidden — only the movement is removed.
- **44px touch targets** on the menu button.
- Decorative SVGs are `aria-hidden="true"` so they aren't announced.

## Run it locally

No install, no dependencies. Clone and open:

```bash
git clone https://github.com/Ebthalgamal2020/my-school-project.git
cd my-school-project
```

Then either:

**Option A — just open the file.** Double-click `index.html`. Works fine for
this project.

**Option B — a local server** (recommended; matches how GitHub Pages serves it):

```bash
npx serve .
```

Then visit the URL it prints, usually `http://localhost:3000`.

> Using VS Code? The **Live Server** extension is the easiest option — right-click
> `index.html` → *Open with Live Server*. It reloads on save.

## Deploy

Hosted on GitHub Pages from the `main` branch.

1. Push to `main`.
2. Repo → **Settings** → **Pages**.
3. **Source:** *Deploy from a branch* · **Branch:** `main` · **Folder:** `/ (root)`.
4. **Save**, wait ~60 seconds, then load the URL at the top of this file.

Every later push to `main` redeploys automatically.

## Customising it

To rebrand, edit these three places:

1. **`index.html`** — the four marked lines in `<head>` (title, description, OG tags),
   then find/replace `Meridian` throughout the body.
2. **`css/style.css`** — the `:root` block at the top. Swap `--brand` and
   `--accent`, and re-check contrast at [webaim.org/resources/contrastchecker](https://webaim.org/resources/contrastchecker/).
3. **`README.md`** — this file.

## Contributing

1. Fork the repo and create a branch: `git checkout -b feature/your-idea`
2. Make your change. Keep the existing conventions:
   - Two-space indentation in all three files.
   - New colours go in `:root` as custom properties — no hard-coded hex in rules.
   - Any new interactive element needs a visible `:focus-visible` state.
   - Any new animation needs a `prefers-reduced-motion` fallback.
3. Test at 375px, 768px, and 1440px widths, and tab through the whole page.
4. Commit with a clear message and open a pull request describing what changed and why.

## Licence

MIT — see `LICENSE`. Free to use as a starting point for your own project.
