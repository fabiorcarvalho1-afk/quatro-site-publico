const siteHeader = document.querySelector(".site-header");
const menuToggle = document.querySelector(".menu-toggle");
const modal = document.querySelector("#lead-modal");
const leadForm = document.querySelector("#lead-form");
const dynamicFields = document.querySelector("#dynamic-fields");
const modalTitle = document.querySelector("#modal-title");
const modalEyebrow = document.querySelector("#modal-eyebrow");
const successMessage = document.querySelector(".success-message");
const studentPortal = document.querySelector(".student-portal");
const portalToggle = document.querySelector(".portal-toggle");
const runtimeProtocol = window.location.protocol === "file:" ? "http:" : window.location.protocol;
const runtimeHostname = window.location.hostname || "127.0.0.1";
const SITE_API_URL = window.QF_API_URL || `${runtimeProtocol}//${runtimeHostname}:3001`;
const PORTAL_WEB_URL = window.QF_PORTAL_URL || `${runtimeProtocol}//${runtimeHostname}:3000`;
const PORTAL_LOGIN_URL = `${PORTAL_WEB_URL}/login`;
const TURNSTILE_SITE_KEY = "0x4AAAAAAD64c541osMVHz3x";
const AUTH_ACCESS_TOKEN_KEY = "qf_admin_access_token";
const AUTH_REFRESH_TOKEN_KEY = "qf_admin_refresh_token";
const AUTH_CURRENT_USER_KEY = "qf_current_user";
const currentPage = window.location.pathname.split("/").pop() || "index.html";


function installKidsSchoolsMenu() {
  const kidsLink = document.querySelector('.main-nav > a[href$="criancas-e-escolas.html"]');
  if (!kidsLink || kidsLink.closest('.kids-nav-item')) return;

  const item = document.createElement('div');
  item.className = 'nav-item has-mega kids-nav-item';
  kidsLink.parentNode.insertBefore(item, kidsLink);
  item.appendChild(kidsLink);
  kidsLink.classList.add('nav-link');
  kidsLink.setAttribute('aria-haspopup', 'true');
  kidsLink.setAttribute('aria-expanded', 'false');

  const menu = document.createElement('div');
  menu.className = 'mega-menu kids-mega-menu';
  menu.setAttribute('role', 'menu');
  menu.innerHTML = `
    <div class="kids-menu-heading">
      <strong>Crianças e Escolas</strong>
      <span>Escolha uma experiência</span>
    </div>
    <div class="kids-menu-links">
      <a href="mini-chef.html" role="menuitem">
        <strong>Mini Chef</strong>
        <span>Curso de gastronomia para crianças</span>
      </a>
      <a href="festa-infantil-gastronomica.html" role="menuitem">
        <strong>Festa Infantil</strong>
        <span>Comemoração com experiência gastronômica</span>
      </a>
      <a href="aulas-para-escolas.html" role="menuitem">
        <strong>Aulas para Escolas</strong>
        <span>Projetos gastronômicos para instituições</span>
      </a>
    </div>
  `;
  item.appendChild(menu);

  kidsLink.addEventListener('click', (event) => {
    const touchLayout = window.matchMedia('(max-width: 1060px), (hover: none) and (pointer: coarse)').matches;
    if (!touchLayout) return;
    if (!item.classList.contains('is-open')) {
      event.preventDefault();
      item.classList.add('is-open');
      kidsLink.setAttribute('aria-expanded', 'true');
    }
  });

  document.addEventListener('click', (event) => {
    if (item.contains(event.target)) return;
    item.classList.remove('is-open');
    kidsLink.setAttribute('aria-expanded', 'false');
  });
}

installKidsSchoolsMenu();


function simplifyCoursesMenu() {
  const coursesLink = document.querySelector('.nav-item.has-mega > a[href$="cursos.html"]');
  const item = coursesLink && coursesLink.closest('.nav-item.has-mega');
  const menu = item && item.querySelector('.mega-menu');
  if (!coursesLink || !item || !menu || item.classList.contains('courses-nav-item')) return;

  item.classList.add('kids-nav-item', 'courses-nav-item');
  coursesLink.setAttribute('aria-haspopup', 'true');
  coursesLink.setAttribute('aria-expanded', 'false');
  menu.classList.add('kids-mega-menu');
  menu.innerHTML = `
    <div class="kids-menu-heading">
      <strong>Cursos</strong>
      <span>Escolha sua formação</span>
    </div>
    <div class="kids-menu-links">
      <a href="chef-profissional.html" role="menuitem">
        <strong>Chef Profissional</strong>
        <span>Formação prática em cozinha profissional</span>
      </a>
      <a href="confeitaria-profissional.html" role="menuitem">
        <strong>Confeitaria Profissional</strong>
        <span>Técnicas, produção e rotina de confeitaria</span>
      </a>
      <a href="cursos-rapidos.html" role="menuitem">
        <strong>Cursos Rápidos</strong>
        <span>Aprendizados específicos em formatos compactos</span>
      </a>
      <a href="mini-chef.html" role="menuitem">
        <strong>Mini Chef</strong>
        <span>Experiência gastronômica para crianças</span>
      </a>
    </div>
  `;

  coursesLink.addEventListener('click', (event) => {
    const touchLayout = window.matchMedia('(max-width: 1060px), (hover: none) and (pointer: coarse)').matches;
    if (!touchLayout) return;
    if (!item.classList.contains('is-open')) {
      event.preventDefault();
      document.querySelectorAll('.nav-item.has-mega.is-open').forEach((openItem) => {
        if (openItem !== item) openItem.classList.remove('is-open');
      });
      item.classList.add('is-open');
      coursesLink.setAttribute('aria-expanded', 'true');
    }
  });

  document.addEventListener('click', (event) => {
    if (item.contains(event.target)) return;
    item.classList.remove('is-open');
    coursesLink.setAttribute('aria-expanded', 'false');
  });
}

simplifyCoursesMenu();

const portalStatusLabels = {
  open: "Inscricoes abertas",
  in_progress: "Em andamento",
  planned: "Programacao aberta",
  active: "Turma ativa"
};

function formatCurrencyCents(valueCents) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format((Number(valueCents) || 0) / 100);
}

function formatDateOnly(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit"
  }).format(date);
}

function formatDateTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

