# DEO Kairo — Landing Page Design Blueprint

**Version:** 0.1 (draft for review)
**Status:** Blueprint only — no production code. Design tokens supplied separately in `tokens.css`.
**Owner:** _TBD_
**Last updated:** 2026-08-16

> **All copy in this document is placeholder.** Nothing here should be published as
> official school communication until reviewed and approved by DEO Kairo. Factual
> claims (grade ranges, ages, exam names, admissions dates) are marked `⚠ CONFIRM`.

---

## 0. Three decisions that must be made before design starts

These change the architecture, not just the styling. Everything after §1 assumes the
recommended answer; if a decision goes the other way, the affected sections are noted.

### 0.1 Two languages or three? ⚠ CONFIRM

The brief says "bilingual language toggle" but lists **English / German / Arabic**.
That is three languages, and the third one changes the build.

Arabic is written right-to-left. That is not a translation task — it is a **layout
mirroring** task. Navigation, the timeline direction, icon arrows, card alignment,
list bullets, and the whole reading order flip. If Arabic is in scope, it must be
designed in from day one; retrofitting RTL onto a finished LTR site is roughly a
full re-layout.

**Recommendation:** decide now, and design the layout mirrored from the first
wireframe even if Arabic ships in phase 2.

| Scope | Effort | Note |
|---|---|---|
| DE + EN | Baseline | Toggle, two content sets, no mirroring |
| DE + EN + AR | +40–60% | Mirroring, Arabic typography, RTL QA pass |
| DE + EN, AR "coming soon" | +10% | Build RTL-safe now, translate later — **recommended** |

### 0.2 Language switching: separate URLs, not a JavaScript toggle

**Recommendation: separate URLs per language** — `/de/`, `/en/`, `/ar/`.

A client-side toggle that swaps strings in place looks simpler and is worse:

- Parents cannot share or bookmark a link in their language.
- Search engines index one language only, so an Arabic-speaking parent searching in
  Arabic will not find the school.
- Printing, translation tools, and screen readers all read the wrong `lang`.
- The page flashes the wrong language before JS runs.

Separate pages let each document declare `<html lang="de" dir="ltr">` honestly, and
the toggle becomes three ordinary links. It is also the only approach that degrades
gracefully with JavaScript off.

Add `<link rel="alternate" hreflang="…">` tags pointing at each sibling, plus
`hreflang="x-default"`.

### 0.3 GDPR / DSGVO is a design constraint here, not a legal footnote ⚠ CONFIRM

A German school abroad will almost certainly be held to German data-protection
practice. Three consequences that directly affect this design:

1. **Self-host the fonts.** Loading fonts from `fonts.googleapis.com` sends every
   visitor's IP address to Google. A Munich regional court ruled against a site
   operator for exactly this in January 2022, and German public institutions have
   largely moved to self-hosting since. Download the WOFF2 files, serve them from
   `/assets/fonts/`, and declare them with `@font-face`. This also makes the site
   faster and removes a third-party dependency.
2. **The map cannot load automatically.** A Google Maps embed sets cookies and
   contacts Google before the visitor consents. The contact section therefore needs
   a **two-state map component** — see §5.8. This is a real UI component with a
   designed placeholder state, not an afterthought.
3. **Impressum and Datenschutzerklärung are required pages**, linked from the
   footer of every page in every language. Budget content time for them.

> If the school's legal counsel confirms a different standard applies, items 1 and 2
> can be simplified. Confirm before build.

---

## 1. Brand foundation

### 1.1 Concept

The design idea is **"two shores, one path."** The school's distinctive quality is
that a student's education runs along a single continuous route while drawing on two
cultures at once. The horizontal timeline is the visual spine of the whole page —
everything else hangs off it.

Two materials carry the palette: **water** (the deep Nile teal) and **paper**
(papyrus). Clay and sun-gold are the Egyptian ground; the teals are the school.
Restraint matters here — a school site that looks like a travel brochure undercuts
its own seriousness.

### 1.2 Colour palette

