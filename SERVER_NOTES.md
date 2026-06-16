# Server Notes

The site now uses a real no-dependency Node backend.

Run:
```powershell
npm start
```

Open:
```text
http://127.0.0.1:3000
```

Default users:
```text
student: college / 1234
admin: admin / admin123
```

Important paths:
- `server.js` - small HTTP bootstrap
- `server/` - backend modules: auth, routes, storage, multipart uploads, static files
- `data/app-data.json` - persisted groups and submission metadata
- `data/bin-database.json` - local BIN registry
- `storage/uploads/` - uploaded student PDFs and admin report PDFs
- `src/js/` - frontend ES modules
- `assets/templates/` - DOCX templates

Core API:
```text
GET  /api/health
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me

GET    /api/groups
POST   /api/groups
PATCH  /api/groups/:id
PATCH  /api/groups/:id/practice
DELETE /api/groups/:id

GET    /api/submissions
POST   /api/submissions
PATCH  /api/submissions/:id
DELETE /api/submissions/:id
POST   /api/submissions/:id/report
GET    /api/submissions/:id/file?type=submission
GET    /api/submissions/:id/file?type=report

GET /api/bin/:bin
```

Notes:
- No external libraries are used.
- Auth is cookie-session based and kept in memory until server restart.
- Metadata persists in `data/app-data.json`; uploaded PDFs persist in `storage/uploads/`.
