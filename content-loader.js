(function () {
  const section = document.querySelector("[data-cms-home-pathways]");
  if (!section) return;

  const setText = (selector, value) => {
    const element = section.querySelector(selector);
    if (element && typeof value === "string" && value.trim()) {
      element.textContent = value.trim();
    }
  };

  const setHref = (element, value) => {
    if (!element || typeof value !== "string") return;
    const href = value.trim();
    if (!href || /^javascript:/i.test(href)) return;
    element.setAttribute("href", href);
  };

  const renderMedia = (container, card) => {
    if (!container || !card) return;

    const alt = typeof card.alt === "string" ? card.alt.trim() : "";
    container.setAttribute("aria-label", alt);

    if (card.media_type === "video" && card.video) {
      const video = document.createElement("video");
      video.src = card.video;
      video.muted = true;
      video.loop = true;
      video.autoplay = true;
      video.playsInline = true;
      video.preload = "metadata";
      video.setAttribute("aria-label", alt);
      if (card.poster) video.poster = card.poster;
      container.style.backgroundImage = card.poster ? `url("${card.poster}")` : "";
      container.replaceChildren(video);
      return;
    }

    container.replaceChildren();
    if (card.image) {
      container.style.backgroundImage = `url("${card.image}")`;
    }
  };

  const renderCard = (card) => {
    if (!card || !card.id) return;
    const element = section.querySelector(`[data-cms-card="${card.id}"]`);
    if (!element) return;

    setHref(element, card.href);

    const label = element.querySelector("[data-cms-card-label]");
    const title = element.querySelector("[data-cms-card-title]");
    const description = element.querySelector("[data-cms-card-description]");
    const cta = element.querySelector("[data-cms-card-cta]");

    if (label && card.label) label.textContent = card.label;
    if (description && card.description) description.textContent = card.description;
    if (cta && card.cta) cta.textContent = card.cta;

    if (title && card.id === "professional" && card.title_line_1 && card.title_line_2) {
      const firstLine = document.createElement("span");
      const secondLine = document.createElement("span");
      firstLine.textContent = card.title_line_1;
      secondLine.textContent = card.title_line_2;
      secondLine.className = "home-path-title-line";
      title.replaceChildren(firstLine, secondLine);
    } else if (title && card.title) {
      title.textContent = card.title;
    }

    renderMedia(element.querySelector("[data-cms-card-media]"), card);
  };

  fetch("content/home.json", { cache: "no-cache" })
    .then((response) => {
      if (!response.ok) throw new Error("Conteúdo da página inicial indisponível.");
      return response.json();
    })
    .then((content) => {
      const pathways = content && content.pathways;
      if (!pathways) return;

      setText("[data-cms-pathways-eyebrow]", pathways.eyebrow);
      setText("[data-cms-pathways-title]", pathways.title);
      setText("[data-cms-pathways-description]", pathways.description);

      const allCourses = section.querySelector("[data-cms-pathways-all]");
      if (allCourses && pathways.all_courses_label) {
        allCourses.textContent = pathways.all_courses_label;
      }
      setHref(allCourses, pathways.all_courses_href);

      if (Array.isArray(pathways.cards)) {
        pathways.cards.forEach(renderCard);
      }
    })
    .catch((error) => {
      console.warn("[Quatro Folhas] Conteúdo local da Home preservado.", error);
    });
})();

