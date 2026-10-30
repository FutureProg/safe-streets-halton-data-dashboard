import { pgSchema, text } from "drizzle-orm/pg-core";

import { point4326 } from "./common";

/**
 * Read-only declaration of the `geo` schema owned by FutureProg/open-data-sync.
 * It lives outside `schema.ts` so drizzle-kit never creates or migrates it, and
 * the schema is absent from local and test databases (see `isMissingRelation`).
 */
export const geo = pgSchema("geo");

/** Intersections derived from the municipalities' road networks. */
export const intersections = geo
  .materializedView("intersections", {
    intersectionId: text("intersection_id").notNull(),
    label: text("label").notNull(),
    geom: point4326("geom").notNull(),
  })
  .existing();
