const PHONE_FILES = ["/preview/phone-1.png", "/preview/phone-2.png", "/preview/phone-3.png"] as const;
const VIDEO_SRC = "/preview/demo.mp4";
const POSTER_SRC = "/preview/poster.jpg";
const MOBILE_STACK_QUERY = "(max-width: 959px)";
const SWIPE_THRESHOLD = 48;

const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function initPreview(): void {
  initPhones(document.querySelector("[data-phone-stage]"));
  document.querySelectorAll<HTMLElement>("[data-mini-phones] .phone").forEach((phone, index) => {
    bindPhone(phone, PHONE_FILES[index] ?? "/preview/phone-1.png");
  });
  initFilm(document.querySelector("[data-film-well]"));
}

function initPhones(stage: HTMLElement | null): void {
  if (!stage) return;
  const phones = Array.from(stage.querySelectorAll<HTMLElement>(".phone"));
  const dots = Array.from(stage.querySelectorAll<HTMLButtonElement>(".dot"));
  phones.forEach((phone, index) => bindPhone(phone, PHONE_FILES[index] ?? "/preview/phone-1.png"));

  let active = 0;
  const show = (index: number) => {
    active = (index + phones.length) % phones.length;
    const stacked = window.matchMedia("(min-width: 960px)").matches;
    phones.forEach((phone, i) => {
      phone.classList.toggle("is-hidden", !stacked && i !== active);
    });
    dots.forEach((dot, i) => {
      if (i === active) dot.setAttribute("aria-current", "true");
      else dot.removeAttribute("aria-current");
    });
  };

  const next = () => show(active + 1);
  const prev = () => show(active - 1);

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => show(index));
  });

  initPhoneSwipe(stage, { next, prev });

  const media = window.matchMedia("(min-width: 960px)");
  const onChange = () => show(active);
  media.addEventListener("change", onChange);
  show(0);
}

function initPhoneSwipe(
  stage: HTMLElement,
  handlers: { next: () => void; prev: () => void },
): void {
  const mobile = window.matchMedia(MOBILE_STACK_QUERY);
  let startX = 0;
  let startY = 0;
  let tracking = false;

  const onStart = (x: number, y: number) => {
    if (!mobile.matches) return;
    startX = x;
    startY = y;
    tracking = true;
  };

  const onEnd = (x: number, y: number) => {
    if (!tracking || !mobile.matches) return;
    tracking = false;
    const dx = x - startX;
    const dy = y - startY;
    if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) < Math.abs(dy)) return;
    if (dx < 0) handlers.next();
    else handlers.prev();
  };

  stage.addEventListener(
    "touchstart",
    (event) => {
      const touch = event.changedTouches[0];
      if (!touch) return;
      onStart(touch.clientX, touch.clientY);
    },
    { passive: true },
  );

  stage.addEventListener(
    "touchend",
    (event) => {
      const touch = event.changedTouches[0];
      if (!touch) return;
      onEnd(touch.clientX, touch.clientY);
    },
    { passive: true },
  );

  stage.addEventListener("pointerdown", (event) => {
    if (event.pointerType !== "mouse" || !mobile.matches) return;
    onStart(event.clientX, event.clientY);
  });

  stage.addEventListener("pointerup", (event) => {
    if (event.pointerType !== "mouse" || !mobile.matches) return;
    onEnd(event.clientX, event.clientY);
  });
}

function bindPhone(phone: HTMLElement, src: string): void {
  const img = phone.querySelector("img");
  const empty = phone.querySelector(".phone-empty");
  if (!(img instanceof HTMLImageElement)) return;
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

function initFilm(well: HTMLElement | null): void {
  if (!well) return;
  const video = well.querySelector("video");
  const empty = well.querySelector(".film-empty");
  const toggle = well.querySelector<HTMLButtonElement>("[data-film-toggle]");
  if (!(video instanceof HTMLVideoElement)) return;

  video.muted = true;
  video.defaultMuted = true;
  video.playsInline = true;
  video.loop = true;
  video.poster = POSTER_SRC;
  video.classList.add("is-hidden");

  const setPlaying = (playing: boolean) => {
    if (!toggle) return;
    toggle.textContent = playing ? "Pause" : "Play";
    toggle.setAttribute("aria-pressed", playing ? "true" : "false");
  };

  const tryPlay = () => {
    if (prefersReducedMotion()) return;
    void video.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  };

  video.addEventListener("loadeddata", () => {
    video.classList.remove("is-hidden");
    empty?.classList.add("is-hidden");
    toggle?.classList.remove("is-hidden");
  });
  video.addEventListener("error", () => {
    video.classList.add("is-hidden");
    empty?.classList.remove("is-hidden");
    toggle?.classList.add("is-hidden");
  });
  toggle?.addEventListener("click", () => {
    if (video.paused) void video.play().then(() => setPlaying(true));
    else {
      video.pause();
      setPlaying(false);
    }
  });

  video.src = VIDEO_SRC;

  if (prefersReducedMotion()) {
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) tryPlay();
        else {
          video.pause();
          setPlaying(false);
        }
      }
    },
    { threshold: 0.45 },
  );
  observer.observe(video);
}
