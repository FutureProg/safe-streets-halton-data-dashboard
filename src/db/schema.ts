import {
  unique,
  text,
  timestamp,
  doublePrecision,
  varchar,
  pgSchema,
} from "drizzle-orm/pg-core";

export const pgSafeStreetsHalton = pgSchema("safe_streets_halton");

export const hrpsData = pgSafeStreetsHalton.table(
  "hrps_data",
  {
    caseNo: text("case_no"),
    date: timestamp().defaultNow().notNull(),
    description: text().notNull(),
    location: text(),
    city: text(),
    latitude: doublePrecision().notNull(),
    longitude: doublePrecision().notNull(),
    globalId: varchar({ length: 255 }).notNull(),
  },
  (table) => [unique("hrps_data_unique_globalId").on(table.globalId)],
);