| Token | Hex | Role |
|---|---|---|
| `--nile-900` | `#123832` | Primary dark. Body text on light, background for dark bands. |
| `--papyrus-50` | `#F7F0DE` | Page background. Warm, not white — reduces glare. |
| `--clay-600` | `#A64B2A` | Primary action colour. Buttons, active states. |
| `--gold-500` | `#C89B3C` | Accent. Rules, timeline markers, decorative detail. |
| `--teal-500` | `#3E9C86` | Secondary. Fills, illustration, graphic elements. |

#### Contrast audit — measured, not estimated

Every pair below was computed against the WCAG 2.1 relative-luminance formula.
**Three of the five brand colours fail as text in their most obvious use.** This is
normal for a palette chosen for mood, and it is fixable — but it must be handled in
the token layer rather than discovered during QA.

| Foreground | Background | Ratio | Verdict |
|---|---|---|---|
| Papyrus | Nile-900 | **11.28:1** | AAA ✅ |
| Nile-900 | Papyrus | **11.28:1** | AAA ✅ |
| White | Clay-600 | **5.74:1** | AA ✅ |
| Clay-600 | Papyrus | **5.05:1** | AA ✅ |
| Gold-500 | Nile-900 | **5.01:1** | AA ✅ |
| Nile-900 | Gold-500 | **5.01:1** | AA ✅ |
| Clay-600 | Nile-900 | 2.24:1 | **FAIL** ❌ |
| Gold-500 | Papyrus | 2.25:1 | **FAIL** ❌ |
| White | Gold-500 | 2.56:1 | **FAIL** ❌ |
| Teal-500 | Papyrus | 2.93:1 | **FAIL** ❌ |
| Teal-500 | Nile-900 | 3.85:1 | Large text / UI only ⚠ |
| White | Teal-500 | 3.33:1 | Large text / UI only ⚠ |

**Rules that follow directly from the table:**

- **Never** set clay text on the dark teal. Use papyrus or gold instead.
- **Never** put white text on sun-gold. A gold button takes **Nile-900** text (5.01:1).
- **Never** use gold for body copy on papyrus. Gold is for rules, markers, and
  ornament — things with no reading burden.
- Bright teal is a **fill colour, not a text colour.** It is fine for the timeline
  line, illustration, and icon shapes (3:1 suffices for non-text graphics against an
  adjacent colour), and unusable for paragraphs.

#### Derived tokens — the three colours the palette is missing

| Token | Hex | Why it exists | Measured |
|---|---|---|---|
| `--teal-700` | `#2A6E5E` | A readable teal. Links and secondary buttons. | 5.29:1 on papyrus · 6.02:1 with white text ✅ |
| `--ink-muted` | `#4E5F57` | Secondary copy, captions, labels on papyrus. | 5.96:1 ✅ |
| `--teal-100` | `#B8CFC8` | Secondary copy on the dark bands. | 7.82:1 on Nile-900 ✅ |

With these three added, every text role in the design has a compliant colour.

#### Semantic mapping

Design in **roles**, not hues — so a future palette revision touches one block.

```
Surface        papyrus-50   →  page background
Surface-raised #FFFDF7      →  cards (a half-step lighter than papyrus)
Surface-invert nile-900     →  hero band, footer, stage-detail bands
Text           nile-900     →  headings, body
Text-muted     ink-muted    →  captions, meta, labels
Text-on-dark   papyrus-50   →  body inside dark bands
Text-on-dark-muted teal-100 →  captions inside dark bands
Action         clay-600     →  primary buttons, current state
Action-hover   #8F3F22      →  clay darkened ~8%
Link           teal-700     →  inline links
Accent         gold-500     →  rules, timeline nodes, ornament (never text on light)
Graphic        teal-500     →  fills, illustration, the timeline line itself
Focus ring     gold-500     →  3px, on both light and dark ⚠ see note
```

