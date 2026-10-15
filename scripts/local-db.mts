// Offline development against a local Postgres container.
//
//   pnpm dev-local            start the DB (if needed), migrate, run `next dev` against it
//   pnpm local-db:sync [days] (online) copy the last N days (default 180) of rows from the remote DB
//   pnpm local-db:up          just start + migrate the local DB
//   pnpm local-db:down        stop the container (data is kept in a docker volume)
//
// `sync` runs under `varlock run` (see package.json) so the remote DB_* vars
// arrive decrypted; the other commands only need the local DB.
import { spawn, execFileSync, spawnSync } from "node:child_process";
import pg from "pg";

const NAME = "hrps-local-db";
const LOCAL = {
  host: "localhost",
  port: 5433,
  user: "hrps",
  pass: "hrps",
  db: "hrps",
};
const LOCAL_URL = `postgresql://${LOCAL.user}:${LOCAL.pass}@${LOCAL.host}:${LOCAL.port}/${LOCAL.db}`;

const docker = (...args: string[]) =>
  spawnSync("docker", args, { encoding: "utf8" });

const up = async () => {
  const state = docker("inspect", "-f", "{{.State.Running}}", NAME);
  if (state.status !== 0) {
    execFileSync(
      "docker",
      [
        ...["run", "-d", "--name", NAME],
        ...["-e", `POSTGRES_USER=${LOCAL.user}`],
        ...["-e", `POSTGRES_PASSWORD=${LOCAL.pass}`],
        ...["-e", `POSTGRES_DB=${LOCAL.db}`],
        ...["-p", `${LOCAL.port}:5432`],
        ...["-v", `${NAME}-data:/var/lib/postgresql/data`],
        "postgres:17",
      ],
      { stdio: "inherit" },
    );
  } else if (state.stdout.trim() !== "true") {
    execFileSync("docker", ["start", NAME], { stdio: "inherit" });
  }
  for (let i = 0; ; i++) {
    const c = new pg.Client({ connectionString: LOCAL_URL });
    try {
      await c.connect();
      await c.end();
      break;
    } catch {
      if (i > 60) throw new Error("local Postgres did not become ready");
      await new Promise((r) => setTimeout(r, 500));
    }
  }
  execFileSync(
    "npx",
    ["drizzle-kit", "push", "--config", "drizzle.config.ts", "--force"],
    { stdio: "inherit", env: localEnv() },
  );
  console.log(`[local-db] ready at ${LOCAL_URL}`);
};

// Env that points the app (and drizzle-kit) at the local DB, overriding
// anything .env.local supplies. DB_URL wins over the DB_* parts, but they're
// set too because the env schema marks them required.
const localEnv = () => ({
  ...process.env,
  DB_HOST: LOCAL.host,
  DB_PORT: String(LOCAL.port),
  DB_USER: LOCAL.user,
  DB_PASS: LOCAL.pass,
  DB_NAME: LOCAL.db,
  DB_URL: LOCAL_URL,
  DB_ORM_URL: LOCAL_URL,
  DB_CA_CERT: "",
});

const sync = async () => {
  await up();
  const { DB_USER, DB_HOST, DB_PASS, DB_PORT, DB_NAME, DB_URL, DB_CA_CERT } =
    process.env;
  const url = new URL(
    DB_URL ??
      `postgresql://${DB_USER}:${DB_PASS}@${DB_HOST}:${DB_PORT}/${DB_NAME}`,
  );
  if (DB_CA_CERT) url.searchParams.delete("sslmode");
  const remote = new pg.Client({
    connectionString: url.toString(),
    ssl: DB_CA_CERT ? { ca: DB_CA_CERT } : undefined,
  });
  const local = new pg.Client({ connectionString: LOCAL_URL });
  await Promise.all([remote.connect(), local.connect()]);
  const cols =
    'case_no, date, description, location, city, latitude, longitude, "globalId"';
  const days = Number(process.argv[3] ?? 180);
  if (!Number.isFinite(days) || days <= 0) throw new Error("days must be > 0");
  const { rows } = await remote.query(
    `SELECT ${cols} FROM safe_streets_halton.hrps_data
     WHERE date >= NOW() - make_interval(days => $1) ORDER BY date DESC`,
    [days],
  );
  console.log(
    `[local-db] fetched ${rows.length} rows from the last ${days} days`,
  );
  await local.query("BEGIN");
  await local.query("TRUNCATE safe_streets_halton.hrps_data");
  const names = cols.split(", ");
  const CHUNK = 2000;
  for (let i = 0; i < rows.length; i += CHUNK) {
    const chunk = rows.slice(i, i + CHUNK);
    const params: unknown[] = [];
    const tuples = chunk.map((r, ri) => {
      names.forEach((n) => params.push(r[n.replace(/"/g, "")]));
      return `(${names.map((_, ci) => `$${ri * names.length + ci + 1}`).join(",")})`;
    });
    await local.query(
      `INSERT INTO safe_streets_halton.hrps_data (${cols}) VALUES ${tuples.join(",")}`,
      params,
    );
  }
  await local.query("COMMIT");
  await Promise.all([remote.end(), local.end()]);
  console.log("[local-db] sync complete");
};

const dev = async () => {
  await up();
  const child = spawn(
    "npx",
    ["varlock", "run", "--", "next", "dev", "--webpack"],
    {
      stdio: "inherit",
      env: localEnv(),
    },
  );
  const stop = () => child.kill();
  process.on("SIGINT", stop);
  process.on("SIGTERM", stop);
  child.on("exit", (code) => process.exit(code ?? 0));
};

const cmd = process.argv[2];
if (cmd === "up") await up();
else if (cmd === "sync") await sync();
else if (cmd === "dev") await dev();
else if (cmd === "down")
  execFileSync("docker", ["stop", NAME], { stdio: "inherit" });
else {
  console.error("usage: local-db.mts <up|sync|dev|down>");
  process.exit(1);
}
