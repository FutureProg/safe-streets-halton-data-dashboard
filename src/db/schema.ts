import { mysqlTable, unique, text, timestamp, double, varchar, int } from "drizzle-orm/mysql-core";

export const hrpsData = mysqlTable("hrps_data", {
	caseNo: text("case_no"),
	date: timestamp().onUpdateNow().notNull(),
	description: text().notNull(),
	location: text(),
	city: text(),
	latitude: double().notNull(),
	longitude: double().notNull(),
	globalId: varchar({ length: 255 }).notNull(),
},
(table) => {
	return {
		hrpsDataUniqueGlobalId: unique("hrps_data_unique_globalId").on(table.globalId),
	}
});

export const statscanPopulationEstimates = mysqlTable("statscan_population_estimates", {
	year: int().notNull(),
	town: varchar({ length: 100 }).notNull(),
	population: int().notNull(),
});