import { API_STORAGE_KEY, MAX_FILE_SIZE_BYTES, ACCEPTED_TYPES } from "./constants.js";
import { getDom } from "./dom.js";
import { getDefaultApiBase, normalizeApiBase, parseJsonSafe } from "./api.js";
import { createTile, renderEmptyGallery, updateGalleryCount } from "./gallery.js";

const dom = getDom();

function setStatus(message, type) {
  dom.statusEl.textContent = message || "";
  dom.statusEl.className = "status";
  if (type === "success") dom.statusEl.classList.add("success");
  if (type === "error") dom.statusEl.classList.add("error");
}

function getApiBase() {
  return normalizeApiBase(dom.apiBaseInput.value);
}

function makeApiUrl(path) {
  return `${getApiBase()}${path}`;
}

function getSafeInitialApiBase() {
  const saved = localStorage.getItem(API_STORAGE_KEY);
  const fallback = getDefaultApiBase();
  if (!saved) return fallback;

  const normalized = normalizeApiBase(saved);
  const frontendOrigin = normalizeApiBase(window.location.origin);
  if (!normalized || normalized === frontendOrigin) {
    return fallback;
  }
  return normalized;
}

function isValidImage(file) {
  if (!file) return { ok: false, reason: "Please choose an image file." };
  if (!ACCEPTED_TYPES.has(file.type)) return { ok: false, reason: "Only JPG and PNG files are allowed." };
  if (file.size > MAX_FILE_SIZE_BYTES) return { ok: false, reason: "Image must be 20MB or smaller." };
  return { ok: true };
}

async function copyText(value) {
  try {
    await navigator.clipboard.writeText(value);
    setStatus("Image URL copied.", "success");
  } catch (_error) {
    setStatus("Clipboard copy failed. Copy manually from Open.", "error");
  }
}

function openPreview(url) {
  dom.modalImage.src = url;
  dom.galleryModal.classList.add("open");
  dom.galleryModal.setAttribute("aria-hidden", "false");
}

function closePreview() {
  dom.galleryModal.classList.remove("open");
  dom.galleryModal.setAttribute("aria-hidden", "true");
  dom.modalImage.src = "";
}

async function loadImages() {
  let apiBase = getApiBase();
  if (!apiBase) {
    setStatus("Please set API URL first.", "error");
    renderEmptyGallery(dom.galleryEl, dom.galleryCountEl);
    return;
  }

  setStatus("Loading gallery...");
  dom.galleryEl.innerHTML = "";

  try {
    let response = await fetch(makeApiUrl("/images"), { method: "GET" });
    let data;
    try {
      data = await parseJsonSafe(response);
    } catch (parseError) {
      const fallback = getDefaultApiBase();
      if (apiBase !== fallback) {
        apiBase = fallback;
        dom.apiBaseInput.value = fallback;
        localStorage.setItem(API_STORAGE_KEY, fallback);
        response = await fetch(`${fallback}/images`, { method: "GET" });
        data = await parseJsonSafe(response);
      } else {
        throw parseError;
      }
    }

    if (!response.ok) throw new Error(data.error || "Unable to fetch images.");

    if (!Array.isArray(data) || data.length === 0) {
      renderEmptyGallery(dom.galleryEl, dom.galleryCountEl);
      setStatus("Gallery loaded.", "success");
      return;
    }

    dom.galleryEl.innerHTML = "";
    for (const url of data) {
      dom.galleryEl.appendChild(
        createTile(url, {
          onPreview: openPreview,
          onCopy: copyText
        })
      );
    }
    updateGalleryCount(dom.galleryCountEl, data.length);
    setStatus("Gallery loaded.", "success");
  } catch (error) {
    renderEmptyGallery(dom.galleryEl, dom.galleryCountEl);
    setStatus(error.message || "Failed to load gallery.", "error");
  }
}

function persistApiBase() {
  const apiBase = getApiBase();
  if (!apiBase) {
    setStatus("API URL cannot be empty.", "error");
    return false;
  }
  localStorage.setItem(API_STORAGE_KEY, apiBase);
  setStatus("API URL saved.", "success");
  return true;
}

dom.uploadForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const file = dom.imageInput.files[0];
  const validation = isValidImage(file);
  if (!validation.ok) {
    setStatus(validation.reason, "error");
    return;
  }

  const apiBase = getApiBase();
  if (!apiBase) {
    setStatus("Please set API URL first.", "error");
    return;
  }

  const formData = new FormData();
  formData.append("image", file);

  dom.uploadBtn.disabled = true;
  dom.refreshBtn.disabled = true;
  setStatus("Uploading...");

  try {
    const response = await fetch(makeApiUrl("/upload"), {
      method: "POST",
      body: formData
    });
    const data = await parseJsonSafe(response);
    if (!response.ok) throw new Error(data.error || "Upload failed.");
    dom.imageInput.value = "";
    setStatus("Uploaded successfully.", "success");
    await loadImages();
  } catch (error) {
    setStatus(error.message || "Upload failed.", "error");
  } finally {
    dom.uploadBtn.disabled = false;
    dom.refreshBtn.disabled = false;
  }
});

dom.refreshBtn.addEventListener("click", loadImages);

dom.saveApiBtn.addEventListener("click", () => {
  if (persistApiBase()) loadImages();
});

dom.apiBaseInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    if (persistApiBase()) loadImages();
  }
});

dom.closeModalBtn.addEventListener("click", closePreview);
dom.galleryModal.addEventListener("click", (event) => {
  if (event.target === dom.galleryModal) closePreview();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && dom.galleryModal.classList.contains("open")) closePreview();
});

(function init() {
  dom.apiBaseInput.value = getSafeInitialApiBase();
  updateGalleryCount(dom.galleryCountEl, 0);
  loadImages();
})();
