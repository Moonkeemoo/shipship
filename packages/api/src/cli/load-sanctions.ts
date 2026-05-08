// Loads OFAC SDN vessel entries into sanctioned_vessels table.
// Source: https://www.treasury.gov/ofac/downloads/sdn.csv
//
// SDN.csv columns (no header line):
//   ent_num, SDN_Name, SDN_Type, Program, Title, Call_Sign, Vess_type,
//   Tonnage, GRT, Vess_flag, Vess_owner, Remarks
// Empty fields are "-0-". Quoted fields wrap values containing punctuation.
// Vessel rows have SDN_Type="vessel". IMO/MMSI usually live in Remarks like:
//   "Vessel Registration Identification IMO 9187629; MMSI 572469210; f.k.a. ..."
//
// Run: bun run packages/api/src/cli/load-sanctions.ts

import { sql } from "../db.ts";
import { logger } from "../log.ts";

const SDN_URL = "https://www.treasury.gov/ofac/downloads/sdn.csv";

interface VesselRow {
  entNum: string;
  name: string;
  program: string;
  callSign: string | null;
  vesselType: string | null;
  tonnage: string | null;
  grt: string | null;
  flag: string | null;
  owner: string | null;
  remarks: string | null;
  imo: number | null;
  mmsi: number | null;
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

function clean(v: string | undefined): string | null {
  if (!v) return null;
  const t = v.trim();
  if (t === "-0-" || t === "" || t === "-0- ") return null;
  return t;
}

function extractImo(remarks: string | null): number | null {
  if (!remarks) return null;
  const m = remarks.match(/IMO\s+(\d{7})/i);
  return m && m[1] ? parseInt(m[1], 10) : null;
}

function extractMmsi(remarks: string | null): number | null {
  if (!remarks) return null;
  const m = remarks.match(/MMSI\s+(\d{9})/i);
  return m && m[1] ? parseInt(m[1], 10) : null;
}

async function fetchSDN(): Promise<string> {
  logger.info({ event: "sdn_fetch", url: SDN_URL }, "downloading OFAC SDN list");
  const res = await fetch(SDN_URL);
  if (!res.ok) throw new Error(`SDN fetch failed: HTTP ${res.status}`);
  return await res.text();
}

function parseVessels(csv: string): VesselRow[] {
  const lines = csv.split("\n");
  const vessels: VesselRow[] = [];
  for (const line of lines) {
    if (!line.trim()) continue;
    const cols = parseCSVLine(line);
    if (cols.length < 12) continue;
    const sdnType = clean(cols[2]);
    if (sdnType?.toLowerCase() !== "vessel") continue;
    const remarks = clean(cols[11]);
    vessels.push({
      entNum: clean(cols[0]) ?? "",
      name: clean(cols[1]) ?? "",
      program: clean(cols[3]) ?? "",
      callSign: clean(cols[5]),
      vesselType: clean(cols[6]),
      tonnage: clean(cols[7]),
      grt: clean(cols[8]),
      flag: clean(cols[9]),
      owner: clean(cols[10]),
      remarks,
      imo: extractImo(remarks),
      mmsi: extractMmsi(remarks),
    });
  }
  return vessels;
}

async function main(): Promise<void> {
  if (!sql) {
    logger.error({ event: "no_db" }, "DATABASE_URL not set");
    process.exit(1);
  }

  const csv = await fetchSDN();
  const vessels = parseVessels(csv);

  const programCounts = new Map<string, number>();
  let withImo = 0;
  let withMmsi = 0;
  for (const v of vessels) {
    programCounts.set(v.program, (programCounts.get(v.program) ?? 0) + 1);
    if (v.imo) withImo++;
    if (v.mmsi) withMmsi++;
  }

  logger.info(
    {
      event: "sdn_parsed",
      totalVessels: vessels.length,
      withImo,
      withMmsi,
      topPrograms: [...programCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8),
    },
    "OFAC SDN parsed",
  );

  let inserted = 0;
  for (const v of vessels) {
    try {
      await sql`
        INSERT INTO sanctioned_vessels (source, identifier, imo, mmsi, name, reason, raw)
        VALUES (
          'OFAC',
          ${v.entNum},
          ${v.imo},
          ${v.mmsi},
          ${v.name},
          ${v.program},
          ${JSON.stringify({
            program: v.program,
            callSign: v.callSign,
            vesselType: v.vesselType,
            tonnage: v.tonnage,
            grt: v.grt,
            flag: v.flag,
            owner: v.owner,
            remarks: v.remarks,
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
      logger.error({ event: "insert_error", err: String(err), entNum: v.entNum }, "insert failed");
    }
  }

  logger.info({ event: "sdn_loaded", inserted, total: vessels.length }, "OFAC SDN loaded");
  await sql.end({ timeout: 5 });
}

void main();
