import fs from "node:fs";
import path from "node:path";

function walkHtmlFiles(rootDir) {
  const out = [];
  const stack = [rootDir];
  while (stack.length) {
    const dir = stack.pop();
    for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        // Skip translated stubs (handled separately)
        if (ent.name === "en" || ent.name === "es") continue;
        stack.push(full);
      } else if (ent.isFile() && ent.name.toLowerCase().endsWith(".html")) {
        out.push(full);
      }
    }
  }
  return out;
}

function fixMojibakeSymbols(text) {
  // Minimal set for leftovers that we saw in practice.
  return text
    .split("Ã‚©").join("©")
    .split("Ã‚·").join("·")
    .split("ÃƒÂ ").join("à")
    .split("Ãƒ ").join("à");
}

function fixFooterAsciiSymbols(text) {
  // Some pages ended up with plain '?' where we expect symbols.
  return text
    .replace(/<span>\?\s*20(\d{2})/g, "<span>© 20$1")
    .split("São Paulo/SP ? Unidade").join("São Paulo/SP · Unidade");
}

function fixTematicaFechada(text) {
  // Rename requested by user: "aula temática fechada" -> "aula temática personalizada"
  return text
    .split("Aula temática fechada").join("Aula temática personalizada")
    .split("aula temática fechada").join("aula temática personalizada")
    .split("Aula tematica fechada").join("Aula temática personalizada")
    .split("aula tematica fechada").join("aula temática personalizada");
}

function fixQuestionMarksInWords(text) {
  // Replace common Portuguese words that were damaged into '?'.
  const pairs = [
    [/Conhe\?a/gi, "Conheça"],
    [/Hist\?ria/gi, "História"],
    [/hist\?ria/gi, "história"],
    [/visit\?vel/gi, "visitável"],
    [/n\?vel/gi, "nível"],
    [/d\?vidas/gi, "dúvidas"],
    [/\?reas/gi, "áreas"],
    [/Conex\?o/gi, "Conexão"],
    [/M\?ltiplas/gi, "Múltiplas"],
    [/Utens\?lios/gi, "Utensílios"],
    [/Acad\?mica/gi, "Acadêmica"],
    [/acad\?mica/gi, "acadêmica"],
    [/p\?s-graduados/gi, "pós-graduados"],
    [/tamb\?m/gi, "também"],
    [/al\?m/gi, "além"],
    [/r\?pido/gi, "rápido"],
    [/pr\?tico(s)?/gi, (m, s) => (s ? "práticos" : "prático")],
    [/pr\?tica(s)?/gi, (m, s) => (s ? "práticas" : "prática")],
    [/\s\?\s/g, " é "],
    [/m\?o/gi, "mão"],
    [/n\?o/gi, "não"],
    [/N\?o/g, "Não"],
    [/Anivers\?rio/gi, "Aniversário"],
    [/Fam\?lia/gi, "Família"],
    [/respons\?veis/gi, "responsáveis"],
    [/op\?\?es/gi, "opções"],
    [/op\?\?o/gi, "opção"],
    [/s\?\?o/gi, "são"],
    [/presen\?a/gi, "presença"],
    [/paix\?o/gi, "paixão"],
    [/viv\?ncia/gi, "vivência"],
    [/dura\?o/gi, "duração"],
    [/forma\?([aã])o/gi, "formação"],
    [/tr\?s/gi, "três"],
    [/s\?o/gi, "são"],
    [/pedag\?gico/gi, "pedagógico"],
    [/pedag\?gica/gi, "pedagógica"],
    [/proposi\?o/gi, "proposição"],
    [/organiza\?o/gi, "organização"],
    [/evolu\?o/gi, "evolução"],
    [/\?sltimas/gi, "Últimas"],
    [/neg\?cio/gi, "negócio"],
    [/in\?cio/gi, "início"],
    [/pr\?via/gi, "prévia"],
    [/n\?veis/gi, "níveis"],
    [/inscri\?\?o/gi, "inscrição"],
    [/necess\?ria/gi, "necessária"],
    [/d\?\s+dicas/gi, "dá dicas"],
    [/excel\?ncia/gi, "excelência"],
    [/mem\?ria/gi, "memória"],
    [/hor\?rio/gi, "horário"],
    [/est\?\s+incluso/gi, "está incluso"],
    [/est\?/gi, "está"],
    [/Restri\?\?es/gi, "Restrições"],
    [/restri\?\?o/gi, "restrição"],
    [/ocasi\?es/gi, "ocasiões"],
    [/\bs\?\b/gi, "só"],
    [/s\?\s/gi, "só "],
    [/d\?vidas/gi, "dúvidas"],
    [/d\?vida/gi, "dúvida"],
    [/p\?blico/gi, "público"],
  ];

  let out = text;
  for (const [re, val] of pairs) out = out.replace(re, val);
  return out;
}

function capitalizeTagText(html) {
  // Capitalize the first letter inside h1/h2/h3/strong when the text starts with a letter.
  // Conservative: only when the content is plain text (no '<' inside).
  const tags = ["h1", "h2", "h3", "strong"];
  let out = html;
  for (const tag of tags) {
    const re = new RegExp(`<${tag}([^>]*)>([^<][^<]*?)</${tag}>`, "g");
    out = out.replace(re, (m, attrs, txt) => {
      // Find first alphabetical char.
      const i = txt.search(/[A-Za-zÀ-ÿ]/);
      if (i === -1) return m;
      const ch = txt[i];
      const up = ch.toUpperCase();
      if (ch === up) return m;
      const fixed = txt.slice(0, i) + up + txt.slice(i + 1);
      return `<${tag}${attrs}>${fixed}</${tag}>`;
    });
  }

  // Eyebrows also should start with uppercase for consistency.
  out = out.replace(/<p class="eyebrow">([^<][^<]*?)<\/p>/g, (m, txt) => {
    const i = txt.search(/[A-Za-zÀ-ÿ]/);
    if (i === -1) return m;
    const ch = txt[i];
    const up = ch.toUpperCase();
    if (ch === up) return m;
    return `<p class="eyebrow">${txt.slice(0, i)}${up}${txt.slice(i + 1)}</p>`;
  });

  return out;
}

