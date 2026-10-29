import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import worker, { handleRequest, publicImage, renderItem, resolveItem, slug } from "../../worker/share-worker.mjs";

const content = JSON.parse(readFileSync(new URL("../../content/courses.json", import.meta.url)));
const published = { id: "published-1", name: 'Aula "Francesa" <especial>', startsAt: "2027-03-16T12:00:00Z", course: { description: "Descrição do curso", priceCents: 25000 }, thematic: { publicationStatus: "published", shortDescription: 'Texto <script>alert(1)</script>', imageUrl: "https://quatro-folhas-backend-api.onrender.com/uploads/aulas-tematicas/franca.png", preparations: "Molho; Sobremesa" } };
const env = { ASSETS: { fetch: async (request) => new URL(request.url).pathname === "/content/courses.json" ? Response.json(content) : new Response("asset unchanged", { headers: { "x-test-asset": "yes" } }) } };
const calls = [];
const fetcher = async (url, options) => { calls.push({ url, options }); return Response.json([published, { ...published, id: "draft-1", thematic: { publicationStatus: "draft" } }]); };

test("normal assets retain their original response", async () => {
  const response = await worker.fetch(new Request("https://example.invalid/chef-profissional-setembro-2026?utm_campaign=cp02"), env, {});
  assert.equal(await response.text(), "asset unchanged");
  assert.equal(response.headers.get("x-test-asset"), "yes");
});
test("all visible catalog courses have distinct valid preview IDs and the correct images", async () => {
  const ids = new Set();
  for (const entry of content.catalog.courses.filter((row) => row.visible !== false)) {
    const id = entry.shareId || slug(entry.title);
    assert.match(id, /^[a-z0-9_-]{1,150}$/);
    assert.ok(!ids.has(id)); ids.add(id);
    const item = await resolveItem("curso", id, env, () => { throw new Error("Static courses must not call the API"); });
    assert.equal(item.title, entry.title);
    assert.equal(item.image, new URL(entry.image, "https://quatrofolhasgastronomia.com.br").href);
    assert.match(renderItem(item), /property="og:image"/);
  }
});
test("published class has server-rendered metadata and its own canonical URL", async () => {
  calls.length = 0;
  const response = await handleRequest(new Request("https://example.invalid/compartilhar/aula/published-1", { headers: { Cookie: "private-session=never-forward", Authorization: "Bearer never-forward" } }), env, fetcher);
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.ok(html.includes('content="Aula &quot;Francesa&quot; &lt;especial&gt; | Quatro Folhas"'));
  assert.ok(html.includes('property="og:image" content="' + published.thematic.imageUrl + '"'));
  assert.ok(html.includes('rel="canonical" href="https://cursos.quatrofolhasgastronomia.com.br/compartilhar/aula/published-1"'));
  assert.ok(html.includes("aulas-tematicas.html?aula=published-1#"));
  assert.ok(!html.includes("<script>alert(1)</script>"));
  assert.equal(calls[0].url, "https://quatro-folhas-backend-api.onrender.com/thematic-registrations/public/classes");
  assert.deepEqual(calls[0].options.headers, { Accept: "application/json" });
  assert.equal(calls[0].options.method, "GET");
});
test("draft and missing classes are never exposed", async () => {
  for (const id of ["draft-1", "missing"]) assert.equal((await handleRequest(new Request("https://example.invalid/compartilhar/aula/" + id), env, fetcher)).status, 404);
});
test("invalid identifiers and writes do not reach the public API", async () => {
  const never = () => { throw new Error("Unexpected API request"); };
  assert.equal((await handleRequest(new Request("https://example.invalid/compartilhar/aula/%22test"), env, never)).status, 404);
  assert.equal((await handleRequest(new Request("https://example.invalid/compartilhar/aula/published-1", { method: "POST" }), env, never)).status, 405);
});
test("API failure returns a temporary error, not invented class details", async () => {
  const response = await handleRequest(new Request("https://example.invalid/compartilhar/aula/published-1"), env, async () => new Response("offline", { status: 503 }));
  assert.equal(response.status, 503);
});
test("HEAD succeeds without a response body", async () => {
  const response = await handleRequest(new Request("https://example.invalid/compartilhar/aula/published-1", { method: "HEAD" }), env, fetcher);
  assert.equal(response.status, 200); assert.equal(await response.text(), "");
});
test("untrusted image URLs cannot become preview images", () => {
  for (const value of ["javascript:alert(1)", "https://other.invalid/a.jpg", "https://quatro-folhas-backend-api.onrender.com/uploads/documentos/private.png", "https://quatrofolhasgastronomia.com.br/assets/test.svg"]) assert.ok(publicImage(value).endsWith("/assets/photos/cozinha-escola-horizontal.png"));
});
