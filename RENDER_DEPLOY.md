# Deploy to Render

This project is ready for Render as a Node Web Service.

## Quick Deploy

1. Push this folder to a GitHub repository.
2. Open Render Dashboard.
3. Click **New** -> **Blueprint**.
4. Connect the repository.
5. Render will read `render.yaml` and create the web service.

The site will be available at the generated `*.onrender.com` URL.

## Why The Disk Is Included

The app stores uploaded PDF files and `app-data.json` on disk.
Render's normal service filesystem is ephemeral, so uploads can disappear after restarts or redeploys.

`render.yaml` attaches a persistent disk at:

```text
/var/data
```

The backend then stores runtime data here:

```text
/var/data/data/app-data.json
/var/data/storage/uploads
```

This requires a paid Render web service plan. If you deploy without the disk, the app can run on a free web service, but uploaded files and changed statuses are not durable.

## Manual Web Service Settings

If you do not use Blueprint, create a Render **Web Service** with:

```text
Runtime: Node
Build Command: npm install
Start Command: npm start
Health Check Path: /api/health
```

Add environment variables if you attach a disk:

```text
APP_DATA_DIR=/var/data/data
APP_STORAGE_DIR=/var/data/storage
```