> **Focus-ring note:** gold reaches 5.01:1 on the dark band but only 2.25:1 on
> papyrus — too weak to be a visible focus indicator on light backgrounds. Use a
> **two-tone ring**: 3px `clay-600` with a 1px papyrus inner gap on light surfaces,
> 3px `gold-500` on dark surfaces. WCAG 2.2 requires the focus indicator itself to
> reach 3:1 against what surrounds it; a single gold ring on papyrus would fail.

### 1.3 Typography

#### On "a serif with Arabic-calligraphy warmth" — a caution

There is a category of Latin typeface that mimics Arabic letterforms — the faux-kufic
look used on restaurant signage. **Avoid it.** In a genuinely Arabic-speaking context
it reads as pastiche, and for a school whose whole premise is real cross-cultural
education, a costume version of Arabic script undercuts the message.

The honest way to get the warmth: pair a **real Latin serif** with a **real Arabic
typeface**, chosen to sit well together. The calligraphic quality then comes from
actual Arabic calligraphic tradition (Naskh), used where Arabic belongs.

#### Recommended stack — all open-source, all self-hostable

| Role | Latin | Arabic | Why |
|---|---|---|---|
| Headings | **Spectral** (SemiBold 600) | **Amiri** (Bold) | Spectral has a humanist axis and slight calligraphic stress — warm without being fussy, and legible at display sizes. Amiri is a genuine Naskh revival: the real calligraphic warmth the brief is reaching for. |
| Body | **Manrope** (400/500/700) | **IBM Plex Sans Arabic** (400/600) | Manrope as specified — geometric, open apertures, excellent at small sizes. Plex Arabic is geometric in the same way, so the two feel like siblings. |
| Numerals | Manrope, tabular figures | — | For dates, grades, and timeline steps. |

**Alternates if Spectral is rejected:** Literata (more neutral, very screen-legible)
or Marcellus (headings only — no italic, no weight range).

#### Arabic typesetting is not "the same text, mirrored"

Four adjustments, all mandatory:

1. **Size up ~8%.** Arabic has no capital/lowercase distinction and relies on fine
   sub-letter detail. At the same nominal size it reads smaller than Latin.
2. **Line-height up.** Arabic ascenders and descenders overlap more. Use `1.9` for
   Arabic body against `1.65` for Latin.
3. **No letter-spacing, ever.** Arabic letters connect. Applying `letter-spacing`
   breaks the joins and produces text that is genuinely hard to read. Scope any
   tracking rules to `[lang]:not([lang^="ar"])`.
4. **No faux bold or faux italic.** Load a real bold weight. Arabic has no italic —
   use weight or colour for emphasis instead.

#### Type scale

Fluid via `clamp()`, so no font-size media queries are needed.

| Step | Size | Line-height | Use |
|---|---|---|---|
| Display | `clamp(2.5rem, 5.5vw, 4rem)` | 1.1 | Hero H1 |
| H2 | `clamp(1.9rem, 3.5vw, 2.75rem)` | 1.15 | Section titles |
| H3 | `clamp(1.25rem, 2vw, 1.5rem)` | 1.3 | Card and stage titles |
| Body-lg | `1.125rem` | 1.65 | Hero subtitle, mission |
| Body | `1rem` | 1.65 | Default |
| Small | `0.9rem` | 1.6 | Captions, meta |
| Label | `0.8rem` | 1.4 | Eyebrows, uppercase labels (Latin only) |

Body text never goes below `1rem` (16px). Measure caps at **66 characters**
(`max-width: 66ch`) for Latin, `60ch` for Arabic.

### 1.4 Spacing, shape, motion

- **Spacing scale** (4px base): 4, 8, 12, 16, 24, 32, 48, 64, 96, 128.
- **Radius:** 4px (inputs) · 10px (cards) · 999px (pills). Keep it modest — heavy
  rounding reads consumer-app, not institution.
- **Elevation:** one soft shadow only, on cards. Dark bands use colour change, not
  shadow, to separate.
- **Motion:** 200ms for state changes, 500ms for reveals, one shared easing curve.
  Every animation needs a `prefers-reduced-motion` off-switch.

---

## 2. Page architecture