function formatMonthLabel(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("pt-BR", { month: "short" }).format(date).replace(".", "");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function readJsonResponse(response) {
  return response.text().then((raw) => {
    if (!raw) return {};
    try {
      return JSON.parse(raw);
    } catch (error) {
      return { message: raw };
    }
  });
}

async function apiRequest(path, init) {
  const response = await fetch(`${SITE_API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {})
    }
  });

  if (!response.ok) {
    const payload = await readJsonResponse(response);
    const message = Array.isArray(payload?.message)
      ? payload.message.join(" | ")
      : payload?.message || "Falha ao conectar com a escola.";
    throw new Error(message);
  }

  return readJsonResponse(response);
}

function getFieldValue(formData, ...keys) {
  for (const key of keys) {
    const value = formData[key];
    if (value) return String(value).trim();
  }
  return "";
}

function formToObject(form) {
  const data = {};
  new FormData(form).forEach((value, key) => {
    if (typeof value !== "string") return;
    data[key] = value.trim();
  });
  return data;
}

function ensureFeedback(form, className = "form-feedback") {
  let feedback = form.querySelector(`.${className}`);
  if (!feedback) {
    feedback = document.createElement("p");
    feedback.className = className;
    form.appendChild(feedback);
  }
  return feedback;
}

function setButtonLoading(button, text) {
  if (!button) return () => {};
  const originalText = button.textContent;
  const originalDisabled = button.disabled;
  button.disabled = true;
  button.textContent = text;
  return () => {
    button.disabled = originalDisabled;
    button.textContent = originalText;
  };
}

function savePortalTokens(tokens) {
  window.localStorage.setItem(AUTH_ACCESS_TOKEN_KEY, tokens.accessToken);
  window.localStorage.setItem(AUTH_REFRESH_TOKEN_KEY, tokens.refreshToken);
  if (tokens.user) {
    window.localStorage.setItem(AUTH_CURRENT_USER_KEY, JSON.stringify(tokens.user));
  }
}

function buildPortalHandoffUrl(tokens) {
  const handoff = encodeURIComponent(JSON.stringify(tokens));
  return `${PORTAL_LOGIN_URL}#handoff=${handoff}`;
}

async function submitLead(payload) {
  if (!payload?.payload?.turnstileToken) {
    const error = new Error("Conclua a verificação de segurança antes de enviar.");
    error.code = "TURNSTILE_REQUIRED";
    throw error;
  }

  return apiRequest("/site/leads", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

function buildLeadPayload(form, source, extraPayload = {}) {
  const data = formToObject(form);
  const turnstileToken = getTurnstileToken(form);
  delete data["cf-turnstile-response"];
  const allTextInputs = [...form.querySelectorAll("input[type='text'], input:not([type]), textarea")];
  const fallbackName = allTextInputs[0]?.value?.trim() || "Lead site Quatro Folhas";
  const fallbackMessage = form.querySelector("textarea")?.value?.trim() || "";
  const fallbackPhone = form.querySelector("input[type='tel']")?.value?.trim() || "";
  const fallbackEmail = form.querySelector("input[type='email']")?.value?.trim() || "";

  const name = getFieldValue(data, "nome", "name", "responsavel", "empresa", "escola") || fallbackName;
  const phone = getFieldValue(data, "whatsapp", "telefone", "phone") || fallbackPhone;
  const email = getFieldValue(data, "email") || fallbackEmail;
  const message = getFieldValue(data, "mensagem", "message", "descricao") || fallbackMessage;

  return {
    name,
    phone,
    email: email || undefined,
    source,
    message: message || undefined,
    payload: {
      page: window.location.href,
      turnstileToken,
      ...data,
      ...extraPayload
    }
  };
}

function whatsappLeadFallback(payload) {
  const text = encodeURIComponent(
    [
      "Ola! Quero falar com a Quatro Folhas.",
      payload.name ? `Nome: ${payload.name}` : "",
      payload.phone ? `WhatsApp: ${payload.phone}` : "",
      payload.email ? `E-mail: ${payload.email}` : "",
      payload.message ? `Mensagem: ${payload.message}` : "",
      payload.source ? `Origem: ${payload.source}` : ""
    ].filter(Boolean).join("\n")
  );
  window.open(`https://wa.me/5511947781922?text=${text}`, "_blank", "noreferrer");
}

function classStatusLabel(status) {
  return portalStatusLabels[status] || "Agenda aberta";
}

function describeCourse(course) {
  const parts = [];
  if (course.description) parts.push(course.description);
  if (course.workloadHours) parts.push(`${course.workloadHours} horas`);
  if (course.lessonsCount) parts.push(`${course.lessonsCount} aulas`);
  return parts.join(" • ");
}

function normalizePortalLoginFields() {
  document.querySelectorAll("[data-portal-login]").forEach((form) => {
    const identifierInput = form.querySelector("input[type='email']");
    if (identifierInput) {
      identifierInput.type = "text";
      identifierInput.placeholder = "Seu e-mail ou CPF";
      identifierInput.setAttribute("autocomplete", "username");
      identifierInput.setAttribute("inputmode", "text");
    }
  });
}

function mountHeroVideoReady() {
  const video = document.querySelector("#heroVideo");
  if (!video) return;

  const markReady = () => document.documentElement.classList.add("hero-video-ready");

  // If the video can load/play, hide the fallback reel quickly.
  video.addEventListener("loadeddata", markReady, { once: true });
  video.addEventListener("canplay", markReady, { once: true });
  video.addEventListener("playing", markReady, { once: true });

  // Some mobile browsers delay autoplay; try once and ignore errors.
  try {
    const p = video.play?.();
    if (p && typeof p.catch === "function") p.catch(() => {});
  } catch (e) {}
}

function mountWhatsappFab() {
  const isHome = document.body.classList.contains("home-page");
  if (isHome) return;

  // Hide the big header WhatsApp CTA on inner pages; use a small floating icon instead.
  const headerWhatsapp = document.querySelector(".header-whatsapp");
  if (headerWhatsapp) headerWhatsapp.style.display = "none";

  if (document.querySelector(".wa-fab")) return;

  const a = document.createElement("a");
  a.className = "wa-fab";
  a.href = "https://wa.me/5511947781922";
  a.target = "_blank";
  a.rel = "noreferrer";
  a.setAttribute("aria-label", "WhatsApp");
  a.innerHTML = `
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false">
      <path fill="currentColor" d="M20.5 3.5A11.8 11.8 0 0 0 12 0C5.4 0 .1 5.3.1 11.9c0 2.1.6 4.2 1.7 6.1L0 24l6.2-1.6a11.9 11.9 0 0 0 5.8 1.5h.1c6.6 0 11.9-5.3 11.9-11.9 0-3.2-1.2-6.2-3.5-8.5zM12 21.7h-.1c-1.9 0-3.8-.5-5.5-1.5l-.4-.2-3.7 1 1-3.6-.3-.4A9.8 9.8 0 0 1 2.2 12C2.2 6.6 6.6 2.2 12 2.2c2.6 0 5.1 1 6.9 2.9a9.7 9.7 0 0 1 2.8 6.9c0 5.4-4.4 9.7-9.7 9.7zm5.6-7.3c-.3-.2-1.7-.8-2-1s-.5-.2-.7.2-.8 1-.9 1.2-.3.3-.6.1a8 8 0 0 1-2.4-1.5 9 9 0 0 1-1.7-2.2c-.2-.3 0-.5.1-.6l.4-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.6s-.7-1.7-1-2.3c-.3-.7-.6-.6-.7-.6h-.6c-.2 0-.6.1-.9.4s-1.2 1.1-1.2 2.7 1.2 3.1 1.4 3.3c.2.2 2.4 3.6 5.8 5.1.8.4 1.4.6 1.9.8.8.2 1.6.2 2.2.1.7-.1 1.7-.7 1.9-1.4.2-.7.2-1.2.1-1.4-.1-.2-.3-.2-.6-.4z"/>
    </svg>
  `;
  document.body.appendChild(a);
}

const fieldTemplates = {
  "class-form": ({ interest, date, content, includes }) => ({
    title: "Reservar vaga",
    eyebrow: "Aula temática",
    fields: `
      ${content ? `
        <div class="class-detail-box">
          <h3>Conteúdo da aula</h3>
          <p>${content}</p>
          ${includes ? `<small>${includes}</small>` : ""}
        </div>
      ` : ""}
      <label>
        Aula de interesse
        <input name="aula" type="text" value="${interest || ""}" required>
      </label>
      <label>
        Data da aula
        <input name="data" type="text" value="${date || ""}" required>
      </label>
      <label>
        Número de participantes
        <input name="participantes" type="number" min="1" value="1" required>
      </label>
    `
  }),
  "course-form": ({ interest }) => ({
    title: "Quero me matricular",
    eyebrow: "Curso",
    fields: `
      <label>
        Curso de interesse
        <input name="curso" type="text" value="${interest || ""}" required>
      </label>
      <label>
        Turma desejada
        <input name="turma" type="text" placeholder="Informe a turma ou período desejado">
      </label>
      <label>
        Melhor horário para contato
        <input name="horario" type="text" placeholder="Manhã, tarde ou noite">
      </label>
      <label>
        Como conheceu a escola
        <input name="origem" type="text" placeholder="Instagram, Google, indicação...">
      </label>
      <label>
        Mensagem opcional
        <textarea name="mensagem" rows="3" placeholder="Conte seu objetivo ou dúvida sobre o curso."></textarea>
      </label>
    `
  }),
  "party-form": () => ({
    title: "Solicitar proposta",
    eyebrow: "Festa infantil gastronômica",
    fields: `
      <label>
        Idade da criança
        <input name="idade" type="text" required>
      </label>
      <label>
        Data desejada
        <input name="data" type="text" required>
      </label>
      <label>
        Número estimado de crianças
        <input name="criancas" type="number" min="1" required>
      </label>
      <label>
        Tema de interesse
        <input name="tema" type="text" placeholder="Pizza, cupcake, cookies...">
      </label>
      <label>
        Mensagem
        <textarea name="mensagem" rows="3" placeholder="Conte o estilo da festa, perfil das crianças e qualquer ideia especial."></textarea>
      </label>
    `
  }),
  "school-form": () => ({
    title: "Montar projeto",
    eyebrow: "Aulas para escolas",
    fields: `
      <label>
        Escola
        <input name="escola" type="text" required>
      </label>
      <label>
        Cargo
        <input name="cargo" type="text" required>
      </label>
      <label>
        Faixa etária dos alunos
        <input name="faixa" type="text" required>
      </label>
      <label>
        Formato de interesse
        <select name="formato" required>
          <option value="">Selecione</option>
          <option>Aula na Quatro Folhas</option>
          <option>Aula dentro da escola</option>
          <option>Projeto recorrente</option>
          <option>Evento especial</option>
        </select>
      </label>
      <label>
        Mensagem
        <textarea name="mensagem" rows="3" placeholder="Conte o objetivo pedagógico, quantidade de alunos e data desejada."></textarea>
      </label>
    `
  }),
  "business-form": ({ interest }) => ({
    title: "Solicitar proposta",
    eyebrow: "Empresas e marcas",
    fields: `
      <label>
        Empresa
        <input name="empresa" type="text" required>
      </label>
      <label>
        Cargo
        <input name="cargo" type="text" required>
      </label>
      <label>
        Interesse
        <input name="interesse" type="text" value="${interest || ""}" required>
      </label>
      <label>
        Data ou período desejado
        <input name="periodo" type="text" placeholder="Informe uma data, mês ou janela flexível">
      </label>
      <label>
        Mensagem
        <textarea name="mensagem" rows="3" placeholder="Conte o objetivo da empresa, perfil do grupo e formato desejado."></textarea>
      </label>
    `
  }),
  "job-form": () => ({
    title: "Cadastrar vaga",
    eyebrow: "Banco de oportunidades",
    fields: `
      <label>
        Empresa
        <input name="empresa" type="text" required>
      </label>
      <label>
        Responsável
        <input name="responsavel" type="text" required>
      </label>
      <label>
        Cargo da vaga
        <input name="cargo-vaga" type="text" required>
      </label>
      <label>
        Local
        <input name="local" type="text" required>
      </label>
      <label>
        Tipo de contratação
        <input name="contratacao" type="text" placeholder="CLT, estágio, freelancer...">
      </label>
      <label>
        Descrição da oportunidade
        <textarea name="descricao" rows="4" required placeholder="Descreva atividades, requisitos, jornada e como será a candidatura."></textarea>
      </label>
      <label>
        Como se candidatar
        <input name="candidatura" type="text" required placeholder="WhatsApp, e-mail ou link de candidatura">
      </label>
    `
  })
};

menuToggle?.addEventListener("click", () => {
  const isOpen = siteHeader.classList.toggle("is-open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
});

mountWhatsappFab();
mountHeroVideoReady();

portalToggle?.addEventListener("click", (event) => {
  event.stopPropagation();
  const isOpen = studentPortal.classList.toggle("is-open");
  portalToggle.setAttribute("aria-expanded", String(isOpen));
});

document.addEventListener("click", (event) => {
  if (!studentPortal?.contains(event.target)) {
    studentPortal?.classList.remove("is-open");
    portalToggle?.setAttribute("aria-expanded", "false");
  }
});

document.addEventListener("click", (event) => {
  const target = event.target instanceof Element ? event.target : null;
  const closeButton = target?.closest(".modal-close");
  if (!closeButton) return;

  event.preventDefault();
  event.stopPropagation();
  const dialog = closeButton.closest("dialog");
  if (dialog?.open) dialog.close("cancel");
});

modal?.addEventListener("click", (event) => {
  if (event.target === modal && modal.open) {
    modal.close("cancel");
  }
});

modal?.addEventListener("close", () => {
  leadForm?.reset();
  if (leadForm) resetTurnstile(leadForm);
});

document.querySelectorAll("[data-open]").forEach((trigger) => {
  trigger.dataset.bound = "true";
  trigger.addEventListener("click", () => {
    const type = trigger.dataset.open;
    const template = fieldTemplates[type]?.({
      interest: trigger.dataset.interest,
      date: trigger.dataset.date,
      content: trigger.dataset.content,
      includes: trigger.dataset.includes
    });

    if (!template || !modal) return;

    successMessage.hidden = true;
    successMessage.textContent = trigger.dataset.successText || {
      "class-form": "Obrigado pelo seu interesse! Recebemos sua solicitação de reserva. Nossa equipe já entrará em contato pelo WhatsApp para confirmar a vaga e enviar o link de pagamento.",
      "course-form": "Recebemos seu interesse. Nossa equipe entrará em contato pelo WhatsApp para orientar sobre turma, disponibilidade e próximos passos.",
      "party-form": "Recebemos seu pedido. Nossa equipe entrará em contato pelo WhatsApp para montar a proposta da festa.",
      "school-form": "Recebemos seu pedido. Nossa equipe entrará em contato pelo WhatsApp para entender o projeto da escola.",
      "business-form": "Recebemos sua solicitação. Nossa equipe entrará em contato para preparar a proposta.",
      "job-form": "Recebemos sua solicitação. Nossa equipe entrará em contato pelo WhatsApp para orientar o envio ou aprovação da vaga."
    }[type] || "Recebemos sua solicitação. Nossa equipe entrará em contato pelo WhatsApp.";
    modalTitle.textContent = template.title;
    modalEyebrow.textContent = template.eyebrow;
    dynamicFields.innerHTML = template.fields;
    leadForm.dataset.leadSource = type || "site_modal";
    leadForm.dataset.leadInterest = trigger.dataset.interest || "";
    leadForm.dataset.leadDate = trigger.dataset.date || "";
    leadForm.dataset.leadContent = trigger.dataset.content || "";
    leadForm.reset();
    modal.showModal();
  });
});

leadForm?.addEventListener("submit", (event) => {
  event.preventDefault();
  const button = leadForm.querySelector("button[type='submit']");
  const feedback = ensureFeedback(leadForm);
  if (!getTurnstileToken(leadForm)) {
    feedback.textContent = "Conclua a verificação de segurança antes de enviar.";
    return;
  }
  const stopLoading = setButtonLoading(button, "Enviando");
  const payload = buildLeadPayload(leadForm, leadForm.dataset.leadSource || "site_modal", {
    interest: leadForm.dataset.leadInterest || "",
    date: leadForm.dataset.leadDate || "",
    content: leadForm.dataset.leadContent || ""
  });

  submitLead(payload)
    .then(() => {
      successMessage.hidden = false;
      leadForm.reset();
      resetTurnstile(leadForm);
    })
    .catch((error) => {
      if (isTurnstileError(error)) {
        feedback.textContent = error.message || "Não foi possível validar a verificação de segurança.";
        resetTurnstile(leadForm);
        return;
      }
      whatsappLeadFallback(payload);
      successMessage.hidden = false;
      successMessage.textContent = "Recebemos seu interesse. Vamos continuar pelo WhatsApp.";
      resetTurnstile(leadForm);
    })
    .finally(() => {
      stopLoading();
    });
});

const isBackofficePage = /\/(admin|portal)-/.test(window.location.pathname);
const turnstileWidgets = new WeakMap();

const securityCheckMarkup = `
  <div class="turnstile-check" data-turnstile-container aria-label="Verificação de segurança"></div>
  <label class="spam-trap" aria-hidden="true">
    Site
    <input type="text" name="website" tabindex="-1" autocomplete="off">
  </label>
`;

function getTurnstileToken(form) {
  return String(form?.querySelector("[name='cf-turnstile-response']")?.value || "").trim();
}

function isTurnstileError(error) {
  return error?.code === "TURNSTILE_REQUIRED"
    || /captcha|turnstile|verifica[cç][aã]o de seguran[cç]a/i.test(String(error?.message || ""));
}

function resetTurnstile(form) {
  const widgetId = turnstileWidgets.get(form);
  if (widgetId !== undefined && window.turnstile) {
    window.turnstile.reset(widgetId);
  }
}

function loadTurnstile() {
  if (window.turnstile) return Promise.resolve(window.turnstile);

  return new Promise((resolve, reject) => {
    const existing = document.querySelector("script[data-turnstile-script]");
    if (existing) {
      existing.addEventListener("load", () => resolve(window.turnstile), { once: true });
      existing.addEventListener("error", () => reject(new Error("Falha ao carregar a verificação de segurança.")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.defer = true;
    script.dataset.turnstileScript = "true";
    script.addEventListener("load", () => resolve(window.turnstile), { once: true });
    script.addEventListener("error", () => reject(new Error("Falha ao carregar a verificação de segurança.")), { once: true });
    document.head.appendChild(script);
  });
}

function renderTurnstileWidgets() {
  return loadTurnstile().then((turnstile) => {
    document.querySelectorAll("[data-turnstile-container]").forEach((container) => {
      const form = container.closest("form");
      if (!form || turnstileWidgets.has(form)) return;

      const widgetId = turnstile.render(container, {
        sitekey: TURNSTILE_SITE_KEY,
        theme: "light",
        language: document.documentElement.lang || "pt-BR",
        size: window.matchMedia("(max-width: 380px)").matches ? "compact" : "flexible",
        appearance: "always",
        "error-callback": () => {
          const feedback = ensureFeedback(form);
          feedback.textContent = "Não foi possível carregar a verificação de segurança. Atualize a página e tente novamente.";
          feedback.hidden = false;
        },
        "expired-callback": () => resetTurnstile(form),
        "timeout-callback": () => resetTurnstile(form)
      });

      turnstileWidgets.set(form, widgetId);
    });
  });
}

if (!isBackofficePage) {
  document.querySelectorAll("[data-demo-form], [data-whatsapp-optin], #lead-form").forEach((form) => {
    if (form.querySelector("[data-turnstile-container]")) return;
    const button = form.querySelector("button[type='submit']");
    const footerConsent = form.matches("[data-whatsapp-optin]")
      ? form.querySelector(".footer-consent")
      : null;
    const insertionPoint = footerConsent || button;
    if (insertionPoint) insertionPoint.insertAdjacentHTML("beforebegin", securityCheckMarkup);
  });

  renderTurnstileWidgets().catch(() => {
    document.querySelectorAll("[data-turnstile-container]").forEach((container) => {
      const form = container.closest("form");
      if (!form) return;
      const feedback = ensureFeedback(form);
      feedback.textContent = "Não foi possível carregar a verificação de segurança. Atualize a página e tente novamente.";
      feedback.hidden = false;
    });
  });
}

document.querySelectorAll("[data-demo-form]").forEach((form) => {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const button = form.querySelector("button[type='submit']");
    const feedback = ensureFeedback(form);
    if (form.querySelector("[name='website']")?.value) {
      feedback.textContent = "Nao foi possivel enviar a mensagem. Tente novamente.";
      return;
    }
    if (!getTurnstileToken(form)) {
      feedback.textContent = "Conclua a verificação de segurança antes de enviar.";
      return;
    }
    const stopLoading = setButtonLoading(button, "Enviando");
    const source = form.dataset.source || `site_${currentPage.replace(".html", "")}`;
    const payload = buildLeadPayload(form, source);

    try {
      await submitLead(payload);
      feedback.textContent = form.dataset.successText || "Recebemos sua mensagem. Nossa equipe entrara em contato pelo WhatsApp.";
      form.reset();
      resetTurnstile(form);
    } catch (error) {
      if (isTurnstileError(error)) {
        feedback.textContent = error.message || "Não foi possível validar a verificação de segurança.";
        resetTurnstile(form);
        return;
      }
      whatsappLeadFallback(payload);
      feedback.textContent = "Recebemos seu interesse. Vamos continuar o atendimento pelo WhatsApp.";
      resetTurnstile(form);
    } finally {
      stopLoading();
    }
  });
});

document.querySelectorAll("[data-portal-login]").forEach((form) => {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const button = form.querySelector("button[type='submit']");
    const identifier = form.querySelector("input[type='text'], input[type='email']")?.value?.trim() || "";
    const password = form.querySelector("input[type='password']")?.value || "";
    const feedback = ensureFeedback(form);
    const stopLoading = setButtonLoading(button, "Entrando");

    try {
      const tokens = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({ identifier, password })
      });

      savePortalTokens(tokens);
      feedback.textContent = "Acesso liberado. Abrindo o portal oficial do aluno...";
      window.location.href = buildPortalHandoffUrl(tokens);
    } catch (error) {
      feedback.textContent = error instanceof Error ? error.message : "Nao foi possivel entrar no portal.";
    } finally {
      stopLoading();
    }
  });
});

document.querySelectorAll("[data-admin-login]").forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const button = form.querySelector("button[type='submit']");
    button.textContent = "Entrando";
    setTimeout(() => {
      window.location.href = "admin.html";
    }, 450);
  });
});

