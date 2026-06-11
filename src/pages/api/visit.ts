import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

export const prerender = false;

const DB_PATH = process.env.VISIT_DB_PATH || "data/visits.db";

let db: Database.Database | null = null;

function getDb(): Database.Database {
  if (db) return db;

  mkdirSync(dirname(DB_PATH), { recursive: true });

  db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS visits (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      count INTEGER NOT NULL DEFAULT 0
    )
  `);

  const row = db.prepare("SELECT count FROM visits WHERE id = 1").get();
  if (!row) {
    db.prepare("INSERT INTO visits (id, count) VALUES (1, 0)").run();
  }

  return db;
}

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });

export async function POST(): Promise<Response> {
  try {
    const database = getDb();
    const row = database
      .prepare("UPDATE visits SET count = count + 1 RETURNING count")
      .get() as { count: number };
    return json({ count: row.count });
  } catch {
    return json({ error: "Internal error" }, 500);
  }
}

export async function GET(): Promise<Response> {
  try {
    const database = getDb();
    const row = database
      .prepare("SELECT count FROM visits WHERE id = 1")
      .get() as { count: number };
    return json({ count: row.count });
  } catch {
    return json({ error: "Internal error" }, 500);
  }
}
