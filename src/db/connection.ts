import "../../envConfig";

/**
 * Connection settings for the Node runtime (local dev, tests, `next start`).
 * The Cloudflare build swaps this module for `connection.cloudflare.ts`
 * (see vite.cloudflare.config.ts).
 */
export const isWorker = false;

export function getPoolConfig() {
  const { DB_USER, DB_HOST, DB_PASS, DB_PORT, DB_NAME, DB_URL, DB_CA_CERT } =
    process.env;
  const connectionString = new URL(
    DB_URL ??
      `postgresql://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}`,
  );
  // pg lets URL-derived ssl settings (from sslmode) override the `ssl` option,
  // which would discard the CA below, so drop it from the URL.
  if (DB_CA_CERT) connectionString.searchParams.delete("sslmode");
  return {
    connectionString: connectionString.toString(),
    ssl: DB_CA_CERT ? { ca: DB_CA_CERT } : undefined,
  };
}
