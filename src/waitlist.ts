interface WaitlistResponse {
  ok: boolean;
  error?: string;
  fields?: Record<string, string>;
}

export function initWaitlist(form: HTMLFormElement | null): void {
  if (!form) return;
  const status = form.querySelector<HTMLElement>("[data-form-status]");
  const submit = form.querySelector<HTMLButtonElement>("[type='submit']");
  const success = document.querySelector<HTMLElement>("[data-form-success]");
  const chips = Array.from(form.querySelectorAll<HTMLButtonElement>(".chip"));
  const stores = form.querySelector<HTMLTextAreaElement>("#stores");

  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const pressed = chip.getAttribute("aria-pressed") === "true";
      chip.setAttribute("aria-pressed", pressed ? "false" : "true");
    });
  });

  form.querySelectorAll("input, textarea").forEach((field) => {
    field.addEventListener("input", () => clearFieldError(field));
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!submit) return;
    clearStatus(form, status);

    const body = readForm(form, chips, stores);
    const localErrors = validate(body);
    if (Object.keys(localErrors).length > 0) {
      applyErrors(form, localErrors);
      setStatus(status, "Check the highlighted fields.", true);
      const first = form.querySelector<HTMLElement>(".field.error input, .field.error textarea");
      first?.focus();
      return;
    }

    submit.disabled = true;
    const original = submit.textContent;
    submit.textContent = "Requesting…";

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const payload = (await parseResponse(response)) ?? {
        ok: false,
        error: "Something went wrong. Try again.",
      };
      if (!payload.ok) {
        applyErrors(form, payload.fields ?? {});
        setStatus(status, payload.error ?? "Something went wrong. Try again.", true);
        return;
      }
      form.classList.add("is-hidden");
      success?.classList.remove("is-hidden");
      success?.focus();
    } catch {
      setStatus(status, "Network error. Try again.", true);
    } finally {
      submit.disabled = false;
      submit.textContent = original ?? "Request access";
    }
  });
}

function readForm(
  form: HTMLFormElement,
  chips: HTMLButtonElement[],
  stores: HTMLTextAreaElement | null,
): Record<string, string> {
  const data = new FormData(form);
  const selected = chips
    .filter((chip) => chip.getAttribute("aria-pressed") === "true")
    .map((chip) => chip.dataset.value ?? chip.textContent?.trim() ?? "")
    .filter((value) => value !== "");
  const extra = stores?.value.trim() ?? "";
  const combined = [...selected, extra].filter(Boolean).join(", ");
  return {
    email: String(data.get("email") ?? ""),
    name: String(data.get("name") ?? ""),
    zip: String(data.get("zip") ?? ""),
    stores: combined,
    website: String(data.get("website") ?? ""),
  };
}

function validate(body: Record<string, string>): Record<string, string> {
  const errors: Record<string, string> = {};
  const email = body.email?.trim() ?? "";
  if (!email) errors.email = "Enter your email.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Enter a valid email.";
  const zip = body.zip?.trim() ?? "";
  if (zip && !/^\d{5}$/.test(zip)) errors.zip = "Use a 5-digit US zip.";
  return errors;
}

function applyErrors(form: HTMLFormElement, fields: Record<string, string>): void {
  for (const [name, message] of Object.entries(fields)) {
    const field = form.querySelector<HTMLElement>(`.field[data-field="${name}"]`);
    const input = field?.querySelector("input, textarea");
    const error = field?.querySelector("[data-error]");
    field?.classList.add("error");
    if (input instanceof HTMLElement) input.setAttribute("aria-invalid", "true");
    if (error) error.textContent = message;
  }
}

function clearFieldError(field: Element): void {
  const wrap = field.closest(".field");
  wrap?.classList.remove("error");
  if (field instanceof HTMLElement) field.removeAttribute("aria-invalid");
  const error = wrap?.querySelector("[data-error]");
  if (error) error.textContent = "";
}

function clearStatus(form: HTMLFormElement, status: HTMLElement | null): void {
  form.querySelectorAll(".field.error").forEach((field) => field.classList.remove("error"));
  form.querySelectorAll("[data-error]").forEach((node) => {
    node.textContent = "";
  });
  setStatus(status, "", false);
}

function setStatus(status: HTMLElement | null, message: string, isError: boolean): void {
  if (!status) return;
  status.textContent = message;
  status.classList.toggle("error", isError);
}

async function parseResponse(response: Response): Promise<WaitlistResponse | null> {
  try {
    const payload: unknown = await response.json();
    if (typeof payload !== "object" || payload === null) return null;
    const record = payload as Record<string, unknown>;
    const fields =
      typeof record.fields === "object" && record.fields !== null && !Array.isArray(record.fields)
        ? Object.fromEntries(
            Object.entries(record.fields as Record<string, unknown>).filter(
              (entry): entry is [string, string] => typeof entry[1] === "string",
            ),
          )
        : undefined;
    return {
      ok: record.ok === true,
      ...(typeof record.error === "string" ? { error: record.error } : {}),
      ...(fields ? { fields } : {}),
    };
  } catch {
    return null;
  }
}
