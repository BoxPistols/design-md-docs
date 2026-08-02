---
# ─────────────────────────────────────────────────────────────
# このテンプレートは「流派A（スキーマ型）」の出発点です。
# 散文だけで始めたい場合は frontmatter ごと削除してください（それも正当な DESIGN.md です）。
#   → docs/03-two-styles.md
#
# 【規約】値はすべて引用符で囲むこと。
#   YAML の素の数値（lineHeight: 1.5 / spacing: 8）は黙って捨てられます。
#   → docs/05-pitfalls.md §1
#
# 【規約】色は #RRGGBB で書くこと。
#   一部の関数記法は誤変換され、無効な CSS を出力します。
#   → docs/05-pitfalls.md §3
#
# 【規約】{参照} は components の中でだけ使うこと。
#   他のカテゴリでは、壊れた参照が無警告でトークンごと消えます。
#   → docs/05-pitfalls.md §2
# ─────────────────────────────────────────────────────────────

version: "alpha"
name: "<プロダクト名>"
description: "<一行で。何のためのデザインシステムか>"

colors:
  primary: "#1A1C1E"
  on-primary: "#FFFFFF"
  surface: "#F7F5F2"
  on-surface: "#1A1C1E"
  accent: "#B8422E"
  on-accent: "#FFFFFF"

typography:
  headline-lg:
    fontFamily: "Public Sans"
    fontSize: "48px"
    fontWeight: "600"
    lineHeight: "1.1"
    letterSpacing: "-0.02em"
  body-md:
    fontFamily: "Public Sans"
    fontSize: "16px"
    fontWeight: "400"
    lineHeight: "1.6"
  label-sm:
    fontFamily: "Public Sans"
    fontSize: "12px"
    fontWeight: "500"
    lineHeight: "1"
    letterSpacing: "0.08em"

rounded:
  sm: "4px"
  md: "8px"
  full: "9999px"

spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "32px"

components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.label-sm}"
    rounded: "{rounded.sm}"
    padding: "12px"
  button-primary-hover:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.md}"
    padding: "{spacing.lg}"
---

# <プロダクト名> DESIGN.md

<!--
  以下、セクションは仕様の正準順です。省略できますが、順序は変えないでください。
  Responsive Behavior / Iteration Guide / Known Gaps は仕様外ですが、
  実物の過半数が使っている実務セクションです（→ docs/03-two-styles.md）。
-->

## Overview

<!--
  ★ここが最重要。形容詞を並べず、具体的な参照を1つ置いてください。
  「モダンでクリーン」は何も制約しません。
  「1970年代の大学講義ハンドアウト」「空港の発着案内板」のような
  具体物を指すと、そこから制約が自動的に導かれます。
  → docs/04-writing-guide.md 原則1
-->

<具体的な参照を1〜2文で。例: 高級マット紙の質感 — 上質なブロードシート紙か、現代的なギャラリーの図録。>

<対象読者と、開始5秒で伝わるべき印象を1〜2文で。>

## Colors

<!-- 各色について「何であるか / どこに使うか / どこに使わないか」の3点を書く -->

<パレット全体の方針を1文で。例: 高コントラストのニュートラルと、単一のアクセント。>

- **Primary** {colors.primary} — <役割>。<使わない場所>。
- **Surface** {colors.surface} — <役割>。<使わない場所>。
- **Accent** {colors.accent} — <役割>。**<使ってはいけない場所を明示>**。

## Typography

<書体選択の理由を1〜2文で。「読みやすいから」ではなく、その書体が運ぶ性格を書く。>

- **Headline** {typography.headline-lg} — <役割と、その大きさである理由>。
- **Body** {typography.body-md} — <役割>。
- **Label** {typography.label-sm} — <役割>。<大文字化・字間などの規則>。

## Layout

<グリッドモデルと、余白のリズムの根拠。「8pxグリッド」とだけ書かない。>

## Elevation & Depth

<!--
  影を使わないフラットデザインでも空欄にしないこと。
  仕様は「階層を伝える代替手段（境界線・コントラスト）を説明せよ」と求めています。
-->

<階層をどう表現するか。影を使わないなら、その代替手段を書く。>

## Shapes

<形状言語と、その一貫性の根拠。角丸の数値だけでなく「なぜその半径か」。>

## Components

<コンポーネント全体に共通する方針。状態（hover/active）の意図。>

## Do's and Don'ts

<!--
  ★Don't が長大になったら、それは Overview が曖昧なサインです。
  参照から自動的に導けるもの（「ハンドアウトはグローを使わない」等）は書かなくてよい。
  ここには「参照から導けない、このプロダクト固有の判断」だけを書く。
  それぞれに理由か代替手段を添えること。
  → docs/04-writing-guide.md 原則2
-->

- **Do** <すべきこと>。<理由>。
- **Don't** <してはいけないこと>。<理由、または代わりにすべきこと>。

## Responsive Behavior

<!-- 仕様外だが実物の80%が使用。ブレークポイントと、各幅での振る舞い。 -->

- **< 640px** — <振る舞い>
- **640–1024px** — <振る舞い>
- **> 1024px** — <振る舞い。最大幅を持つならその値と理由>

## Iteration Guide

<!--
  仕様外だが実物の78%が使用。
  「この方向に調整したいとき、どこを見て、どう指示するか」を先に書いておく。
  エージェントへの修正依頼が毎回ゼロから始まるのを防げます。
-->

- **もっと落ち着かせたい** → <どのトークン/記述を動かすか>
- **もっと目立たせたい** → <同上>
- **密度を上げたい** → <同上>

## Known Gaps

<!--
  仕様外だが実物の67%が使用。
  「未定義」と「意図的に持たない」を区別して書くこと。
  未定義領域を宣言しないと、エージェントが毎回違うやり方で勝手に埋めます。
-->

- **<領域>**: 未定義。エージェントは<何から推測してよいか>。決定したら<どのセクション>へ移す。
- **<領域>**: 意図的に持たない。<理由>。
