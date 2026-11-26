"use strict";

const roleSwitcher = document.querySelector("[data-role-switcher]");
const roleButtons = [...document.querySelectorAll("[data-role-tab]")];
const rolePanels = [...document.querySelectorAll("[data-role-panel]")];
const links = [...document.querySelectorAll(".section-menu a")];
const chapters = links.map(link => document.getElementById(link.hash.slice(1)));
const strategy = document.getElementById("strategy");

function selectRole(role) {
  if (!rolePanels.some(panel => panel.dataset.rolePanel === role)) return;
  for (const panel of rolePanels) panel.hidden = panel.dataset.rolePanel !== role;
  for (const button of roleButtons) {
    button.setAttribute("aria-pressed", String(button.dataset.roleTab === role));
  }
}

selectRole("marketing");
selectRole(location.hash.slice(1));
roleSwitcher.hidden = false;

for (const link of document.querySelectorAll("[data-role-link]")) {
  link.addEventListener("click", event => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    selectRole(link.dataset.roleLink);
    if (location.hash !== link.hash) history.pushState(null, "", link.hash);
    strategy.focus({ preventScroll: true });
    strategy.scrollIntoView();
  });
}

for (const button of roleButtons) {
  button.addEventListener("click", () => {
    const role = button.dataset.roleTab;
    selectRole(role);
    history.replaceState(null, "", "#" + role);
  });
}

window.addEventListener("hashchange", () => {
  const id = location.hash.slice(1);
  const panel = document.getElementById(id);
  if (panel?.matches("[data-role-panel]") && panel.hidden) {
    selectRole(id);
    panel.scrollIntoView();
  }
});

for (const button of document.querySelectorAll(".copy-button")) {
  button.hidden = false;
  button.addEventListener("click", async () => {
    const template = button.closest(".template");
    const text = template.querySelector("pre");
    const status = template.querySelector(".copy-status");
    try {
      await navigator.clipboard.writeText(text.textContent);
      status.textContent = "Шаблон скопирован.";
    } catch {
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(text);
      selection.removeAllRanges();
      selection.addRange(range);
      status.textContent = "Текст выделен. Скопируйте его.";
    }
  });
}

const menu = document.querySelector(".section-menu");
let queued = false;
let activeIndex = 0;

function updateSection() {
  queued = false;
  const mobile = matchMedia("(max-width: 700px)").matches;
  const top = mobile ? menu.offsetHeight + 34 : 114;
  let current = 0;
  for (const [i, chapter] of chapters.entries()) {
    if (chapter.getBoundingClientRect().top <= top) current = i;
  }
  if (current === activeIndex) return;
  links[activeIndex].removeAttribute("aria-current");
  links[current].setAttribute("aria-current", "location");
  activeIndex = current;
}

function queueSectionUpdate() {
  if (queued) return;
  queued = true;
  requestAnimationFrame(updateSection);
}

window.addEventListener("scroll", queueSectionUpdate, { passive: true });
window.addEventListener("resize", queueSectionUpdate);
document.addEventListener("toggle", queueSectionUpdate, true);
queueSectionUpdate();
