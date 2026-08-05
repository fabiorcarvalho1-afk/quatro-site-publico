(function () {
  const page = document.querySelector("main#home");
  if (!page) return;

  const text = (element, value) => {
    if (!element || value === undefined || value === null) return;
    element.textContent = String(value);
  };

  const href = (element, value) => {
    if (!element || typeof value !== "string") return;
    const nextHref = value.trim();
    if (!nextHref || /^javascript:/i.test(nextHref)) return;
    element.setAttribute("href", nextHref);
  };

  const image = (element, source, alt) => {
    if (!element) return;
    if (typeof source === "string" && source.trim()) {
      element.setAttribute("src", source.trim());
    }
    if (typeof alt === "string") element.setAttribute("alt", alt);
  };

  const background = (element, source, alt) => {
    if (!element) return;
    if (typeof source === "string" && source.trim()) {
      element.style.backgroundImage = `url("${source.trim()}")`;
    }
    if (typeof alt === "string") element.setAttribute("aria-label", alt);
  };

  const section = (name) => page.querySelector(`[data-cms-section="${name}"]`);

  const renderHeading = (root, data) => {
    if (!root || !data) return;
    root.querySelectorAll("[data-cms-field]").forEach((element) => {
      text(element, data[element.dataset.cmsField]);
    });
  };

  const renderItems = (root, items, options) => {
    if (!root || !Array.isArray(items)) return;

    items.forEach((item, index) => {
      const element = root.querySelector(`[data-cms-item="${index}"]`);
      if (!element || !item) return;

      element.querySelectorAll("[data-cms-item-field]").forEach((field) => {
        text(field, item[field.dataset.cmsItemField]);
      });

      const itemLink = element.querySelector("[data-cms-item-link]");
      if (itemLink) {
        text(itemLink, item.cta);
        href(itemLink, item.href);
      }

      const itemButton = element.querySelector("[data-cms-item-button]");
      if (itemButton) {
        text(itemButton, item.button || item.cta);
        if (item.title) itemButton.dataset.interest = item.title;
        if (item.date) itemButton.dataset.date = item.date;
      }

      image(element.querySelector("[data-cms-item-image]"), item.image, item.alt);

      if (item.category) element.dataset.category = item.category;

      const status = element.querySelector(".thematic-status");
      if (status && typeof item.urgent === "boolean") {
        status.classList.toggle("is-urgent", item.urgent);
      }

      if (options && typeof options.afterItem === "function") {
        options.afterItem(element, item, index);
      }
    });
  };

  const renderHero = (data) => {
    const root = section("hero");
    if (!root || !data) return;

    const media = root.querySelector("[data-cms-hero-media]");
    const video = root.querySelector("#heroVideo");
    const reel = root.querySelector(".hero-demo-reel");

    if (media && data.aria_label) media.setAttribute("aria-label", data.aria_label);

    if (video) {
      if (data.poster) video.poster = data.poster;
      const sources = [data.video, data.fallback_video];
      sources.forEach((source, index) => {
        const element = video.querySelector(`[data-cms-hero-video="${index}"]`);
        if (element && source) element.src = source;
      });

      const showVideo = data.media_type !== "image" && Boolean(data.video);
      video.hidden = !showVideo;
      if (reel) reel.hidden = data.media_type === "image";

      if (data.media_type === "image") {
        background(media, data.poster, data.aria_label);
        document.documentElement.classList.remove("hero-video-ready");
      } else {
        media.style.backgroundImage = data.poster ? `url("${data.poster}")` : "";
        video.load();
        const playAttempt = video.play();
        if (playAttempt && typeof playAttempt.catch === "function") {
          playAttempt.catch(function () {});
        }
      }
    }

    if (Array.isArray(data.fallback_images)) {
      data.fallback_images.forEach((source, index) => {
        background(root.querySelector(`[data-cms-hero-fallback="${index}"]`), source);
      });
    }

    text(root.querySelector("[data-cms-hero-eyebrow]"), data.eyebrow);
    text(root.querySelector("[data-cms-hero-title]"), data.title);
    text(root.querySelector("[data-cms-hero-description]"), data.description);

    if (Array.isArray(data.buttons)) {
      data.buttons.forEach((button, index) => {
        const desktop = root.querySelector(`[data-cms-hero-button="${index}"]`);
        text(desktop, button.label);
        href(desktop, button.href);
      });
    }

    if (data.mobile) {
      text(root.querySelector("[data-cms-hero-mobile-label]"), data.mobile.label);
      text(root.querySelector("[data-cms-hero-mobile-eyebrow]"), data.mobile.eyebrow);
      text(root.querySelector("[data-cms-hero-mobile-title]"), data.mobile.title);
      text(root.querySelector("[data-cms-hero-mobile-description]"), data.mobile.description);
      const mobileButton = root.querySelector("[data-cms-hero-mobile-button]");
      text(mobileButton, data.mobile.button_label);
      href(mobileButton, data.mobile.button_href);
      if (Array.isArray(data.mobile.proofs)) {
        data.mobile.proofs.forEach((value, index) => {
          text(root.querySelector(`[data-cms-hero-mobile-proof="${index}"]`), value);
        });
      }
    }
  };

  const renderSimpleSection = (name, data) => {
    const root = section(name);
    if (!root || !data) return;
    renderHeading(root, data);
    renderItems(root, data.cards || data.items);
  };

  const renderPathways = (data) => {
    const root = document.querySelector("[data-cms-home-pathways]");
    if (!root || !data) return;

    text(root.querySelector("[data-cms-pathways-eyebrow]"), data.eyebrow);
    text(root.querySelector("[data-cms-pathways-title]"), data.title);
    text(root.querySelector("[data-cms-pathways-description]"), data.description);

    const allCourses = root.querySelector("[data-cms-pathways-all]");
    text(allCourses, data.all_courses_label);
    href(allCourses, data.all_courses_href);

    if (!Array.isArray(data.cards)) return;
    data.cards.forEach((card) => {
      if (!card || !card.id) return;
      const element = root.querySelector(`[data-cms-card="${card.id}"]`);
      if (!element) return;

      href(element, card.href);
      text(element.querySelector("[data-cms-card-label]"), card.label);
      text(element.querySelector("[data-cms-card-description]"), card.description);
      text(element.querySelector("[data-cms-card-cta]"), card.cta);

      const title = element.querySelector("[data-cms-card-title]");
      if (title && card.id === "professional" && card.title_line_1 && card.title_line_2) {
        const firstLine = document.createElement("span");
        const secondLine = document.createElement("span");
        firstLine.textContent = card.title_line_1;
        secondLine.textContent = card.title_line_2;
        secondLine.className = "home-path-title-line";
        title.replaceChildren(firstLine, secondLine);
      } else {
        text(title, card.title);
      }

      const media = element.querySelector("[data-cms-card-media]");
      if (!media) return;
      if (typeof card.alt === "string") media.setAttribute("aria-label", card.alt);

      media.replaceChildren();
      background(media, card.image, card.alt);
    });
  };

  const renderKids = (data) => {
    const root = section("kids");
    if (!root || !data) return;
    renderHeading(root, data);
    renderItems(root, data.cards);
  };

  const renderEnterprise = (data) => {
    const root = section("enterprise");
    if (!root || !data) return;
    renderHeading(root, data);
    renderItems(root, data.cards);

    const proposal = root.querySelector('[data-cms-link="proposal"]');
    text(proposal, data.proposal_label);
    href(proposal, data.proposal_href);
  };

  const renderCareer = (data) => {
    const root = section("career");
    if (!root || !data) return;
    renderHeading(root, data);
    image(root.querySelector("[data-cms-image]"), data.image, data.alt);

    const primary = root.querySelector('[data-cms-link="primary"]');
    const secondary = root.querySelector('[data-cms-link="secondary"]');
    text(primary, data.primary_label);
    href(primary, data.primary_href);
    text(secondary, data.secondary_label);
    href(secondary, data.secondary_href);
  };

  const renderSchool = (data) => {
    const root = section("school");
    if (!root || !data) return;
    renderHeading(root, data);
    background(root.querySelector("[data-cms-background-image]"), data.image, data.alt);

    if (Array.isArray(data.items)) {
      data.items.forEach((value, index) => {
        text(root.querySelector(`[data-cms-school-item="${index}"]`), value);
      });
    }

    const primary = root.querySelector('[data-cms-link="primary"]');
    const secondary = root.querySelector('[data-cms-link="secondary"]');
    text(primary, data.primary_label);
    href(primary, data.primary_href);
    text(secondary, data.secondary_label);
    href(secondary, data.secondary_href);
  };

  const renderGallery = (data) => {
    const root = section("gallery");
    if (!root || !data) return;
    renderHeading(root, data);
    renderItems(root, data.items);
  };

  const renderContact = (data) => {
    const root = section("contact");
    if (!root || !data) return;
    renderHeading(root, data);

    const form = root.querySelector("[data-cms-contact-form]");
    const message = root.querySelector("[data-cms-message]");
    const button = root.querySelector("[data-cms-contact-button]");
    if (form && data.success) form.dataset.successText = data.success;
    if (message && data.message_placeholder) message.placeholder = data.message_placeholder;
    text(button, data.button);
  };

  fetch("content/home.json", { cache: "no-cache" })
    .then((response) => {
      if (!response.ok) throw new Error("Conteúdo da página inicial indisponível.");
      return response.json();
    })
    .then((content) => {
      renderHero(content.hero);

      const intent = section("intent");
      if (intent && content.intent) {
        renderHeading(intent, content.intent);
        renderItems(intent, content.intent.cards, {
          afterItem: (element, item) => href(element, item.href)
        });
      }

      renderSimpleSection("differentials", content.differentials);
      renderSimpleSection("media_highlights", content.media_highlights);
      renderPathways(content.pathways);
      renderKids(content.kids);
      renderEnterprise(content.enterprise);
      renderCareer(content.career);
      renderSchool(content.school);
      renderGallery(content.gallery);
      renderContact(content.contact);
    })
    .catch((error) => {
      console.warn("[Quatro Folhas] Conteúdo local da Home preservado.", error);
    });
})();
