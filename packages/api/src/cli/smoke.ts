// Smoke-test entry — connects to AISStream and logs samples WITHOUT DB writes.
// Use this to verify the API key + connection before bringing up Postgres.
//
// Run: bun run smoke

import { env } from "../env.ts";
import { logger } from "../log.ts";
import { startIngestor } from "../ingestor.ts";

logger.info(
  {
    event: "smoke_start",
    bboxes: env.AIS_BBOXES,
    keyPreview: env.AISSTREAM_KEY.slice(0, 6) + "…",
    persist: false,
  },
  "starting AISStream smoke test (no DB)",
);

startIngestor({ persist: false, bboxes: env.AIS_BBOXES });
