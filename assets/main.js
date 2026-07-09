const menuButton = document.querySelector("[data-menu-button]");
const siteNav = document.querySelector("[data-site-nav]");
const pagePath = window.location.pathname.split("/").pop() || "index.html";

const officialPhotos = {
  home: "https://english.yangtzeu.edu.cn/images/22/11/21/zhangjiangdaxue.jpg",
  mainBuilding: "https://english.yangtzeu.edu.cn/images/22/11/21/dongxiaoqu-zhujiaoxuelou.jpg",
  humanities: "https://english.yangtzeu.edu.cn/images/22/11/21/dongxiaoqu-wenkedalou.jpg",
  history: "https://english.yangtzeu.edu.cn/images/22/11/21/dongxiaoqu-xiaoshizhanglang.jpg",
  sakura: "https://english.yangtzeu.edu.cn/images/22/11/21/dongxiaoqu-xiaoyuanyinghua.jpg",
  library: "https://english.yangtzeu.edu.cn/images/22/11/21/wuhanxiaoqu-tushuguan.jpg"
};

window.officialClassPhotos = officialPhotos;

if (menuButton && siteNav) {
  menuButton.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("is-open");
    menuButton.setAttribute("aria-expanded", String(isOpen));
  });
}

document.querySelectorAll(".site-nav a").forEach((link) => {
  const href = link.getAttribute("href");
  link.classList.toggle("is-active", href === pagePath);
});

document.querySelectorAll("[data-year]").forEach((node) => {
  node.textContent = String(new Date().getFullYear());
});

document.querySelectorAll("img[data-fallback]").forEach((image) => {
  image.addEventListener("error", () => {
    if (image.dataset.fallbackApplied === "true") return;
    image.dataset.fallbackApplied = "true";
    image.src = image.dataset.fallback;
  }, { once: true });
});

document.querySelectorAll("[data-bg-fallback]").forEach((node) => {
  const style = window.getComputedStyle(node);
  const value = style.getPropertyValue("--hero-photo") || style.getPropertyValue("--page-photo") || style.getPropertyValue("--contact-photo");
  const match = value.match(/url\(["']?(.+?)["']?\)/);
  if (!match) return;
  const testImage = new Image();
  testImage.onerror = () => {
    const fallback = `url("${node.dataset.bgFallback}")`;
    if (style.getPropertyValue("--hero-photo")) node.style.setProperty("--hero-photo", fallback);
    if (style.getPropertyValue("--page-photo")) node.style.setProperty("--page-photo", fallback);
    if (style.getPropertyValue("--contact-photo")) node.style.setProperty("--contact-photo", fallback);
  };
  testImage.src = match[1];
});

const progress = document.querySelector("[data-scroll-progress]");
function updateScrollProgress() {
  if (!progress) return;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.transform = `scaleX(${max <= 0 ? 0 : Math.min(1, Math.max(0, window.scrollY / max))})`;
}
window.addEventListener("scroll", updateScrollProgress, { passive: true });
window.addEventListener("resize", updateScrollProgress);
updateScrollProgress();

const backToTop = document.querySelector("[data-back-to-top]");
if (backToTop) {
  const syncBackToTop = () => backToTop.classList.toggle("is-visible", window.scrollY > 420);
  backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  window.addEventListener("scroll", syncBackToTop, { passive: true });
  syncBackToTop();
}

function normalize(value) {
  return (value || "").trim().toLowerCase();
}

function setEmptyState(list, selector) {
  const empty = list.parentElement.querySelector("[data-empty-state]");
  if (!empty) return;
  const visibleCount = Array.from(list.querySelectorAll(selector)).filter((item) => !item.hidden).length;
  empty.hidden = visibleCount !== 0;
}

function applyListState(list) {
  const selector = list.dataset.itemSelector || ".notice-card, .gallery-card, .project-card";
  const activeFilter = list.dataset.activeFilter || "all";
  const query = normalize(list.dataset.activeQuery || "");
  list.querySelectorAll(selector).forEach((item) => {
    const categories = (item.dataset.category || "").split(/\s+/);
    const text = normalize(item.dataset.searchText || item.textContent);
    const matchesFilter = activeFilter === "all" || categories.includes(activeFilter);
    const matchesSearch = query === "" || text.includes(query);
    item.hidden = !matchesFilter || !matchesSearch;
  });
  setEmptyState(list, selector);
}

document.querySelectorAll("[data-filter-group]").forEach((group) => {
  const targetSelector = group.dataset.filterTarget || "[data-filter-item]";
  const list = document.querySelector(group.dataset.filterList || "[data-filter-list]");
  if (!list) return;
  list.dataset.itemSelector = targetSelector;
  group.addEventListener("click", (event) => {
    const button = event.target.closest("[data-filter]");
    if (!button) return;
    group.querySelectorAll("[data-filter]").forEach((item) => {
      item.classList.toggle("is-active", item === button);
      item.setAttribute("aria-pressed", String(item === button));
    });
    list.dataset.activeFilter = button.dataset.filter;
    applyListState(list);
  });
});

document.querySelectorAll("[data-search-input]").forEach((input) => {
  const list = document.querySelector(input.dataset.searchList);
  const selector = input.dataset.searchItem || "[data-search-text]";
  if (!list) return;
  list.dataset.itemSelector = selector;
  input.addEventListener("input", () => {
    list.dataset.activeQuery = input.value;
    applyListState(list);
  });
});

const modal = document.querySelector("[data-modal]");
const modalTitle = modal?.querySelector("[data-modal-title]");
const modalBody = modal?.querySelector("[data-modal-body]");
const modalImage = modal?.querySelector("[data-modal-image]");
const modalMeta = modal?.querySelector("[data-modal-meta]");
let lastFocusedElement = null;

function openModal(trigger) {
  if (!modal || !modalTitle || !modalBody) return;
  lastFocusedElement = document.activeElement;
  modalTitle.textContent = trigger.dataset.modalTitle || trigger.querySelector("h3")?.textContent || "详情";
  modalBody.textContent = trigger.dataset.modalBody || trigger.querySelector("p")?.textContent || "";
  modalMeta.textContent = trigger.dataset.modalMeta || "";
  const image = trigger.dataset.modalImage || trigger.querySelector("img")?.src || "";
  if (modalImage) {
    modalImage.hidden = !image;
    if (image) {
      modalImage.src = image;
      modalImage.alt = trigger.dataset.modalTitle || "详情图片";
    }
  }
  modal.classList.add("is-open");
  modal.removeAttribute("hidden");
  document.body.classList.add("modal-open");
  modal.querySelector("[data-modal-close]")?.focus();
}

function closeModal() {
  if (!modal) return;
  modal.classList.remove("is-open");
  modal.setAttribute("hidden", "");
  document.body.classList.remove("modal-open");
  if (lastFocusedElement && "focus" in lastFocusedElement) lastFocusedElement.focus();
}

document.querySelectorAll("[data-modal-trigger]").forEach((trigger) => {
  if (!trigger.hasAttribute("tabindex")) trigger.setAttribute("tabindex", "0");
  if (!trigger.hasAttribute("role")) trigger.setAttribute("role", "button");
  trigger.addEventListener("click", () => openModal(trigger));
  trigger.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openModal(trigger);
    }
  });
});

modal?.addEventListener("click", (event) => {
  if (event.target.matches("[data-modal-close], .modal")) closeModal();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && modal?.classList.contains("is-open")) closeModal();
});

const revealItems = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}
