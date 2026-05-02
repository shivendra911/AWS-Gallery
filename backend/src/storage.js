const fs = require("fs");
const path = require("path");
const { S3Client, PutObjectCommand, ListObjectsV2Command } = require("@aws-sdk/client-s3");

const driver = (process.env.STORAGE_DRIVER || "s3").toLowerCase();
const region = process.env.AWS_REGION;
const bucket = process.env.BUCKET;
const localUploadDir = path.join(__dirname, "..", "uploads");

if (driver === "local" && !fs.existsSync(localUploadDir)) {
  fs.mkdirSync(localUploadDir, { recursive: true });
}

function getPublicBaseUrl() {
  return process.env.PUBLIC_BASE_URL || `http://localhost:${process.env.PORT || 3001}`;
}

function createS3ObjectUrl(key) {
  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
}

function createLocalObjectUrl(key) {
  return `${getPublicBaseUrl().replace(/\/$/, "")}/uploads/${key}`;
}

let s3;
if (driver === "s3") {
  const requiredVars = ["AWS_KEY", "AWS_SECRET", "AWS_REGION", "BUCKET"];
  for (const variable of requiredVars) {
    if (!process.env[variable]) {
      throw new Error(`Missing required environment variable: ${variable}`);
    }
  }

  s3 = new S3Client({
    region,
    credentials: {
      accessKeyId: process.env.AWS_KEY,
      secretAccessKey: process.env.AWS_SECRET
    }
  });
}

async function uploadImage({ key, buffer, contentType }) {
  if (driver === "local") {
    const filePath = path.join(localUploadDir, key);
    fs.writeFileSync(filePath, buffer);
    return createLocalObjectUrl(key);
  }

  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType
    })
  );

  return createS3ObjectUrl(key);
}

async function listImageUrls() {
  if (driver === "local") {
    const files = fs.existsSync(localUploadDir) ? fs.readdirSync(localUploadDir) : [];
    return files.map((name) => createLocalObjectUrl(name));
  }

  const result = await s3.send(
    new ListObjectsV2Command({
      Bucket: bucket
    })
  );

  const keys = (result.Contents || []).map((item) => item.Key).filter(Boolean);
  return keys.map((key) => createS3ObjectUrl(key));
}

module.exports = {
  uploadImage,
  listImageUrls
};