const partnerProtectedPage = document.querySelector("[data-partner-protected]");
const partnerAccessGranted = sessionStorage.getItem("qf_partner_access") === "granted";

if (partnerProtectedPage && !partnerAccessGranted) {
  window.location.href = "parceiros-acesso.html";
}

document.querySelectorAll("[data-partner-login]").forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const button = form.querySelector("button[type='submit']");
    const feedback = form.querySelector(".form-feedback");
    button.textContent = "Liberando acesso";
    if (feedback) feedback.textContent = "Acesso liberado para o ambiente de parceiros.";
    sessionStorage.setItem("qf_partner_access", "granted");
    setTimeout(() => {
      window.location.href = "parceiros-area.html";
    }, 550);
  });
});

const franchiseProtectedPage = document.querySelector("[data-franchise-protected]");
const franchiseAccessGranted = sessionStorage.getItem("qf_franchise_access") === "granted";

if (franchiseProtectedPage && !franchiseAccessGranted) {
  window.location.href = "franquia-acesso.html";
}

document.querySelectorAll("[data-franchise-login]").forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const button = form.querySelector("button[type='submit']");
    const feedback = form.querySelector(".form-feedback");
    button.textContent = "Liberando acesso";
    if (feedback) feedback.textContent = "Acesso liberado para a area reservada de franquia.";
    sessionStorage.setItem("qf_franchise_access", "granted");
    setTimeout(() => {
      window.location.href = "franquia-area.html";
    }, 550);
  });
});

