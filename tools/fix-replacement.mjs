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

function applyHeuristics(text) {
  // Fix common Portuguese words that previously got damaged into U+FFFD (�) or '?'.
  // This is lossy (we can’t infer arbitrary characters), but these specific phrases
  // are visible in the UI and we know the intended spelling.
  let out = text;

  const rep = /[�?]/g;

  // Fix U+FFFD (replacement) or '?' in known phrases.
  out = out.replace(new RegExp(`p${rep.source}s-graduados`, "gi"), "pós-graduados");
  out = out.replace(new RegExp(`acad${rep.source}mica`, "gi"), "acadêmica");
  out = out.replace(new RegExp(`tamb${rep.source}m`, "gi"), "também");
  out = out.replace(new RegExp(`vis${rep.source}o`, "gi"), "visão");
  out = out.replace(new RegExp(`at${rep.source}\\s`, "gi"), "até ");

  // Other frequent generic fixes:
  out = out.replace(new RegExp(`conhec${rep.source}a`, "gi"), "conheça");
  out = out.replace(new RegExp(`formac${rep.source}o`, "gi"), "formação");
  out = out.replace(new RegExp(`direc${rep.source}o`, "gi"), "direção");

  // Common Portuguese words that often show up with replacement chars.
  out = out.replace(/Avan[�?]ado/gi, "Avançado");
  out = out.replace(/Avan[�?]ada/gi, "Avançada");
  out = out.replace(/pr[�?]ximo/gi, "próximo");
  out = out.replace(/pr[�?]xima/gi, "próxima");
  out = out.replace(/al[�?]m/gi, "além");
  out = out.replace(/t[�?]cnico/gi, "técnico");
  out = out.replace(/Pr[�?]-matr[ií]cula/gi, "Pré-matrícula");
  out = out.replace(/r[�?]pido/gi, "rápido");
  out = out.replace(/pr[�?]tico(s)?/gi, (m, s) => (s ? "práticos" : "prático"));
  out = out.replace(/pr[�?]tica(s)?/gi, (m, s) => (s ? "práticas" : "prática"));
  out = out.replace(/presen[�?]a/gi, "presença");
  out = out.replace(/paix[�?]o/gi, "paixão");
  out = out.replace(/viv[�?]ncia/gi, "vivência");
  out = out.replace(/dura[�?]o/gi, "duração");
  out = out.replace(/forma[�?][aã]o/gi, "formação");

  // Double-question artifacts (e.g., "corre??o").
  out = out.replace(/corre\?\?o/gi, "correção");
  out = out.replace(/sele\?\?o/gi, "seleção");
  out = out.replace(/competi\?\?es/gi, "competições");

  return out;
}

function main() {
  const rootDir = process.argv[2] ? path.resolve(process.argv[2]) : process.cwd();
  const files = walkHtmlFiles(rootDir);

  let changed = 0;
  let flagged = 0;

  for (const f of files) {
    const before = fs.readFileSync(f, "utf8");
    const hasBad =
      before.includes("\uFFFD") ||
      before.includes("?s-graduados") ||
      before.includes("tamb?m") ||
      before.includes("vis?o") ||
      before.includes("acad?mica") ||
      before.includes("at? ") ||
      /[A-Za-z]\?[A-Za-z]/.test(before);
    if (!hasBad) continue;
    flagged++;

    const after = applyHeuristics(before);
    if (after !== before) {
      fs.writeFileSync(f, after, "utf8");
      changed++;
    }
  }

  process.stdout.write(
    `fix-replacement complete. root=${rootDir}\nflagged=${flagged}\nchanged=${changed}\nfiles=${files.length}\n`
  );
}

main();
