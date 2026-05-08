// Loads OpenSanctions Maritime dataset into sanctioned_vessels.
// Source: https://www.opensanctions.org/datasets/maritime/
// CSV columns: type, caption, imo, risk, countries, flag, mmsi, id, url, datasets, aliases
//
// Aggregates 50+ source lists incl. OFAC SDN, EU consolidated, UK OFSI, UN,
// Australia DFAT, Japan METI, Canada SEMA, port-state-control detentions
// (Abuja/Tokyo/Paris MOUs), KSE Russia Oil Tracker, Atlantic Council shadow fleet.
//
// Run: bun run load-opensanctions

import { sql } from "../db.ts";
import { logger } from "../log.ts";

const URL = "https://data.opensanctions.org/datasets/latest/maritime/maritime.csv";

interface Row {
  type: string;
  caption: string;
  imo: number | null;
  risk: string;
  countries: string;
  flag: string;
  mmsi: number | null;
  id: string;
  url: string;
  datasets: string;
  aliases: string;
}

function parseCSVLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"' && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cur += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        out.push(cur);
        cur = "";
      } else {
        cur += ch;
      }
    }
  }
  out.push(cur);
  return out;
}

function parseImo(s: string | undefined): number | null {
  if (!s) return null;
  const m = s.replace(/^IMO/i, "").trim().match(/^\d{7}$/);
  return m ? parseInt(m[0], 10) : null;
}

function parseMmsi(s: string | undefined): number | null {
  if (!s) return null;
  const t = s.trim();
  if (!/^\d{9}$/.test(t)) return null;
  return parseInt(t, 10);
}

async function fetchCsv(): Promise<string> {
  logger.info({ event: "fetch", url: URL }, "downloading OpenSanctions maritime CSV");
  const res = await fetch(URL);
  if (!res.ok) throw new Error(`fetch failed: HTTP ${res.status}`);
  return await res.text();
}

function parse(csv: string): Row[] {
  const lines = csv.split("\n");
  const out: Row[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line || !line.trim()) continue;
    const cols = parseCSVLine(line);
    if (cols.length < 11) continue;
    out.push({
      type: cols[0] ?? "",
      caption: cols[1] ?? "",
      imo: parseImo(cols[2]),
      risk: cols[3] ?? "",
      countries: cols[4] ?? "",
      flag: cols[5] ?? "",
      mmsi: parseMmsi(cols[6]),
      id: cols[7] ?? "",
      url: cols[8] ?? "",
      datasets: cols[9] ?? "",
      aliases: cols[10] ?? "",
    });
  }
  return out;
}

async function main(): Promise<void> {
  if (!sql) {
    logger.error({ event: "no_db" }, "DATABASE_URL not set");
    process.exit(1);
  }

  const csv = await fetchCsv();
  const rows = parse(csv);

  const byType = new Map<string, number>();
  let withImo = 0;
  let vesselsWithImo = 0;
  for (const r of rows) {
    byType.set(r.type, (byType.get(r.type) ?? 0) + 1);
    if (r.imo) withImo++;
    if (r.imo && r.type === "VESSEL") vesselsWithImo++;
  }

  logger.info(
    { event: "parsed", total: rows.length, withImo, vesselsWithImo, byType: [...byType.entries()] },
    "OpenSanctions maritime parsed",
  );

  // Only persist VESSEL rows with IMO. Organizations come back via JOIN later if needed.
  const toInsert = rows.filter((r) => r.type === "VESSEL" && r.imo);
  let inserted = 0;
  for (const r of toInsert) {
    try {
      await sql`
        INSERT INTO sanctioned_vessels (source, identifier, imo, mmsi, name, reason, raw)
        VALUES (
          'OpenSanctions',
          ${r.id},
          ${r.imo},
          ${r.mmsi},
          ${r.caption || null},
          ${r.datasets || r.risk},
          ${JSON.stringify({
            risk: r.risk,
            countries: r.countries,
            flag: r.flag,
            datasets: r.datasets,
            aliases: r.aliases,
            url: r.url,
          })}::jsonb
        )
        ON CONFLICT (source, identifier) DO UPDATE SET
          imo    = EXCLUDED.imo,
          mmsi   = EXCLUDED.mmsi,
          name   = EXCLUDED.name,
          reason = EXCLUDED.reason,
          raw    = EXCLUDED.raw
      `;
      inserted++;
    } catch (err) {
      logger.error({ event: "insert_error", err: String(err), id: r.id }, "insert failed");
    }
  }

  logger.info({ event: "loaded", inserted, total: toInsert.length }, "OpenSanctions maritime loaded");
  await sql.end({ timeout: 5 });
}

void main();
