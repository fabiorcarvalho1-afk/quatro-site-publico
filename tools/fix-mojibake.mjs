import fs from "node:fs";
import path from "node:path";

function count(haystack, needle) {
  if (!needle) return 0;
  let i = 0;
  let n = 0;
  while (true) {
    const j = haystack.indexOf(needle, i);
    if (j === -1) return n;
    n++;
    i = j + needle.length;
  }
}

function walkHtmlFiles(rootDir) {
  const out = [];
  const stack = [rootDir];
  while (stack.length) {
    const dir = stack.pop();
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        stack.push(full);
      } else if (ent.isFile() && ent.name.toLowerCase().endsWith(".html")) {
        out.push(full);
      }
    }
  }
  return out;
}

function fixMojibake(text) {
  // Common mojibake patterns seen in this project:
  // - double-encoded UTF-8: "prÃƒÂ¡tica"
  // - single-encoded UTF-8: "prÃ¡tica"
  // - stray "Â" (nbsp / encoding artifacts)
  const pairs = [
    // Double-encoded (ÃƒÂx)
    ["ÃƒÂ¡", "á"], ["ÃƒÂÁ", "Á"],
    ["ÃƒÂ¢", "â"], ["ÃƒÂÂ", "Â"],
    ["ÃƒÂ£", "ã"], ["ÃƒÂÃ", "Ã"],
    ["ÃƒÂ¤", "ä"], ["ÃƒÂÄ", "Ä"],
    ["ÃƒÂª", "ê"], ["ÃƒÂÊ", "Ê"],
    ["ÃƒÂ©", "é"], ["ÃƒÂÉ", "É"],
    ["ÃƒÂ¨", "è"], ["ÃƒÂÈ", "È"],
    ["ÃƒÂ­", "í"], ["ÃƒÂÍ", "Í"],
    ["ÃƒÂ³", "ó"], ["ÃƒÂÓ", "Ó"],
    ["ÃƒÂ´", "ô"], ["ÃƒÂÔ", "Ô"],
    ["ÃƒÂµ", "õ"], ["ÃƒÂÕ", "Õ"],
    ["ÃƒÂº", "ú"], ["ÃƒÂÚ", "Ú"],
    ["ÃƒÂ§", "ç"], ["ÃƒÂÇ", "Ç"],
    ["ÃƒÂ¹", "ù"], ["ÃƒÂÙ", "Ù"],
    ["ÃƒÂ±", "ñ"], ["ÃƒÂÑ", "Ñ"],
    ["ÃƒÂ°", "ð"], ["ÃƒÂÐ", "Ð"],
    ["ÃƒÂ¿", "ÿ"], ["ÃƒÂŸ", "ß"],
    ["ÃƒÂ ", "à"], ["ÃƒÂÀ", "À"],
    ["Ãƒ ", "à"], ["ÃƒÀ", "À"],

    // Single-encoded (Ãx)
    ["Ã¡", "á"], ["ÃÁ", "Á"],
    ["Ã¢", "â"], ["ÃÂ", "Â"],
    ["Ã£", "ã"], ["ÃÃ", "Ã"],
    ["Ã¤", "ä"], ["Ã„", "Ä"],
    ["Ãª", "ê"], ["ÃŠ", "Ê"],
    ["Ã©", "é"], ["Ã‰", "É"],
    ["Ã¨", "è"], ["Ãˆ", "È"],
    ["Ã­", "í"], ["ÃÍ", "Í"],
    ["Ã³", "ó"], ["Ã“", "Ó"],
    ["Ã´", "ô"], ["Ã”", "Ô"],
    ["Ãµ", "õ"], ["Ã•", "Õ"],
    ["Ãº", "ú"], ["Ãš", "Ú"],
    ["Ã§", "ç"], ["Ã‡", "Ç"],
    ["Ã¹", "ù"], ["Ã™", "Ù"],
    ["Ã±", "ñ"], ["Ã‘", "Ñ"],
    ["Ã ", "à"], ["Ã€", "À"],

    // Misc symbols sometimes mangled
    ["Ã‚·", "·"],
    ["Ã‚©", "©"],
  ];

  let out = text;
  for (const [from, to] of pairs) out = out.split(from).join(to);

  // Clean up common stray "Â" variants (keep ordinals and similar if present)
  out = out.split("Â ").join(" ");
  out = out.split("Â").join("");

  return out;
}

function processFile(filePath) {
  const before = fs.readFileSync(filePath, "utf8");

  const beforeA = count(before, "Ã");
  const beforeCirc = count(before, "Â");
  const beforeRep = count(before, "�");

  if (beforeA + beforeCirc === 0) return { changed: false };

  const after = fixMojibake(before);

  const afterA = count(after, "Ã");
  const afterCirc = count(after, "Â");
  const afterRep = count(after, "�");

  const improves =
    (afterA < beforeA || afterCirc < beforeCirc) &&
    afterRep <= beforeRep &&
    after !== before;

  if (!improves) return { changed: false };

  fs.writeFileSync(filePath, after, "utf8");
  return { changed: true, beforeA, beforeCirc, beforeRep, afterA, afterCirc, afterRep };
}

function main() {
  const rootDir = process.argv[2] ? path.resolve(process.argv[2]) : process.cwd();
  const files = walkHtmlFiles(rootDir);
  let changed = 0;
  let skipped = 0;

  for (const f of files) {
    const r = processFile(f);
    if (r.changed) changed++;
    else skipped++;
  }

  process.stdout.write(
    `fix-mojibake complete. root=${rootDir}\nchanged=${changed}\nskipped=${skipped}\nfiles=${files.length}\n`
  );
}

main();
