import fs from "node:fs";
import path from "node:path";

const FROM = "https://wa.me/5511947781922";
const TO = "https://wa.me/5511947781922";

function walkFiles(rootDir) {
  const out = [];
  const stack = [rootDir];
  while (stack.length) {
    const dir = stack.pop();
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) stack.push(full);
      else if (ent.isFile() && /\.(html|js|mjs|css)$/i.test(ent.name)) out.push(full);
    }
  }
  return out;
}

function main() {
  const rootDir = process.argv[2] ? path.resolve(process.argv[2]) : process.cwd();
  const files = walkFiles(rootDir);
  let changed = 0;

  for (const f of files) {
    const before = fs.readFileSync(f, "utf8");
    let after = before;

    after = after.split(FROM).join(TO);
    // Handle if protocol was omitted in older snippets.
    after = after.split("wa.me/5511947781922").join("wa.me/5511947781922");

    if (after !== before) {
      fs.writeFileSync(f, after, "utf8");
      changed++;
    }
  }

  process.stdout.write(`fix-whatsapp-number root=${rootDir}\nfiles=${files.length}\nchanged=${changed}\n`);
}

main();

