const PHONE_FILES = [
  "/preview/phone-1.png",
  "/preview/phone-2.png",
  "/preview/phone-3.png",
  "/preview/phone-4.png",
  "/preview/phone-5.png",
] as const;

const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function initPreview(): void {
  initHeroVideo();
  document.querySelectorAll<HTMLElement>("[data-preview-phone]").forEach((phone) => {
    const src = phone.dataset.previewPhone;
    if (!src) return;
    const alt = phone.dataset.previewAlt ?? "";
    bindPhone(phone, src, alt);
  });
}

function initHeroVideo(): void {
  const video = document.querySelector<HTMLVideoElement>("[data-hero-video]");
  if (!video) return;

  video.muted = true;
  video.defaultMuted = true;
  video.playsInline = true;
  video.loop = true;

  if (prefersReducedMotion()) {
    video.pause();
    video.removeAttribute("autoplay");
    video.classList.add("is-paused");
    return;
  }

  const tryPlay = () => {
    void video.play().catch(() => {
      /* Autoplay can fail until user gesture; muted loop usually succeeds. */
    });
  };

  if (video.readyState >= 2) tryPlay();
  else video.addEventListener("loadeddata", tryPlay, { once: true });
}

function bindPhone(phone: HTMLElement, src: string, alt = ""): void {
  const img = phone.querySelector("img");
  const empty = phone.querySelector(".phone-empty");
  if (!(img instanceof HTMLImageElement)) return;
  if (alt) img.alt = alt;
  img.addEventListener("load", () => {
    img.classList.remove("is-hidden");
    empty?.classList.add("is-hidden");
  });
  img.addEventListener("error", () => {
    img.classList.add("is-hidden");
    empty?.classList.remove("is-hidden");
  });
  img.src = src;
}

export { PHONE_FILES };
