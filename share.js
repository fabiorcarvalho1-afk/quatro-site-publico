(() => {
  if (!document.querySelector('meta[name="qf:sharing"][content="public"]')) return;
  if (window.QFShare) return;
  const source = document.currentScript.src;
  const site = "https://quatrofolhasgastronomia.com.br";
  const previews = "https://cursos.quatrofolhasgastronomia.com.br/compartilhar";
  const asset = (file) => new URL(file, source).href;
  const slug = (value) => String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 120);
  const text = (value) => String(value || "").replace(/\s+/g, " ").trim();
  let catalog = [];
  let queued = false;
  let revealed = "";

  const sheet = document.createElement("link");
  sheet.rel = "stylesheet";
  sheet.href = asset("share.css?v=20261029-1");
  if (!Array.from(document.querySelectorAll('link[rel="stylesheet"]')).some((link) => link.href === sheet.href)) document.head.appendChild(sheet);

  function previewUrl(kind, id) {
    if (!["aula", "curso"].includes(kind) || !/^[a-zA-Z0-9_-]{1,150}$/.test(id || "")) return "";
    return `${previews}/${kind}/${encodeURIComponent(id)}`;
  }

  function setContent(button, title, url) {
    button.dataset.qfShareTitle = text(title);
    button.dataset.qfShareUrl = url;
    const label = `Compartilhar ${text(title)} pelo WhatsApp`;
    button.title = label;
    button.setAttribute("aria-label", label);
  }

  function bind(button) {
    if (button.dataset.qfShareBound) return;
    button.dataset.qfShareBound = "true";
    button.type = "button";
    button.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const url = button.dataset.qfShareUrl;
      if (!url || !/^https:\/\//.test(url)) return;
      // Sharing is not a contact/lead conversion and must not use the contact links.
      const message = `${button.dataset.qfShareTitle}\n${url}`;
      window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
    });
  }

  function button(className) {
    const element = document.createElement("button");
    element.className = `qf-share-control ${className}`;
    const icon = document.createElement("span");
    icon.className = "qf-share-icon";
    icon.setAttribute("aria-hidden", "true");
    element.appendChild(icon);
    bind(element);
    return element;
  }

  const pageButton = document.querySelector("[data-qf-share-page]") || button("site-share-button qf-share-page");
  if (!pageButton.isConnected) document.body.appendChild(pageButton);
  bind(pageButton);

  function pageShare() {
    const meta = document.querySelector('meta[property="og:title"]');
    let title = meta?.content || document.title;
    let url = document.querySelector('link[rel="canonical"]')?.href || document.querySelector('meta[property="og:url"]')?.content;
    if (!url) {
      const path = window.location.pathname === "/index.html" ? "/" : window.location.pathname;
      url = new URL(path, site).href;
    }
    const id = new URLSearchParams(window.location.search).get("aula") || (window.location.hash.startsWith("#aula-") ? window.location.hash.slice(6) : "");
    if (id && previewUrl("aula", id)) {
      const card = Array.from(document.querySelectorAll('[data-qf-share-kind="aula"]')).find((item) => item.dataset.qfShareId === id);
      url = previewUrl("aula", id);
      if (card) title = card.dataset.qfShareTitle || card.querySelector("h3,h2")?.textContent || title;
      if (card && revealed !== id) {
        revealed = id;
        card.scrollIntoView({ block: "center", behavior: "auto" });
      }
    }
    setContent(pageButton, title, url);
  }

  function descriptor(card) {
    const title = text(card.dataset.qfShareTitle || card.querySelector("h3,h2")?.textContent);
    if (!title) return null;
    if (card.dataset.qfShareKind && card.dataset.qfShareId) return { title, url: previewUrl(card.dataset.qfShareKind, card.dataset.qfShareId) };
    const link = card.querySelector('a[href$=".html"],a[href*=".html#"]');
    const href = link?.getAttribute("href")?.split("#")[0];
    const item = catalog.find((course) => slug(course.title) === slug(title)) || catalog.find((course) => course.href?.split("#")[0] === href);
    return item ? { title: item.title, url: previewUrl("curso", item.shareId || slug(item.title)) } : null;
  }

  function scan() {
    queued = false;
    document.querySelectorAll('[data-qf-share-kind],.catalog-course-card,.prof-course-card,.course-card').forEach((card) => {
      const item = descriptor(card);
      if (!item?.url) return;
      let control = card.querySelector(".qf-card-share");
      if (!control) {
        const heading = card.querySelector("h3,h2");
        if (!heading || heading.closest("a")) return;
        const row = document.createElement("div");
        row.className = "qf-share-heading";
        heading.before(row);
        control = button("qf-card-share");
        row.append(heading, control);
      }
      setContent(control, item.title, item.url);
    });
    pageShare();
  }

  function schedule() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(scan);
  }

  document.querySelectorAll("[data-qf-share-page]").forEach(bind);
  new MutationObserver(schedule).observe(document.querySelector("main") || document.body, { childList: true, subtree: true });
  window.addEventListener("hashchange", schedule);
  window.QFShare = { previewUrl, slug, refresh: schedule };
  scan();
  fetch(asset("content/courses.json"), { cache: "no-cache" }).then((response) => response.ok ? response.json() : null).then((data) => {
    catalog = (data?.catalog?.courses || []).filter((item) => item.visible !== false);
    schedule();
  }).catch(() => {});
})();
