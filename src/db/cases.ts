import { eq, desc, getTableColumns, sql } from "drizzle-orm";

import type { DataRecord } from "@/app/common";
import { db } from "./db";
import { isMissingRelation } from "./common";
import { intersections } from "./geo";
import { incidentLocations, incidentsView } from "./incidents";
import { hrpsData } from "./schema";

/** More than this per case would mean something is wrong with the data. */
const MAX_RESULTS = 50;

/**
 * Every incident with the given HRPS case number. The de-duplicated view holds
 * one row per case, but the endpoint returns an array so a case that does turn
 * out to have several incidents is not a breaking change.
 *
 * Falls back one step at a time when the open-data-sync relations are missing
 * (local and test databases): view, then raw rows with intersections, then
 * bare raw rows. Same order as `/api/data`.
 */
export const findByCaseNo = async (caseNo: string): Promise<DataRecord[]> => {
  const fromView = () =>
    db
      .select({
        caseNo: incidentsView.caseNo,
        date: incidentsView.date,
        description: incidentsView.description,
        location: incidentsView.location,
        city: incidentsView.city,
        latitude: incidentsView.latitude,
        longitude: incidentsView.longitude,
        globalId: incidentsView.globalId,
        intersectionId: incidentsView.intersectionId,
        intersectionLabel: intersections.label,
        intersectionLatitude: sql<number | null>`ST_Y(${intersections.geom})`,
        intersectionLongitude: sql<number | null>`ST_X(${intersections.geom})`,
      })
      .from(incidentsView)
      .leftJoin(
        intersections,
        eq(intersections.intersectionId, incidentsView.intersectionId),
      )
      .where(eq(incidentsView.caseNo, caseNo))
      .orderBy(desc(incidentsView.date), desc(incidentsView.globalId))
      .limit(MAX_RESULTS);

  const withIntersections = () =>
    db
      .select({
        ...getTableColumns(hrpsData),
        intersectionId: intersections.intersectionId,
        intersectionLabel: intersections.label,
        intersectionLatitude: sql<number | null>`ST_Y(${intersections.geom})`,
        intersectionLongitude: sql<number | null>`ST_X(${intersections.geom})`,
      })
      .from(hrpsData)
      .leftJoin(
        incidentLocations,
        eq(incidentLocations.globalId, hrpsData.globalId),
      )
      .leftJoin(
        intersections,
        eq(intersections.intersectionId, incidentLocations.intersectionId),
      )
      .where(eq(hrpsData.caseNo, caseNo))
      .orderBy(desc(hrpsData.date), desc(hrpsData.globalId))
      .limit(MAX_RESULTS);

  const bare = () =>
    db
      .select(getTableColumns(hrpsData))
      .from(hrpsData)
      .where(eq(hrpsData.caseNo, caseNo))
      .orderBy(desc(hrpsData.date), desc(hrpsData.globalId))
      .limit(MAX_RESULTS);

  try {
    return await fromView();
  } catch (error) {
    if (!isMissingRelation(error)) throw error;
  }
  try {
    return await withIntersections();
  } catch (error) {
    if (!isMissingRelation(error)) throw error;
  }
  return bare();
};