document.querySelectorAll("[data-certificate-validation]").forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const result = form.querySelector(".validation-result");
    const button = form.querySelector("button[type='submit']");
    if (result) result.hidden = false;
    if (button) button.textContent = "Certificado validado";
  });
});

const protectedContentPage = document.querySelector("[data-partner-protected], [data-franchise-protected]");

if (protectedContentPage) {
  document.body.classList.add("content-protected");
  const isEditableTarget = (target) => Boolean(target.closest?.("input, textarea, select, [contenteditable='true']"));

  document.addEventListener("contextmenu", (event) => {
    if (!isEditableTarget(event.target)) event.preventDefault();
  });

  document.addEventListener("copy", (event) => {
    if (!isEditableTarget(event.target)) event.preventDefault();
  });

  document.addEventListener("cut", (event) => {
    if (!isEditableTarget(event.target)) event.preventDefault();
  });

  document.addEventListener("selectstart", (event) => {
    if (!isEditableTarget(event.target)) event.preventDefault();
  });

  document.addEventListener("keydown", (event) => {
    const key = event.key.toLowerCase();
    const protectedShortcut = (event.ctrlKey || event.metaKey) && ["a", "c", "p", "s", "u"].includes(key);
    if (protectedShortcut && !isEditableTarget(event.target)) {
      event.preventDefault();
    }
  });
}