```
┌─ Skip link (first focusable element)
├─ Header ............ logo · nav · language switcher
├─ Hero .............. bilingual headline · mission · timeline preview · 2 CTAs
├─ Pillars ........... 5 values, paraphrased
├─ Timeline .......... the four stages, numbered — the spine of the page
├─ Stage highlights .. curriculum emphasis per stage
├─ News .............. 3 latest updates
├─ Admissions teaser . single strong CTA band
├─ Contact ........... address · hours · consent-gated map
└─ Footer ............ nav · languages · Impressum · Datenschutz · socials
```

Rationale for the order: a prospective parent's questions arrive in this sequence —
*What is this school? What does it believe? What is the path my child takes? What
will they actually learn? Is it alive? How do I apply? Where are you?* Each section
answers exactly one.

---

## 3. Section specifications

### 3.1 Header

- Sticky, translucent, gains a hairline border after ~12px of scroll.
- Logo left in LTR, **right in RTL** — use `margin-inline-start`, never `margin-left`.
- Nav collapses to a hamburger below 900px (the trigger is language-length-sensitive:
  German compounds are long, so test with `Schulgemeinschaft` in the nav).
- Language switcher sits **outside** the hamburger — it must stay reachable when the
  menu is closed. A parent who lands on the wrong language should not have to open a
  menu to fix it.

#### Language switcher — specification

- Renders as three links, or a dropdown if more than three languages ship.
- **Each language name is written in its own language:** `Deutsch` · `English` ·
  `العربية`. Never "German / English / Arabic" — a visitor who cannot read the
  current language cannot find their own.
- **No flag icons.** Flags denote countries, not languages: Arabic is spoken across
  ~25 countries, German across at least four, and an Egyptian flag for Arabic implies
  the school serves only Egyptian families. Use text.
- Current language marked with `aria-current="true"` **and** a visual weight change —
  colour alone is insufficient.
- Each link carries `hreflang` and `lang` on itself, so a screen reader announces
  "العربية" in Arabic rather than mangling it in German.
- Links point to the **same page** in the other language, not to that language's
  homepage.

### 3.2 Hero

**Content blocks:**
1. Eyebrow — `Deutsche Evangelische Oberschule Kairo` (small, gold on dark)
2. H1 — primary language, display size
3. **Secondary-language line** — the same headline in the other language, at Body-lg,
   in `teal-100`, marked with its own `lang` attribute
4. Mission statement — 2 sentences, max 60 words ⚠ CONFIRM with school
5. Two CTAs — `Apply` (clay, primary) and `Visit us` (ghost)
6. Timeline preview strip — the four stages as a compact row, linking to §3.4

**On the bilingual headline pattern:** show two languages in the hero, not three.
Three stacked headlines is a wall. The third language is reachable via the switcher.

The dual headline is the single clearest expression of the school's premise — two
languages, equal weight, one message. Do not let the secondary line look like a
caption; give it real size and real contrast (`teal-100` at 7.82:1).

**Background:** Nile-900 with a very low-contrast papyrus-texture overlay
(≤4% opacity). No photographs of children in the hero until image rights are
confirmed ⚠ CONFIRM — see §6.3.

### 3.3 Pillars

Five values, paraphrased into plain English. These are drafts for the school to
approve — the German originals carry theological and pedagogical weight that a
literal translation loses.

| German | English heading | Draft copy (placeholder) |
|---|---|---|
| **Begegnung** | Encounter | Two cultures share one campus. Students learn German and Egyptian ways of thinking side by side, and learn to move between them. |
| **Bildung** | Formation | More than instruction. We are interested in what a student becomes, not only what they can recall. |
| **Religion & Spiritualität** | Faith & Reflection | A Protestant foundation, open to every student. Space to ask difficult questions and to hold different answers with respect. |
| **Individuum & Gemeinschaft** | The Individual and the Community | Each student is known by name. Each also belongs to something larger than themselves. |
| **Partizipation** | Participation | Students help shape the school. Their voice is part of how decisions get made, not a suggestion box. |

