const PHONE_FILES = [
  "/preview/phone-1.png",
  "/preview/phone-2.png",
  "/preview/phone-3.png",
  "/preview/phone-4.png",
  "/preview/phone-5.png",
] as const;

export function initPreview(): void {
  document.querySelectorAll<HTMLElement>("[data-preview-phone]").forEach((phone) => {
    const src = phone.dataset.previewPhone;
    if (!src) return;
    const alt = phone.dataset.previewAlt ?? "";
    bindPhone(phone, src, alt);
  });
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