document.querySelectorAll("[data-whatsapp-optin]").forEach((form) => {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const tel = form.querySelector("input[name='whatsapp']");
    const feedback = form.querySelector(".footer-optin-feedback");
    if (form.querySelector("[name='website']")?.value) return;
    if (!getTurnstileToken(form)) {
      if (feedback) {
        feedback.textContent = "Conclua a verificação de segurança antes de enviar.";
        feedback.hidden = false;
      }
      return;
    }
    if (!tel) return;

    const valueRaw = String(tel.value || "").trim();
    if (!valueRaw) return;

    const normalizePhone = (value) => String(value).replace(/[^\d]+/g, "");

    const payload = {
      name: "Lead agenda e novidades",
      phone: normalizePhone(valueRaw),
      source: "site_optin",
      message: "Opt-in para agenda e novidades",
      payload: {
        consent: true,
        ts: new Date().toISOString(),
        page: window.location.href,
        userAgent: navigator.userAgent,
        turnstileToken: getTurnstileToken(form)
      }
    };

    const fallbackToWhatsApp = () => {
      const text = encodeURIComponent(
        `Olá! Quero receber a agenda de aulas e novidades da Quatro Folhas. Meu WhatsApp é: ${valueRaw}. Autorizo receber comunicações por WhatsApp (LGPD).`
      );
      window.open(`https://wa.me/5511947781922?text=${text}`, "_blank", "noreferrer");
    };

    const done = (ok) => {
      if (feedback) {
        feedback.textContent = ok ? "Obrigado! Cadastro recebido." : "Obrigado! Vamos te atender pelo WhatsApp.";
        feedback.hidden = false;
      }
      setTimeout(() => {
        if (feedback) feedback.hidden = true;
        form.reset();
        resetTurnstile(form);
      }, 2400);
    };

    try {
      await submitLead(payload);
      done(true);
    } catch (error) {
      if (isTurnstileError(error)) {
        if (feedback) {
          feedback.textContent = error.message || "Não foi possível validar a verificação de segurança.";
          feedback.hidden = false;
        }
        resetTurnstile(form);
        return;
      }
      fallbackToWhatsApp();
      done(false);
    }
  });
});

function renderAgendaCard(item) {
  const startsAt = formatDateTime(item.startsAt);
  const meta = [startsAt, item.course?.title].filter(Boolean).join(" • ");
  return `
    <article class="agenda-card">
      <div>
        <span class="tag">${escapeHtml(classStatusLabel(item.status))}</span>
        <h3>${escapeHtml(item.name || item.course?.title || "Aula Quatro Folhas")}</h3>
        <p>${escapeHtml(meta || "Programacao aberta")}</p>
        <small>${escapeHtml(item.course?.description || "Consulte a equipe para confirmar conteudo, carga e detalhes da aula.")}</small>
        ${item.seats ? `<small class="class-price">${escapeHtml(`${item.seats} vagas previstas`)}</small>` : ""}
      </div>
      <button class="solid-btn" data-open="class-form" data-interest="${escapeHtml(item.name || item.course?.title || "Aula Quatro Folhas")}" data-date="${escapeHtml(formatDateOnly(item.startsAt))}" data-content="${escapeHtml(item.course?.description || "")}" data-includes="Reserva assistida pela equipe Quatro Folhas.">Reservar vaga</button>
    </article>
  `;
}

