import { drizzle } from "drizzle-orm/node-postgres";
import { hrpsData } from "./schema";
import { incidentsView } from "./incidents";
import { isMissingRelation } from "./common";
import { Pool } from "pg";
import {
  and,
  between,
  count,
  countDistinct,
  inArray,
  isNotNull,
} from "drizzle-orm";
import { PgColumn } from "drizzle-orm/pg-core";
import { HRPSDataModel } from "./models";
import { getPoolConfig, isWorker } from "@/db/connection";

const createDb = () => drizzle(new Pool({ ...getPoolConfig(), max: 5 }));

let sharedDb: ReturnType<typeof createDb> | undefined;

/**
 * Node keeps one pool for the process. A Worker cannot reuse a connection
 * across requests, so it gets a small fresh pool each time (Hyperdrive does
 * the real pooling).
 */
const getDb = () => (isWorker ? createDb() : (sharedDb ??= createDb()));

export const db = new Proxy({} as ReturnType<typeof createDb>, {
  get(_target, prop) {
    const current = getDb();
    const value = Reflect.get(current, prop, current);
    return typeof value === "function" ? value.bind(current) : value;
  },
});

export type HRPSDataColumns = keyof HRPSDataModel;

export const findInfo = async () => {
  // Same set of types as the de-duplicated view serves, so the filter list
  // matches the incidents; raw rows when the view does not exist yet.
  const descriptionUniqueInfo = db
    .selectDistinct({ value: incidentsView.description })
    .from(incidentsView)
    .catch((error) => {
      if (!isMissingRelation(error)) throw error;
      return db.selectDistinct({ value: hrpsData.description }).from(hrpsData);
    });
  const citiesUniqueInfo = db
    .selectDistinct({ value: hrpsData.city })
    .from(hrpsData)
    .where(isNotNull(hrpsData.city));
  return Promise.allSettled([descriptionUniqueInfo, citiesUniqueInfo]).then(
    ([incidentTypes, cities]) => {
      [incidentTypes, cities].forEach((result) => {
        if (result.status === "rejected") console.error(result.reason);
      });
      return {
        incidents:
          incidentTypes.status == "fulfilled"
            ? incidentTypes.value.map((x) => x.value)
            : undefined,
        cities:
          cities.status == "fulfilled"
            ? cities.value.map((x) => x.value!)
            : undefined,
      };
    },
  );
};

export const findDataGroupBy = async (
  groupby: HRPSDataColumns[],
  startDate: Date,
  endDate: Date,
  addCounts: boolean = true,
  options?: {
    includedCities?: string[];
    itemOffset?: number;
    itemCount?: number;
    filter?: string;
  },
) => {
  options = {
    includedCities: options?.includedCities ?? [],
    itemCount: options?.itemCount ?? 100,
    itemOffset: options?.itemOffset ?? 0,
  };
  let selectFields: Partial<Record<HRPSDataColumns, PgColumn>> = {};
  groupby.forEach((value) => {
    selectFields[value] = hrpsData[value];
  });
  let selectBuilder = null;
  if (addCounts === true) {
    selectBuilder = db.select({
      ...selectFields,
      cases: countDistinct(hrpsData.caseNo),
      records: count(),
    });
  } else {
    selectBuilder = db.select(selectFields);
  }
  let filters = [
    between(hrpsData.date, startDate, endDate),
    inArray(hrpsData.city, options.includedCities as string[]),
  ];
  const result = selectBuilder
    .from(hrpsData)
    .groupBy(...Object.values(selectFields))
    .where(and(...filters))
    .offset(options.itemOffset!)
    .limit(options.itemCount!);
  return await result;
};
