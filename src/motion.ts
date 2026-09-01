const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function initMotion(): void {
  document.documentElement.classList.add("js-ready");
  if (prefersReducedMotion()) {
    document.documentElement.classList.add("motion-reduced");
    return;
  }

  initHeroEnter();
  initMagneticButtons();
  initRipples();
  initTiltCards();
  initReceipt();
  initChipFeedback();
}

function initHeroEnter(): void {
  requestAnimationFrame(() => {
    document.documentElement.classList.add("is-entered");
  });
}

function initMagneticButtons(): void {
  const buttons = document.querySelectorAll<HTMLElement>("[data-magnetic]");
  buttons.forEach((button) => {
    const strength = 10;
    button.addEventListener("pointermove", (event) => {
      if (event.pointerType !== "mouse") return;
      const rect = button.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      button.style.transform = `translate(${(x / rect.width) * strength}px, ${(y / rect.height) * strength}px)`;
    });
    button.addEventListener("pointerleave", () => {
      button.style.transform = "";
    });
  });
}

function initRipples(): void {
  document.querySelectorAll<HTMLElement>("[data-ripple]").forEach((button) => {
    button.addEventListener("pointerdown", (event) => {
      if (event.button !== 0) return;
      const rect = button.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 1.35;
      const ripple = document.createElement("span");
      ripple.className = "ripple";
      ripple.style.width = `${size}px`;
      ripple.style.height = `${size}px`;
      ripple.style.left = `${event.clientX - rect.left - size / 2}px`;
      ripple.style.top = `${event.clientY - rect.top - size / 2}px`;
      button.appendChild(ripple);
      ripple.addEventListener("animationend", () => ripple.remove());
    });
  });
}

function initTiltCards(): void {
  const cards = document.querySelectorAll<HTMLElement>("[data-tilt-card]");
  cards.forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      if (event.pointerType !== "mouse") return;
      const rect = card.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.setProperty("--tilt-x", `${(-py * 4).toFixed(2)}deg`);
      card.style.setProperty("--tilt-y", `${(px * 5).toFixed(2)}deg`);
      card.classList.add("is-tilting");
    });
    card.addEventListener("pointerleave", () => {
      card.style.removeProperty("--tilt-x");
      card.style.removeProperty("--tilt-y");
      card.classList.remove("is-tilting");
    });
  });
}

function initReceipt(): void {
  const receipt = document.querySelector<HTMLElement>("[data-receipt]");
  if (!receipt) return;

  const save = receipt.querySelector<HTMLElement>("[data-receipt-save]");
  const prices = receipt.querySelectorAll<HTMLElement>("[data-price]");
  const total = receipt.querySelector<HTMLElement>("[data-receipt-total]");
  const compare = receipt.querySelector<HTMLElement>("[data-receipt-compare]");
  const saveValue = receipt.querySelector<HTMLElement>("[data-save-value]");

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        receipt.classList.add("is-live");
        save?.setAttribute("aria-hidden", "false");
        prices.forEach((node, index) => {
          const value = Number(node.dataset.value);
          if (!Number.isNaN(value)) {
            window.setTimeout(() => animatePrice(node, value), index * 120);
          }
        });
        if (total) animatePrice(total, Number(total.dataset.value));
        if (compare) animatePrice(compare, Number(compare.dataset.value));
        if (saveValue) animatePrice(saveValue, Number(saveValue.dataset.value));
        observer.unobserve(receipt);
      }
    },
    { threshold: 0.35 },
  );
  observer.observe(receipt);

  receipt.addEventListener("pointerenter", () => receipt.classList.add("is-hover"));
  receipt.addEventListener("pointerleave", () => receipt.classList.remove("is-hover"));
}

function animatePrice(node: Element | null | undefined, target: number): void {
  if (!(node instanceof HTMLElement)) return;
  const start = performance.now();
  const duration = 900;
  const tick = (now: number) => {
    const t = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - t, 3);
    node.textContent = `$${(target * eased).toFixed(2)}`;
    if (t < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

function initChipFeedback(): void {
  document.querySelectorAll<HTMLButtonElement>(".chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      chip.classList.remove("is-pop");
      // Force reflow so the pop animation can retrigger.
      void chip.offsetWidth;
      chip.classList.add("is-pop");
    });
  });
}
