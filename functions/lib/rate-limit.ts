const WINDOW_SECONDS = 10 * 60;
const MAX_ATTEMPTS = 5;

function clientIp(request: Request): string {
  return request.headers.get("CF-Connecting-IP") ?? request.headers.get("x-forwarded-for") ?? "unknown";
}

export async function allowRequest(request: Request): Promise<boolean> {
  const ip = clientIp(request);
  const key = new Request(`https://waitlist-rate.smartgrocer.internal/${encodeURIComponent(ip)}`);
  const cache = caches.default;
  const cached = await cache.match(key);
  let count = 0;
  if (cached) {
    const parsed = Number.parseInt(await cached.text(), 10);
    count = Number.isFinite(parsed) ? parsed : MAX_ATTEMPTS;
  }
  if (count >= MAX_ATTEMPTS) {
    return false;
  }
  const next = new Response(String(count + 1), {
    headers: { "Cache-Control": `max-age=${WINDOW_SECONDS}` },
  });
  await cache.put(key, next);
  return true;
}