function stripHeadingTrailingPeriods(html) {
  // User request: remove trailing '.' from titles.
  // Apply to h1/h2/h3 only (not paragraphs).
  return html
    .replace(/<h1([^>]*)>([^<]*?)\.<\/h1>/g, "<h1$1>$2</h1>")
    .replace(/<h2([^>]*)>([^<]*?)\.<\/h2>/g, "<h2$1>$2</h2>")
    .replace(/<h3([^>]*)>([^<]*?)\.<\/h3>/g, "<h3$1>$2</h3>");
}

function capitalizeMainNavLinks(html) {
  return html.replace(/<nav class="main-nav"[^>]*>([\s\S]*?)<\/nav>/g, (m, inner) => {
    const fixed = inner.replace(/<a([^>]*)>([^<]+)<\/a>/g, (m2, attrs, txt) => {
      const raw = txt;
      const t = raw.replace(/\s+/g, " ").trim();
      if (!t) return m2;
      const i = t.search(/[A-Za-zÀ-ÿ]/);
      if (i === -1) return m2;
      const ch = t[i];
      const up = ch.toUpperCase();
      if (ch === up) return m2;
      const out = t.slice(0, i) + up + t.slice(i + 1);
      // Preserve surrounding whitespace from the original token as best as possible.
      const prefix = raw.match(/^\s*/)?.[0] ?? "";
      const suffix = raw.match(/\s*$/)?.[0] ?? "";
      return `<a${attrs}>${prefix}${out}${suffix}</a>`;
    });
    return `<nav class="main-nav"${m.match(/<nav class="main-nav"([^>]*)>/)?.[1] ?? ""}>${fixed}</nav>`;
  });
}

function capitalizeSpanTitles(html) {
  // Mega menu cards use <span class="title">...</span>.
  return html.replace(/<span class="title">([^<]+)<\/span>/g, (m, txt) => {
    const t = txt.trim();
    const i = t.search(/[A-Za-zÀ-ÿ]/);
    if (i === -1) return m;
    const ch = t[i];
    const up = ch.toUpperCase();
    if (ch === up) return m;
    return `<span class="title">${t.slice(0, i)}${up}${t.slice(i + 1)}</span>`;
  });
}

function capitalizeTagPills(html) {
  // Many UI pills are rendered as <span class="tag ...">text</span>.
  return html.replace(/<span class="tag([^"]*)">([^<]+)<\/span>/g, (m, cls, txt) => {
    const raw = txt;
    const t = raw.replace(/\s+/g, " ").trim();
    if (!t) return m;
    const i = t.search(/[A-Za-zÀ-ÿ]/);
    if (i === -1) return m;
    const ch = t[i];
    const up = ch.toUpperCase();
    if (ch === up) return m;
    const out = t.slice(0, i) + up + t.slice(i + 1);
    const prefix = raw.match(/^\s*/)?.[0] ?? "";
    const suffix = raw.match(/\s*$/)?.[0] ?? "";
    return `<span class="tag${cls}">${prefix}${out}${suffix}</span>`;
  });
}

function capitalizeFooterLinks(html) {
  return html.replace(/<footer class="site-footer"[^>]*>([\s\S]*?)<\/footer>/g, (m, inner) => {
    const fixed = inner.replace(/<a([^>]*)>([^<]+)<\/a>/g, (m2, attrs, txt) => {
      const raw = txt;
      const t = raw.replace(/\s+/g, " ").trim();
      if (!t) return m2;
      const i = t.search(/[A-Za-zÀ-ÿ]/);
      if (i === -1) return m2;
      const ch = t[i];
      const up = ch.toUpperCase();
      if (ch === up) return m2;
      const out = t.slice(0, i) + up + t.slice(i + 1);
      const prefix = raw.match(/^\s*/)?.[0] ?? "";
      const suffix = raw.match(/\s*$/)?.[0] ?? "";
      return `<a${attrs}>${prefix}${out}${suffix}</a>`;
    });
    return m.replace(inner, fixed);
  });
}

function processFile(filePath) {
  const before = fs.readFileSync(filePath, "utf8");
  let after = before;
  after = fixMojibakeSymbols(after);
  after = fixFooterAsciiSymbols(after);
  after = fixTematicaFechada(after);
  after = fixQuestionMarksInWords(after);
  after = stripHeadingTrailingPeriods(after);
  after = capitalizeTagText(after);
  after = capitalizeMainNavLinks(after);
  after = capitalizeSpanTitles(after);
  after = capitalizeTagPills(after);
  after = capitalizeFooterLinks(after);
  if (after !== before) fs.writeFileSync(filePath, after, "utf8");
  return after !== before;
}

function main() {
  const rootDir = process.argv[2] ? path.resolve(process.argv[2]) : process.cwd();
  const files = walkHtmlFiles(rootDir);
  let changed = 0;
  for (const f of files) if (processFile(f)) changed++;
  process.stdout.write(`sweep-fix-text root=${rootDir}\nfiles=${files.length}\nchanged=${changed}\n`);
}

main();
