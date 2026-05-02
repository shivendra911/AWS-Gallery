export function updateGalleryCount(galleryCountEl, count) {
  galleryCountEl.textContent = `${count} image${count === 1 ? "" : "s"}`;
}

export function renderEmptyGallery(galleryEl, galleryCountEl) {
  galleryEl.innerHTML = "";
  const empty = document.createElement("div");
  empty.className = "empty";
  empty.textContent = "No images uploaded yet.";
  galleryEl.appendChild(empty);
  updateGalleryCount(galleryCountEl, 0);
}

export function createTile(url, { onPreview, onCopy }) {
  const card = document.createElement("article");
  card.className = "tile";

  const variants = ["size-large", "size-wide", "size-tall", "", "", ""];
  const hash = Array.from(url).reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const variant = variants[hash % variants.length];
  if (variant) {
    card.classList.add(variant);
  }

  const media = document.createElement("div");
  media.className = "tile-media";

  const img = document.createElement("img");
  img.src = url;
  img.alt = "Uploaded image";
  img.loading = "lazy";
  img.referrerPolicy = "no-referrer";

  const overlay = document.createElement("div");
  overlay.className = "tile-overlay";
  const previewBtn = document.createElement("button");
  previewBtn.type = "button";
  previewBtn.className = "preview-btn";
  previewBtn.textContent = "Preview";
  previewBtn.addEventListener("click", () => onPreview(url));
  overlay.appendChild(previewBtn);

  const actions = document.createElement("div");
  actions.className = "tile-actions";

  const previewActionBtn = document.createElement("button");
  previewActionBtn.type = "button";
  previewActionBtn.textContent = "Preview";
  previewActionBtn.addEventListener("click", () => onPreview(url));

  const openLink = document.createElement("a");
  openLink.href = url;
  openLink.target = "_blank";
  openLink.rel = "noopener noreferrer";
  openLink.textContent = "Open";

  const copyBtn = document.createElement("button");
  copyBtn.type = "button";
  copyBtn.textContent = "Copy URL";
  copyBtn.addEventListener("click", () => onCopy(url));

  actions.append(previewActionBtn, openLink, copyBtn);
  media.append(img, overlay);
  card.append(media, actions);
  return card;
}
