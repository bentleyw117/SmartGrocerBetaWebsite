import { sendWaitlistEmail } from "../lib/email";
import { requireEnv, type WaitlistEnv } from "../lib/env";
import { allowRequest } from "../lib/rate-limit";

interface WaitlistFields {
  email: string;
  name: string | null;
  zip: string | null;
  stores: string | null;
  website: string;
}

interface JsonObject {
  [key: string]: unknown;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ZIP_PATTERN = /^\d{5}$/;

export async function handleWaitlistRequest(request: Request, env: WaitlistEnv): Promise<Response> {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders(request) });
  }
  if (request.method !== "POST") {
    return json({ ok: false, error: "Use POST." }, 405, request);
  }

  try {
    const required = requireEnv(env);
    if (!(await allowRequest(request))) {
      return json({ ok: false, error: "Please wait a few minutes and try again." }, 429, request);
    }

    const payload = await readJson(request);
    if (!payload) {
      return json({ ok: false, error: "Send a JSON body." }, 400, request);
    }

    const parsed = parseFields(payload);
    if ("error" in parsed) {
      return json({ ok: false, error: parsed.error, fields: parsed.fields }, 400, request);
    }

    if (parsed.website !== "") {
      return json({ ok: true }, 200, request);
    }

    const inserted = await insertWaitlist(required, parsed, request.headers.get("user-agent"));
    if (inserted === "error") {
      return json({ ok: false, error: "We couldn’t save that just now. Try again." }, 500, request);
    }

    if (inserted === "created") {
      try {
        await sendWaitlistEmail({
          apiKey: required.RESEND_API_KEY,
          to: parsed.email,
          name: parsed.name,
        });
      } catch (error) {
        console.error("waitlist confirmation email failed", error);
      }
    }

    return json({ ok: true }, 200, request);
  } catch (error) {
    console.error("waitlist handler failed", error);
    return json({ ok: false, error: "Waitlist is temporarily unavailable." }, 500, request);
  }
}

async function readJson(request: Request): Promise<JsonObject | null> {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return null;
  }
  try {
    const body: unknown = await request.json();
    if (typeof body !== "object" || body === null || Array.isArray(body)) {
      return null;
    }
    return body as JsonObject;
  } catch {
    return null;
  }
}

function parseFields(body: JsonObject): WaitlistFields | { error: string; fields: Record<string, string> } {
  const fields: Record<string, string> = {};
  const email = stringify(body.email).trim().toLowerCase();
  const firstName = stringify(body.first_name).trim();
  const lastName = stringify(body.last_name).trim();
  const legacyName = stringify(body.name).trim();
  const name =
    [firstName, lastName].filter(Boolean).join(" ") || legacyName;
  const zip = stringify(body.zip).trim();
  const stores = stringify(body.stores).trim();
  const website = stringify(body.website).trim();

  if (!email) {
    fields.email = "Enter your email.";
  } else if (!EMAIL_PATTERN.test(email) || email.length > 320) {
    fields.email = "Enter a valid email.";
  }

  if (!firstName && !legacyName) {
    fields.first_name = "Enter your first name.";
  } else if (firstName.length > 40) {
    fields.first_name = "Keep this under 40 characters.";
  }

  if (lastName.length > 40) {
    fields.last_name = "Keep this under 40 characters.";
  }

  if (name.length > 80) {
    fields.first_name = "Keep your name under 80 characters.";
  }

  if (!zip) {
    fields.zip = "Enter your zip.";
  } else if (!ZIP_PATTERN.test(zip)) {
    fields.zip = "Use a 5-digit US zip.";
  }

  if (stores.length > 400) {
    fields.stores = "Keep this under 400 characters.";
  }

  if (Object.keys(fields).length > 0) {
    return { error: "Check the highlighted fields.", fields };
  }

  return {
    email,
    name,
    zip,
    stores: stores === "" ? null : stores,
    website,
  };
}

function stringify(value: unknown): string {
  return typeof value === "string" ? value : "";
}

async function insertWaitlist(
  env: { SUPABASE_URL: string; SUPABASE_ANON_KEY: string },
  fields: WaitlistFields,
  userAgent: string | null,
): Promise<"created" | "duplicate" | "error"> {
  const response = await fetch(`${env.SUPABASE_URL}/rest/v1/beta_waitlist`, {
    method: "POST",
    headers: {
      apikey: env.SUPABASE_ANON_KEY,
      Authorization: `Bearer ${env.SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({
      email: fields.email,
      name: fields.name,
      zip: fields.zip,
      stores_text: fields.stores,
      user_agent: (userAgent ?? "").slice(0, 512) || null,
    }),
  });

  if (response.status === 201 || response.status === 200) {
    return "created";
  }

  if (response.status === 409) {
    return "duplicate";
  }

  const detail = await response.text();
  if (response.status === 400 && detail.includes("23505")) {
    return "duplicate";
  }

  console.error("supabase insert failed", response.status, detail);
  return "error";
}

function json(body: Record<string, unknown>, status = 200, request?: Request): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...corsHeaders(request),
    },
  });
}

function corsHeaders(request?: Request): Record<string, string> {
  const origin = request?.headers.get("Origin") ?? "";
  const allowed =
    origin === "https://beta.smartgrocerapp.com" ||
    origin.startsWith("http://127.0.0.1:") ||
    origin.startsWith("http://localhost:");
  return {
    "Access-Control-Allow-Origin": allowed ? origin : "https://beta.smartgrocerapp.com",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  };
}
