(() => {
  const dialog = document.getElementById("chef-november-offer");
  if (!dialog || typeof dialog.showModal !== "function" || dialog.dataset.initialized) return;
  dialog.dataset.initialized = "true";
  // The deadline is midnight after November 30 in São Paulo, not a resetting timer.
  const deadline = Date.parse("2026-12-01T00:00:00-03:00");
  if (Date.now() >= deadline) return;
  const key = "qf_chef_novembro_2026_seen";
  try { if (sessionStorage.getItem(key)) return; } catch {}
  const form = document.querySelector("#inscricao form");
  let formStarted = false;
  let attempts = 0;
  const remember = () => { try { sessionStorage.setItem(key, "1"); } catch {} };
  const stopForForm = () => { formStarted = true; remember(); };
  form?.addEventListener("input", stopForForm, { once: true });
  form?.addEventListener("focusin", stopForForm, { once: true });
  dialog.querySelector("[data-november-close]")?.addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  dialog.querySelector("[data-november-cta]")?.addEventListener("click", () => {
    dialog.close();
    const heading = document.querySelector("#inscricao .lead-card h3");
    if (heading) { heading.setAttribute("tabindex", "-1"); heading.focus({ preventScroll: true }); }
  });
  function attempt() {
    if (formStarted || Date.now() >= deadline) return;
    const rect = form?.getBoundingClientRect();
    if (location.hash === "#inscricao" || (rect && rect.top < innerHeight && rect.bottom > 0)) { remember(); return; }
    const editing = document.activeElement?.matches("input,textarea,select,[contenteditable='true']");
    if (document.hidden || document.querySelector(".cookie-notice,dialog[open]") || editing) {
      if (++attempts < 25) setTimeout(attempt, 2000);
      return;
    }
    try { dialog.showModal(); remember(); } catch {}
  }
  setTimeout(attempt, 10000);
})();
