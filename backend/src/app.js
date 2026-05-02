const path = require("path");
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { uploadImage, listImageUrls } = require("./storage");

const MAX_IMAGE_SIZE_BYTES = 20 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/png"]);

function buildObjectKey(filename = "image") {
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}-${safeName}`;
}

function createApp() {
  const app = express();

  app.use(cors());
  app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_IMAGE_SIZE_BYTES },
    fileFilter: (_req, file, cb) => {
      if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
        cb(new Error("Only JPG and PNG files are allowed"));
        return;
      }
      cb(null, true);
    }
  });

  app.get("/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.post("/upload", upload.single("image"), async (req, res, next) => {
    try {
      if (!req.file) {
        res.status(400).json({ error: "image field is required" });
        return;
      }

      const key = buildObjectKey(req.file.originalname);
      const url = await uploadImage({
        key,
        buffer: req.file.buffer,
        contentType: req.file.mimetype
      });

      res.status(201).json({ url });
    } catch (error) {
      next(error);
    }
  });

  app.get("/images", async (_req, res, next) => {
    try {
      const images = await listImageUrls();
      res.json(images);
    } catch (error) {
      next(error);
    }
  });

  app.use((error, _req, res, _next) => {
    if (error instanceof multer.MulterError) {
      if (error.code === "LIMIT_FILE_SIZE") {
        res.status(400).json({ error: "Image must be 20MB or smaller" });
        return;
      }
      res.status(400).json({ error: error.message });
      return;
    }

    if (error.message === "Only JPG and PNG files are allowed") {
      res.status(400).json({ error: error.message });
      return;
    }

    res.status(500).json({ error: "Internal server error" });
  });

  return app;
}

module.exports = {
  createApp
};

