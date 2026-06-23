import fs from "node:fs";
import path from "node:path";

function walkFiles(rootDir) {
  const out = [];
  const stack = [rootDir];
  while (stack.length) {
    const dir = stack.pop();
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) stack.push(full);
      else if (ent.isFile() && /\.(html|css|js)$/i.test(ent.name)) out.push(full);
    }
  }
  return out;
}

function fix(text) {
  // Fix classic UTF-8 interpreted as Latin-1 mojibake sequences seen in this repo.
  const pairs = [
    ["Ã¡", "á"], ["Ã", "Á"],
    ["Ã¢", "â"], ["Ã‚", "Â"],
    ["Ã£", "ã"], ["Ãƒ", "Ã"],
    ["Ã¤", "ä"], ["Ã„", "Ä"],
    ["Ã§", "ç"], ["Ã‡", "Ç"],
    ["Ã¨", "è"], ["Ãˆ", "È"],
    ["Ã©", "é"], ["Ã‰", "É"],
    ["Ãª", "ê"], ["ÃŠ", "Ê"],
    ["Ã­", "í"], ["Ã", "Í"],
    ["Ã³", "ó"], ["Ã“", "Ó"],
    ["Ã´", "ô"], ["Ã”", "Ô"],
    ["Ãµ", "õ"], ["Ã•", "Õ"],
    ["Ãº", "ú"], ["Ãš", "Ú"],
    ["Ã¹", "ù"], ["Ã™", "Ù"],
    ["Ã±", "ñ"], ["Ã‘", "Ñ"],
    ["Â·", "·"], ["Â©", "©"],
    ["Âª", "ª"], ["Âº", "º"],
  ];

  let out = text;
  for (const [from, to] of pairs) out = out.split(from).join(to);
  return out;
}

function main() {
  const rootDir = process.argv[2] ? path.resolve(process.argv[2]) : process.cwd();
  const files = walkFiles(rootDir);
  let changed = 0;

  for (const f of files) {
    const before = fs.readFileSync(f, "utf8");
    if (!before.includes("Ã") && !before.includes("Â")) continue;
    const after = fix(before);
    if (after !== before) {
      fs.writeFileSync(f, after, "utf8");
      changed++;
    }
  }

  process.stdout.write(
    `fix-basic-mojibake complete. root=${rootDir}\nchanged=${changed}\nfiles=${files.length}\n`
  );
}

main();

