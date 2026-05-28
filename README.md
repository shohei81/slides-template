# slides-template

A reveal.js presentation template. Runs from a single HTML file, with a dark theme, KaTeX math, speaker notes, PDF export, and **per-slide bilingual (JA / EN) content** togglable at runtime.

> 日本語版の README は [README.ja.md](README.ja.md) を参照。

## Quick start

Use this template via "Use this template," or clone it, then:

```bash
npm run dev    # open http://localhost:8000/slides.html
```

Edit `slides.html` directly. Drop figures into `figs/` and reference them as `<img src="figs/foo.png">`.

## Setup

### Prerequisites

- **Node.js 18+** (for `npx`; Node 20 LTS recommended)
- For PDF export: a Chromium-compatible browser. `decktape` bundles its own via Puppeteer on first run, so you usually don't need to install anything extra.

No `npm install` step — this repo has zero project dependencies. `serve` (dev server) and `decktape` (PDF) are fetched on demand by `npx -y`.

### Installing Node.js

**macOS (Homebrew):**
```bash
brew install node
```

**Linux (Debian / Ubuntu):**
```bash
sudo apt install nodejs npm
```

**Cross-platform via nvm** (recommended for managing multiple Node versions):
```bash
# https://github.com/nvm-sh/nvm — install nvm first, then:
nvm install 20
nvm use 20
```

**Windows:** download the installer from <https://nodejs.org/>, or use [nvm-windows](https://github.com/coreybutler/nvm-windows).

### Verify

```bash
node --version   # v18.x or later
npx --version
```

### First-time scratch run

```bash
git clone <this-repo>
cd slides-template
npm run dev        # serves at http://localhost:8000/slides.html
# in another terminal:
npm run pdf        # writes slides.pdf
```

The first `npm run pdf` is slow — `npx` downloads `decktape` and Puppeteer's Chromium (~150 MB) and caches them. Subsequent runs reuse the cache.

## Keyboard

| Key | Action |
|---|---|
| `←` `→` `↑` `↓` | Move between slides |
| `l` | Toggle JA / EN |
| `s` | Open speaker-notes window |
| `f` | Fullscreen |
| `esc` | Slide overview |

## Bilingual slides

Each slide carries both a Japanese and an English version side by side in the markup. The current language is controlled by a class on `<body>` (`lang-ja` or `lang-en`); CSS hides the inactive one. Press `l` to flip.

Authoring pattern:

```html
<section>
  <div class="lang-ja">
    <h2>日本語タイトル</h2>
    <p>本文</p>
  </div>
  <div class="lang-en">
    <h2>English title</h2>
    <p>Body text</p>
  </div>

  <aside class="notes">
    <div class="lang-ja">日本語ノート</div>
    <div class="lang-en">English notes</div>
  </aside>
</section>
```

The initial language is JA (`<body class="lang-ja">`). To preset the language via URL (useful for PDF export or sharing a link), append `?lang=en` or `?lang=ja`. A small `JA` / `EN` badge in the bottom-left corner shows the current state.

## Components

The sample slides in `slides.html` exercise every block the template offers:

- `.title` section — title slide
- `.progress-step` — small step indicator above the section heading
- `.takeaway` — warm-toned highlight box (main message)
- `.insight` — cool-toned highlight box (supplementary observation)
- `.twocol` — two-column layout
- `.eq-block` — centered KaTeX math block
- `table.compare` — comparison table
- `.ex-grid` — 4-column mini-card grid
- `.fig-card` — figure framed by a white card (for dark-background figures)
- `.label` — small pill label, e.g. `<span class="label">KEY</span>`
- `<aside class="notes">` — speaker notes

Color variables live under `:root` — overwrite `--accent` / `--accent2` to recolor the whole deck.

## PDF export

```bash
npm run pdf                          # writes slides.pdf in JA
bash scripts/export-pdf.sh out.pdf   # custom filename
bash scripts/export-pdf.sh slides-en.pdf en   # English version
```

Internally spins up `npx serve` and runs `decktape` against `slides.html?lang=<ja|en>`. Requires Node.js and a Chromium-compatible browser runtime (decktape pulls it in).

If you prefer the browser route, append `?print-pdf` to the URL and use the browser's "Save as PDF" dialog (Chrome recommended). Combine with `?lang=en&print-pdf` for an English print.

## Design templates

`templates/` holds drop-in design alternatives (dark / light / academic / minimal / terminal / pastel). Pick one and copy it over `slides.html`:

```bash
cp templates/academic.html slides.html
```

See [templates/README.md](templates/README.md) for previews and details on each look. When editing sample slide content shared across all templates, run `bash scripts/sync-templates.sh` to propagate the body from `templates/dark.html` to every other template and to `slides.html`.

## Layout

```
slides-template/
├── slides.html              # The deck. Edit this directly.
├── templates/               # Drop-in design alternatives
│   ├── README.md            # Previews + descriptions
│   ├── dark.html
│   ├── light.html
│   ├── academic.html
│   ├── minimal.html
│   ├── terminal.html
│   ├── pastel.html
│   └── screenshots/
├── figs/                    # Figures
│   └── sample.svg
├── scripts/
│   ├── export-pdf.sh
│   ├── screenshot.sh        # Regenerates template previews
│   └── sync-templates.sh    # Propagates body from templates/dark.html
├── package.json             # dev / pdf scripts
├── README.md
└── README.ja.md
```

## Dependencies

- No runtime dependencies. `slides.html` loads reveal.js@5.1.0 and KaTeX@0.16.11 from a CDN.
- The scripts need Node.js (`serve` and `decktape` are fetched via `npx`).
