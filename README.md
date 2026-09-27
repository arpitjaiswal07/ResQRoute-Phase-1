# ResQRoute

Highway roadside assistance app using Next.js, React, TypeScript, Tailwind CSS, Leaflet, MongoDB Atlas and optional Groq AI.

## Setup

Requirements: Node.js 20+ and pnpm 12+.

1. Create a MongoDB Atlas M0 cluster and database user.
2. Add your machine IP in Atlas Network Access.
3. Create `.env.local` in this folder:

```env
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/resqroute?retryWrites=true&w=majority
GROQ_API_KEY=
GOOGLE_MAPS_API_KEY=
```

4. Install and seed:

```bash
pnpm install
pnpm seed
```

5. Start:

```bash
pnpm dev
```

Open http://localhost:3000.

## How location/data works

After the user clicks **Fetch My Live GPS Location**, the browser provides latitude/longitude. The frontend calls `/api/shops?lat=...&lng=...&category=...`. The server calculates real distances using Haversine distance. It first checks MongoDB; if seeded providers are more than 50 km away, it tries OpenStreetMap/Overpass for real nearby mechanics/towing. This prevents fake 8,800 km results caused by fixed offsets.

The map and service cards both use the same API data.

## API

- `GET /api/health` — MongoDB health
- `GET /api/shops` — nearby services
- `POST /api/breakdowns` — create assistance request
- `GET /api/breakdowns` — recent requests
- `PATCH /api/breakdowns/:id` — update status/provider
- `POST /api/sos` — log SOS event
- `POST /api/diagnose` — Groq AI diagnosis when `GROQ_API_KEY` is configured

Never commit `.env.local` or API keys.
