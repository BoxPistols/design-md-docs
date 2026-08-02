# 構造リファレンス

> 検証時点: フォーマット `alpha` / CLI `@google/design.md` v0.4.0（2026-08）
> 出典は本家リポジトリの `docs/spec.md`。行番号は同ファイルのもの。

書きながら引く辞書として使ってください。**仕様どおりに書いても動かない箇所**は [落とし穴](05-pitfalls.md) にまとめてあります。

---

## 全体構造

DESIGN.md は2層です。

```md
---                          ← YAML frontmatter：機械可読なトークン
name: Heritage                  「規範的な値」
colors: …
typography: …
---

## Overview                  ← Markdown 本文：人間可読な根拠
                                「なぜその値なのか、どう使うのか」
## Colors
## Typography
…
```

frontmatter は**任意**です。トークンを1つも書かず、散文だけの DESIGN.md も成立します（→ [2つの流派](03-two-styles.md)）。

frontmatter ブロックは、**ちょうど `---` だけの行**で始まり、**ちょうど `---` だけの行**で終わる必要があります。

---

## frontmatter スキーマ

```yaml
version: <string>          # 任意。現在は "alpha"
name: <string>
description: <string>      # 任意
omitted: <string[] | OmittedSection[]>   # 任意
colors:
  <token-name>: <Color>
typography:
  <token-name>: <Typography>
rounded:
  <scale-level>: <Dimension>
spacing:
  <scale-level>: <Dimension | number>
components:
  <component-name>:
    <token-name>: <string | token reference>
```

`<scale-level>` は任意の文字列キーです。`xs` `sm` `md` `lg` `xl` `full` が慣用ですが、`gutter` `margin` のような記述的な名前も有効です。

**スキーマ外のトップレベルキーも書けます。** `motion:` `iconography:` など、必要なカテゴリを自由に足せる設計です（`PHILOSOPHY.md:88`）。ただしリンタは未知キーに対して2種類の警告を出すことがあります（[落とし穴 §6](05-pitfalls.md)）。

---

## 型

### Color

**任意の有効な CSS 色文字列**が使えます。

| 分類 | 例 |
|:--|:--|
| Hex | `#RGB` `#RGBA` `#RRGGBB` `#RRGGBBAA` |
| 名前付き | `red` `cornflowerblue` `transparent` |
| 関数 | `rgb()` `rgba()` `hsl()` `hsla()` `hwb()` |
| 広色域 | `oklch()` `oklab()` `lch()` `lab()` |
| 混色 | `color-mix(in srgb, ...)` |

WCAG コントラスト計算のため内部的に sRGB へ変換されますが、**元の表記は保持**され、そのまま出力されます。

仕様の推奨デフォルトは `#RRGGBB`（`docs/spec.md:73`）。ツールの互換性が最も広いためです。

> ⚠️ 一部の関数記法で**誤った色に変換されるバグ**があります。→ [落とし穴 §3](05-pitfalls.md)

### Dimension

**単位付きの文字列。有効な単位は `px` `em` `rem` の3つだけ**（`docs/spec.md:85`）。

```yaml
fontSize: 48px
letterSpacing: -0.02em
rounded:
  sm: 0.25rem
```

`%` `vh` `vw` `ch` などは仕様外です。

> ⚠️ 単位違反の扱いはカテゴリごとに一貫していません。→ [落とし穴 §5](05-pitfalls.md)

### Typography

7つのプロパティを持つオブジェクトです。

| プロパティ | 型 | 備考 |
|:--|:--|:--|
| `fontFamily` | string | |
| `fontSize` | Dimension | |
| `fontWeight` | number | 素の数値でも引用符付き文字列でもよい（等価） |
| `lineHeight` | Dimension \| number | **単位なし数値は fontSize の倍率**。CSS のベストプラクティス |
| `letterSpacing` | Dimension | |
| `fontFeature` | string | `font-feature-settings` を設定 |
| `fontVariation` | string | `font-variation-settings` を設定 |

```yaml
typography:
  h1:
    fontFamily: Public Sans
    fontSize: 48px
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: -0.02em
```

> ⚠️ **`lineHeight: 1.1` は仕様上正しいのに、実装では黙って捨てられます。** 文字列で `"1.1"` と書けば通ります。→ [落とし穴 §1](05-pitfalls.md)

### Token Reference

波括弧で包み、YAML ツリー内の別の値へのパスを書きます。

```yaml
components:
  button-primary:
    backgroundColor: "{colors.tertiary}"
    rounded: "{rounded.sm}"
```

ルールが2つあります。

