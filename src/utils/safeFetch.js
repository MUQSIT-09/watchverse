export async function safeFetch(url, options = {}, timeoutMs = 5000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal, cache: "no-cache" });
    clearTimeout(id);
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      const err = new Error(`HTTP ${res.status}: ${res.statusText} ${text}`);
      err.status = res.status;
      throw err;
    }
    return res;
  } catch (e) {
    clearTimeout(id);
    // optional: log to console or remote logger
    console.error("safeFetch failed:", e);
    throw e;
  }
}