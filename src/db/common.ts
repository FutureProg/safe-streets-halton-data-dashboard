import { customType } from "drizzle-orm/pg-core";

/** PostGIS point column, SRID 4326. Drizzle's own `geometry()` has no SRID option. */
export const point4326 = customType<{ data: string }>({
  dataType: () => "geometry(Point,4326)",
});

/** Postgres: undefined_table / invalid_schema_name / undefined_column. */
const MISSING_CODES = new Set(["42P01", "3F000", "42703"]);

/**
 * Whether a query failed because a table, schema or column is absent, as it is
 * for the open-data-sync schemas in local and test databases. Drizzle wraps the
 * driver error, so the Postgres code can sit on `cause`.
 */
export const isMissingRelation = (error: unknown): boolean => {
  let current: any = error;
  for (let depth = 0; current && depth < 4; depth++) {
    if (MISSING_CODES.has(current.code)) return true;
    current = current.cause;
  }
  return false;
};