> **Translation note for the school:** *Bildung* has no English equivalent.
> "Education" is too narrow, "formation" is closer but carries religious overtones in
> English. Flagged for a native-speaker decision. Similarly *Begegnung* — "encounter"
> is literal but stiff; "meeting" is warmer but vaguer.

**Layout:** 5 items do not divide evenly into a grid. Use `3 + 2` centred on desktop,
`2 + 2 + 1` on tablet, single column on mobile — or make the first pillar a wide
feature card spanning two columns, which fixes the parity and creates a hierarchy.
Recommend the latter.

### 3.4 The four-stage timeline — primary component

The centrepiece. Specified in detail because it carries the most design and
accessibility risk on the page.

**Stages** ⚠ CONFIRM all ages, grades, and exam naming with the school:

| # | Stage | Ages | Grades | One-line description |
|---|---|---|---|---|
| 01 | **Kindergarten** | 3–6 | — | German through play. First friendships across two cultures. |
| 02 | **Grundschule** | 6–10 | 1–4 | Literacy in two scripts. The foundations, taught patiently. |
| 03 | **Gymnasium** | 10–18 | 5–12 | Academic depth. Sciences, languages, humanities. |
| 04 | **Abitur** | 17–18 | 12 | The German International Abitur — university entry in Germany, Egypt, and beyond. |

**Structure:** an ordered list `<ol>`. The steps have a real sequence and a screen
reader should announce "list of 4 items." Never build this from `<div>`s.

**Responsive behaviour — no horizontal scrolling:**

| Breakpoint | Layout |
|---|---|
| ≥1024px | 4 equal columns, horizontal connector line behind the nodes |
| 768–1023px | 2 × 2 grid, connector line per row |
| <768px | Vertical stack, connector line running down the inline-start edge |

A horizontally scrolling timeline is tempting and wrong: scroll containers are a
known keyboard and screen-reader trap, content hides off-screen with no affordance,
and it fails badly at 200% zoom. Four items fit in four columns. Use them.

**RTL:** the connector must run right-to-left and the step numbers must sit on the
correct side. Build with flexbox and logical properties and this is automatic. Test
it — an arrow glyph `→` pointing the wrong way in Arabic is the classic RTL bug.
Use a mirrored SVG or `scaleX(-1)`, not the character.

**Node design:** gold-500 circle, Nile-900 numeral inside (5.01:1 ✅), teal-500
connector line. The current/hovered node fills clay-600 with papyrus numeral.

**States:** default · hover · focus-visible · current (if a "you are here" mode is
ever used) · reduced-motion (connector draws instantly rather than animating).

### 3.5 Stage highlights

Four blocks, one per timeline stage, `id`-linked from the timeline so a click scrolls
to the matching detail.

Each block carries: stage name (DE + EN) · age range · 3–4 curriculum emphases ·
one line on progression to the next stage · optional pull quote from a teacher or
student ⚠ CONFIRM permissions.

Alternate the layout left/right down the page for rhythm; on mobile they all stack
in the same order. Ensure the alternation is done with grid `order`, not by
duplicating markup.

### 3.6 News

Three cards: date · category tag · headline · 1-line excerpt · "Read more."

- Dates need `<time datetime="…">` and **locale-appropriate formatting** —
  `16.08.2026` in German, `16 August 2026` in English, and Arabic dates in
  Eastern Arabic numerals if the school prefers ⚠ CONFIRM.
- **Design the empty state.** A school news feed will be empty during holidays. A
  section that collapses to a heading and nothing else looks broken. Specify a
  fallback: "No updates right now — follow us on [channel] for the latest."
- Design a loading state if news comes from a CMS.

### 3.7 Admissions teaser

A single full-width clay or Nile band. One heading, two sentences, one button.
Resist adding a form here — the goal is to move the visitor to the admissions page,
and a second competing CTA reduces the odds they do either.

### 3.8 Contact & map — the consent-gated component

Two columns: address, phone, email, office hours as a `<dl>`; map beside it.

**The map has two states, and the placeholder is the default:**

