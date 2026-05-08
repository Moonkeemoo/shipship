// Composite risk scoring for vessels.
// Pure function. Inputs are observed facts; output is 0-100 score with explainable factors.
//
// Methodology (transparent — every score breaks down into named factors):
//   +5 per sanction list (cap at 30)
//   +20 if Russia/Ukraine sanctions linked
//   +10 flag of convenience (curated FoC ISO list)
//   +10 currently AIS-dark (>60 min since last broadcast)
//   +15 AIS gap (>30 min) within last 24h overlapping a known suspect zone
//   +5  longest 24h gap >2h
// Capped at 100. Buckets: 0-29 low, 30-59 elevated, 60-79 high, 80+ critical.

export interface RiskInputs {
  sanction_count: number;             // distinct source-list count
  russia_ukraine_linked: boolean;
  flag_of_convenience: boolean;
  ais_dark_minutes: number;           // since last position; 0 if currently broadcasting
  longest_gap_min_24h: number;
  gap_in_suspect_zone_24h: boolean;
  chain_has_sanctioned_country: boolean; // ownership chain touches a sanctioned-state owner (ru/ir/kp/by/sy/ve)
}

export interface RiskFactor {
  name: string;
  contribution: number;
}

export interface RiskResult {
  score: number;            // 0-100
  bucket: "low" | "elevated" | "high" | "critical";
  factors: RiskFactor[];
}

export function computeRisk(inp: RiskInputs): RiskResult {
  const factors: RiskFactor[] = [];
  let score = 0;

  if (inp.sanction_count > 0) {
    const c = Math.min(30, inp.sanction_count * 5);
    factors.push({ name: `${inp.sanction_count} sanction list${inp.sanction_count > 1 ? "s" : ""}`, contribution: c });
    score += c;
  }
  if (inp.russia_ukraine_linked) {
    factors.push({ name: "Russia/Ukraine sanctions linked", contribution: 20 });
    score += 20;
  }
  if (inp.flag_of_convenience) {
    factors.push({ name: "Flag of convenience", contribution: 10 });
    score += 10;
  }
  if (inp.ais_dark_minutes >= 60) {
    factors.push({ name: `Currently AIS-dark ${Math.round(inp.ais_dark_minutes / 60)}h`, contribution: 10 });
    score += 10;
  }
  if (inp.gap_in_suspect_zone_24h) {
    factors.push({ name: "AIS gap inside STS / sanctioned zone (24h)", contribution: 15 });
    score += 15;
  }
  if (inp.longest_gap_min_24h >= 120) {
    factors.push({ name: `24h longest gap ${Math.round(inp.longest_gap_min_24h / 60)}h`, contribution: 5 });
    score += 5;
  }
  if (inp.chain_has_sanctioned_country) {
    factors.push({ name: "Ownership chain touches sanctioned-state entity", contribution: 10 });
    score += 10;
  }

  const capped = Math.min(100, score);
  const bucket: RiskResult["bucket"] =
    capped >= 80 ? "critical" : capped >= 60 ? "high" : capped >= 30 ? "elevated" : "low";
  return { score: capped, bucket, factors };
}

// Curated flag-of-convenience ISO 3166-1 alpha-2 codes per ITF + KSE shadow-fleet research.
// Lower-cased for OpenSanctions normalization.
const FOC_ISO2: ReadonlySet<string> = new Set([
  "pa", // Panama
  "lr", // Liberia
  "mh", // Marshall Islands
  "cy", // Cyprus
  "mt", // Malta
  "an", // Antigua & Barbuda (some)
  "bs", // Bahamas
  "bz", // Belize
  "bm", // Bermuda
  "kh", // Cambodia
  "km", // Comoros
  "ck", // Cook Islands
  "dj", // Djibouti
  "ga", // Gabon
  "gn", // Guinea
  "hn", // Honduras
  "jm", // Jamaica
  "ki", // Kiribati
  "lb", // Lebanon
  "lk", // Sri Lanka
  "mn", // Mongolia
  "mu", // Mauritius
  "nu", // Niue
  "pw", // Palau
  "st", // São Tomé and Príncipe
  "tg", // Togo
  "to", // Tonga
  "vu", // Vanuatu
  "su", // ex-Soviet
]);

export function isFlagOfConvenience(flag: string | null | undefined): boolean {
  if (!flag) return false;
  return FOC_ISO2.has(flag.toLowerCase());
}
