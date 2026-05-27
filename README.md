# slides-template

Reveal.js ベースのプレゼンテーション・テンプレート。単一HTMLで動作し、ダークテーマ・KaTeX 数式・スピーカーノート・hjkl ナビゲーション・PDF エクスポートを備える。

## クイックスタート

このリポジトリを "Use this template" で複製、もしくは clone してから:

```bash
npm run dev    # http://localhost:8000/slides.html を開く
```

スライドは `slides.html` を直接編集する。図は `figs/` に置き、`<img src="figs/foo.png">` で参照する。

## キーボード

| キー | 動作 |
|---|---|
| `←` `→` `↑` `↓` / `h` `j` `k` `l` | スライド移動 |
| `s` | スピーカーノート・ウィンドウを開く |
| `f` | フルスクリーン |
| `esc` | 全スライド一覧 |

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
npm run pdf    # slides.pdf を出力
# 別ファイル名にしたい場合
bash scripts/export-pdf.sh out.pdf
```

裏で `npx serve` を一時的に立ち上げて `decktape` で印刷する。Node.js と Chromium 系ブラウザの実行環境が必要 (decktape が自動取得)。

ブラウザ側で出したい場合は、URL の末尾に `?print-pdf` を付けてブラウザの印刷ダイアログから "PDF として保存" する手もある (Chrome 推奨)。

## ディレクトリ構成

```
slides-template/
├── slides.html              # 本体。直接編集する
├── figs/                    # 図を置く
│   └── sample.svg
├── scripts/
│   └── export-pdf.sh
├── package.json             # dev / pdf スクリプト
└── README.md
```

## 依存

- ランタイム依存ゼロ。`slides.html` 内から CDN で reveal.js@5.1.0 と KaTeX@0.16.11 を読み込んでいる。
- スクリプト実行には Node.js (npx 経由で `serve` と `decktape` を取得)。