- **State A — consent not given (default).** A styled placeholder box in Nile-900
  with a papyrus outline map illustration, the full postal address in text, a short
  line explaining that loading the map will contact Google and set cookies, a
  **"Load map"** button, and a plain link to open the location in a new tab. The
  address must be readable and copyable here — this state has to be genuinely
  useful, not a nag screen.
- **State B — consent given.** The `<iframe>` loads, with a `title` attribute
  ("Map showing DEO Kairo, [address]"). Consent persists in `localStorage`.

An `<iframe>` with no text alternative is inaccessible regardless of consent, so the
text address is required in **both** states, not just the placeholder.

### 3.9 Footer

Nav repeat · language links · contact summary · **Impressum** · **Datenschutzerklärung**
· social links (with accessible names, not bare icons) · copyright.

---

## 4. Content plan

### 4.1 Voice

**Warm, plain, and specific.** A school prospectus voice fails in two directions:
corporate ("leveraging synergies in holistic learner outcomes") and saccharine
("we nurture every little dream"). Aim between them — the tone of a good teacher
talking to a parent at an open evening.

| Do | Don't |
|---|---|
| "Students learn to read in two scripts." | "Multi-literacy competencies are fostered." |
| "Class sizes are around 20." | "Small, intimate learning environments." |
| Name the exam, the language, the year. | "World-class." "Excellence." "Journey." |
| Short sentences. One idea each. | Subordinate clauses stacked three deep. |

Avoid "journey" — it is the single most overused word in school marketing. The
timeline already communicates progression; the copy does not need to say it.

### 4.2 Bilingual presentation patterns

Four patterns, each with a defined use. Consistency matters more than which one:

| Pattern | Form | Use for |
|---|---|---|
| **Parallel** | Both languages, equal weight, stacked | Hero headline only |
| **Primary + gloss** | Primary large, secondary smaller beneath | Section headings |
| **Term + translation** | `Grundschule` *(Primary School)* | German stage names in English copy |
| **Single** | Page language only | Body copy, always |

**Never machine-translate the German pedagogical terms.** Keep *Abitur*,
*Grundschule*, *Gymnasium*, *Kindergarten* in German across all three languages,
glossed on first use. They are proper nouns for a specific system, and an English
parent researching "Abitur" needs to see that word.

### 4.3 Microcopy

| Element | German | English | Arabic ⚠ needs native review |
|---|---|---|---|
| Primary CTA | `Jetzt bewerben` | `Apply now` | `قدّم الآن` |
| Secondary CTA | `Schule besuchen` | `Visit the school` | `زوروا المدرسة` |
| Timeline label | `Der Bildungsweg` | `The educational path` | `المسار التعليمي` |
| Read more | `Weiterlesen` | `Read more` | `اقرأ المزيد` |
| Load map | `Karte laden` | `Load map` | `تحميل الخريطة` |
| Skip link | `Zum Inhalt springen` | `Skip to content` | `تخطَّ إلى المحتوى` |

> All Arabic strings above are placeholders pending review by a native speaker,
> ideally one familiar with Egyptian educational register. Machine-translated Arabic
> on a school site is immediately visible to the audience it is meant to serve.

**German-specific layout warning:** German runs roughly 30% longer than English, and
compound nouns do not break. `Datenschutzerklärung` is 24 characters with no natural
break point. Every button, nav item, and card title must be tested with German
strings — and CSS needs `hyphens: auto` with `lang="de"` plus `overflow-wrap:
break-word` as a backstop.

### 4.4 Content ownership ⚠ CONFIRM

| Block | Source | Owner | Status |
|---|---|---|---|
| Mission statement | School Leitbild | _TBD_ | Needs approval |
| Five pillars | Existing German text | _TBD_ | Draft EN in §3.3 |
| Stage descriptions | Department heads | _TBD_ | Not started |
| Ages / grades / exams | Registrar | _TBD_ | ⚠ Must verify |
| News | Comms | _TBD_ | Needs 3 to launch |
| Photography | — | _TBD_ | ⚠ See §6.3 |
| Impressum / Datenschutz | Legal | _TBD_ | Legally required |
| Arabic translation | Native speaker | _TBD_ | Not started |