function thematicCategory(item) {
  const text = `${item?.name || ""} ${item?.course?.title || ""} ${item?.course?.description || ""}`.toLowerCase();
  if (/confeit|bolo|doce|sobremesa|chocolate|torta/.test(text)) return "confeitaria";
  if (/massa|italian|pizza|focaccia|ravioli|nhoque/.test(text)) return "massas";
  return "cozinha";
}

function thematicImage(item, index = 0) {
  const category = thematicCategory(item);
  if (category === "confeitaria") return "assets/photos/aula-confeitaria.jpg";
  if (category === "massas") return "assets/photos/mesa-pratos.jpg";
  const fallbacks = [
    "assets/photos/cozinha-bancadas.jpg",
    "assets/photos/cozinha-qf.jpg",
    "assets/photos/equipamentos.jpg"
  ];
  return fallbacks[index % fallbacks.length];
}

function thematicPreparations(item) {
  const titles = [
    ...(Array.isArray(item?.lessons) ? item.lessons : []),
    ...(Array.isArray(item?.course?.lessons) ? item.course.lessons : [])
  ]
    .map((lesson) => String(lesson?.title || "").trim())
    .filter(Boolean);
  const unique = [...new Set(titles)].slice(0, 3);
  return unique.length ? unique : ["Conteúdo e preparos descritos pela equipe"];
}

