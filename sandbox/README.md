# sandbox — 実験環境

「実装が DESIGN.md を守っているか、機械で判定できるか」を確かめるための素材です。

**解説と結果は [`docs/07-machine-verification.md`](../docs/07-machine-verification.md) にあります。** こちらは素材だけです。

```
DESIGN.md          視覚的に検証可能な Don't を5つ持つデザインシステム
base.css           DESIGN.md 準拠の実装（値は theme.vars.css の CSS 変数を参照）
theme.css          design.md export --format css-tailwind の生出力
theme.vars.css     上を :root に変換したもの（プレーン HTML 用）
variants/          同じ UI の3実装。A=準拠 / B=全違反 / C=V2,V4のみ
shots/             スクリーンショットと決定的チェッカの出力(probe.json)
```

判定器はリポジトリ直下の [`tools/`](../tools/) にあります。

```bash
PLAYWRIGHT_PKG=<playwright>/index.mjs node tools/shoot.mjs   # スクショ
PLAYWRIGHT_PKG=<playwright>/index.mjs node tools/probe.mjs   # 決定的チェッカ
```