---

## 5. Accessibility & responsiveness

### 5.1 Target

**WCAG 2.1 Level AA**, with WCAG 2.2 focus-appearance criteria adopted where
practical. For a school serving families with a wide range of devices, ages, and
connection speeds, AA is a floor rather than a stretch goal.

### 5.2 The four principles, made concrete

**Perceivable** — contrast audited in §1.2 with three derived tokens added to fix
the gaps. Every image gets meaningful `alt`; decorative SVG gets `aria-hidden="true"`.
Never use colour alone to convey state — the current language is bold *and*
coloured, the current timeline step is filled *and* labelled.

**Operable** — every interactive element reachable and usable by keyboard, in a
logical order. Visible focus on everything. Skip link first in the DOM. No keyboard
traps (this is why §3.4 rejects the scrolling timeline). Touch targets ≥44×44px.
Respect `prefers-reduced-motion`.

**Understandable** — correct `lang` on `<html>` and on any inline foreign-language
run, which is frequent on a bilingual site and is what makes a screen reader switch
pronunciation. Consistent navigation across pages. Form errors described in text,
next to the field, not by red border alone.

**Robust** — semantic HTML first, ARIA only where HTML has no equivalent. Landmarks
(`header` / `nav` / `main` / `footer`) so screen-reader users can jump between
regions. The site must remain readable with JavaScript disabled.

### 5.3 Keyboard specification

| Key | Behaviour |
|---|---|
| `Tab` | Skip link → logo → nav → language switcher → hero CTAs → timeline steps → … |
| `Enter` / `Space` | Activate buttons; `Enter` for links |
| `Escape` | Close mobile menu, return focus to the trigger |
| Arrow keys | Only if the language switcher is a dropdown — then full menu semantics |

Focus must never be lost. When the mobile menu closes, focus returns to the
hamburger. When "Load map" is pressed, focus moves into the loaded map region and it
is announced.

### 5.4 Breakpoints

Content-driven, not device-driven — set them where the layout actually breaks.

| Range | Layout |
|---|---|
| <480px | Single column · vertical timeline · stacked CTAs |
| 480–767px | Single column, wider gutters · news 1-up |
| 768–1023px | 2-col pillars · 2×2 timeline · news 2-up |
| 1024–1279px | 3-col pillars · 4-col timeline · news 3-up |
| ≥1280px | Max content width 1200px, centred |

Test at **320px** (smallest realistic phone) and at **200% zoom on a 1280px window**
— WCAG requires no loss of content or function at 200%, and it is where fixed-height
heroes usually break.

### 5.5 RTL implementation rules

Adopt these from the first line of CSS, whether or not Arabic ships in phase 1. They
cost nothing in LTR and make RTL nearly free later.

| Use | Not |
|---|---|
| `margin-inline-start` | `margin-left` |
| `padding-inline` | `padding-left` / `-right` |
| `inset-inline-start` | `left` |
| `border-inline-start` | `border-left` |
| `text-align: start` | `text-align: left` |
| Mirrored SVG arrows | `→` / `←` characters |

Directional icons (arrows, chevrons, "next") flip. Non-directional ones (clock, mail,
phone) do not. Logos never flip. Numbers and Latin-script names inside Arabic text
stay LTR — the browser's bidi algorithm handles this if the markup is correct, so
avoid forcing direction on individual spans.

---

## 6. Deliverables

### 6.1 Style guide excerpt

A one-page reference to hand to a developer:

1. Colour swatches with hex, token name, and the measured contrast table from §1.2
2. Type scale specimen — Latin and Arabic side by side, all weights
3. Spacing scale ruler
4. Button matrix — primary / secondary / ghost × default / hover / focus / disabled,
   in LTR and RTL
5. The timeline component at all three breakpoints, both directions
6. Focus-ring specification on both light and dark surfaces

### 6.2 Component & state map

