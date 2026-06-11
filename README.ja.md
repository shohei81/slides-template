# slides-template

Reveal.js ベースのプレゼンテーション・テンプレート。単一 HTML で動作し、ダークテーマ・KaTeX 数式・スピーカーノート・PDF エクスポート・**スライドごとの日英二言語版**(実行時に切替可能)を備える。

> English README: [README.md](README.md)

## クイックスタート

このリポジトリを "Use this template" で複製、もしくは clone してから:

```bash
npm run dev    # http://localhost:8000/slides.html を開く
```

スライドは `slides.html` を直接編集する。図は `figs/` に置き、`<img src="figs/foo.png">` で参照する。

## セットアップ

### 前提

- **Node.js 18 以降** (`npx` のため。Node 20 LTS 推奨)
- PDF エクスポート用にローカルの Chrome/Chromium (例: Google Chrome)。エクスポータは既存のブラウザをそのまま使い、ダウンロードは一切しない。

`npm install` は不要 — このリポジトリはプロジェクト依存ゼロ。`serve` (開発サーバ) は `npx -y` で都度取得する。PDF エクスポートに必要なのは Node.js とローカルの Chrome だけ。

### Node.js のインストール

**macOS (Homebrew):**
```bash
brew install node
```

**Linux (Debian / Ubuntu):**
```bash
sudo apt install nodejs npm
```

**nvm 経由(複数バージョン管理したい場合に推奨):**
```bash
# まず nvm を入れる: https://github.com/nvm-sh/nvm
nvm install 20
nvm use 20
```

**Windows:** <https://nodejs.org/> からインストーラを取得するか、[nvm-windows](https://github.com/coreybutler/nvm-windows) を使う。

### 動作確認

```bash
node --version   # v18.x 以降
npx --version
```

### 初回実行

```bash
git clone <this-repo>
cd slides-template
npm run dev        # http://localhost:8000/slides.html で配信
npm run pdf        # slides.pdf を出力 (ローカル Chrome を使用、ダウンロードなし)
```

PDF エクスポートに開発サーバは不要で、何もダウンロードしない — ローカルの Chrome を DevTools Protocol で操作し、reveal.js の印刷レイアウトとフォントの準備が整ってから印刷する。ネットワークアクセスは、スライドが元々読み込む reveal.js / KaTeX の CDN 取得にのみ必要。

## キーボード

| キー | 動作 |
|---|---|
| `←` `→` `↑` `↓` | スライド移動 |
| `l` | 日英切替 |
| `s` | スピーカーノート・ウィンドウを開く |
| `f` | フルスクリーン |
| `esc` | 全スライド一覧 |

## 二言語スライド

各スライドはマークアップ内に日本語版と英語版を並置している。`<body>` のクラス (`lang-ja` / `lang-en`) で表示言語を制御し、CSS が非アクティブ側を非表示にする。`l` キーで切り替わる。

書き方:

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

初期言語は JA (`<body class="lang-ja">`)。URL から初期言語を上書きする場合は `?lang=en` または `?lang=ja` を付ける(PDF 書き出しや共有リンク用)。左下の `JA` / `EN` バッジが現在の言語を示す。

## 用意されているコンポーネント

`slides.html` のサンプルスライドが、テンプレートで使えるブロックを全て一通り示している。

- `.title` セクション — タイトルスライド
- `.progress-step` — セクション見出しの上に置く小さなステップ表示
- `.takeaway` — 暖色のハイライト枠 (主張用)
- `.insight` — 寒色のハイライト枠 (補足・気づき用)
- `.twocol` — 2 カラムレイアウト
- `.eq-block` — 中央寄せの数式ブロック (KaTeX)
- `table.compare` — 比較用テーブル
- `.ex-grid` — 4 列のミニカードグリッド
- `.fig-card` — 白カードで囲った画像 (ダーク背景に図を載せる用)
- `.label` — `<span class="label">KEY</span>` のような小さなピル型ラベル
- `<aside class="notes">` — スピーカーノート

カラー変数は `:root` で定義しているので、`--accent` / `--accent2` を書き換えれば全体の配色を変えられる。

