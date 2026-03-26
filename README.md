# SevaHub

SevaHub is now a working full-stack service marketplace demo with a React frontend and an Express backend.

## What is included

- Searchable service catalogue across home repair, tutoring, delivery, wellness, and business support
- Live backend API for categories, dashboard data, service filters, and customer requests
- Request intake flow that stores submissions locally in `server/data/requests.json`
- Optional MongoDB connectivity check so the app still runs even without a database
- Production serving from the backend once the frontend is built

## Run locally

### 1. Install dependencies

```bash
npm install
npm install --prefix client
npm install --prefix server
```

### 2. Configure environment variables

Copy the example env files if you want to customize ports or API URLs.

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

### 3. Start development mode

```bash
npm run dev
```

- Frontend: `http://127.0.0.1:5173`
- Backend: `http://127.0.0.1:5000`

### 4. Build and run production mode

```bash
npm run build
npm run start
```

After the build, the Express server will serve the frontend from `client/dist`.

## Main API routes

- `GET /api/dashboard`
- `GET /api/categories`
- `GET /api/services`
- `GET /api/services/:serviceId`
- `GET /api/requests`
- `POST /api/requests`
- `GET /api/health`

## Notes

- MongoDB is optional. If `MONGO_URI` is not set or MongoDB is unavailable, SevaHub still works using local JSON storage.
- Incoming requests are saved to `server/data/requests.json`.
- `npm run build` builds the frontend only. `npm run start` launches the backend and serves the built frontend if available.

made by sevahub