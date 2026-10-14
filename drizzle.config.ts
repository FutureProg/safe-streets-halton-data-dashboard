import { defineConfig } from "drizzle-kit";
import "./envConfig";

// drizzle-kit can't attach a CA to a plain `url`, so when one is supplied the
// connection URL is expanded into discrete fields.
const ormUrl = process.env.DB_CA_CERT
  ? new URL(process.env.DB_ORM_URL!)
  : undefined;

export default defineConfig({
  out: "./drizzle",
  schema: "./src/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: ormUrl
    ? {
        host: ormUrl.hostname,
        port: Number(ormUrl.port) || 5432,
        user: decodeURIComponent(ormUrl.username),
        password: decodeURIComponent(ormUrl.password),
        database: ormUrl.pathname.slice(1),
        ssl: { ca: process.env.DB_CA_CERT! },
      }
    : { url: process.env.DB_ORM_URL! },
  schemaFilter: ["safe_streets_halton"],
  verbose: true,
});
