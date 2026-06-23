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

const utf8Strict = new TextDecoder("utf-8", { fatal: true });
const latin1 = new TextDecoder("latin1");

function isProbablyBinary(buf) {
  // Basic heuristic: if it has lots of NULs, don't touch.
  let nuls = 0;
  const sample = buf.subarray(0, Math.min(buf.length, 8000));
  for (const b of sample) if (b === 0) nuls++;
  return nuls > 0;
}

function main() {
  const rootDir = process.argv[2] ? path.resolve(process.argv[2]) : process.cwd();
  const files = walkFiles(rootDir);
  let converted = 0;
  let skipped = 0;

  for (const f of files) {
    const buf = fs.readFileSync(f);
    if (isProbablyBinary(buf)) {
      skipped++;
      continue;
    }

    let utf8Ok = true;
    try {
      utf8Strict.decode(buf);
    } catch {
      utf8Ok = false;
    }
    if (utf8Ok) continue;

    // Convert latin1->utf8.
    const text = latin1.decode(buf);
    fs.writeFileSync(f, text, "utf8");
    converted++;
  }

  process.stdout.write(
    `convert-to-utf8-if-invalid complete. root=${rootDir}\nconverted=${converted}\nskipped=${skipped}\nfiles=${files.length}\n`
  );
}

main();

