# Safe Streets Dashboard
This dashboard uses data from the Halton Regional Police Services to display stats and maps of traffic-related incidents in Halton Region. 
![screenshot of dashboard website](screenshot_1.png)

## Why this dashboard?
The [existing dashboard](https://experience.arcgis.com/experience/e2d6a32212ba438da4144ea42dfccaf9) for the Halton Regional Police is limited to the past 365 days, data prior to that is deleted.
By keeping records locally, we are able to perform long-term time-series analysis that currently isn't facilitated. The dashboard aims to make understanding safety issues simpler, and raising awareness of the issue in Halton as well as solutions. 

## How it works
1. A separate pipeline (`HRPS_Pipeline`, a private Deno/TypeScript service) pulls incident data from the Halton Regional Police [ArcGIS REST API](https://developers.arcgis.com/rest/) `Crime_Map` FeatureServer once a day via `Deno.cron` (and exposes an admin-triggered `Deno.serve` endpoint for manual/backfill runs). It validates each record with Valibot and upserts it into the database, keyed on the ArcGIS `GlobalID`.
2. This NextJS app has no separate backend server - its own `src/app/api/*` route handlers query the database directly using [Drizzle ORM](https://orm.drizzle.team/). Note that as of this writing the dashboard's database is still MySQL, while the pipeline has already moved to Postgres; the dashboard side of that migration is in progress (see `NEW_DB_ORM_URL` in `.env.schema`) but not yet cut over.
3. The NextJS React web application fetches from its own API routes (via SWR, coordinated by an XState state machine and Redux Toolkit) and displays the results on a map using [Plotly](https://plotly.com/javascript/react/) and [Leaflet](https://leafletjs.com/).