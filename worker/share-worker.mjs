const SITE = "https://quatrofolhasgastronomia.com.br";
const ORIGIN = "https://cursos.quatrofolhasgastronomia.com.br";
const API = "https://quatro-folhas-backend-api.onrender.com";
const FALLBACK_IMAGE = `${SITE}/assets/photos/cozinha-escola-horizontal.png`;
const imageHosts = new Set([new URL(SITE).host, new URL(ORIGIN).host, new URL(API).host, "www.quatrofolhasgastronomia.com.br", "rascunho.quatrofolhasgastronomia.com.br"]);
const escape = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
export const slug = (value) => String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 120);
const plain = (value, limit = 6000) => String(value || "").trim().slice(0, limit);
const compact = (value) => plain(value, 1200).replace(/\s+/g, " ").slice(0, 220);

export function publicImage(value) {
  try {
    const image = new URL(value || "", SITE);
    if (image.protocol !== "https:" || image.username || image.password || !imageHosts.has(image.host)) return FALLBACK_IMAGE;
    if (!/^\/(?:assets\/|uploads\/aulas-tematicas\/)/.test(image.pathname) || !/\.(?:png|jpe?g|webp)$/i.test(image.pathname)) return FALLBACK_IMAGE;
    return image.href;
  } catch { return FALLBACK_IMAGE; }
}

function courseHref(value) {
  try {
    const url = new URL(value || "cursos.html", SITE + "/");
    if (url.origin !== SITE || /(?:admin|portal|acesso|area|sistema-api)/i.test(url.pathname)) return SITE + "/cursos.html";
    return url.href;
  } catch { return SITE + "/cursos.html"; }
}

async function publicJson(url, fetcher) {
  const response = await fetcher(url, { method: "GET", headers: { Accept: "application/json" }, redirect: "error", signal: AbortSignal.timeout(7000) });
  if (!response.ok) throw new Error("Public content unavailable");
  return response.json();
}

async function catalog(env) {
  const response = await env.ASSETS.fetch(new Request(ORIGIN + "/content/courses.json"));
  if (!response.ok) throw new Error("Catalog unavailable");
  const data = await response.json();
  return (data.catalog?.courses || []).filter((course) => course.visible !== false);
}

const money = (cents) => Number.isFinite(Number(cents)) && Number(cents) > 0 ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(cents) / 100) : "Consulte condições";
const listItems = (value) => plain(value).split(/\r?\n|\s+[•·]\s+|;/).map((item) => item.trim().replace(/^[\-–—•]+\s*/, "")).filter(Boolean).slice(0, 40);

export async function resolveItem(kind, id, env, fetcher = fetch) {
  if (kind === "aula") {
    const rows = await publicJson(API + "/thematic-registrations/public/classes", fetcher);
    if (!Array.isArray(rows)) throw new Error("Invalid public response");
    const item = rows.find((entry) => entry.id === id && entry.thematic?.publicationStatus === "published");
    if (!item) return null;
    const thematic = item.thematic || {}, course = item.course || {};
    const date = new Date(item.startsAt);
    const validDate = Number.isFinite(date.getTime());
    return {
      kind, id, title: plain(item.name || course.title || "Aula temática", 180),
      description: plain(thematic.shortDescription || course.description || "Uma experiência prática na Quatro Folhas."),
      image: publicImage(thematic.imageUrl), imageAlt: plain(item.name || "Aula temática", 180),
      details: [
        ["Data", validDate ? new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "full" }).format(date) : "Consulte a agenda"],
        ["Horário", validDate ? new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", hour: "2-digit", minute: "2-digit" }).format(date) : "A confirmar"],
        ["Por pessoa", money(thematic.priceCents ?? course.priceCents)],
      ],
      preparations: listItems(thematic.preparations), includes: plain(thematic.includes),
      target: `${SITE}/aulas-tematicas.html?aula=${encodeURIComponent(id)}#aula-${encodeURIComponent(id)}`,
      cta: "Ver aula e reservar",
    };
  }
  const courses = await catalog(env);
  const saved = courses.find((course) => (course.shareId || slug(course.title)) === id);
  if (saved) return {
    kind, id, title: plain(saved.title, 180), description: plain(saved.description), image: publicImage(saved.image), imageAlt: plain(saved.alt || saved.title, 180),
    details: [["Formato", plain(saved.type, 120)], ["Duração", plain(saved.duration, 120)]], preparations: [], includes: "",
    target: courseHref(saved.href), cta: plain(saved.cta || "Conhecer curso", 80),
  };
  const data = await publicJson(API + "/site/courses", fetcher);
  const item = data.items?.find((course) => course.id === id);
  if (!item) return null;
  const matched = courses.find((course) => slug(course.title) === slug(item.title));
  return {
    kind, id, title: plain(item.title, 180), description: plain(item.description), image: publicImage(matched?.image), imageAlt: plain(matched?.alt || item.title, 180),
    details: [["Carga horária", item.workloadHours ? `${Number(item.workloadHours)}h` : "Consulte a escola"]], preparations: [], includes: "",
    target: courseHref(matched?.href), cta: "Conhecer curso",
  };
}

