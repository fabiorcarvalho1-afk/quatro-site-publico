(() => {
  const create = (tag, className, text) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  };

  const formatDate = (value) => {
    const parts = String(value || "").split("-");
    return parts.length === 3 ? `${parts[2]}/${parts[1]}` : String(value || "");
  };

  const formatMonth = (value) => {
    const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    const month = Number(String(value || "").split("-")[1]);
    return months[month - 1] || "";
  };

  const formatTime = (value) => String(value || "").replace(":00", "h");
  const formatPrice = (value) => new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0
  }).format(Number(value) || 0);

  const emptyMessage = "Nenhuma aula temática cadastrada no momento.";

  const renderEmpty = (container, message = emptyMessage) => {
    if (!container) return;
    container.replaceChildren(create("p", "thematic-empty", message));
  };

  const categoryLabel = (value) => String(value || "")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/(^|\s)\S/g, (letter) => letter.toUpperCase());

  const renderFilters = (root, items) => {
    const filters = root?.querySelector(".thematic-filters");
    if (!filters) return;

    const categories = [...new Set(items.map((item) => String(item.category || "").trim()).filter(Boolean))];
    if (!categories.length) {
      filters.replaceChildren();
      filters.hidden = true;
      return;
    }

    filters.hidden = false;
    const all = create("button", "is-active", "Todas");
    all.type = "button";
    all.dataset.thematicFilter = "all";
    const buttons = categories.map((category) => {
      const button = create("button", "", categoryLabel(category));
      button.type = "button";
      button.dataset.thematicFilter = category;
      return button;
    });
    filters.replaceChildren(all, ...buttons);
  };

  const isUnavailable = (item) => {
    const status = String(item.status || "").toLowerCase();
    return item.vacancies === 0 || status === "esgotada" || status === "encerrada";
  };

  const configureButton = (button, item, label) => {
    button.type = "button";
    button.className = "solid-btn";
    button.textContent = isUnavailable(item) ? "Indisponível" : label;
    if (isUnavailable(item)) {
      button.disabled = true;
      return;
    }
    button.dataset.open = "class-form";
    button.dataset.interest = item.title || "";
    button.dataset.date = formatDate(item.date);
    button.dataset.content = item.details || item.description || "";
    button.dataset.includes = item.includes || "";
  };

  const renderThematicCard = (item) => {
    const article = create("article", "thematic-card");
    article.dataset.category = item.category || "cozinha";

    const figure = create("figure", "thematic-card-image");
    const image = create("img");
    image.src = item.image || "";
    image.alt = item.alt || item.title || "";
    image.loading = "lazy";
    const status = create("span", `thematic-status${item.urgent ? " is-urgent" : ""}`, item.status || "");
    figure.append(image, status);

    const body = create("div", "thematic-card-body");
    body.append(create("h3", "", item.title || ""), create("p", "", item.description || ""));

    const meta = create("div", "thematic-meta");
    [formatDate(item.date), formatTime(item.time), item.duration || ""].forEach((value) => meta.append(create("span", "", value)));

    const preparations = create("div", "thematic-preparations");
    preparations.append(create("strong", "", "Nesta aula você prepara"), create("span", "", item.preparations || ""));

    const footer = create("div", "thematic-card-footer");
    const price = create("span", "thematic-price");
    price.append(create("small", "", "por pessoa"), document.createTextNode(formatPrice(item.price)));
    const button = create("button");
    configureButton(button, item, item.button || "Reservar e comprar");
    footer.append(price, button);

    body.append(meta, preparations, footer);
    article.append(figure, body);
    return article;
  };

  const renderAgendaCard = (item, reserveLabel) => {
    const article = create("article", "agenda-card");
    const content = create("div");
    content.append(
      create("span", `tag${item.urgent ? " accent" : ""}`, item.status || ""),
      create("h3", "", item.title || ""),
      create("p", "", `${formatDate(item.date)} - ${formatTime(item.time)} - ${item.duration || ""} de experiência`),
      create("small", "", item.description || ""),
      create("small", "class-price", formatPrice(item.price))
    );
    const button = create("button");
    configureButton(button, item, reserveLabel);
    article.append(content, button);
    return article;
  };

  const renderHomeOrPage = (root, copy, items, limit) => {
    if (!root) return;
    const eyebrow = root.querySelector(".thematic-heading .eyebrow");
    const title = root.querySelector(".thematic-heading h2");
    const description = root.querySelector(".thematic-heading h2 + p");
    if (eyebrow) eyebrow.textContent = copy.eyebrow || "";
    if (title) title.textContent = copy.title || "";
    if (description) description.textContent = copy.description || "";

    const grid = root.querySelector("[data-thematic-grid]");
    if (grid) {
      const displayedItems = items.slice(0, limit || items.length);
      if (displayedItems.length) {
        grid.replaceChildren(...displayedItems.map(renderThematicCard));
        if (typeof window.enhanceDynamicTriggers === "function") window.enhanceDynamicTriggers(grid);
      } else {
        renderEmpty(grid);
      }
    }
    renderFilters(root, items);

    const allLink = root.querySelector(".thematic-all-link");
    if (allLink && copy.all_label) allLink.textContent = copy.all_label;
    if (allLink && copy.all_href) allLink.href = copy.all_href;
  };

  const renderAgenda = (content, items) => {
    const featureRoot = document.querySelector("[data-cms-agenda-feature]");
    const calendar = document.querySelector("[data-cms-agenda-calendar]");
    const listRoot = document.querySelector("[data-cms-agenda-list]");
    const headingRoot = document.querySelector("[data-cms-agenda-list-section]");
    const copy = content.agenda || {};
    const featured = items.find((item) => item.featured) || items[0];

    if (headingRoot) {
      const eyebrow = headingRoot.querySelector(".section-heading .eyebrow");
      const title = headingRoot.querySelector(".section-heading h2");
      const description = headingRoot.querySelector(".section-heading > p");
      if (eyebrow) eyebrow.textContent = copy.eyebrow || "";
      if (title) title.textContent = copy.title || "";
      if (description) description.textContent = copy.description || "";
    }

    if (featureRoot) {
      if (featured) {
        const meta = create("div", "agenda-meta");
        [formatDate(featured.date), formatTime(featured.time), featured.duration || "", copy.feature_note || ""]
          .forEach((value) => meta.append(create("span", "", value)));
        const button = create("button");
        configureButton(button, featured, copy.reserve_label || "Reservar vaga");
        featureRoot.replaceChildren(
          create("span", "tag accent", copy.feature_label || "Destaque da semana"),
          create("h2", "", featured.title || ""),
          create("p", "", featured.description || ""),
          meta,
          button
        );
        if (typeof window.enhanceDynamicTriggers === "function") window.enhanceDynamicTriggers(featureRoot);
      } else {
        renderEmpty(featureRoot);
      }
    }

    if (calendar) {
      if (items.length) {
        calendar.replaceChildren(...items.slice(0, 4).map((item) => {
          const day = String(item.date || "").split("-")[2] || "--";
          const cell = create("div");
          cell.append(create("strong", "", day), create("span", "", formatMonth(item.date)), create("small", "", item.title || ""));
          return cell;
        }));
      } else {
        renderEmpty(calendar);
      }
    }

    if (listRoot) {
      if (items.length) {
        listRoot.replaceChildren(...items.map((item) => renderAgendaCard(item, copy.reserve_label || "Reservar vaga")));
        if (typeof window.enhanceDynamicTriggers === "function") window.enhanceDynamicTriggers(listRoot);
      } else {
        renderEmpty(listRoot);
      }
    }
  };

  const apiUrl = "https://quatro-folhas-backend-api.onrender.com/thematic-registrations/public/classes";

  const dateParts = (value) => {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/Sao_Paulo",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).formatToParts(new Date(value));
    const read = (type) => parts.find((part) => part.type === type)?.value || "";
    return `${read("year")}-${read("month")}-${read("day")}`;
  };

  const timeParts = (value) => new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(new Date(value));

  const durationLabel = (startsAt, endsAt, workloadHours) => {
    const milliseconds = new Date(endsAt).getTime() - new Date(startsAt).getTime();
    const hours = milliseconds > 0 ? milliseconds / 3600000 : Number(workloadHours || 0);
    if (!hours) return "";
    return `${Number.isInteger(hours) ? hours : hours.toFixed(1).replace(".", ",")}h`;
  };

  const apiClassToItem = (item, index) => {
    const thematic = item.thematic || {};
    const course = item.course || {};
    const vacancies = Number(item.seatsAvailable ?? Math.max(0, Number(item.seats || 0) - Number(item.registrations || 0)));
    const unavailable = vacancies <= 0 || ["closed", "cancelled", "canceled"].includes(String(item.status || "").toLowerCase());
    return {
      id: item.id,
      title: item.name || course.title || "Aula temática",
      description: thematic.shortDescription || course.description || "",
      details: course.description || thematic.shortDescription || "",
      image: thematic.imageUrl || "assets/photos/cozinha-aula.jpg",
      alt: `Aula temática ${item.name || "Quatro Folhas"}`,
      category: thematic.publicCategory || "cozinha",
      date: dateParts(item.startsAt),
      time: timeParts(item.startsAt),
      duration: durationLabel(item.startsAt, item.endsAt, course.workloadHours),
      price: Number(thematic.priceCents ?? course.priceCents ?? 0) / 100,
      preparations: thematic.preparations || (course.lessons || []).map((lesson) => lesson.title).join(" · "),
      includes: thematic.includes || "",
      status: unavailable ? "Esgotada" : vacancies <= 3 ? "Últimas vagas" : "Inscrições abertas",
      urgent: !unavailable && vacancies <= 3,
      vacancies,
      featured: thematic.featured === true,
      visible: thematic.publicationStatus === "published",
      show_home: true,
      order: thematic.featured === true ? -1 : index
    };
  };

  const loadContent = async () => {
    const contentResponse = await fetch("content/thematic-classes.json", { cache: "no-cache" });
    if (!contentResponse.ok) throw new Error("Conteúdo de aulas temáticas indisponível.");
    const content = await contentResponse.json();

    try {
      const apiResponse = await fetch(apiUrl, { cache: "no-store" });
      if (!apiResponse.ok) throw new Error(`API respondeu ${apiResponse.status}`);
      const apiClasses = await apiResponse.json();
      if (Array.isArray(apiClasses)) content.classes = apiClasses.map(apiClassToItem);
    } catch (error) {
      console.warn("[Quatro Folhas] API indisponível; usando agenda local.", error);
    }

    return content;
  };

  loadContent()
    .then((content) => {
      const items = (content.classes || [])
        .filter((item) => item.visible !== false)
        .sort((a, b) => Number(a.order || 0) - Number(b.order || 0));
      const homeItems = items.filter((item) => item.show_home !== false);
      renderHomeOrPage(document.querySelector('[data-cms-thematic-source="home"]'), content.home || {}, homeItems, 3);
      renderHomeOrPage(document.querySelector('[data-cms-thematic-source="page"]'), content.page || {}, items);
      renderAgenda(content, items);
      if (typeof window.bindThematicFilters === "function") window.bindThematicFilters();
    })
    .catch((error) => {
      console.warn("[Quatro Folhas] Conteúdo local de aulas temáticas preservado.", error);
    });
})();
