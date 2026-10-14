import { drizzle } from "drizzle-orm/node-postgres";
import { hrpsData } from "./schema";
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
import "../../envConfig";

const { DB_USER, DB_HOST, DB_PASS, DB_PORT, DB_NAME, DB_URL, DB_CA_CERT } =
  process.env;
const connectionString = new URL(
  DB_URL ??
    `postgresql://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}`,
);
// pg lets URL-derived ssl settings (from sslmode) override the `ssl` option,
// which would discard the CA below, so drop it from the URL.
if (DB_CA_CERT) connectionString.searchParams.delete("sslmode");
export const db = drizzle(
  new Pool({
    connectionString: connectionString.toString(),
    ssl: DB_CA_CERT ? { ca: DB_CA_CERT } : undefined,
  }),
);

export type HRPSDataColumns = keyof HRPSDataModel;

export const findInfo = async () => {
  const descriptionUniqueInfo = db
    .selectDistinct({ value: hrpsData.description })
    .from(hrpsData);
  const citiesUniqueInfo = db
    .selectDistinct({ value: hrpsData.city })
    .from(hrpsData)
    .where(isNotNull(hrpsData.city));
  return Promise.allSettled([descriptionUniqueInfo, citiesUniqueInfo]).then(
    ([incidentTypes, cities]) => {
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
    (error: any) => {
      console.log(error);
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
