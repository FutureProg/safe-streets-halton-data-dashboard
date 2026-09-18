// Boots a throwaway MySQL container (via Testcontainers), migrates the
// schema, seeds a couple of fixture rows so the static dropdown values
// (municipalities / incident types) aren't empty, then starts `next dev` as
// a child process that inherits the resulting DB_* env vars.
//
// This whole script is playwright.config.ts's `webServer.command`. Playwright
// starts it once, polls `baseURL` until it responds, then runs the suite;
// killing this process (SIGTERM/SIGINT) tears down `next dev` and the
// container together.
import { MySqlContainer } from '@testcontainers/mysql';
import { spawn, execFileSync } from 'node:child_process';
import mysql from 'mysql2/promise';

const PORT = process.env.PORT || 3002;

const container = await new MySqlContainer('mysql:8')
  .withDatabase('e2e')
  .withUsername('e2e')
  .withUserPassword('e2e')
  .start();

process.env.DB_HOST = container.getHost();
process.env.DB_PORT = String(container.getPort());
process.env.DB_USER = container.getUsername();
process.env.DB_PASS = container.getUserPassword();
process.env.DB_NAME = container.getDatabase();
process.env.DB_ORM_URL = container.getConnectionUri();

console.log(`[testcontainers] MySQL ready at ${process.env.DB_HOST}:${process.env.DB_PORT}`);

execFileSync('npx', ['drizzle-kit', 'push', '--config', 'drizzle.config.ts', '--force'], {
  stdio: 'inherit',
  env: process.env,
});

const connection = await mysql.createConnection(process.env.DB_ORM_URL);
await connection.execute(
  `INSERT INTO hrps_data (case_no, date, description, location, city, latitude, longitude, globalId) VALUES
   (?, NOW(), ?, ?, ?, ?, ?, ?),
   (?, NOW(), ?, ?, ?, ?, ?, ?)`,
  [
    'SEED-0001', 'Motor Vehicle Collision', '123 Main St', 'Oakville', 43.4675, -79.6877, 'seed-0001',
    'SEED-0002', 'Pedestrian Incident', '456 King St', 'Burlington', 43.3255, -79.7990, 'seed-0002',
  ],
);
await connection.end();
console.log('[testcontainers] seed data inserted');

const child = spawn('npx', ['next', 'dev', '-p', String(PORT)], {
  stdio: 'inherit',
  env: process.env,
});

let shuttingDown = false;
const shutdown = async (code: number) => {
  if (shuttingDown) return;
  shuttingDown = true;
  child.kill();
  await container.stop();
  process.exit(code ?? 0);
};

process.on('SIGTERM', () => shutdown(0));
process.on('SIGINT', () => shutdown(0));
child.on('exit', (code) => shutdown(code ?? 0));
