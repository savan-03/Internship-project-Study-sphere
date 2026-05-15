## Infrastructure Module

This repo now includes a basic production-style stack for local deployment and handoff:

- `docker-compose.yml`
  Runs `mongo`, `redis`, `backend`, and `frontend`
- `BACKEND/Dockerfile`
  Production Node container for the API
- `FRONTEND/Dockerfile`
  Vite build served by Nginx
- `FRONTEND/nginx.conf`
  SPA fallback plus `/api` reverse proxy to the backend

### Environment notes

- Backend accepts either `MONGO_URI` or `MONGODB_URI`
- Backend CORS accepts comma-separated `ALLOWED_ORIGINS`
- Frontend can now use:
  - `VITE_API_URL=http://localhost:3000` for direct local API calls
  - empty `VITE_API_URL` for reverse-proxy deployments using `/api`

### New endpoints

- `GET /api/health`
  Basic health snapshot with API, MongoDB, and Redis status
- `GET /api/ready`
  Readiness endpoint for containers and load balancers

### Local production-style run

From the repo root:

```powershell
docker compose up --build
```

Then open:

- Frontend: `http://localhost:8080`
- Backend health: `http://localhost:3000/api/health`

### Development run

Use the existing local setup when you want hot reload:

```powershell
# backend
cd BACKEND
npm run dev

# frontend
cd FRONTEND
npm run dev
```

### Important

- If you use uploads or OpenAI features in Docker, provide the matching env vars before `docker compose up`
- The compose file includes safe placeholder JWT values for local stack startup only; replace them for real deployment
