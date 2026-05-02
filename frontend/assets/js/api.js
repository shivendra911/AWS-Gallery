export function getDefaultApiBase() {
  // When served via Nginx, API routes are proxied on the same origin (port 80).
  // Nginx forwards /upload, /images, /health to the backend on localhost:3001.
  if (window.location.protocol.startsWith("http")) {
    return window.location.origin;
  }
  return "http://localhost:3001";
}

export function normalizeApiBase(value) {
  if (!value) return "";
  return value.trim().replace(/\/$/, "");
}

export async function parseJsonSafe(response) {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch (_error) {
    throw new Error("Server returned invalid JSON");
  }
}