## PDF エクスポート

```bash
npm run pdf                                          # slides.pdf を出力 (JA)
npm run pdf:en                                       # slides-en.pdf を出力 (EN)
node scripts/export-pdf.mjs slides.html ja out.pdf   # 入力・言語・出力を指定
node scripts/export-pdf.mjs templates/terminal.html en talk.pdf   # 任意のテンプレート
```

`scripts/export-pdf.mjs` はデッキ (`file://…?print-pdf&lang=<ja|en>`) をローカルの Chrome で DevTools Protocol 経由で開き、**reveal.js の印刷レイアウトとフォントの準備が整うまで待ってから** `preferCSSPageSize` で印刷する。これにより 1 スライド = 1 ページが保証され、一発勝負の `chrome --print-to-pdf` で起きがちな「空ページ」問題を回避する。

- **依存ゼロ・ダウンロードなし。** Node 18+ はグローバルな `fetch` と `WebSocket` を備えるため npm パッケージは不要。約 150 MB のブラウザを取得せず、既存の Chrome を再利用する。
- **ブラウザの指定**は `CHROME` 環境変数で。未指定なら macOS / Linux 上の Google Chrome / Canary / Chromium / Edge を自動検出する。
- reveal.js / KaTeX の CDN へのネットワークアクセスは引き続き必要 (デッキが実行時に読み込むため)。

手動で出したい場合は、URL の末尾に `?print-pdf` を付けて Chrome の "PDF として保存" ダイアログから出す手もある。英語版を出すなら `?lang=en&print-pdf` の組み合わせで。

## デザインテンプレート

`templates/` 配下に差し替え用のデザイン違い (dark / light / academic / minimal / terminal) を用意している。気に入ったものを `slides.html` に上書きコピーして使う:

```bash
cp templates/academic.html slides.html
```

各テーマのプレビューと説明は [templates/README.md](templates/README.md) を参照。サンプルスライドの DOM (コンポーネントの追加・再構成・サンプル文言の差し替え等) を更新した場合は `bash scripts/sync-templates.sh` で `templates/dark.html` の本文を他の全テンプレートと `slides.html` に伝搬できる。

## 他リポジトリで使う (`new-deck`)

`bin/new-deck` を PATH に通しておくと、任意のディレクトリから一発で新しいデッキを生やせる。

```bash
ln -s "$(pwd)/bin/new-deck" ~/.local/bin/new-deck   # 初回だけ
```

使い方:

```bash
cd ../other-repo
new-deck docs/slides/2026-05-talk    # デフォルト (slides.html + figs/ + templates/*.html + scripts/export-pdf.mjs + package.json, 約108K)
new-deck --minimal presentations/lt  # 最小 (slides.html + figs/ のみ, 約20K)
```

スクリーンショット (`templates/screenshots/`) と `templates/README.md` はコピー対象外。デザイン切り替えは `cp templates/light.html slides.html` で。

## ディレクトリ構成

```
slides-template/
├── slides.html              # 本体。直接編集する
├── templates/               # 差し替え用デザイン一式
│   ├── README.md            # プレビュー + 説明
│   ├── dark.html
│   ├── light.html
│   ├── academic.html
│   ├── minimal.html
│   ├── terminal.html
│   └── screenshots/
├── figs/                    # 図を置く
│   └── sample.svg
├── scripts/
│   ├── export-pdf.mjs       # ローカル Chrome (CDP) で PDF 出力
│   ├── screenshot.sh        # テンプレートのプレビューを再生成
│   └── sync-templates.sh    # templates/dark.html の本文を全テンプレに伝搬
├── package.json             # dev / pdf スクリプト
├── README.md                # 英語版
└── README.ja.md             # 日本語版 (このファイル)
```

## 依存

- ランタイム依存ゼロ。`slides.html` 内から CDN で reveal.js@5.1.0 と KaTeX@0.16.11 を読み込んでいる。
- スクリプト実行には Node.js 18+。開発サーバ (`serve`) は npx 経由で取得。PDF 出力はローカルの Chrome を使い、npm パッケージは不要。
