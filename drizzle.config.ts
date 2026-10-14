import { defineConfig } from "drizzle-kit";
import "./envConfig";

export default defineConfig({
  out: "./drizzle",
  schema: "./src/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: process.env.DB_CA_CERT
    ? {
        host: process.env.DB_HOST!,
        port: Number(process.env.DB_PORT),
        user: process.env.DB_USER!,
        password: process.env.DB_PASS!,
        database: process.env.DB_NAME!,
        ssl: { ca: process.env.DB_CA_CERT },
      }
    : { url: process.env.DB_ORM_URL! },
  schemaFilter: ["safe_streets_halton"],
  verbose: true,
});
