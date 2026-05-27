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
- PDF エクスポート用に Chromium 系ブラウザ。`decktape` が Puppeteer 経由で自前のものを初回に取得するので、別途インストールは通常不要。

`npm install` は不要 — このリポジトリはプロジェクト依存ゼロ。`serve` (開発サーバ) と `decktape` (PDF) は `npx -y` で都度取得する。

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
# 別ターミナルで:
npm run pdf        # slides.pdf を出力
```

初回の `npm run pdf` は遅い — `npx` が `decktape` と Puppeteer 用の Chromium (約 150 MB) を取得してキャッシュするため。2 回目以降はキャッシュを使う。

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
npm run pdf                                   # slides.pdf を JA で出力
bash scripts/export-pdf.sh out.pdf            # ファイル名を変更
bash scripts/export-pdf.sh slides-en.pdf en   # 英語版を出力
```

内部で `npx serve` を一時的に立ち上げ、`decktape` で `slides.html?lang=<ja|en>` を印刷する。Node.js と Chromium 系ブラウザの実行環境が必要 (decktape が自動取得)。

ブラウザ側で出したい場合は、URL の末尾に `?print-pdf` を付けてブラウザの印刷ダイアログから "PDF として保存" する手もある (Chrome 推奨)。英語版を出すなら `?lang=en&print-pdf` の組み合わせで。

## デザインテンプレート

`templates/` 配下に差し替え用のデザイン違い (dark / light / academic / minimal) を用意している。気に入ったものを `slides.html` に上書きコピーして使う:

```bash
cp templates/academic.html slides.html
```

各テーマのプレビューと説明は [templates/README.md](templates/README.md) を参照。

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
│   └── screenshots/
├── figs/                    # 図を置く
│   └── sample.svg
├── scripts/
│   ├── export-pdf.sh
│   └── screenshot.sh        # テンプレートのプレビューを再生成
├── package.json             # dev / pdf スクリプト
├── README.md                # 英語版
└── README.ja.md             # 日本語版 (このファイル)
```

## 依存

- ランタイム依存ゼロ。`slides.html` 内から CDN で reveal.js@5.1.0 と KaTeX@0.16.11 を読み込んでいる。
- スクリプト実行には Node.js (npx 経由で `serve` と `decktape` を取得)。
