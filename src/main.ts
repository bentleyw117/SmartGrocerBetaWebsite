import { initLogoWells } from "./brand";
import { initPreview } from "./preview";
import { initReveal } from "./reveal";
import { initWaitlist } from "./waitlist";
import "./styles.css";

initLogoWells();
initReveal();
initPreview();
initWaitlist(document.querySelector("#waitlist-form"));

document.querySelectorAll<HTMLAnchorElement>('a[href="#waitlist"]').forEach((link) => {
  link.addEventListener("click", () => {
    window.setTimeout(() => {
      document.querySelector<HTMLInputElement>("#email")?.focus();
    }, 0);
  });
});
