# ResQRoute — Fixed Build Notes

## Run
1. Install dependencies:
   `pnpm install`
2. Create `.env.local` with at least:
   - `MONGODB_URI=...`
   - `GROQ_API_KEY=...` (optional; AI falls back if unavailable)
3. Seed providers:
   `pnpm tsx scripts_seed.ts` (if this script exists)
4. Start:
   `pnpm dev`

## Important behavior
- Service providers use the user's GPS coordinates when available.
- If location permission is unavailable, the service directory uses the project's default demo center instead of returning an empty list.
- Provider verification is based on the database `verified` flag, not rating.
- SOS logging is awaited before opening the emergency actions.
- The project uses OpenStreetMap/Leaflet/Overpass for map and nearby-place lookup unless a separate Google Maps implementation is added.