export function renderItem(item) {
  const canonical = `${ORIGIN}/compartilhar/${item.kind}/${encodeURIComponent(item.id)}`;
  const description = compact(item.description);
  const details = item.details.filter(([, value]) => value).map(([label, value]) => `<div><dt>${escape(label)}</dt><dd>${escape(value)}</dd></div>`).join("");
  const preparations = item.preparations.length ? `<h2>Nesta aula você prepara</h2><ul>${item.preparations.map((text) => `<li>${escape(text)}</li>`).join("")}</ul>` : "";
  return `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="qf:sharing" content="public">
<title>${escape(item.title)} | Quatro Folhas</title>
<meta name="description" content="${escape(description)}"><meta name="robots" content="noindex,follow">
<link rel="canonical" href="${escape(canonical)}">
<meta property="og:type" content="website"><meta property="og:locale" content="pt_BR">
<meta property="og:site_name" content="Quatro Folhas Escola de Gastronomia">
<meta property="og:title" content="${escape(item.title)} | Quatro Folhas"><meta property="og:description" content="${escape(description)}">
<meta property="og:url" content="${escape(canonical)}"><meta property="og:image" content="${escape(item.image)}"><meta property="og:image:alt" content="${escape(item.imageAlt)}">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${escape(item.title)}"><meta name="twitter:description" content="${escape(description)}"><meta name="twitter:image" content="${escape(item.image)}">
<link rel="stylesheet" href="${ORIGIN}/share.css?v=20261029-1"><script src="${ORIGIN}/share.js?v=20261029-1" defer></script></head>
<body class="qf-share-document"><header><div class="qf-detail-header"><a href="${SITE}"><img src="${ORIGIN}/assets/logo-quatrofolhas-horizontal.png" alt="Quatro Folhas Escola de Gastronomia" width="200"></a><button type="button" class="qf-share-control" data-qf-share-page title="Compartilhar pelo WhatsApp" aria-label="Compartilhar pelo WhatsApp"><span class="qf-share-icon" aria-hidden="true"></span></button></div></header>
<main class="qf-share-detail"><p class="qf-detail-label">${item.kind === "aula" ? "Aula temática" : "Curso"}</p><h1>${escape(item.title)}</h1>
<img class="qf-detail-image" src="${escape(item.image)}" alt="${escape(item.imageAlt)}"><dl>${details}</dl><p>${escape(item.description)}</p>
${preparations}${item.includes ? `<h2>O que está incluso</h2><p>${escape(item.includes)}</p>` : ""}
<p><a class="qf-detail-cta" href="${escape(item.target)}">${escape(item.cta)}</a></p></main>
<footer>Quatro Folhas Escola de Gastronomia · São Paulo</footer></body></html>`;
}

function htmlResponse(body, status, head) {
  return new Response(head ? null : body, { status, headers: {
    "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Content-Security-Policy": "default-src 'none'; connect-src 'self'; img-src 'self' https://quatrofolhasgastronomia.com.br https://*.quatrofolhasgastronomia.com.br https://quatro-folhas-backend-api.onrender.com; style-src 'self'; script-src 'self'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'",
  } });
}

export async function handleRequest(request, env, fetcher = fetch) {
  const pathname = new URL(request.url).pathname;
  if (!pathname.startsWith("/compartilhar/")) return env.ASSETS.fetch(request);
  if (!["GET", "HEAD"].includes(request.method)) return new Response(null, { status: 405, headers: { Allow: "GET, HEAD" } });
  const match = pathname.match(/^\/compartilhar\/(aula|curso)\/([a-zA-Z0-9_-]{1,150})\/?$/);
  if (!match) return htmlResponse("<!doctype html><meta name=robots content=noindex><h1>Conteúdo não encontrado</h1>", 404, request.method === "HEAD");
  try {
    const item = await resolveItem(match[1], match[2], env, fetcher);
    if (!item) return htmlResponse("<!doctype html><meta charset=utf-8><meta name=robots content=noindex><h1>Conteúdo não disponível</h1>", 404, request.method === "HEAD");
    return htmlResponse(renderItem(item), 200, request.method === "HEAD");
  } catch {
    return htmlResponse(`<!doctype html><meta charset=utf-8><meta name=robots content=noindex><h1>Conteúdo temporariamente indisponível</h1><a href="${SITE}/aulas-tematicas.html">Consultar a escola</a>`, 503, request.method === "HEAD");
  }
}

export default { fetch: (request, env) => handleRequest(request, env) };
