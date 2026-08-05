---
version: "alpha"
name: "Catalogue"
description: "美術館の展示図録を参照した、静かで密度の高い情報提示のためのデザインシステム"

colors:
  ink: "#1E1A17"
  paper: "#F5F2EC"
  rule: "#C8C0B4"
  muted: "#6B635A"
  accent: "#9C3B26"
  on-accent: "#FFFFFF"

typography:
  title:
    fontFamily: "Georgia"
    fontSize: "28px"
    fontWeight: "600"
    lineHeight: "1.25"
    letterSpacing: "-0.01em"
  body:
    fontFamily: "Georgia"
    fontSize: "16px"
    fontWeight: "400"
    lineHeight: "1.7"
  meta:
    fontFamily: "Helvetica Neue"
    fontSize: "12px"
    fontWeight: "500"
    lineHeight: "1.4"
    letterSpacing: "0.08em"

rounded:
  none: "0px"
  sm: "3px"

spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "32px"

components:
  card:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "{spacing.lg}"
  card-title:
    textColor: "{colors.ink}"
    typography: "{typography.title}"
  card-meta:
    textColor: "{colors.muted}"
    typography: "{typography.meta}"
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.on-accent}"
    typography: "{typography.meta}"
    rounded: "{rounded.sm}"
    padding: "10px"
---

# Catalogue

## Overview

美術館の展示図録。壁に掛かった作品の隣に置かれた、上質な紙のキャプションカード。

読者は作品の前に立っていて、目線は作品にある。図録は主役ではない。仕事は「邪魔をせずに情報を渡すこと」であって、自らを見せることではない。装飾は情報の邪魔をしない範囲でのみ許される。

紙は温かく、インクは黒より柔らかい。階層は大きさの差ではなく、余白と細い罫線で作る。

## Colors

単一インク＋アクセント1色の体系。

- **Ink** {colors.ink} — すべての本文と見出し。純黒ではなく、わずかに温かい。印刷インクの記憶。
- **Paper** {colors.paper} — 紙面。純白ではない。照明の下で目が疲れない温度。
- **Rule** {colors.rule} — 罫線専用。文字には使わない。
- **Muted** {colors.muted} — メタデータ（制作年、素材、寸法）。本文より一段引く。
- **Accent** {colors.accent} — **唯一のアクセント**。インタラクション（ボタン、リンク）にのみ宿る。

## Typography

Georgia を本文と見出しに、Helvetica Neue をメタデータに。図録の慣習として、作品情報は本文と別の声で語られる。

- **Title** {typography.title} — 作品名。本文の約1.75倍。それ以上は大きくしない。
- **Body** {typography.body} — 解説文。長文を読ませる前提の行間。
- **Meta** {typography.meta} — 制作年・素材・寸法。字間を開けて小さく。

## Layout

8px の倍数で刻む。カード内部の余白は 32px を基準にし、詰めない。

余白は「埋め残し」ではなく設計である。カードの下三分の一が空いていても正しい。

## Elevation & Depth

**影を使わない。** 図録は紙であり、紙は浮かない。

階層は3つの手段で作る。(1) 1px の罫線 {colors.rule}、(2) 余白の差、(3) 文字色のコントラスト差（ink と muted）。

## Shapes

建築的な鋭さ。角丸は最大 3px。「四角い」と読めるぎりぎりまで残す。

## Components

- **Card** — 紙片1枚。背景は paper、境界は 1px の rule。
- **Button** — 唯一アクセント色が乗る場所。図録の中で最も目立ってよい要素。

## Do's and Don'ts

<!--
  この5項目は、実装のスクリーンショットから目視で判定できるように選んである。
  judge の検証実験（README 参照）はこの5項目に対する二値判定で行う。
-->

- **Don't** アクセント色 {colors.accent} を文字に使わない。見出しにも、本文にも、メタデータにも。**アクセントはインタラクション要素の背景にのみ宿る。** 外側での希少さが、内側での意味を作る。
- **Don't** Bold（font-weight 700 以上）を使わない。最大は 600。強調が要るなら大きさか余白で作る。
- **Don't** 角丸を 3px より大きくしない。丸みは「モダンに見える最小限」であって、やわらかさの表現ではない。
- **Don't** ドロップシャドウを使わない。紙は浮かない。階層は罫線・余白・文字色で作る。
- **Don't** グラデーションを使わない。すべての面は単色。図録に印刷できない表現は使わない。

- **Do** 余白を残す。カードが埋まっていなくてよい。
- **Do** 控えめなサイズ差を信頼する。見出しは本文の1.75倍であって、3倍ではない。

## Known Gaps

- **アイコン**: 未定義。エージェントは既存のストローク幅と角の処理から推測してよい。決定したら Shapes に移す。
- **ダークモード**: 意図的に持たない。図録は紙であり、紙に暗所モードは無い。