- 通常のトークングループでは、**プリミティブ値**を指す必要があります（`{colors.primary-60}` は可、`{colors}` は不可）
- **`components` 内に限り、複合値も参照できます**（`{typography.label-md}` のようにオブジェクト全体を指せる）

> ⚠️ **壊れた参照が検出されるのは `components` の中だけです。** `colors` などで壊れた参照を書くと、警告ゼロ・終了コード0のまま、そのトークンが消えます。→ [落とし穴 §2](05-pitfalls.md)

---

## components

コンポーネント名から、サブトークンの集合へのマップです。

```yaml
components:
  button-primary:
    backgroundColor: "{colors.tertiary}"
    textColor: "{colors.on-tertiary}"
    rounded: "{rounded.sm}"
    padding: 12px
  button-primary-hover:
    backgroundColor: "{colors.tertiary-container}"
```

### 有効なサブトークン（8種）

`backgroundColor` `textColor` `typography` `rounded` `padding` `size` `height` `width`

これ以外のプロパティ名を書くと **warning** が出ます（拒否はされません）。

### バリアントは入れ子にしない

hover / active / pressed といった状態は、**関連する別キー**として並べます。

```yaml
components:
  button-primary:            # ベース
  button-primary-hover:      # 状態
  button-primary-active:     # 状態
```

エージェントは全バリアントを見て、適切なスタイリングを判断します。

---

## omitted

意図的に省略したセクションを宣言し、「無い」ことに対するリンタ警告を抑制します。

```yaml
omitted:
  - spacing
  - section: rounded
    reason: "ブランドブックに角丸の定義が無いため"
```

文字列だけでも、`{ section, reason }` オブジェクトでも書けます。**理由を書けるのが重要**で、「まだ決めていない」と「意図的に持たない」を区別できます。チーム運用では `reason` を必須にすることを勧めます。

---

## セクション

すべて `##`（h2）見出しです。文書タイトル用の `#`（h1）を置くことはできますが、セクションとしては解釈されません。

**セクションは省略できますが、書く場合はこの順序で並べる必要があります。**

| # | セクション | 別名 | 内容 |
|:--|:--|:--|:--|
| 1 | Overview | Brand & Style | ブランド人格・対象読者・喚起したい感情。**エージェントの高レベル判断の土台** |
| 2 | Colors | | パレットと役割 |
| 3 | Typography | | タイポグラフィのレベルと役割 |
| 4 | Layout | Layout & Spacing | レイアウトモデルと余白戦略 |
| 5 | Elevation & Depth | Elevation | 階層の表現方法。フラットならその代替手段 |
| 6 | Shapes | | 形状言語 |
| 7 | Components | | コンポーネント単位のスタイル指針 |
| 8 | Do's and Don'ts | | ガードレール |

順序を外すと `section-order` の **warning** が出ます（エラーではない）。

### 未知のセクションは足してよい

仕様外の見出しを書いても、リンタは**保持し、エラーにしません**。実際、実物の過半数が仕様外セクションを使っています（→ [2つの流派](03-two-styles.md)）。

---

## 未知コンテンツの扱い（仕様の規定）

`docs/spec.md:366-377` の表です。

| ケース | 規定された挙動 | 例 |
|:--|:--|:--|
| 未知のセクション見出し | 保持。エラーにしない | `## Iconography` |
| 未知の色トークン名 | 値が有効なら受理 | `surface-container-high` |
| 未知のタイポグラフィ名 | タイポグラフィとして受理 | `telemetry-data` |
| 未知の spacing 値 | 受理。有効な Dimension でなければ文字列として保持 | `grid-columns: '5'` |
| 未知のコンポーネントプロパティ | 警告つきで受理 | `borderColor` |
| **重複するセクション見出し** | **エラー。ファイルを拒否** | `## Colors` が2つ |

> ⚠️ 最後の「重複見出しはエラー」は**実装されていません**。→ [落とし穴 §4](05-pitfalls.md)

---

## 推奨トークン名（非規範）

必須ではありませんが、揃えておくと相互運用しやすい名前です（`docs/spec.md:356-364`）。

- **Colors:** `primary` `secondary` `tertiary` `neutral` `surface` `on-surface` `error`
- **Typography:** `headline-display` `headline-lg` `headline-md` `body-lg` `body-md` `body-sm` `label-lg` `label-md` `label-sm`
- **Rounded:** `none` `sm` `md` `lg` `xl` `full`

`primary` が無いと warning が出ます（エージェントが勝手に生成してしまうため）。

---

次: [2つの流派と選び方](03-two-styles.md)
