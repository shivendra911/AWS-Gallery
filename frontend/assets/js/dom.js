export function getDom() {
  return {
    apiBaseInput: document.getElementById("apiBase"),
    saveApiBtn: document.getElementById("saveApiBtn"),
    refreshBtn: document.getElementById("refreshBtn"),
    uploadForm: document.getElementById("uploadForm"),
    uploadBtn: document.getElementById("uploadBtn"),
    imageInput: document.getElementById("imageInput"),
    statusEl: document.getElementById("status"),
    galleryEl: document.getElementById("gallery"),
    galleryCountEl: document.getElementById("galleryCount"),
    galleryModal: document.getElementById("galleryModal"),
    modalImage: document.getElementById("modalImage"),
    closeModalBtn: document.getElementById("closeModalBtn")
  };
}
