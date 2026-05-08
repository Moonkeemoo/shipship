// Suspect maritime zones for shadow-fleet activity.
// Used to flag AIS gaps that occur in STS-transfer regions, sanctioned-port
// approaches, and Iranian/Russian operational areas.
//
// Categories:
//   sts              — known ship-to-ship transfer hotspots (often used to
//                       launder origin of crude)
//   russian_port     — approaches to Russian oil-export terminals
//   iranian_port     — approaches to Iranian terminals
//   choke_point      — strategic chokepoints where evasion patterns concentrate
//
// Coordinates and radii are best-effort from public OSINT sources
// (RUSI, Atlantic Council, KSE Russia Oil Tracker reports). Tunable.

export interface Zone {
  name: string;
  category: "sts" | "russian_port" | "iranian_port" | "choke_point";
  lat: number;
  lon: number;
  radius_nm: number;
}

export const SUSPECT_ZONES: readonly Zone[] = [
  // STS hotspots
  { name: "Ceuta / Algeciras STS", category: "sts", lat: 35.9, lon: -5.3, radius_nm: 30 },
  { name: "Lakonikos Bay STS",     category: "sts", lat: 36.7, lon: 22.55, radius_nm: 25 },
  { name: "Kalamata STS",          category: "sts", lat: 36.85, lon: 22.0, radius_nm: 20 },
  { name: "Augusta STS",           category: "sts", lat: 37.3, lon: 15.2, radius_nm: 15 },
  { name: "Mersin STS",            category: "sts", lat: 36.7, lon: 34.6, radius_nm: 20 },
  { name: "Sikka STS (India)",     category: "sts", lat: 22.4, lon: 69.7, radius_nm: 25 },
  { name: "Singapore E. Anchorage", category: "sts", lat: 1.25, lon: 104.0, radius_nm: 30 },
  { name: "Fujairah anchorage",    category: "sts", lat: 25.2, lon: 56.4, radius_nm: 25 },
  { name: "Sohar STS",             category: "sts", lat: 24.45, lon: 56.8, radius_nm: 20 },

  // Russian port approaches
  { name: "Novorossiysk approach", category: "russian_port", lat: 44.72, lon: 37.7, radius_nm: 30 },
  { name: "Tuapse approach",       category: "russian_port", lat: 44.1, lon: 39.1, radius_nm: 20 },
  { name: "Ust-Luga approach",     category: "russian_port", lat: 59.7, lon: 28.4, radius_nm: 25 },
  { name: "Primorsk approach",     category: "russian_port", lat: 60.36, lon: 28.6, radius_nm: 20 },
  { name: "St. Petersburg approach", category: "russian_port", lat: 59.95, lon: 29.5, radius_nm: 25 },
  { name: "Murmansk approach",     category: "russian_port", lat: 69.0, lon: 33.4, radius_nm: 30 },

  // Iranian port approaches
  { name: "Kharg Island",          category: "iranian_port", lat: 29.25, lon: 50.32, radius_nm: 20 },
  { name: "Bandar Abbas",          category: "iranian_port", lat: 27.15, lon: 56.2, radius_nm: 20 },
  { name: "Sirri Island",          category: "iranian_port", lat: 25.9, lon: 54.5, radius_nm: 20 },

  // Choke points / evasion
  { name: "Bosphorus",             category: "choke_point", lat: 41.2, lon: 29.1, radius_nm: 20 },
  { name: "Bab el-Mandeb",         category: "choke_point", lat: 12.6, lon: 43.4, radius_nm: 25 },
  { name: "Strait of Hormuz",      category: "choke_point", lat: 26.6, lon: 56.4, radius_nm: 30 },
  { name: "Malacca Strait",        category: "choke_point", lat: 2.5, lon: 101.0, radius_nm: 40 },
];

const EARTH_RADIUS_NM = 3440.065;

export function haversineNm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return EARTH_RADIUS_NM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function findZone(lat: number, lon: number): Zone | null {
  for (const zone of SUSPECT_ZONES) {
    if (haversineNm(lat, lon, zone.lat, zone.lon) <= zone.radius_nm) return zone;
  }
  return null;
}
