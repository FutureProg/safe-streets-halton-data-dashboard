import { drizzle } from "drizzle-orm/mysql2";
import { hrpsData } from "./schema";
import mysql2 from "mysql2/promise.js";
import { and, between, eq, notInArray } from "drizzle-orm";
import { MySqlColumn } from "drizzle-orm/mysql-core";
import { HRPSDataModel } from "./models";
import "../../envConfig";

const { DB_USER, DB_HOST, DB_PASS, DB_PORT, DB_NAME } = process.env;
export const db = drizzle({
    client: mysql2.createPool(
        `mysql://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}`,
    ),
});

type HRPSDataColumns = keyof HRPSDataModel;
export const findData = async (startDate: Date, endDate: Date, options?: {
    excludedCities?: string[];
    itemOffset?: number;
    itemCount?: number;
}) => {
    options = {
        excludedCities: options?.excludedCities ?? [""],
        itemCount: options?.itemCount ?? 100,
        itemOffset: options?.itemOffset ?? 0,
    };
    return await db.select().from(hrpsData).where(and(
        between(hrpsData.date, startDate, endDate),
        notInArray(hrpsData.city, options.excludedCities!),
    ))
        .offset(options.itemOffset!)
        .limit(options.itemCount!);
};

export const findDataGroupBy = async (
    groupby: (HRPSDataColumns)[],
    filter: string,
    startDate: Date,
    endDate: Date,
    options?: {
        excludedCities?: string[];
        itemOffset?: number;
        itemCount?: number;
    },
) => {
    options = {
        excludedCities: options?.excludedCities ?? [""],
        itemCount: options?.itemCount ?? 100,
        itemOffset: options?.itemOffset ?? 0,
    };
    let selectFields: Partial<Record<HRPSDataColumns, MySqlColumn>> = {};
    groupby.forEach((value) => {
        selectFields[value] = hrpsData[value];
    });
    let result = db.select(selectFields);
};
