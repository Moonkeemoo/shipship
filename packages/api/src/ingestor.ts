import { env } from "./env.ts";
import { logger } from "./log.ts";
import { sql, type Sql } from "./db.ts";
import { type AISEnvelope, type AISMessage, isHandledMessage, isCommercial } from "./types.ts";

const ENDPOINT = "wss://stream.aisstream.io/v0/stream";
const STALE_MS = 30_000;
const RECONNECT_DELAY_MS = 5_000;
const STATS_INTERVAL_MS = 30_000;
const WATCHDOG_INTERVAL_MS = 10_000;
const BATCH_FLUSH_MS = 1000;       // flush position buffer every 1 s
const BATCH_FLUSH_SIZE = 500;      // or when buffer hits 500 rows

interface IngestorOpts {
  persist: boolean;
  bboxes: number[][][];
}

interface Stats {
  startedAt: number;
  lastMessageAt: number;
  messagesTotal: number;
  positionsTotal: number;
  staticTotal: number;
  commercialPositions: number;
  unknownTypePositions: number;
  positionsPersisted: number;
  staticPersisted: number;
  parseErrors: number;
  dbErrors: number;
  batchFlushes: number;
  batchSize: number;
}

const stats: Stats = {
  startedAt: Date.now(),
  lastMessageAt: Date.now(),
  messagesTotal: 0,
  positionsTotal: 0,
  staticTotal: 0,
  commercialPositions: 0,
  unknownTypePositions: 0,
  positionsPersisted: 0,
  staticPersisted: 0,
  parseErrors: 0,
  dbErrors: 0,
  batchFlushes: 0,
  batchSize: 0,
};

// In-memory cache: MMSI → ship_type, populated from ShipStaticData.
// We use it to filter PositionReport stream client-side (server has no ship-type filter).
const knownShipType = new Map<number, number>();

// AIS-stream sends timestamps in Go-time format:
//   "2026-05-08 06:28:04.417846661 +0000 UTC"
// Postgres jsonb_to_recordset → ::timestamptz is stricter than direct parameter bind.
// Normalize to ISO-8601 with millisecond precision before buffering.
function normalizeAisTs(s: string): string {
  const m = s.match(/^(\d{4}-\d{2}-\d{2})[ T](\d{2}:\d{2}:\d{2})(?:\.(\d+))?/);
  if (!m) return s;
  const date = m[1], time = m[2], frac = m[3] ?? "";
  const ms = frac.slice(0, 3).padEnd(3, "0");
  return `${date}T${time}.${ms}Z`;
}

// Position write buffer — flushed in batches every BATCH_FLUSH_MS or on size.
interface PositionRow {
  ts: string;
  mmsi: number;
  lat: number;
  lon: number;
  sog: number | null;
  cog: number | null;
  heading: number | null;
  nav_status: number;
}
let positionBuffer: PositionRow[] = [];

let ws: WebSocket | null = null;

export function startIngestor(opts: IngestorOpts): void {
  if (opts.persist && !sql) {
    logger.error({ event: "no_db" }, "persist=true but DATABASE_URL not set");
    process.exit(1);
  }
  connect(opts);
  startWatchdog(opts);
  startStatsLog(opts);
  startBatchFlusher(opts);
}

async function flushPositionBatch(): Promise<void> {
  if (!sql || positionBuffer.length === 0) return;
  const batch = positionBuffer;
  positionBuffer = [];
  stats.batchSize = batch.length;
  try {
    // postgres-js sql.json packs the array properly for jsonb_to_recordset
    await sql`
      INSERT INTO positions (ts, mmsi, lat, lon, sog, cog, heading, nav_status)
      SELECT (ts)::timestamptz, mmsi, lat, lon, sog, cog, heading, nav_status
      FROM jsonb_to_recordset(${sql.json(batch as unknown as Parameters<typeof sql.json>[0])}::jsonb)
        AS t(ts text, mmsi bigint, lat real, lon real, sog real, cog real, heading real, nav_status int)
    `;
    stats.positionsPersisted += batch.length;
    stats.batchFlushes++;
  } catch (err) {
    stats.dbErrors++;
    if (stats.dbErrors < 10) {
      logger.error({ event: "batch_flush_error", err: String(err), batch_size: batch.length }, "batch insert failed");
    }
  }
}

function startBatchFlusher(_opts: IngestorOpts): void {
  setInterval(() => { void flushPositionBatch(); }, BATCH_FLUSH_MS);
}

function connect(opts: IngestorOpts): void {
  logger.info({ event: "ws_connect", endpoint: ENDPOINT }, "connecting to AISStream");
  ws = new WebSocket(ENDPOINT);

  ws.onopen = () => {
    logger.info({ event: "ws_open" }, "connected, sending subscribe");
    const subscribe = {
      APIKey: env.AISSTREAM_KEY,
      BoundingBoxes: opts.bboxes,
      FilterMessageTypes: ["PositionReport", "ShipStaticData"],
    };
    ws!.send(JSON.stringify(subscribe));
    logger.info({ event: "ws_subscribed", bboxes: opts.bboxes }, "subscribed");
  };

  ws.onmessage = async (event) => {
    stats.messagesTotal++;
    stats.lastMessageAt = Date.now();
    try {
      const raw = JSON.parse(event.data as string) as AISEnvelope;
      if (isHandledMessage(raw)) {
        if (raw.MessageType === "ShipStaticData") {
          await handleShipStatic(raw, opts.persist);
        } else if (raw.MessageType === "PositionReport") {
          handlePosition(raw, opts.persist);
        }
      }
    } catch (err) {
      stats.parseErrors++;
      if (stats.parseErrors < 5) {
        logger.error({ event: "parse_error", err: String(err) }, "failed to parse message");
      }
    }
  };

  ws.onerror = (event) => {
    const message = (event as unknown as { message?: string }).message ?? "unknown";
    logger.error({ event: "ws_error", message }, "ws error");
  };

  ws.onclose = (event) => {
    logger.warn(
      { event: "ws_close", code: event.code, reason: event.reason },
      `ws closed, reconnecting in ${RECONNECT_DELAY_MS}ms`,
    );
    ws = null;
    setTimeout(() => connect(opts), RECONNECT_DELAY_MS);
  };
}

