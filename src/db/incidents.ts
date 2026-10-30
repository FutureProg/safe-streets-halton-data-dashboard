import { pgSchema, text, varchar } from "drizzle-orm/pg-core";

/**
 * Read-only declaration of the `incidents` schema owned by
 * FutureProg/open-data-sync. See `geo.ts` for why it is kept out of `schema.ts`.
 */
export const incidents = pgSchema("incidents");

/** One row per HRPS incident, holding its nearest intersection (within 30 m). */
export const incidentLocations = incidents.table("incident_locations", {
  globalId: varchar("global_id", { length: 255 }).primaryKey(),
  intersectionId: text("intersection_id"),
});
