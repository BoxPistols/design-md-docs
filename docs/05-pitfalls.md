# 落とし穴

> 検証日: 2026-08 / 検証対象: **npm で公開されている `@google/design.md@0.4.0`**（ソースではなく配布物）
> すべて `npx -y @google/design.md@0.4.0` で再現しました。コマンドはそのままコピーして実行できます。

**仕様書どおりに書いたのに動かない箇所**があります。しかもその多くが**警告なし・終了コード0**で失敗するため、CI を通しても気づけません。

フォーマットは `alpha` 段階なので、これらは今後修正される可能性があります。**検証日時点の事実**として読んでください。

---

## 一覧

| # | 症状 | 検知 | 深刻度 |
|:--|:--|:--|:--|
| [1](#1) | YAML の**素の数値**（`lineHeight: 1.5` / `spacing: 8`）が黙って消える | ❌ 無警告 | 高 |
| [2](#2) | `components` **以外**の壊れた参照が無警告で消える | ❌ 無警告 | 高 |
| [3](#3) | 一部の色記法が誤変換され、**無効な CSS を出力**する | ❌ 無警告 | 高 |
| [4](#4) | 仕様が「エラー」と定める**重複セクション見出し**が素通り | ❌ 無警告 | 中 |
| [5](#5) | 単位バリデーションがカテゴリ間で不整合 | ⚠️ 一部 | 中 |
| [6](#6) | `-`（stdin）がどのコマンドでも動かない | ✅ エラー | 中 |
| [7](#7) | 細かいもの（`--format text`、`rule` フィールド欠落） | — | 低 |

---

<a id="1"></a>
## 1. YAML の素の数値が黙って消える

### 症状

仕様書は `lineHeight` を「**Dimension または単位なし数値**」と規定し（`docs/spec.md:78`）、**仕様書自身のサンプルが `lineHeight: 1.1` を使っています**（`docs/spec.md:34, 201, 207, 212`）。

しかし YAML の**数値として**書くと、値は捨てられます。**文字列として引用符で囲めば通ります。**

`spacing` も同じです。仕様は `<Dimension | number>` と規定していますが（`docs/spec.md:55, 240`）、数値は消えます。

### 再現

```yaml
typography:
  body:
    fontSize: 1rem
    lineHeight: 1.5      # 数値
  body2:
    fontSize: 1rem
    lineHeight: "1.5"    # 文字列
spacing:
  sm: 8                  # 数値
  md: 16px               # 文字列
```

```console
$ npx -y @google/design.md@0.4.0 export --format css-tailwind P.md
@theme {
  --text-body: 1rem;
  --text-body2: 1rem;
  --leading-body2: 1.5;      ← body2 だけ。body の lineHeight は消えた
  --spacing-md: 16px;        ← md だけ。sm は消えた
}

$ npx -y @google/design.md@0.4.0 lint P.md
  ... summary: { errors: 0, warnings: 0 }     ← 何も言わない
```

`token-summary` は「1 spacing token」と報告します。**消えた後の数を数えるので、失われたことに気づく手段がありません。**

### 回避策

**数値になりうる値は、すべて引用符で囲む。**

```yaml
lineHeight: "1.5"     # ✅
spacing:
  sm: "8px"           # ✅ 単位も付ける
```

チーム規約として「frontmatter の値は原則すべてクォートする」と決めてしまうのが安全です。[テンプレート](../templates/DESIGN.md)はその方針で書いてあります。

---

<a id="2"></a>
## 2. `components` 以外の壊れた参照が無警告で消える

### 症状

`lint` の `broken-ref` ルールは「解決しないトークン参照は **error**」と説明されています。しかし**実際に検査されるのは `components` セクションだけ**です。

`colors` `typography` `rounded` `spacing` に壊れた参照を書くと、**警告なしでそのトークンごと消えます**。

### 再現

```yaml
colors:
  primary: "#1A1C1E"
  accent: "{colors.nope}"    # 存在しないトークンへの参照
```

```console
$ npx -y @google/design.md@0.4.0 lint P.md
  info | token-summary | Design system defines 3 colors, ...
  summary: { errors: 0, warnings: 0 }        ← 無警告・exit 0

$ npx -y @google/design.md@0.4.0 export --format css-tailwind P.md
@theme {
  --color-primary: #1a1c1e;                  ← accent が丸ごと消えている
}
```

### 回避策

- **参照は `components` の中でだけ使う。** それ以外のカテゴリではリテラル値を書く
- どうしてもカテゴリ間で参照したい場合は、**export 結果を目視するか diff で確認する**

```bash
# 変更前後で消えたトークンが無いか確認
npx -y @google/design.md@0.4.0 diff before.md after.md
```

`diff` は `removed` にトークン名を出すので、意図しない消失はここで拾えます。CI に入れておくと安全です。

---

<a id="3"></a>
## 3. 一部の色記法が誤変換され、無効な CSS を出力する

### 症状

仕様は `hsl()` `oklch()` などを正式にサポートすると書いています（`docs/spec.md:63-69`）。しかし一部の記法で、**まったく違う色に変換される**、あるいは**構文的に無効な CSS が出力されます**。

### 再現

```yaml
colors:
  bad-hsl: "hsl(120, 100, 50)"        # レガシー記法（S/L に % が無い）
  bad-alpha: "hsl(120 100% 50% / -1)" # アルファが負
```

```console
$ npx -y @google/design.md@0.4.0 export --format css-tailwind P.md
@theme {
  --color-bad-hsl: #ff00ff;      ← 色相120（緑）のはずがマゼンタ
  --color-bad-alpha: #00ff00-ff; ← CSS として構文エラー
}

$ npx -y @google/design.md@0.4.0 lint P.md
  summary: { errors: 0, warnings: 0 }        ← 無警告
```

`#00ff00-ff` はテーマファイルに混入すると、その宣言が丸ごと無効になります。ビルドは通り、実行時に色が当たらない、という壊れ方をします。

### 回避策

- **色は `#RRGGBB` で書く。** 仕様自身も「ツール互換性が最も広い」として hex を推奨しています（`docs/spec.md:73`）
- 関数記法を使う場合は、`%` を省略しない・アルファを `0`〜`1` に収める
- **`export` の出力を一度目視する。** 特に CSS 出力は `-` や不正な文字が混ざっていないか確認する

```bash
# 出力に不正なトークンが無いか簡易チェック
npx -y @google/design.md@0.4.0 export --format css-tailwind DESIGN.md | grep -nE '#[0-9a-fA-F]{6}[^;)\s]'
```

---

<a id="4"></a>
## 4. 重複セクション見出しが素通りする

### 症状

仕様は明確に規定しています（`docs/spec.md:377`）:

| ケース | 規定 |
|:--|:--|
| 重複するセクション見出し | **エラー。ファイルを拒否** |

実装されていません。

### 再現

```md
## Colors

one

## Colors

duplicate
```

```console
$ npx -y @google/design.md@0.4.0 lint Q.md
  ... 重複についての指摘は1件も出ない
```

（同じファイルで、順序違反の `section-order` warning はきちんと出ます。重複だけが見られていません。）

### なぜ困るか

セクションが重複していると、**後から書いた方が読まれるのか、両方読まれるのか、仕様上どちらか不明**です。マージ時のコンフリクト解決ミスで重複が生まれても、CI は緑のまま通ります。

### 回避策

自前でチェックを足すのが確実です。

```bash
# 重複した ## 見出しを検出（コードフェンス内は考慮しない簡易版）
grep -E '^## ' DESIGN.md | sort | uniq -d
```

---

<a id="5"></a>
## 5. 単位バリデーションがカテゴリ間で不整合

### 症状

仕様は Dimension の有効単位を `px` `em` `rem` の3つに限定しています（`docs/spec.md:85`）。しかし扱いがカテゴリごとに違います。

| 書いたもの | lint | export |
|:--|:--|:--|
| `rounded: { bad: 10vh }` | ✅ **error** を出す | ⚠️ **それでも出力する** |
| `spacing: { pct: 50% }` | ❌ 何も言わない | 出力する |
| `components: { btn: { padding: 0 24px } }` | ❌ 何も言わない | （components は対象外） |

### 再現

```console
$ npx -y @google/design.md@0.4.0 lint Q.md
  error | '10vh' has an invalid unit 'vh'. Only px, rem, and em are allowed.
  ... spacing の 50% については何も言わない

$ npx -y @google/design.md@0.4.0 export --format css-tailwind Q.md
@theme {
  --radius-bad: 10vh;      ← error を出したのに出力される
  --spacing-pct: 50%;      ← 無検査で通過
}
```

`export` は「lint の findings に関わらず終了コード0で成功する」設計です（gate したいなら `lint` を別に走らせよ、というのが仕様の立場）。ただし **error を検出した値をそのまま出力する**のは直感に反するので、注意が必要です。

### 回避策

- **CI では `lint` と `export` を必ず両方走らせ、`lint` を gate にする**
- 単位は `px` `em` `rem` に統一する。`%` `vh` `vw` は使わない

---

<a id="6"></a>
## 6. `-`（stdin）がどのコマンドでも動かない

### 症状

README には「すべてのコマンドはファイルパスまたは `-`（stdin）を受け付ける」と書かれ、使用例も載っています。動きません。`lint` `diff` `export` の3つとも同じです。

### 再現

```console
$ cat DESIGN.md | npx -y @google/design.md@0.4.0 lint -
 ERROR  Missing required positional argument: FILE
$ echo $?
1
```

ヘルプ自身が `FILE   Path to DESIGN.md (use "-" for stdin)` と表示するのに、その `-` で落ちます。

### 回避策

**`--` を挟むと今でも動きます。**

```bash
cat DESIGN.md | npx -y @google/design.md@0.4.0 lint -- -     # ✅
```

あるいは一時ファイルを経由してください。

```bash
some-generator > /tmp/DESIGN.md && npx -y @google/design.md@0.4.0 lint /tmp/DESIGN.md
```

---

<a id="7"></a>
## 7. 細かいもの

### `--format text` は存在しない

`lint --help` は `Output format: json or text` と表示しますが、`text` を渡しても **JSON が出ます**。実際に分岐するのは `markdown` と `md` だけです。

```bash
npx -y @google/design.md@0.4.0 lint --format markdown DESIGN.md   # ✅ Markdown で出る
npx -y @google/design.md@0.4.0 lint --format text DESIGN.md       # JSON が出る
```

### 一部の finding に `rule` フィールドが無い

findings の多くは `"rule": "section-order"` のようにルール名を持ちますが、**モデル構築段階で出るエラー（単位違反など）は `rule` を持ちません**。

```json
{ "severity": "error", "message": "'10vh' has an invalid unit 'vh'. ..." }
```

`findings` を `rule` でグルーピングするツールを書くときは、**未定義を考慮してください**。

---

## CI に入れておくとよいチェック

上記を踏まえた最小構成です。[`.github/workflows/lint.yml`](../.github/workflows/lint.yml) に実装してあります。

```bash
set -euo pipefail

# 1. 構造検証（error があれば exit 1）
npx -y @google/design.md@0.4.0 lint DESIGN.md

# 2. 重複見出し（仕様上はエラーだが実装されていない → §4）
if grep -E '^## ' DESIGN.md | sort | uniq -d | grep -q .; then
  echo "重複したセクション見出しがあります"; exit 1
fi

# 3. export が壊れた CSS を吐いていないか（→ §3）
npx -y @google/design.md@0.4.0 export --format css-tailwind DESIGN.md > /tmp/theme.css
if grep -nE '#[0-9a-fA-F]{6}[^;)[:space:]]' /tmp/theme.css; then
  echo "不正な色の出力があります"; exit 1
fi
```

`lint` は「トークンが消えたこと」を教えてくれません。**消失の検出は `diff` の役目**なので、変更 PR では前後比較も併せて走らせるのが確実です。

---

## 報告について

ここに挙げた項目は本家に未報告のものを含みます。Issue を立てる場合は、このページの再現手順をそのまま使ってもらって構いません。修正が入ったら、このページを更新して**検証日とバージョンを書き換えてください**。

---

戻る: [README](../README.md)