function thematicDuration(item) {
  const start = item?.startsAt ? new Date(item.startsAt) : null;
  const end = item?.endsAt ? new Date(item.endsAt) : null;
  if (start && end && Number.isFinite(start.getTime()) && Number.isFinite(end.getTime()) && end > start) {
    const totalMinutes = Math.round((end.getTime() - start.getTime()) / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return [hours ? `${hours}h` : "", minutes ? `${minutes}min` : ""].filter(Boolean).join(" ");
  }
  return item?.course?.workloadHours ? `${item.course.workloadHours}h` : "Consulte";
}

function renderThematicCard(item, index = 0) {
  const title = item.name || item.course?.title || "Aula Quatro Folhas";
  const description = item.course?.description || "Uma experiência prática para aprender novos preparos e viver a gastronomia.";
  const date = formatDateOnly(item.startsAt) || "Data a confirmar";
  const time = formatDateTime(item.startsAt).split(" ").slice(-1)[0] || "Horário a confirmar";
  const preparations = thematicPreparations(item);
  const price = item.course?.priceCents ? formatCurrencyCents(item.course.priceCents) : "Consulte";
  const status = classStatusLabel(item.status);
  const category = thematicCategory(item);
  return `
    <article class="thematic-card" data-category="${escapeHtml(category)}">
      <figure class="thematic-card-image">
        <img src="${thematicImage(item, index)}" alt="${escapeHtml(title)}" loading="lazy">
        <span class="thematic-status">${escapeHtml(status)}</span>
      </figure>
      <div class="thematic-card-body">
        <h3>${escapeHtml(title)}</h3>
        <p>${escapeHtml(description)}</p>
        <div class="thematic-meta">
          <span>${escapeHtml(date)}</span>
          <span>${escapeHtml(time)}</span>
          <span>${escapeHtml(thematicDuration(item))}</span>
        </div>
        <div class="thematic-preparations">
          <strong>Nesta aula você prepara</strong>
          <span>${preparations.map(escapeHtml).join(" · ")}</span>
        </div>
        <div class="thematic-card-footer">
          <span class="thematic-price"><small>por pessoa</small>${escapeHtml(price)}</span>
          <button class="solid-btn" data-open="class-form" data-interest="${escapeHtml(title)}" data-date="${escapeHtml(date)}" data-content="${escapeHtml(description)}" data-includes="${escapeHtml(preparations.join(", "))}">Reservar e comprar</button>
        </div>
      </div>
    </article>
  `;
}

function bindThematicFilters() {
  const buttons = [...document.querySelectorAll("[data-thematic-filter]")];
  const grid = document.querySelector("[data-thematic-grid]");
  if (!grid || !buttons.length) return;
  buttons.forEach((button) => {
    if (button.dataset.thematicBound === "true") return;
    button.dataset.thematicBound = "true";
    button.addEventListener("click", () => {
      const filter = button.dataset.thematicFilter || "all";
      buttons.forEach((item) => item.classList.toggle("is-active", item === button));
      grid.querySelectorAll(".thematic-card").forEach((card) => {
        card.hidden = filter !== "all" && card.dataset.category !== filter;
      });
    });
  });
}

function renderCourseCard(course) {
  const nextClassText = course.nextClass?.startsAt
    ? `Proxima turma: ${formatDateTime(course.nextClass.startsAt)}`
    : "Nova turma sob consulta";
  const metaText = describeCourse(course);
  return `
    <article class="course-card">
      <div class="tag-row">
        <span class="tag">${escapeHtml(course.category?.name || "Curso")}</span>
        ${course.nextClass ? `<span class="tag hot">${escapeHtml(classStatusLabel(course.nextClass.status))}</span>` : ""}
      </div>
      <h3>${escapeHtml(course.title || "Curso Quatro Folhas")}</h3>
      <p>${escapeHtml(course.description || "Curso com acompanhamento pratico na Quatro Folhas.")}</p>
      ${metaText ? `<p class="course-start">${escapeHtml(metaText)}</p>` : ""}
      <p class="course-start">${escapeHtml(nextClassText)}</p>
      ${course.priceCents ? `<p class="course-start">${escapeHtml(formatCurrencyCents(course.priceCents))}</p>` : ""}
      <button class="text-btn" data-open="course-form" data-interest="${escapeHtml(course.title || "Curso Quatro Folhas")}">Tenho interesse</button>
    </article>
  `;
}

function enhanceDynamicTriggers(root = document) {
  root.querySelectorAll("[data-open]").forEach((trigger) => {
    if (trigger.dataset.bound === "true") return;
    trigger.dataset.bound = "true";
    trigger.addEventListener("click", () => {
      const type = trigger.dataset.open;
      const template = fieldTemplates[type]?.({
        interest: trigger.dataset.interest,
        date: trigger.dataset.date,
        content: trigger.dataset.content,
        includes: trigger.dataset.includes
      });

      if (!template || !modal) return;

      successMessage.hidden = true;
      modalTitle.textContent = template.title;
      modalEyebrow.textContent = template.eyebrow;
      dynamicFields.innerHTML = template.fields;
      leadForm.dataset.leadSource = type || "site_modal";
      leadForm.dataset.leadInterest = trigger.dataset.interest || "";
      leadForm.dataset.leadDate = trigger.dataset.date || "";
      leadForm.dataset.leadContent = trigger.dataset.content || "";
      leadForm.reset();
      modal.showModal();
    });
  });
}

async function loadSiteHome() {
  if (!document.body.classList.contains("home-page")) return;
  try {
    const [home, agendaItems] = await Promise.all([
      apiRequest("/site/home"),
      apiRequest("/site/agenda")
    ]);
    const agendaList = document.querySelector("[data-thematic-grid]");
    const coursesGrid = document.querySelector("#cursos .card-grid");
    const proofStrip = document.querySelector(".proof-strip");

    if (agendaList && Array.isArray(agendaItems) && agendaItems.length) {
      agendaList.innerHTML = agendaItems.map(renderThematicCard).join("");
      enhanceDynamicTriggers(agendaList);
      bindThematicFilters();
    }

    if (coursesGrid && Array.isArray(home.featuredCourses) && home.featuredCourses.length) {
      coursesGrid.innerHTML = home.featuredCourses.map(renderCourseCard).join("");
      enhanceDynamicTriggers(coursesGrid);
    }

    if (proofStrip && home.stats) {
      proofStrip.innerHTML = `
        <div><strong>${escapeHtml(String(home.stats.activeCourses || 0))} cursos</strong><span>ativos hoje na Quatro Folhas</span></div>
        <div><strong>${escapeHtml(String(home.stats.upcomingClasses || 0))} turmas</strong><span>com agenda aberta e programacao em andamento</span></div>
        <div><strong>Backend unico</strong><span>site, portal e app falando a mesma lingua</span></div>
        <div><strong>Portal do aluno</strong><span>dados sincronizados com financeiro, materiais e agenda</span></div>
      `;
    }
  } catch (error) {
    // Mantem o conteudo estatico se a API nao responder.
  }
}

async function loadAgendaPage() {
  if (currentPage !== "agenda.html") return;
  try {
    const [agendaItems, courses] = await Promise.all([
      apiRequest("/site/agenda"),
      apiRequest("/site/courses")
    ]);

    const featureCard = document.querySelector(".agenda-feature-card");
    const calendar = document.querySelector(".agenda-calendar");
    const agendaList = document.querySelector("#aulas .agenda-list");
    const coursesGrid = document.querySelector("#cursos .card-grid");
    const firstItem = Array.isArray(agendaItems) ? agendaItems[0] : null;

    if (featureCard && firstItem) {
      featureCard.innerHTML = `
        <span class="tag accent">Destaque da agenda</span>
        <h2>${escapeHtml(firstItem.name || firstItem.course?.title || "Agenda Quatro Folhas")}</h2>
        <p>${escapeHtml(firstItem.course?.description || "Programacao aberta com reserva assistida pela equipe.")}</p>
        <div class="agenda-meta">
          <span>${escapeHtml(formatDateOnly(firstItem.startsAt))}</span>
          <span>${escapeHtml(formatDateTime(firstItem.startsAt).split(" ").slice(-1)[0] || "")}</span>
          <span>${escapeHtml(firstItem.course?.title || "Quatro Folhas")}</span>
          <span>Reserva assistida</span>
        </div>
        <button class="solid-btn" data-open="class-form" data-interest="${escapeHtml(firstItem.name || firstItem.course?.title || "Aula Quatro Folhas")}" data-date="${escapeHtml(formatDateOnly(firstItem.startsAt))}" data-content="${escapeHtml(firstItem.course?.description || "")}" data-includes="Reserva assistida pela equipe Quatro Folhas.">Reservar vaga</button>
      `;
      enhanceDynamicTriggers(featureCard);
    }

    if (calendar && Array.isArray(agendaItems) && agendaItems.length) {
      calendar.innerHTML = agendaItems.slice(0, 4).map((item) => `
        <div><strong>${escapeHtml(formatDateOnly(item.startsAt).split("/")[0] || "--")}</strong><span>${escapeHtml(formatMonthLabel(item.startsAt))}</span><small>${escapeHtml(item.name || item.course?.title || "Aula Quatro Folhas")}</small></div>
      `).join("");
    }

    if (agendaList && Array.isArray(agendaItems) && agendaItems.length) {
      agendaList.innerHTML = agendaItems.map(renderAgendaCard).join("");
      enhanceDynamicTriggers(agendaList);
    }

    if (coursesGrid && Array.isArray(courses.items) && courses.items.length) {
      coursesGrid.innerHTML = courses.items.slice(0, 3).map(renderCourseCard).join("");
      enhanceDynamicTriggers(coursesGrid);
    }
  } catch (error) {
    // Mantem conteudo estatico.
  }
}

async function loadThematicClassesPage() {
  if (currentPage !== "aulas-tematicas.html") return;
  try {
    const agendaItems = await apiRequest("/site/agenda");
    const grid = document.querySelector("[data-thematic-grid]");
    if (!grid || !Array.isArray(agendaItems) || !agendaItems.length) return;
    grid.innerHTML = agendaItems.map(renderThematicCard).join("");
    enhanceDynamicTriggers(grid);
    bindThematicFilters();
  } catch (error) {
    // Mantém o conteúdo estático se a API não responder.
  }
}

async function loadCoursesPage() {
  if (currentPage !== "cursos.html") return;
  try {
    const response = await apiRequest("/site/courses");
    const grid = document.querySelector("#profissionais .card-grid");
    if (!grid || !Array.isArray(response.items) || !response.items.length) return;
    grid.innerHTML = response.items.map(renderCourseCard).join("");
    enhanceDynamicTriggers(grid);
  } catch (error) {
    // Mantem conteudo estatico.
  }
}

normalizePortalLoginFields();
enhanceDynamicTriggers(document);
bindThematicFilters();
loadSiteHome();
loadAgendaPage();
loadThematicClassesPage();
loadCoursesPage();

// Valores preliminares do simulador de festa infantil.
// Quando a administracao definir os valores reais, altere apenas estes campos.
const partyQuotePrices = {
  base: 1800,
  perChild: 95,
  sweetsPerChild: {
    "Brigadeiro tradicional": 4,
    "Brigadeiro de morango": 4,
    "Beijinho": 4,
    "Brigadeiro de leite ninho": 4,
    "Cupcake de cenoura": 9,
    "Cupcake de chocolate": 9,
    "Mini donut": 7,
    "Bolo brigadeiro": 12
  },
  savoriesPerChild: {
    "Wrap de frango": 8,
    "Wrap de queijo e presunto": 8,
    "Wrap de queijo": 7,
    "Hambúrguer": 14,
    "Mini pizza": 12,
    "Nhoque com molho de tomate": 13,
    "Nhoque com molho branco": 14,
    "Mesa de apoio salgada": 16
  },
  drinksPerChild: {
    "Coca-Cola": 3,
    "Coca-Cola zero": 3,
    "Guaraná Antarctica": 3,
    "Guaraná zero": 3,
    "Suco de laranja": 4,
    "Suco de uva": 4,
    "Suco de pêssego": 4,
    "Suco de maracujá": 4
  }
};

const formatCurrency = (value) => value.toLocaleString("pt-BR", {
  style: "currency",
  currency: "BRL"
});

document.querySelectorAll("[data-party-quote]").forEach((form) => {
  const totalEl = form.querySelector("[data-quote-total]");
  const statusEl = form.querySelector("[data-quote-status]");
  const linesEl = form.querySelector("[data-quote-lines]");
  const feedbackEl = form.querySelector("[data-quote-feedback]");
  const childrenEl = form.querySelector("[data-quote-children]");
  const sweetsCountEl = form.querySelector("[data-quote-sweets-count]");
  const savoriesCountEl = form.querySelector("[data-quote-savories-count]");
  const contactEl = form.querySelector("[data-quote-contact]");
  let lastComputedTotal = 0;
  let lastComputedLines = [];

  const getCheckedValues = (name) => [...form.querySelectorAll(`input[name='${name}']:checked`)]
    .map((input) => input.value)
    .filter(Boolean);

  const sumPerChildSelection = (items, priceTable, children) => items.reduce((acc, item) => {
    return acc + ((priceTable[item] || 0) * children);
  }, 0);

  const updateQuote = () => {
    const children = Math.max(0, Number(form.querySelector("[name='children']")?.value || 0));
    const sweets = getCheckedValues("sweets");
    const savories = getCheckedValues("savories");
    const drinks = getCheckedValues("drinks");

    let total = partyQuotePrices.base + (children * partyQuotePrices.perChild);
    const lines = [
      ["Base da festa", partyQuotePrices.base],
      [`Crianças (${children} x ${formatCurrency(partyQuotePrices.perChild)})`, children * partyQuotePrices.perChild]
    ];

    if (sweets.length) {
      const value = sumPerChildSelection(sweets, partyQuotePrices.sweetsPerChild, children);
      total += value;
      lines.push([`Doces: ${sweets.join(", ")}`, value]);
    }

    if (savories.length) {
      const value = sumPerChildSelection(savories, partyQuotePrices.savoriesPerChild, children);
      total += value;
      lines.push([`Salgados: ${savories.join(", ")}`, value]);
    }

    if (drinks.length) {
      const value = sumPerChildSelection(drinks, partyQuotePrices.drinksPerChild, children);
      total += value;
      lines.push([`Bebidas: ${drinks.join(", ")}`, value]);
    }

    lastComputedTotal = total;
    lastComputedLines = lines;

    if (totalEl) totalEl.textContent = formatCurrency(total);
    if (statusEl) {
      statusEl.textContent = `${children || 0} crianças | ${sweets.length} doces | ${savories.length} salgados | ${drinks.length} bebidas`;
    }
    if (childrenEl) {
      childrenEl.textContent = `${children || 0} crianças`;
    }
    if (sweetsCountEl) {
      sweetsCountEl.textContent = `${sweets.length} itens`;
    }
    if (savoriesCountEl) {
      savoriesCountEl.textContent = `${savories.length} itens`;
    }
    if (linesEl) {
      linesEl.innerHTML = lines.map(([label, value]) => `
        <div class="quote-line"><span>${label}</span><strong>${formatCurrency(value)}</strong></div>
      `).join("");
    }
    if (contactEl) {
      const guardianName = String(form.querySelector("[name='guardian_name']")?.value || "").trim();
      const guardianWhatsapp = String(form.querySelector("[name='guardian_whatsapp']")?.value || "").trim();
      const guardianEmail = String(form.querySelector("[name='guardian_email']")?.value || "").trim();
      contactEl.innerHTML = guardianName || guardianWhatsapp || guardianEmail
        ? `
          <strong>${guardianName || "Responsavel nao informado"}</strong>
          <p>${guardianWhatsapp || "WhatsApp pendente"}</p>
          <p>${guardianEmail || "E-mail opcional nao preenchido"}</p>
        `
        : `
          <strong>Contato</strong>
          <p>Preencha os dados do responsavel para enviar o orçamento.</p>
        `;
    }
  };

  form.addEventListener("change", updateQuote);
  form.addEventListener("input", updateQuote);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    updateQuote();
    if (form.querySelector("[name='website']")?.value) return;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const guardianName = String(form.querySelector("[name='guardian_name']")?.value || "").trim();
    const guardianWhatsapp = String(form.querySelector("[name='guardian_whatsapp']")?.value || "").trim();
    const guardianEmail = String(form.querySelector("[name='guardian_email']")?.value || "").trim();
    const partyNotes = String(form.querySelector("[name='party_notes']")?.value || "").trim();
    const children = Math.max(0, Number(form.querySelector("[name='children']")?.value || 0));
    const sweets = getCheckedValues("sweets");
    const savories = getCheckedValues("savories");
    const drinks = getCheckedValues("drinks");
    const summaryItems = [
      sweets.length ? `Doces: ${sweets.join(", ")}` : "",
      savories.length ? `Salgados: ${savories.join(", ")}` : "",
      drinks.length ? `Bebidas: ${drinks.join(", ")}` : ""
    ].filter(Boolean);

    const messageLines = [
      "Olá! Quero montar um orçamento de festa infantil na Quatro Folhas.",
      "",
      `Responsável: ${guardianName}`,
      `WhatsApp: ${guardianWhatsapp}`,
      guardianEmail ? `E-mail: ${guardianEmail}` : "",
      `Número de crianças: ${children}`,
      "",
      "Produtos selecionados:",
      ...summaryItems.map((item) => `- ${item}`),
      "",
      "Resumo financeiro:",
      ...lastComputedLines.map(([label, value]) => `- ${label}: ${formatCurrency(value)}`),
      `Total estimado: ${formatCurrency(lastComputedTotal)}`,
      partyNotes ? "" : null,
      partyNotes ? `Observações: ${partyNotes}` : null
    ].filter((line) => line !== null && line !== "");

    const whatsappText = encodeURIComponent(messageLines.join("\n"));
    window.open(`https://wa.me/5511947781922?text=${whatsappText}`, "_blank", "noreferrer");

    if (feedbackEl) {
      feedbackEl.hidden = false;
      feedbackEl.textContent = "Orçamento pronto. Abrimos o WhatsApp com a seleção para você enviar à equipe.";
    }
  });

  updateQuote();
});

const COOKIE_KEY = "qf_cookie_choice";

if (!localStorage.getItem(COOKIE_KEY)) {
  const cookieNotice = document.createElement("aside");
  cookieNotice.className = "cookie-notice";
  cookieNotice.innerHTML = `
    <div>
      <strong>Privacidade e cookies</strong>
      <p>Usamos cookies necessarios e, se autorizado, cookies de medição para melhorar sua experiencia.</p>
      <a href="politica-de-cookies.html">Ver politica</a>
    </div>
    <div class="cookie-actions">
      <button class="ghost-btn" type="button" data-cookie-choice="essential">Somente necessarios</button>
      <button class="solid-btn" type="button" data-cookie-choice="accepted">Aceitar</button>
    </div>
  `;
  document.body.appendChild(cookieNotice);
  cookieNotice.querySelectorAll("[data-cookie-choice]").forEach((button) => {
    button.addEventListener("click", () => {
      localStorage.setItem(COOKIE_KEY, button.dataset.cookieChoice);
      cookieNotice.remove();
    });
  });
}
