import { customType, pgSchema, text, varchar } from "drizzle-orm/pg-core";

/**
 * Read-only declarations of tables owned by FutureProg/open-data-sync. They
 * live in their own file, outside `schema.ts`, so drizzle-kit never tries to
 * create or migrate them. Both schemas are absent from local and test
 * databases, so every query that joins them must tolerate their absence
 * (see `isMissingCuratedData`).
 */
const point4326 = customType<{ data: string }>({
  dataType: () => "geometry(Point,4326)",
});

const incidentsSchema = pgSchema("incidents");
const geoSchema = pgSchema("geo");

/** One row per HRPS incident, holding its nearest intersection (within 30 m). */
export const incidentLocations = incidentsSchema.table("incident_locations", {
  globalId: varchar("global_id", { length: 255 }).primaryKey(),
  intersectionId: text("intersection_id"),
});

/** Intersections derived from the municipalities' road networks. */
export const intersections = geoSchema
  .materializedView("intersections", {
    intersectionId: text("intersection_id").notNull(),
    label: text("label").notNull(),
    geom: point4326("geom").notNull(),
  })
  .existing();

/** Postgres: undefined_table / invalid_schema_name / undefined_column. */
const MISSING_CODES = new Set(["42P01", "3F000", "42703"]);

export const isMissingCuratedData = (error: unknown): boolean => {
  let current: any = error;
  for (let depth = 0; current && depth < 4; depth++) {
    if (MISSING_CODES.has(current.code)) return true;
    current = current.cause;
  }
  return false;
};
