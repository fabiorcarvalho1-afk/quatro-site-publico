import fs from "node:fs";

const file = process.argv[2];
const pat = process.argv[3] || "\uFFFD";
if (!file) {
  process.stderr.write("usage: node show-pattern.mjs <file> [pattern]\n");
  process.exit(2);
}

const s = fs.readFileSync(file, "utf8");
const lines = s.split(/\r?\n/);

let count = 0;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes(pat)) {
    count++;
    const ln = String(i + 1).padStart(4, " ");
    process.stdout.write(`${ln}: ${lines[i]}\n`);
  }
}
process.stdout.write(`total_lines_with_pattern=${count}\n`);

