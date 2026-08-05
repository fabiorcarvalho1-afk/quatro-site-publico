import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

const root = process.cwd();
const output = join(root, "dist-pages");

async function copy(source, target) {
  const destination = join(output, target);
  await mkdir(dirname(destination), { recursive: true });
  await cp(join(root, source), destination, { recursive: true });
}

await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });

await copy("chef-profissional-setembro-2026.html", "chef-profissional-setembro-2026.html");
await copy("politica-de-privacidade.html", "politica-de-privacidade.html");
await copy("script.js", "script.js");
await copy("assets/campaigns/chef-profissional", "assets/campaigns/chef-profissional");
await copy("assets/logo-quatrofolhas-horizontal.png", "assets/logo-quatrofolhas-horizontal.png");
await copy("assets/logo-quatrofolhas-horizontal-negativo.png", "assets/logo-quatrofolhas-horizontal-negativo.png");
await copy("assets/video/hero-principal-2026-v6-web.mp4", "assets/video/hero-principal-2026-v6-web.mp4");

const redirects = [
  "/ /chef-profissional 302",
  "/chef-profissional/ /chef-profissional 301",
  "/chef-profissional /chef-profissional-setembro-2026.html 200",
  "",
].join("\n");

await writeFile(join(output, "_redirects"), redirects, "utf8");

