const LOGO_SVG = "/brand/logo.svg";
const LOGO_PNG = "/brand/logo.png";

export function initLogoWells(): void {
  const wells = document.querySelectorAll<HTMLElement>("[data-logo-well]");
  wells.forEach((well) => {
    const img = well.querySelector("img");
    if (!(img instanceof HTMLImageElement)) {
      return;
    }
    img.addEventListener("error", () => {
      if (img.dataset.fallback === "png") {
        img.remove();
        well.classList.add("is-empty");
        return;
      }
      img.dataset.fallback = "png";
      img.src = LOGO_PNG;
    });
    if (!img.getAttribute("src")) {
      img.src = LOGO_SVG;
    }
  });
}