| Component | States |
|---|---|
| Header | default · scrolled · menu-open · RTL |
| Language switcher | default · hover · focus · current · (dropdown: open/closed) |
| Button — primary | default · hover · focus-visible · active · disabled · loading |
| Button — ghost | default · hover · focus-visible · active |
| Pillar card | default · hover · focus-within |
| **Timeline** | default · step-hover · step-focus · step-current · reduced-motion · LTR · RTL · 3 breakpoints |
| Stage block | default · image-left · image-right · no-image |
| News card | default · hover · focus-within · **empty** · loading |
| **Map** | **consent-pending (default)** · loading · loaded · load-failed |
| Form field | empty · focus · filled · error · disabled |
| Form | idle · submitting · success · error |
| Footer | default · RTL |

Bolded rows are the ones most often shipped incomplete. The map's consent-pending
state and the news empty state are real designs, not error handling.

### 6.3 Assets needed ⚠ CONFIRM

- Logo: SVG, light and dark variants, with clear-space rules
- Fonts: WOFF2 for Spectral, Manrope, Amiri, IBM Plex Sans Arabic — **self-hosted**
- Photography: campus, classrooms, students. **Two blockers:** written consent for
  any identifiable minor, and a decision on whether photographs of students are
  appropriate given the school's own safeguarding policy. Have an illustration-led
  fallback ready — it may be the better answer regardless.
- Papyrus texture: subtle, tileable, ≤4% opacity
- Favicon and OG image per language
- Map: static outline SVG for the consent-pending state

### 6.4 Design tokens

Supplied as `docs/tokens.css` alongside this document — every colour, type, spacing,
and motion value above as CSS custom properties, with the derived accessible colours
included and contrast noted in comments. This is the jump-start; it is not a page.

---

## 7. Milestones

### M1 — Wireframes & MVP structure (week 1–2)
Greyscale wireframes at 3 breakpoints. Sitemap and URL structure for all languages.
Timeline component designed in detail, LTR and RTL. Content inventory with owners
assigned. **Exit:** structure signed off, no colour discussion yet.

### M2 — Visual design (week 3–4)
Palette and typography applied. Style guide excerpt produced. Full component and
state map. German copy finalised, English copy drafted. **Exit:** desktop and mobile
comps approved, contrast re-audited on the real comps.

### M3 — Build, LTR (week 5–7)
Semantic HTML, self-hosted fonts, responsive CSS with logical properties throughout.
DE and EN live. Consent-gated map built. Accessibility pass: keyboard, screen reader,
200% zoom, 320px width. **Exit:** AA audit passed in two languages.

### M4 — Arabic & polish (week 8–9)
Arabic typography, translation reviewed by a native speaker, full RTL QA. Micro-
interactions with reduced-motion fallbacks. Performance budget: LCP <2.5s on 3G.
**Exit:** three languages live, AA passed in all three.

> If Arabic is deferred, M4 shrinks to a polish sprint — but the RTL-safe CSS from
> M3 must still be in place, or the later Arabic launch becomes a rebuild.

---

## 8. Open questions

| # | Question | Blocks | Owner |
|---|---|---|---|
| 1 | Two languages or three? If three, is Arabic in phase 1 or 2? | M1 layout | _TBD_ |
| 2 | Which language is the default at `/`? | M1 URL structure | _TBD_ |
| 3 | Is DSGVO the operating standard? (Fonts, map, Impressum) | M1 | _TBD_ |
| 4 | CMS, or static pages? Who edits news, and in how many languages? | M1 architecture | _TBD_ |
| 5 | Hosting and deployment — existing infrastructure or new? | M3 | _TBD_ |
| 6 | Are photographs of students permitted? Consent process? | M2 assets | _TBD_ |
| 7 | Confirm stage ages, grade ranges, and the exact exam name | M2 copy | Registrar |
| 8 | Who signs off the English and Arabic translations? | M2 / M4 | _TBD_ |
| 9 | Does an existing brand guide constrain the palette? | M2 | _TBD_ |

Questions 1, 3, and 4 are the ones that change the build rather than the content.
The rest can be answered in parallel with M1.
