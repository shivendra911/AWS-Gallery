export function getDefaultApiBase() {
  if (window.location.protocol.startsWith("http")) {
    // Always point to backend port 3001 regardless of what port the frontend is served from
    const { protocol, hostname } = window.location;
    return `${protocol}//${hostname}:3001`;
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
