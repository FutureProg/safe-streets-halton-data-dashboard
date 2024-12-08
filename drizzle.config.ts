import { defineConfig } from "drizzle-kit";
import './envConfig';

export default defineConfig({
    out: "./drizzle",
    schema: "./src/db/schema.ts",
    dialect: "mysql",
    dbCredentials: {
        url: process.env.DB_ORM_URL!
    },
    schemaFilter: [process.env.DB_NAME!],
    verbose: true
});