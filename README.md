# Scalable Image Upload System (No Database)

This project provides:

- `POST /upload` to upload JPG/PNG images up to 2MB
- `GET /images` to list uploaded image URLs
- S3-based storage with no database (and optional local mode for full offline testing)
- Simple frontend gallery (`frontend/index.html`)
- GitHub Actions workflow for EC2 deployment

## Project Structure

```text
.
├── ecosystem.config.js
├── backend
│   ├── src
│   │   ├── app.js
│   │   ├── server.js
│   │   └── storage.js
│   ├── server.js          # compatibility entrypoint
│   ├── s3.js              # compatibility export
│   ├── package.json
│   └── .env.example
├── frontend
│   └── index.html
└── .github
    └── workflows
        └── deploy.yml
```

## Backend Setup

1. Install dependencies:

```bash
cd backend
npm install
```

2. Create environment file:

```bash
cp .env.example .env
```

3. Fill in `.env` values:

```env
STORAGE_DRIVER=local
AWS_KEY=your_access_key
AWS_SECRET=your_secret_key
AWS_REGION=ap-south-1
BUCKET=your_bucket_name
PORT=3001
PUBLIC_BASE_URL=http://localhost:3001
```

`STORAGE_DRIVER` options:

- `local`: stores files in `backend/uploads` (best for complete local testing)
- `s3`: uses AWS S3 (set real AWS values)

4. Run backend:

```bash
npm start
```

For two local instances:

```bash
PORT=3001 node server.js
PORT=3002 node server.js
```

Windows-friendly commands:

```bash
npm run start:3001
npm run start:3002
```

## PM2 Deployment

Use the provided ecosystem file:

```bash
pm2 startOrReload ecosystem.config.js --update-env
pm2 save
```

This starts two backend instances:

- `image-api-3001` on port 3001
- `image-api-3002` on port 3002

## API

### Upload image

- **Endpoint:** `POST /upload`
- **Body:** `multipart/form-data`, field name `image`
- **Response:**

```json
{ "url": "https://<bucket>.s3.<region>.amazonaws.com/<key>" }
```

### List images

- **Endpoint:** `GET /images`
- **Response:**

```json
["image_url_1", "image_url_2"]
```

## Frontend

Open `frontend/index.html` in a browser.

- Production-style UI includes:
  - persisted API base URL (`localStorage`)
  - client-side file validation (JPG/PNG, max 2MB)
  - upload/loading/error/success states
  - gallery cards with **Open** and **Copy URL**

## NGINX Load Balancer (EC2)

Use an upstream with two backend ports:

```nginx
upstream backend {
    server 127.0.0.1:3001;
    server 127.0.0.1:3002;
}

server {
    listen 80;

    location / {
        root /home/ubuntu/app/frontend;
        index index.html;
    }

    location /upload {
        proxy_pass http://backend;
    }

    location /images {
        proxy_pass http://backend;
    }
}
```

## GitHub Actions Deployment

Workflow file: `.github/workflows/deploy.yml`

Required repository secrets:

- `HOST` (EC2 public IP / DNS)
- `USER` (EC2 SSH username, e.g. `ubuntu`)
- `KEY` (private key for SSH)

## Notes

- Backend is stateless
- No authentication (as per assignment scope)
- Bucket read access should allow `s3:GetObject` for image URLs
