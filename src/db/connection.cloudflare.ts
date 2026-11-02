import { env } from "cloudflare:workers";

/** Running inside a Cloudflare Worker: connect through Hyperdrive. */
export const isWorker = true;

export function getPoolConfig() {
  const hyperdrive = (
    env as unknown as { HYPERDRIVE?: { connectionString: string } }
  ).HYPERDRIVE;
  if (!hyperdrive) {
    throw new Error("The HYPERDRIVE binding is not configured on this Worker.");
  }
  // Hyperdrive holds the database's host, credentials and CA certificate.
  return { connectionString: hyperdrive.connectionString };
}
