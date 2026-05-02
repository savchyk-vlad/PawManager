#!/usr/bin/env python3
"""See header in previous version — converts last module-level StyleSheet.create using colors."""

import re
import sys
from pathlib import Path


def find_matching_brace(s: str, open_idx: int) -> int:
    depth = 0
    for i in range(open_idx, len(s)):
        if s[i] == "{":
            depth += 1
        elif s[i] == "}":
            depth -= 1
            if depth == 0:
                return i
    raise ValueError("unbalanced braces")


def theme_import_path(file: Path) -> str:
    src_root = Path.cwd() / "src"
    rel = file.parent.relative_to(src_root)
    ups = len(rel.parts)
    return "/".join([".."] * ups) + "/theme"


def to_pascal(stem: str) -> str:
    return "".join(w.capitalize() for w in stem.replace(".", "_").split("_"))


def ensure_use_memo_import(src: str) -> str:
    m = re.search(r'^import React from ("react");', src, re.M)
    if m:
        return src.replace(m.group(0), f"import React, {{ useMemo }} from {m.group(1)};", 1)
    m2 = re.search(r'^import React, \{([^}]*)\} from ("react");', src, re.M)
    if m2:
        inner = m2.group(1).strip()
        if "useMemo" in inner:
            return src
        inner_new = f"{inner}, useMemo" if inner else "useMemo"
        return src.replace(
            m2.group(0),
            f"import React, {{{inner_new}}} from {m2.group(2)};",
            1,
        )
    return src


def merge_theme_colors_import(src: str, themep: str) -> str:
    """Add type ThemeColors to existing ../theme import if possible."""
    pat = re.compile(
        rf'^import\s+\{{\s*([^}}]*)\s*\}}\s+from\s+["\']({re.escape(themep)})["\'];',
        re.M,
    )
    m = pat.search(src)
    if not m:
        line = f'import type {{ ThemeColors }} from "{themep}";\n'
        lines = src.splitlines(keepends=True)
        insert_at = 0
        for i, line in enumerate(lines):
            if line.startswith("import "):
                insert_at = i + 1
        lines.insert(insert_at, line)
        return "".join(lines)
    inner = m.group(1)
    if "ThemeColors" in inner:
        return src
    inner_new = inner.strip()
    if inner_new:
        inner_new += ", type ThemeColors"
    else:
        inner_new = "type ThemeColors"
    new_imp = f'import {{ {inner_new} }} from "{themep}";'
    return pat.sub(new_imp, src, count=1)


def main():
    root = Path.cwd()
    path = root / sys.argv[1]
    src = path.read_text(encoding="utf8")

    if "useThemeColors()" not in src:
        print(f"skip {path}: no useThemeColors")
        return

    last_m = None
    for last_m in re.finditer(r"\n(const (\w+) = StyleSheet\.create\(\{)", src):
        pass
    if not last_m:
        print(f"skip {path}: no StyleSheet.create")
        return

    style_var = last_m.group(2)
    start_decl = last_m.start() + 1
    obj_open = src.index("{", last_m.start())
    obj_close = find_matching_brace(src, obj_open)
    stmt_end = obj_close + 1
    while stmt_end < len(src) and src[stmt_end] in " \t":
        stmt_end += 1
    if stmt_end >= len(src) or src[stmt_end] != ")":
        print(f"skip {path}: parse error after object")
        return
    stmt_end = src.index(";", stmt_end) + 1

    inner_obj = src[obj_open : obj_close + 1]

    hook = "const colors = useThemeColors();"
    hi = src.find(hook)
    if hi == -1:
        print(f"skip {path}: no colors hook")
        return

    themep = theme_import_path(path)
    factory = f"create{to_pascal(path.stem)}Styles"

    new_src = src[:start_decl] + src[stmt_end:]
    new_src = (
        new_src[: hi + len(hook)]
        + f"\n  const {style_var} = useMemo(() => {factory}(colors), [colors]);"
        + new_src[hi + len(hook) :]
    )

    new_src = new_src.rstrip() + "\n\n"
    new_src += (
        f"function {factory}(colors: ThemeColors) {{\n"
        f"  return StyleSheet.create({inner_obj});\n"
        f"}}\n"
    )

    new_src = merge_theme_colors_import(new_src, themep)
    new_src = ensure_use_memo_import(new_src)

    path.write_text(new_src, encoding="utf8")
    print(f"ok {path}")


if __name__ == "__main__":
    main()
