/**
 * Replace `colors` import with `useThemeColors` and inject `const colors = useThemeColors();`
 * as the first statement in the first exported function component in each file.
 */
import fs from "fs";
import path from "path";

const SRC = path.join(process.cwd(), "src");

function walk(dir, acc = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory() && ent.name !== "node_modules") walk(p, acc);
    else if (/\.tsx$/.test(ent.name)) acc.push(p);
  }
  return acc;
}

function fixImports(s) {
  return s.replace(
    /import \{([^}]*)\} from (['"])([^'"]*theme)\2/g,
    (full, inner, q, themePath) => {
      if (!/\bcolors\b/.test(inner)) return full;
      const next = inner
        .replace(/\bcolors\b/g, "useThemeColors")
        .replace(/,\s*,/g, ",")
        .replace(/^\s*,/, "")
        .replace(/,\s*$/, "")
        .trim();
      return `import { ${next} } from ${q}${themePath}${q}`;
    }
  );
}

function injectHook(s) {
  if (!s.includes("useThemeColors")) return s;
  if (/\bconst colors = useThemeColors\(\)/.test(s)) return s;

  // Insert after first `export default function Name(...)` or `export function Name(...)` opening brace
  const re =
    /(export default function \w+\([^)]*\)\s*\{|export function \w+\([^)]*\)\s*\{)(\s*\n)/;
  const m = s.match(re);
  if (!m) return s;
  return s.replace(re, `$1$2  const colors = useThemeColors();\n`);
}

for (const file of walk(SRC)) {
  if (file.includes("navigation/index.tsx")) continue;
  if (/\.styles\.ts$/.test(file)) continue;
  if (file.endsWith("dogDetailUtils.ts")) continue;

  let s = fs.readFileSync(file, "utf8");
  if (!s.includes("colors") || !/from ['"][^'"]*theme['"]/.test(s)) continue;
  const before = s;
  s = fixImports(s);
  if (s.includes("useThemeColors")) {
    s = injectHook(s);
  }
  if (s !== before) {
    fs.writeFileSync(file, s);
    console.log(path.relative(process.cwd(), file));
  }
}
