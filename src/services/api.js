// src/services/api.js
const rawBase = import.meta.env.VITE_API_BASE || "https://watchverse-twq7.onrender.com";
const API_BASE = rawBase.replace(/\/$/, "");

// ... rest of file unchanged
async function safeFetch(path, opts = {}) {
  const url = `${API_BASE}${path}`;
  const controller = new AbortController();
  const timeout = opts.timeout || 10000;
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(url, {
      method: opts.method || "GET",
      headers: { "Content-Type": "application/json", ...(opts.headers || {}) },
      body: opts.body ? JSON.stringify(opts.body) : undefined,
      credentials: opts.credentials || "include",
      signal: controller.signal,
    });
    clearTimeout(id);

    const text = await res.text();
    const contentType = res.headers.get("content-type") || "";

    if (!res.ok) {
      const err = new Error(`API ${res.status} ${res.statusText}`);
      err.status = res.status;
      err.body = text;
      throw err;
    }

    if (contentType.includes("application/json")) {
      try {
        return JSON.parse(text);
      } catch {
        return { raw: text };
      }
    }
    return { raw: text };
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

export const saveLibraryItem = async (item) => safeFetch("/api/library/save", { method: "POST", body: item });
export const getUserLibrary = async (uid) => safeFetch(`/api/library/${uid}`);
export const syncUser = async (user) => safeFetch("/api/users/sync", { method: "POST", body: {
  firebaseUid: user.uid, name: user.displayName||"", email: user.email||"", photoURL: user.photoURL||""
}});