function startWatchdog(_opts: IngestorOpts): void {
  setInterval(() => {
    const silentMs = Date.now() - stats.lastMessageAt;
    if (silentMs > STALE_MS && ws) {
      logger.warn({ event: "watchdog_stale", silentMs }, "no messages >30s, forcing reconnect");
      ws.close();
    }
  }, WATCHDOG_INTERVAL_MS);
}

function startStatsLog(opts: IngestorOpts): void {
  setInterval(() => {
    const uptimeS = (Date.now() - stats.startedAt) / 1000;
    logger.info(
      {
        event: "stats",
        persist: opts.persist,
        uptimeS: Math.round(uptimeS),
        msgPerSec: (stats.messagesTotal / uptimeS).toFixed(1),
        knownVessels: knownShipType.size,
        ...stats,
      },
      "stats",
    );
  }, STATS_INTERVAL_MS);
}

async function handleShipStatic(msg: AISMessage, persist: boolean): Promise<void> {
  if (msg.MessageType !== "ShipStaticData") return;
  stats.staticTotal++;
  const data = msg.Message.ShipStaticData;
  if (!data) return;

  const mmsi = data.UserID;
  knownShipType.set(mmsi, data.Type);

  if (!persist || !sql) return;

  try {
    const imo = data.ImoNumber > 0 ? data.ImoNumber : null;
    await sql`
      INSERT INTO vessels (mmsi, imo, name, call_sign, ship_type, destination, draught, dim_a, dim_b, dim_c, dim_d, last_seen)
      VALUES (
        ${mmsi},
        ${imo},
        ${trimOrNull(data.Name)},
        ${trimOrNull(data.CallSign)},
        ${data.Type},
        ${trimOrNull(data.Destination)},
        ${data.MaximumStaticDraught || null},
        ${data.Dimension?.A ?? null},
        ${data.Dimension?.B ?? null},
        ${data.Dimension?.C ?? null},
        ${data.Dimension?.D ?? null},
        NOW()
      )
      ON CONFLICT (mmsi) DO UPDATE SET
        imo         = COALESCE(EXCLUDED.imo, vessels.imo),
        name        = COALESCE(EXCLUDED.name, vessels.name),
        call_sign   = COALESCE(EXCLUDED.call_sign, vessels.call_sign),
        ship_type   = EXCLUDED.ship_type,
        destination = COALESCE(EXCLUDED.destination, vessels.destination),
        draught     = COALESCE(EXCLUDED.draught, vessels.draught),
        dim_a       = COALESCE(EXCLUDED.dim_a, vessels.dim_a),
        dim_b       = COALESCE(EXCLUDED.dim_b, vessels.dim_b),
        dim_c       = COALESCE(EXCLUDED.dim_c, vessels.dim_c),
        dim_d       = COALESCE(EXCLUDED.dim_d, vessels.dim_d),
        last_seen   = NOW()
    `;
    stats.staticPersisted++;
  } catch (err) {
    stats.dbErrors++;
    if (stats.dbErrors < 5) {
      logger.error({ event: "db_static_error", err: String(err), mmsi }, "static insert failed");
    }
  }
}

function handlePosition(msg: AISMessage, persist: boolean): void {
  if (msg.MessageType !== "PositionReport") return;
  stats.positionsTotal++;
  const meta = msg.MetaData;
  const data = msg.Message.PositionReport;
  if (!data || !meta) return;

  const mmsi = data.UserID;
  const shipType = knownShipType.get(mmsi);

  if (shipType === undefined) {
    stats.unknownTypePositions++;
    return; // skip — will be picked up after first ShipStaticData arrives
  }
  if (!isCommercial(shipType)) return;

  stats.commercialPositions++;

  if (!persist) return;

  const heading = data.TrueHeading === 511 ? null : data.TrueHeading;
  positionBuffer.push({
    ts: normalizeAisTs(meta.time_utc),
    mmsi,
    lat: meta.latitude,
    lon: meta.longitude,
    sog: data.Sog || null,
    cog: data.Cog || null,
    heading,
    nav_status: data.NavigationalStatus,
  });

  // Flush early if buffer is large to avoid memory creep
  if (positionBuffer.length >= BATCH_FLUSH_SIZE) {
    void flushPositionBatch();
  }
}

function trimOrNull(s: string | undefined | null): string | null {
  if (!s) return null;
  const t = s.trim();
  return t.length > 0 ? t : null;
}

// Graceful shutdown for SIGINT — flush pending batch before closing
process.on("SIGINT", async () => {
  logger.info({ event: "shutdown", buffer_pending: positionBuffer.length }, "received SIGINT, flushing then closing");
  ws?.close();
  await flushPositionBatch();
  if (sql) await (sql as Sql).end({ timeout: 5 });
  process.exit(0);
});
