import fs from "node:fs";
import path from "node:path";

function walkHtmlFiles(rootDir) {
  const out = [];
  const stack = [rootDir];
  while (stack.length) {
    const dir = stack.pop();
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) stack.push(full);
      else if (ent.isFile() && ent.name.toLowerCase().endsWith(".html")) out.push(full);
    }
  }
  return out;
}

function main() {
  const rootDir = process.argv[2] ? path.resolve(process.argv[2]) : process.cwd();
  const files = walkHtmlFiles(rootDir);

  const rows = [];
  for (const f of files) {
    const s = fs.readFileSync(f, "utf8");
    const u = (s.match(/\uFFFD/g) || []).length;
    const a = (s.match(/Ã/g) || []).length;
    const c = (s.match(/Â/g) || []).length;
    if (u || a || c) rows.push({ f, u, a, c });
  }

  rows.sort((x, y) => (y.u + y.a + y.c) - (x.u + x.a + x.c));
  const top = rows.slice(0, 30);
  process.stdout.write(
    `report-bad-chars root=${rootDir}\nfiles=${files.length}\naffected=${rows.length}\n` +
    top.map(r => `${r.u} U+FFFD | ${r.a} Ã | ${r.c} Â | ${r.f}`).join("\n") +
    (rows.length > top.length ? `\n... (${rows.length - top.length} more)` : "") +
    "\n"
  );
}

main();

