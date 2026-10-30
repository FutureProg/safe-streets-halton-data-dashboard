import {
  doublePrecision,
  pgSchema,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

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

/**
 * De-duplicated incident list: one row per HRPS `case_no`, refreshed by the
 * daily cron. `hrps_data` holds several copies of many cases, so read this
 * instead. Columns the dashboard does not use are left out.
 */
export const incidentsView = incidents
  .materializedView("incidents", {
    caseNo: text("case_no").notNull(),
    globalId: varchar("global_id", { length: 255 }).notNull(),
    // Non-null in hrps_data, so non-null here.
    date: timestamp("date", { withTimezone: true }).notNull(),
    /** The most serious description of the case. */
    description: text("description").notNull(),
    location: text("location"),
    city: text("city"),
    latitude: doublePrecision("latitude").notNull(),
    longitude: doublePrecision("longitude").notNull(),
    intersectionId: text("intersection_id"),
  })
  .existing();
