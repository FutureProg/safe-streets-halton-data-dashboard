import { drizzle } from "drizzle-orm/mysql2";
import { hrpsData } from "./schema";
import mysql2 from "mysql2/promise.js";
import { and, between, count, countDistinct, eq, inArray, notInArray, sql } from "drizzle-orm";
import { MySqlColumn, MySqlSelectBuilder } from "drizzle-orm/mysql-core";
import { HRPSDataModel } from "./models";
import "../../envConfig";

const { DB_USER, DB_HOST, DB_PASS, DB_PORT, DB_NAME } = process.env;
export const db = drizzle({
    client: mysql2.createPool(
        `mysql://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}`,
    ),
});

export type HRPSDataColumns = keyof HRPSDataModel;
export const findData = async (startDate: Date, endDate: Date, options?: {
    includedCities?: string[];
    itemOffset?: number;
    itemCount?: number;
}) => {
    options = {
        itemCount: options?.itemCount ?? 100,
        itemOffset: options?.itemOffset ?? 0,
        includedCities: options?.includedCities ?? []
    };
    return await db.select().from(hrpsData).where(and(
        between(hrpsData.date, startDate, endDate),
        inArray(hrpsData.city, options.includedCities!),
    ))
        .offset(options.itemOffset!)
        .limit(options.itemCount!);
};

export const findDataGroupBy = async (
    groupby: (HRPSDataColumns)[],
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
    let selectFields: Partial<Record<HRPSDataColumns, MySqlColumn>> = {};
    groupby.forEach((value) => {
        selectFields[value] = hrpsData[value];
    });
    let selectBuilder = null;
    if (addCounts === true) {
        selectBuilder = db.select({...selectFields, cases: countDistinct(hrpsData.caseNo), records: count()});
    } else {
        selectBuilder = db.select(selectFields);
    }
    let filters = [
        between(hrpsData.date, startDate, endDate),
        inArray(hrpsData.city, options.includedCities as string[])
    ];
    const result = selectBuilder
        .from(hrpsData)
        .groupBy(...Object.values(selectFields))
        .where(and(
            ...filters
        ))
        .offset(options.itemOffset!)
        .limit(options.itemCount!);
    return await result;
};
