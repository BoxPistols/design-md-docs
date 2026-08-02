#!/usr/bin/env python3
"""実在する DESIGN.md を機械的に測定する。

docs/03-two-styles.md の統計はこのスクリプトの出力です。誰でも再現できます。

    git clone --depth 1 https://github.com/VoltAgent/awesome-design-md.git /tmp/awesome
    python3 tools/measure.py /tmp/awesome/design-md

引数を省略すると /tmp/awesome/design-md を見ます。

測っているもの:
  - frontmatter の有無（＝流派A / 流派B の判別）
  - トークン行数 と 散文行数 の比率（空行は除外）
  - セクション見出しの出現数と、正準8セクション外の見出し
"""

import collections
import glob
import os
import re
import statistics
import sys

# docs/spec.md が定める正準セクション（別名を含む・小文字で比較）
CANONICAL = {
    "overview", "brand & style",
    "colors",
    "typography",
    "layout", "layout & spacing",
    "elevation & depth", "elevation",
    "shapes",
    "components",
    "do's and don'ts",
}

FRONTMATTER = re.compile(r"^---\r?\n(.*?)\r?\n---\r?\n", re.S)
HEADING = re.compile(r"^## (.+)$", re.M)


def nonblank(text):
    return len([line for line in text.splitlines() if line.strip()])


def find_design_file(directory):
    """DESIGN.md を優先し、無ければ README 以外の .md を1つ返す。"""
    primary = os.path.join(directory, "DESIGN.md")
    if os.path.exists(primary):
        return primary
    others = [
        f for f in sorted(glob.glob(os.path.join(directory, "*.md")))
        if "README" not in os.path.basename(f).upper()
    ]
    return others[0] if others else None


def measure(base):
    records = []
    for name in sorted(os.listdir(base)):
        directory = os.path.join(base, name)
        if not os.path.isdir(directory):
            continue
        path = find_design_file(directory)
        if not path:
            continue

        text = open(path, encoding="utf-8").read()
        match = FRONTMATTER.match(text)
        front = match.group(1) if match else ""
        body = text[match.end():] if match else text

        token_lines = nonblank(front)
        prose_lines = nonblank(body)
        total = token_lines + prose_lines
        sections = [s.strip() for s in HEADING.findall(body)]

        records.append({
            "name": name,
            "has_frontmatter": bool(match),
            "token_lines": token_lines,
            "prose_lines": prose_lines,
            "token_pct": (token_lines / total * 100) if total else 0.0,
            "sections": sections,
        })
    return records


def report(records):
    styled = [r for r in records if r["has_frontmatter"]]
    prose_only = [r for r in records if not r["has_frontmatter"]]

    print(f"総数 {len(records)}  /  流派A(frontmatter有) {len(styled)}  /  流派B(散文のみ) {len(prose_only)}")
    print()

    if styled:
        pcts = [r["token_pct"] for r in styled]
        print("=== 流派A: トークン比率 ===")
        print(f"  中央値 {statistics.median(pcts):.1f}%   平均 {statistics.mean(pcts):.1f}%"
              f"   範囲 {min(pcts):.1f}% 〜 {max(pcts):.1f}%")
        print(f"  トークン行数 中央値 {statistics.median([r['token_lines'] for r in styled]):.0f}"
              f"  /  散文行数 中央値 {statistics.median([r['prose_lines'] for r in styled]):.0f}")
        print()

        buckets = collections.Counter()
        for r in styled:
            p = r["token_pct"]
            key = "0-25%" if p < 25 else "25-50%" if p < 50 else "50-75%" if p < 75 else "75-100%"
            buckets[key] += 1
        print("  分布:")
        for key in ("0-25%", "25-50%", "50-75%", "75-100%"):
            print(f"    {key:8} {buckets[key]:3}件  {'#' * buckets[key]}")
        print()

        ranked = sorted(styled, key=lambda r: r["token_pct"])
        print("  散文が厚い上位5:")
        for r in ranked[:5]:
            print(f"    {r['name']:22} token{r['token_lines']:4} / prose{r['prose_lines']:4}  = {r['token_pct']:5.1f}%")
        print("  トークンが厚い上位5:")
        for r in ranked[-5:]:
            print(f"    {r['name']:22} token{r['token_lines']:4} / prose{r['prose_lines']:4}  = {r['token_pct']:5.1f}%")
        print()

    if prose_only:
        print("=== 流派B: frontmatter を持たない DESIGN.md ===")
        for r in prose_only:
            print(f"  {r['name']:22} {r['prose_lines']:4}行  sections={len(r['sections'])}")
        print()

    extra = collections.Counter()
    for r in records:
        for s in r["sections"]:
            if s.lower() not in CANONICAL:
                extra[s] += 1
    print("=== 正準8セクション外の見出し（上位12） ===")
    for section, count in extra.most_common(12):
        print(f"  {count:3}件  {section}")


def main():
    base = sys.argv[1] if len(sys.argv) > 1 else "/tmp/awesome/design-md"
    if not os.path.isdir(base):
        sys.exit(f"ディレクトリが見つかりません: {base}\n{__doc__}")
    report(measure(base))


if __name__ == "__main__":
    main()
