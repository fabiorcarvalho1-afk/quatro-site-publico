(function () {
  const catalog = document.querySelector("[data-cms-course-catalog]");
  const grid = catalog && catalog.querySelector("[data-cms-course-grid]");
  if (!catalog || !grid) return;

  const setText = (selector, value) => {
    const element = catalog.querySelector(selector);
    if (element && value !== undefined && value !== null) {
      element.textContent = String(value);
    }
  };

  const safeHref = (value) => {
    if (typeof value !== "string") return "#matricula";
    const href = value.trim();
    return href && !/^javascript:/i.test(href) ? href : "#matricula";
  };

  const createTag = (label, className) => {
    const tag = document.createElement("span");
    tag.className = className;
    tag.textContent = label;
    return tag;
  };

  const createCourseCard = (course) => {
    const article = document.createElement("article");
    article.className = "catalog-course-card";

    if (typeof course.anchor === "string" && /^[A-Za-z][A-Za-z0-9_-]*$/.test(course.anchor)) {
      article.id = course.anchor;
    }

    const media = document.createElement("span");
    media.className = "course-card-media";
    media.setAttribute("role", "img");
    media.setAttribute("aria-label", course.alt || course.title || "Curso da Quatro Folhas");
    if (course.image) media.style.backgroundImage = `url("${course.image}")`;

    const body = document.createElement("div");
    body.className = "course-card-body";

    const tags = document.createElement("div");
    tags.className = "course-card-tags";
    tags.appendChild(
      createTag(
        course.type || "Curso",
        course.professional ? "tag professional-tag" : "tag"
      )
    );
    if (course.high_demand) {
      tags.appendChild(createTag("Alta demanda", "tag demand-tag"));
    }

    const title = document.createElement("h3");
    title.textContent = course.title || "Curso";

    const description = document.createElement("p");
    description.className = "course-description";
    description.textContent = course.description || "";

    const duration = document.createElement("p");
    duration.className = "course-start";
    duration.textContent = course.duration || "";

    const link = document.createElement("a");
    link.className = "course-card-cta";
    link.href = safeHref(course.href);
    link.textContent = course.cta || "Conhecer curso";

    body.append(tags, title, description, duration, link);
    article.append(media, body);
    return article;
  };

  fetch("content/courses.json", { cache: "no-cache" })
    .then((response) => {
      if (!response.ok) throw new Error("Catálogo de cursos indisponível.");
      return response.json();
    })
    .then((content) => {
      const data = content && content.catalog;
      if (!data || !Array.isArray(data.courses)) return;

      setText("[data-cms-catalog-eyebrow]", data.eyebrow);
      setText("[data-cms-catalog-title]", data.title);
      setText("[data-cms-catalog-description]", data.description);

      const courses = data.courses
        .filter((course) => course && course.visible !== false)
        .sort((a, b) => Number(a.order || 0) - Number(b.order || 0));

      const fragment = document.createDocumentFragment();
      courses.forEach((course) => fragment.appendChild(createCourseCard(course)));

      grid.replaceChildren(fragment);
    })
    .catch((error) => {
      console.warn("[Quatro Folhas] Catálogo local preservado.", error);
    });
})();
