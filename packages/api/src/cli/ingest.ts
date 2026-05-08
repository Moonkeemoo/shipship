// Ingestor entry — connects to AISStream AND writes to Postgres.
// Requires DATABASE_URL set + Postgres+TimescaleDB running (see docker-compose.yml).
//
// Run: bun run ingest

import { env } from "../env.ts";
import { logger } from "../log.ts";
import { startIngestor } from "../ingestor.ts";
import { sql } from "../db.ts";

if (!sql) {
  logger.error({ event: "no_db" }, "DATABASE_URL not set; use 'bun run smoke' for connection test without DB");
  process.exit(1);
}

logger.info(
  {
    event: "ingest_start",
    bboxes: env.AIS_BBOXES,
    keyPreview: env.AISSTREAM_KEY.slice(0, 6) + "…",
    persist: true,
  },
  "starting AISStream ingestor with Postgres persistence",
);

startIngestor({ persist: true, bboxes: env.AIS_BBOXES });
