export function getDefaultApiBase() {
  if (window.location.protocol.startsWith("http")) {
    return `${window.location.protocol}//${window.location.hostname}:3001`;
  }
  return "http://localhost:3001";
}

export function normalizeApiBase(value) {
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
