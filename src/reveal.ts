const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function initReveal(): void {
  const nodes = document.querySelectorAll<HTMLElement>(".reveal");
  if (prefersReducedMotion() || !("IntersectionObserver" in window)) {
    nodes.forEach((node) => {
      node.classList.add("is-in");
      markStagger(node);
    });
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting && entry.target instanceof HTMLElement) {
          entry.target.classList.add("is-in");
          markStagger(entry.target);
          observer.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
  );
  nodes.forEach((node) => observer.observe(node));
}

function markStagger(section: HTMLElement): void {
  section.querySelectorAll<HTMLElement>("[data-stagger] > *").forEach((child, index) => {
    child.style.setProperty("--stagger", String(index));
    child.classList.add("stagger-child", "is-in");
  });
}
