// UN/LOCODE port dictionary — curated to shadow-fleet operational hubs.
// Format: 5-char code (2 country + 3 location), human-readable name, region tag, role tag.
// Roles: oil_export, oil_import, sts, choke, hub, refinery, gas
// Adding ports here improves AIS-destination decoding shown in vessel detail.

export interface PortInfo {
  code: string;
  name: string;
  country: string;
  region: string;
  role: "oil_export" | "oil_import" | "sts" | "choke" | "hub" | "refinery" | "gas" | "other";
  sanctioned_origin?: boolean; // origin port is in a heavily sanctioned regime
}

// Approximate lat/lon for spatial port-call inference (not for visual; rough centroid).
// Without PostGIS we do haversine vs this in-memory list.
export interface PortGeo extends PortInfo {
  lat: number;
  lon: number;
  detect_radius_nm?: number; // override default (12 nm)
}

const PORTS: readonly PortInfo[] = [
  // Russia — oil exports
  { code: "RUULU", name: "Ust-Luga",       country: "Russia",        region: "Baltic",      role: "oil_export", sanctioned_origin: true },
  { code: "RUNVS", name: "Novorossiysk",   country: "Russia",        region: "Black Sea",   role: "oil_export", sanctioned_origin: true },
  { code: "RUTUA", name: "Tuapse",         country: "Russia",        region: "Black Sea",   role: "oil_export", sanctioned_origin: true },
  { code: "RUPRI", name: "Primorsk",       country: "Russia",        region: "Baltic",      role: "oil_export", sanctioned_origin: true },
  { code: "RULED", name: "St. Petersburg", country: "Russia",        region: "Baltic",      role: "hub",        sanctioned_origin: true },
  { code: "RUMUR", name: "Murmansk",       country: "Russia",        region: "Arctic",      role: "oil_export", sanctioned_origin: true },
  { code: "RUKLD", name: "Kaliningrad",    country: "Russia",        region: "Baltic",      role: "hub",        sanctioned_origin: true },
  { code: "RUVAN", name: "Vanino",         country: "Russia",        region: "Far East",    role: "oil_export", sanctioned_origin: true },
  { code: "RUNAK", name: "Nakhodka",       country: "Russia",        region: "Far East",    role: "oil_export", sanctioned_origin: true },
  { code: "RUDVO", name: "De-Kastri",      country: "Russia",        region: "Far East",    role: "oil_export", sanctioned_origin: true },
  { code: "RUKOZ", name: "Kozmino",        country: "Russia",        region: "Far East",    role: "oil_export", sanctioned_origin: true },
  // Iran — oil exports
  { code: "IRBND", name: "Bandar Abbas",   country: "Iran",          region: "Persian Gulf", role: "oil_export", sanctioned_origin: true },
  { code: "IRKHA", name: "Kharg Island",   country: "Iran",          region: "Persian Gulf", role: "oil_export", sanctioned_origin: true },
  { code: "IRBKM", name: "Bandar Khomeini",country: "Iran",          region: "Persian Gulf", role: "oil_export", sanctioned_origin: true },
  { code: "IRMRX", name: "Mahshahr",       country: "Iran",          region: "Persian Gulf", role: "oil_export", sanctioned_origin: true },
  { code: "IRSXI", name: "Siri Island",    country: "Iran",          region: "Persian Gulf", role: "oil_export", sanctioned_origin: true },
  // Venezuela
  { code: "VEPCB", name: "Puerto Cabello", country: "Venezuela",     region: "Caribbean",   role: "hub",        sanctioned_origin: true },
  { code: "VEJST", name: "Jose Terminal",  country: "Venezuela",     region: "Caribbean",   role: "oil_export", sanctioned_origin: true },
  // STS hotspots
  { code: "GRPIR", name: "Piraeus",        country: "Greece",        region: "East Med",    role: "hub" },
  { code: "GRKAL", name: "Kalamata",       country: "Greece",        region: "East Med",    role: "sts" },
  { code: "GRLAK", name: "Lakonikos Bay",  country: "Greece",        region: "East Med",    role: "sts" },
  { code: "ESCEU", name: "Ceuta",          country: "Spain",         region: "Strait Gibraltar", role: "sts" },
  { code: "ESALG", name: "Algeciras",      country: "Spain",         region: "Strait Gibraltar", role: "sts" },
  { code: "AEFJR", name: "Fujairah",       country: "UAE",           region: "Persian Gulf", role: "sts" },
  { code: "OMSOH", name: "Sohar",          country: "Oman",          region: "Persian Gulf", role: "sts" },
  { code: "INSIK", name: "Sikka",          country: "India",         region: "Indian Ocean",role: "sts" },
  { code: "SGSIN", name: "Singapore",      country: "Singapore",     region: "SE Asia",     role: "hub" },
  { code: "MYBAR", name: "Pasir Gudang",   country: "Malaysia",      region: "SE Asia",     role: "sts" },
  { code: "MYPGU", name: "Pengerang",      country: "Malaysia",      region: "SE Asia",     role: "sts" },
  // Major receiving / refinery hubs
  { code: "INMUN", name: "Mundra",         country: "India",         region: "Indian Ocean",role: "refinery" },
  { code: "INVAD", name: "Vadinar",        country: "India",         region: "Indian Ocean",role: "refinery" },
  { code: "INPAR", name: "Paradip",        country: "India",         region: "Indian Ocean",role: "refinery" },
  { code: "INKAN", name: "Kandla",         country: "India",         region: "Indian Ocean",role: "refinery" },
  { code: "CNDLC", name: "Dalian",         country: "China",         region: "East Asia",   role: "refinery" },
  { code: "CNQDG", name: "Qingdao",        country: "China",         region: "East Asia",   role: "refinery" },
  { code: "CNNGB", name: "Ningbo",         country: "China",         region: "East Asia",   role: "refinery" },
  { code: "CNSHA", name: "Shanghai",       country: "China",         region: "East Asia",   role: "hub" },
  { code: "CNRZH", name: "Rizhao",         country: "China",         region: "East Asia",   role: "refinery" },
  { code: "CNZJG", name: "Zhanjiang",      country: "China",         region: "East Asia",   role: "refinery" },
  { code: "CNZHA", name: "Zhoushan",       country: "China",         region: "East Asia",   role: "refinery" },
  { code: "CNYJ", name: "Yangjiang",       country: "China",         region: "East Asia",   role: "refinery" },
  // North Sea / Baltic
  { code: "NLRTM", name: "Rotterdam",      country: "Netherlands",   region: "North Sea",   role: "refinery" },
  { code: "DEHAM", name: "Hamburg",        country: "Germany",       region: "North Sea",   role: "hub" },
  { code: "BEANR", name: "Antwerp",        country: "Belgium",       region: "North Sea",   role: "refinery" },
  { code: "GBSOU", name: "Southampton",    country: "UK",            region: "North Sea",   role: "hub" },
  { code: "GBLON", name: "London",         country: "UK",            region: "North Sea",   role: "hub" },
  { code: "DKKOG", name: "Køge",           country: "Denmark",       region: "Baltic",      role: "hub" },
  { code: "EEMUG", name: "Muuga",          country: "Estonia",       region: "Baltic",      role: "hub" },
  { code: "FIHEL", name: "Helsinki",       country: "Finland",       region: "Baltic",      role: "hub" },
  // Mediterranean
  { code: "TRMER", name: "Mersin",         country: "Turkey",        region: "East Med",    role: "sts" },
  { code: "TRIST", name: "Istanbul",       country: "Turkey",        region: "Bosphorus",   role: "choke" },
  { code: "EGSUZ", name: "Suez",           country: "Egypt",         region: "Suez",        role: "choke" },
  { code: "EGSUE", name: "Suez",           country: "Egypt",         region: "Suez",        role: "choke" },
  { code: "EGDAM", name: "Damietta",       country: "Egypt",         region: "East Med",    role: "hub" },
  { code: "MTMLA", name: "Valletta",       country: "Malta",         region: "Med",         role: "hub" },
  { code: "ITTAR", name: "Taranto",        country: "Italy",         region: "Med",         role: "refinery" },
  { code: "ITAUG", name: "Augusta",        country: "Italy",         region: "Med",         role: "sts" },
  // West Africa / Atlantic
  { code: "ZALAU", name: "Saldanha Bay",   country: "South Africa",  region: "South Atlantic",role: "hub" },
  { code: "GHTKD", name: "Tema",           country: "Ghana",         region: "West Africa", role: "hub" },
  // North America
  { code: "USHOU", name: "Houston",        country: "USA",           region: "Gulf of Mexico",role: "refinery" },
  { code: "USCOR", name: "Corpus Christi", country: "USA",           region: "Gulf of Mexico",role: "refinery" },
  { code: "USNYC", name: "New York",       country: "USA",           region: "US East",     role: "hub" },
  { code: "CAVAN", name: "Vancouver",      country: "Canada",        region: "US West",     role: "hub" },
];

const PORT_INDEX = new Map<string, PortInfo>(PORTS.map((p) => [p.code, p]));

// Extended geo-tagged port database for proximity-based port-call inference.
// Coordinates are berth/anchorage approximations; detect_radius_nm = 8-15 by default.
// This is broader than SUSPECT_ZONES (which are curated risk hotspots) — covers
// all major commercial ports so we can detect vessel-X-was-at-Rotterdam events.
export const WORLD_PORTS: readonly PortGeo[] = [
  // === RUSSIAN OIL EXPORTS ===
  { code: "RUULU", name: "Ust-Luga",        country: "Russia",       region: "Baltic",       role: "oil_export", sanctioned_origin: true,  lat: 59.66, lon: 28.42 },
  { code: "RUNVS", name: "Novorossiysk",    country: "Russia",       region: "Black Sea",    role: "oil_export", sanctioned_origin: true,  lat: 44.72, lon: 37.71 },
  { code: "RUTUA", name: "Tuapse",          country: "Russia",       region: "Black Sea",    role: "oil_export", sanctioned_origin: true,  lat: 44.10, lon: 39.07 },
  { code: "RUPRI", name: "Primorsk",        country: "Russia",       region: "Baltic",       role: "oil_export", sanctioned_origin: true,  lat: 60.36, lon: 28.61 },
  { code: "RULED", name: "St. Petersburg",  country: "Russia",       region: "Baltic",       role: "hub",        sanctioned_origin: true,  lat: 59.92, lon: 30.27 },
  { code: "RUMUR", name: "Murmansk",        country: "Russia",       region: "Arctic",       role: "oil_export", sanctioned_origin: true,  lat: 68.96, lon: 33.07 },
  { code: "RUKLD", name: "Kaliningrad",     country: "Russia",       region: "Baltic",       role: "hub",        sanctioned_origin: true,  lat: 54.71, lon: 20.51 },
  { code: "RUKOZ", name: "Kozmino",         country: "Russia",       region: "Far East",     role: "oil_export", sanctioned_origin: true,  lat: 42.74, lon: 132.74 },
  { code: "RUDVO", name: "De-Kastri",       country: "Russia",       region: "Far East",     role: "oil_export", sanctioned_origin: true,  lat: 51.49, lon: 140.76 },
  { code: "RUNAK", name: "Nakhodka",        country: "Russia",       region: "Far East",     role: "oil_export", sanctioned_origin: true,  lat: 42.81, lon: 132.86 },
  { code: "RUVAN", name: "Vanino",          country: "Russia",       region: "Far East",     role: "oil_export", sanctioned_origin: true,  lat: 49.09, lon: 140.27 },
  // === IRANIAN ===
  { code: "IRBND", name: "Bandar Abbas",    country: "Iran",         region: "Persian Gulf", role: "oil_export", sanctioned_origin: true,  lat: 27.15, lon: 56.21 },
  { code: "IRKHA", name: "Kharg Island",    country: "Iran",         region: "Persian Gulf", role: "oil_export", sanctioned_origin: true,  lat: 29.25, lon: 50.32 },
  { code: "IRBKM", name: "Bandar Khomeini", country: "Iran",         region: "Persian Gulf", role: "oil_export", sanctioned_origin: true,  lat: 30.43, lon: 49.07 },
  { code: "IRSXI", name: "Siri Island",     country: "Iran",         region: "Persian Gulf", role: "oil_export", sanctioned_origin: true,  lat: 25.90, lon: 54.50 },
  { code: "IRMRX", name: "Mahshahr",        country: "Iran",         region: "Persian Gulf", role: "oil_export", sanctioned_origin: true,  lat: 30.55, lon: 49.19 },
  // === VENEZUELA ===
  { code: "VEPCB", name: "Puerto Cabello",  country: "Venezuela",    region: "Caribbean",    role: "hub",        sanctioned_origin: true,  lat: 10.48, lon: -68.01 },
  { code: "VEJST", name: "Jose Terminal",   country: "Venezuela",    region: "Caribbean",    role: "oil_export", sanctioned_origin: true,  lat: 10.10, lon: -64.84 },
  // === STS HOTSPOTS ===
  { code: "GRPIR", name: "Piraeus",         country: "Greece",       region: "East Med",     role: "hub",                                  lat: 37.94, lon: 23.65 },
  { code: "GRKAL", name: "Kalamata STS",    country: "Greece",       region: "East Med",     role: "sts",                                  lat: 36.85, lon: 22.05 },
  { code: "GRLAK", name: "Lakonikos Bay",   country: "Greece",       region: "East Med",     role: "sts",                                  lat: 36.65, lon: 22.55 },
  { code: "ESCEU", name: "Ceuta",           country: "Spain",        region: "Strait Gibraltar", role: "sts",                              lat: 35.90, lon: -5.30 },
  { code: "ESALG", name: "Algeciras",       country: "Spain",        region: "Strait Gibraltar", role: "sts",                              lat: 36.13, lon: -5.45 },
  { code: "AEFJR", name: "Fujairah",        country: "UAE",          region: "Persian Gulf", role: "sts",                                  lat: 25.18, lon: 56.36 },
  { code: "OMSOH", name: "Sohar",           country: "Oman",         region: "Persian Gulf", role: "sts",                                  lat: 24.45, lon: 56.73 },
  { code: "INSIK", name: "Sikka",           country: "India",        region: "Indian Ocean", role: "sts",                                  lat: 22.42, lon: 69.84 },
  { code: "SGSIN", name: "Singapore",       country: "Singapore",    region: "SE Asia",      role: "hub",                                  lat: 1.27,  lon: 103.85 },
  { code: "MYBAR", name: "Pasir Gudang",    country: "Malaysia",     region: "SE Asia",      role: "sts",                                  lat: 1.46,  lon: 103.92 },
  { code: "MYPGU", name: "Pengerang",       country: "Malaysia",     region: "SE Asia",      role: "sts",                                  lat: 1.34,  lon: 104.10 },
  // === MAJOR REFINERIES / RECEIVERS ===
  { code: "INMUN", name: "Mundra",          country: "India",        region: "Indian Ocean", role: "refinery",                             lat: 22.74, lon: 69.71 },
  { code: "INVAD", name: "Vadinar",         country: "India",        region: "Indian Ocean", role: "refinery",                             lat: 22.51, lon: 69.74 },
  { code: "INPAR", name: "Paradip",         country: "India",        region: "Indian Ocean", role: "refinery",                             lat: 20.27, lon: 86.69 },
  { code: "INKAN", name: "Kandla",          country: "India",        region: "Indian Ocean", role: "refinery",                             lat: 23.03, lon: 70.21 },
  { code: "INMUM", name: "Mumbai",          country: "India",        region: "Indian Ocean", role: "hub",                                  lat: 18.95, lon: 72.85 },
  { code: "INCHE", name: "Chennai",         country: "India",        region: "Indian Ocean", role: "hub",                                  lat: 13.10, lon: 80.30 },
  { code: "INVIZ", name: "Visakhapatnam",   country: "India",        region: "Indian Ocean", role: "refinery",                             lat: 17.69, lon: 83.30 },
  { code: "CNDLC", name: "Dalian",          country: "China",        region: "East Asia",    role: "refinery",                             lat: 38.94, lon: 121.65 },
  { code: "CNQDG", name: "Qingdao",         country: "China",        region: "East Asia",    role: "refinery",                             lat: 36.07, lon: 120.32 },
  { code: "CNNGB", name: "Ningbo",          country: "China",        region: "East Asia",    role: "refinery",                             lat: 29.87, lon: 121.81 },
  { code: "CNSHA", name: "Shanghai",        country: "China",        region: "East Asia",    role: "hub",                                  lat: 31.23, lon: 121.49 },
  { code: "CNRZH", name: "Rizhao",          country: "China",        region: "East Asia",    role: "refinery",                             lat: 35.39, lon: 119.53 },
  { code: "CNZJG", name: "Zhanjiang",       country: "China",        region: "East Asia",    role: "refinery",                             lat: 21.20, lon: 110.40 },
  { code: "CNZHA", name: "Zhoushan",        country: "China",        region: "East Asia",    role: "refinery",                             lat: 30.00, lon: 122.10 },
  { code: "CNYTP", name: "Yantai",          country: "China",        region: "East Asia",    role: "hub",                                  lat: 37.55, lon: 121.39 },
  { code: "CNTSN", name: "Tianjin",         country: "China",        region: "East Asia",    role: "hub",                                  lat: 39.00, lon: 117.79 },
  { code: "CNXIA", name: "Xiamen",          country: "China",        region: "East Asia",    role: "hub",                                  lat: 24.46, lon: 118.07 },
  { code: "CNGZH", name: "Guangzhou",       country: "China",        region: "East Asia",    role: "hub",                                  lat: 23.10, lon: 113.32 },
  { code: "CNHKG", name: "Hong Kong",       country: "Hong Kong",    region: "East Asia",    role: "hub",                                  lat: 22.32, lon: 114.17 },
  // === NORTH SEA / BALTIC ===
  { code: "NLRTM", name: "Rotterdam",       country: "Netherlands",  region: "North Sea",    role: "refinery",                             lat: 51.95, lon: 4.14 },
  { code: "DEHAM", name: "Hamburg",         country: "Germany",      region: "North Sea",    role: "hub",                                  lat: 53.55, lon: 9.93 },
  { code: "BEANR", name: "Antwerp",         country: "Belgium",      region: "North Sea",    role: "refinery",                             lat: 51.32, lon: 4.30 },
  { code: "DEBRV", name: "Bremerhaven",     country: "Germany",      region: "North Sea",    role: "hub",                                  lat: 53.55, lon: 8.58 },
  { code: "DEWVN", name: "Wilhelmshaven",   country: "Germany",      region: "North Sea",    role: "oil_import",                           lat: 53.51, lon: 8.13 },
  { code: "GBSOU", name: "Southampton",     country: "UK",           region: "North Sea",    role: "hub",                                  lat: 50.90, lon: -1.40 },
  { code: "GBFXT", name: "Felixstowe",      country: "UK",           region: "North Sea",    role: "hub",                                  lat: 51.96, lon: 1.31 },
  { code: "GBLON", name: "London",          country: "UK",           region: "North Sea",    role: "hub",                                  lat: 51.50, lon: 0.06 },
  { code: "FRLEH", name: "Le Havre",        country: "France",       region: "North Sea",    role: "refinery",                             lat: 49.49, lon: 0.10 },
  { code: "PLGDN", name: "Gdańsk",          country: "Poland",       region: "Baltic",       role: "oil_import",                           lat: 54.40, lon: 18.71 },
  { code: "PLGDY", name: "Gdynia",          country: "Poland",       region: "Baltic",       role: "hub",                                  lat: 54.53, lon: 18.55 },
  { code: "EEMUG", name: "Muuga",           country: "Estonia",      region: "Baltic",       role: "hub",                                  lat: 59.50, lon: 24.93 },
  { code: "FIHEL", name: "Helsinki",        country: "Finland",      region: "Baltic",       role: "hub",                                  lat: 60.16, lon: 24.95 },
  { code: "DKKOG", name: "Køge",            country: "Denmark",      region: "Baltic",       role: "hub",                                  lat: 55.45, lon: 12.20 },
  { code: "SESTO", name: "Stockholm",       country: "Sweden",       region: "Baltic",       role: "hub",                                  lat: 59.32, lon: 18.05 },
  { code: "SEGOT", name: "Gothenburg",      country: "Sweden",       region: "North Sea",    role: "hub",                                  lat: 57.70, lon: 11.96 },
  // === MEDITERRANEAN ===
  { code: "ITGOA", name: "Genoa",           country: "Italy",        region: "Med",          role: "hub",                                  lat: 44.40, lon: 8.93 },
  { code: "ITTAR", name: "Taranto",         country: "Italy",        region: "Med",          role: "refinery",                             lat: 40.47, lon: 17.23 },
  { code: "ITAUG", name: "Augusta",         country: "Italy",        region: "Med",          role: "sts",                                  lat: 37.20, lon: 15.22 },
  { code: "ITTRS", name: "Trieste",         country: "Italy",        region: "Med",          role: "oil_import",                           lat: 45.65, lon: 13.78 },
  { code: "ESBCN", name: "Barcelona",       country: "Spain",        region: "Med",          role: "hub",                                  lat: 41.34, lon: 2.16 },
  { code: "ESVLC", name: "Valencia",        country: "Spain",        region: "Med",          role: "hub",                                  lat: 39.45, lon: -0.32 },
  { code: "FRMRS", name: "Marseille",       country: "France",       region: "Med",          role: "refinery",                             lat: 43.31, lon: 5.36 },
  { code: "MTMLA", name: "Valletta",        country: "Malta",        region: "Med",          role: "hub",                                  lat: 35.90, lon: 14.51 },
  { code: "TRMER", name: "Mersin",          country: "Turkey",       region: "East Med",     role: "sts",                                  lat: 36.78, lon: 34.62 },
  { code: "TRIST", name: "Istanbul",        country: "Turkey",       region: "Bosphorus",    role: "choke",                                lat: 41.00, lon: 29.00 },
  { code: "TRIZM", name: "Izmit",           country: "Turkey",       region: "East Med",     role: "refinery",                             lat: 40.78, lon: 29.92 },
  { code: "EGSUZ", name: "Suez",            country: "Egypt",        region: "Suez",         role: "choke",                                lat: 29.97, lon: 32.55 },
  { code: "EGDAM", name: "Damietta",        country: "Egypt",        region: "East Med",     role: "hub",                                  lat: 31.47, lon: 31.78 },
  { code: "EGALY", name: "Alexandria",      country: "Egypt",        region: "Med",          role: "hub",                                  lat: 31.18, lon: 29.85 },
  // === BLACK SEA (non-Russian) ===
  { code: "ROCND", name: "Constanta",       country: "Romania",      region: "Black Sea",    role: "hub",                                  lat: 44.18, lon: 28.65 },
  { code: "BGBOJ", name: "Burgas",          country: "Bulgaria",     region: "Black Sea",    role: "refinery",                             lat: 42.50, lon: 27.49 },
  { code: "BGVAR", name: "Varna",           country: "Bulgaria",     region: "Black Sea",    role: "hub",                                  lat: 43.21, lon: 27.92 },
  { code: "GEBUS", name: "Batumi",          country: "Georgia",      region: "Black Sea",    role: "oil_export",                           lat: 41.65, lon: 41.65 },
  { code: "GEPTI", name: "Poti",            country: "Georgia",      region: "Black Sea",    role: "hub",                                  lat: 42.15, lon: 41.65 },
  // === PERSIAN GULF (non-sanctioned) ===
  { code: "AEDXB", name: "Dubai",           country: "UAE",          region: "Persian Gulf", role: "hub",                                  lat: 25.27, lon: 55.30 },
  { code: "AEJEA", name: "Jebel Ali",       country: "UAE",          region: "Persian Gulf", role: "hub",                                  lat: 25.01, lon: 55.06 },
  { code: "AEKHK", name: "Khor Fakkan",     country: "UAE",          region: "Persian Gulf", role: "hub",                                  lat: 25.34, lon: 56.36 },
  { code: "SAJED", name: "Jeddah",          country: "Saudi Arabia", region: "Red Sea",      role: "hub",                                  lat: 21.49, lon: 39.18 },
  { code: "SAYAN", name: "Yanbu",           country: "Saudi Arabia", region: "Red Sea",      role: "oil_export",                           lat: 24.08, lon: 38.07 },
  { code: "SARTA", name: "Ras Tanura",      country: "Saudi Arabia", region: "Persian Gulf", role: "oil_export",                           lat: 26.65, lon: 50.16 },
  { code: "OMSLL", name: "Salalah",         country: "Oman",         region: "Persian Gulf", role: "hub",                                  lat: 16.94, lon: 54.00 },
  { code: "JOAQB", name: "Aqaba",           country: "Jordan",       region: "Red Sea",      role: "hub",                                  lat: 29.52, lon: 35.00 },
  { code: "KWKWI", name: "Kuwait City",     country: "Kuwait",       region: "Persian Gulf", role: "oil_export",                           lat: 29.34, lon: 47.93 },
  // === EAST ASIA (non-Chinese) ===
  { code: "JPYOK", name: "Yokohama",        country: "Japan",        region: "East Asia",    role: "hub",                                  lat: 35.45, lon: 139.65 },
  { code: "JPCHB", name: "Chiba",           country: "Japan",        region: "East Asia",    role: "refinery",                             lat: 35.59, lon: 140.10 },
  { code: "JPOSA", name: "Osaka",           country: "Japan",        region: "East Asia",    role: "hub",                                  lat: 34.65, lon: 135.42 },
  { code: "KRPUS", name: "Busan",           country: "South Korea",  region: "East Asia",    role: "hub",                                  lat: 35.10, lon: 129.04 },
  { code: "KRINC", name: "Incheon",         country: "South Korea",  region: "East Asia",    role: "hub",                                  lat: 37.45, lon: 126.61 },
  { code: "TWKHH", name: "Kaohsiung",       country: "Taiwan",       region: "East Asia",    role: "hub",                                  lat: 22.62, lon: 120.28 },
  // === SE ASIA (extras) ===
  { code: "MYTPP", name: "Tanjung Pelepas", country: "Malaysia",     region: "SE Asia",      role: "hub",                                  lat: 1.36,  lon: 103.55 },
  { code: "MYKLA", name: "Port Klang",      country: "Malaysia",     region: "SE Asia",      role: "hub",                                  lat: 3.00,  lon: 101.40 },
  { code: "VNSGN", name: "Ho Chi Minh City",country: "Vietnam",      region: "SE Asia",      role: "hub",                                  lat: 10.77, lon: 106.70 },
  { code: "IDJKT", name: "Jakarta",         country: "Indonesia",    region: "SE Asia",      role: "hub",                                  lat: -6.10, lon: 106.85 },
  { code: "PHMNL", name: "Manila",          country: "Philippines",  region: "SE Asia",      role: "hub",                                  lat: 14.59, lon: 120.96 },
  { code: "THLCH", name: "Laem Chabang",    country: "Thailand",     region: "SE Asia",      role: "hub",                                  lat: 13.10, lon: 100.92 },
  // === AFRICA ===
  { code: "ZALAU", name: "Saldanha Bay",    country: "South Africa", region: "South Atlantic",role: "hub",                                 lat: -33.04,lon: 17.94 },
  { code: "ZADUR", name: "Durban",          country: "South Africa", region: "Indian Ocean", role: "hub",                                  lat: -29.87,lon: 31.04 },
  { code: "ZACPT", name: "Cape Town",       country: "South Africa", region: "South Atlantic",role: "hub",                                 lat: -33.92,lon: 18.42 },
  { code: "GHTKD", name: "Tema",            country: "Ghana",        region: "West Africa",  role: "hub",                                  lat: 5.65,  lon: 0.02 },
  { code: "NGAPP", name: "Apapa",           country: "Nigeria",      region: "West Africa",  role: "hub",                                  lat: 6.45,  lon: 3.36 },
  { code: "NGLOS", name: "Lagos",           country: "Nigeria",      region: "West Africa",  role: "hub",                                  lat: 6.45,  lon: 3.40 },
  { code: "EGPSD", name: "Port Said",       country: "Egypt",        region: "Suez",         role: "choke",                                lat: 31.27, lon: 32.31 },
  { code: "DJIB",  name: "Djibouti",        country: "Djibouti",     region: "Red Sea",      role: "hub",                                  lat: 11.60, lon: 43.15 },
  // === AMERICAS ===
  { code: "USHOU", name: "Houston",         country: "USA",          region: "Gulf of Mexico",role: "refinery",                            lat: 29.73, lon: -95.27 },
  { code: "USCOR", name: "Corpus Christi",  country: "USA",          region: "Gulf of Mexico",role: "refinery",                            lat: 27.82, lon: -97.40 },
  { code: "USNYC", name: "New York",        country: "USA",          region: "US East",      role: "hub",                                  lat: 40.66, lon: -74.05 },
  { code: "USLAX", name: "Long Beach",      country: "USA",          region: "US West",      role: "hub",                                  lat: 33.75, lon: -118.20 },
  { code: "USOAK", name: "Oakland",         country: "USA",          region: "US West",      role: "hub",                                  lat: 37.79, lon: -122.30 },
  { code: "USSAV", name: "Savannah",        country: "USA",          region: "US East",      role: "hub",                                  lat: 32.08, lon: -81.10 },
  { code: "USNOL", name: "New Orleans",     country: "USA",          region: "Gulf of Mexico",role: "refinery",                            lat: 29.95, lon: -90.07 },
  { code: "CAVAN", name: "Vancouver",       country: "Canada",       region: "US West",      role: "hub",                                  lat: 49.29, lon: -123.10 },
  { code: "CAMTR", name: "Montreal",        country: "Canada",       region: "St Lawrence",  role: "hub",                                  lat: 45.55, lon: -73.55 },
  { code: "BRSSZ", name: "Santos",          country: "Brazil",       region: "South Atlantic",role: "hub",                                 lat: -23.97,lon: -46.32 },
  { code: "ARBUE", name: "Buenos Aires",    country: "Argentina",    region: "South Atlantic",role: "hub",                                 lat: -34.59,lon: -58.37 },
  { code: "COCTG", name: "Cartagena",       country: "Colombia",     region: "Caribbean",    role: "hub",                                  lat: 10.40, lon: -75.55 },
  { code: "PACTB", name: "Colon",           country: "Panama",       region: "Caribbean",    role: "choke",                                lat: 9.36,  lon: -79.91 },
  { code: "MXTAM", name: "Tampico",         country: "Mexico",       region: "Gulf of Mexico",role: "oil_export",                          lat: 22.27, lon: -97.85 },
];

const EARTH_NM = 3440.065;
function haversineNmGeo(la1: number, lo1: number, la2: number, lo2: number): number {
  const r = (d: number) => (d * Math.PI) / 180;
  const dla = r(la2 - la1), dlo = r(lo2 - lo1);
  const a = Math.sin(dla / 2) ** 2 + Math.cos(r(la1)) * Math.cos(r(la2)) * Math.sin(dlo / 2) ** 2;
  return EARTH_NM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Find nearest port to (lat, lon) within max_nm. Used for proximity-based port-call inference.
export function findNearestPort(lat: number, lon: number, maxNm = 12): (PortGeo & { distance_nm: number }) | null {
  let best: (PortGeo & { distance_nm: number }) | null = null;
  for (const p of WORLD_PORTS) {
    const d = haversineNmGeo(lat, lon, p.lat, p.lon);
    if (d <= (p.detect_radius_nm ?? maxNm) && (!best || d < best.distance_nm)) {
      best = { ...p, distance_nm: d };
    }
  }
  return best;
}

// Common AIS-destination phrases (free-text, not LOCODE)
const PHRASE_TAGS: Record<string, { tag: string; note: string }> = {
  "FOR ORDERS":            { tag: "awaiting", note: "Vessel awaiting routing instructions — common shadow-fleet pattern" },
  "FOR ORDER":             { tag: "awaiting", note: "Vessel awaiting routing instructions" },
  "ORDERS":                { tag: "awaiting", note: "Awaiting orders" },
  "OFF PORT LIMITS":       { tag: "anchored",  note: "Anchored just outside port territorial waters" },
  "OPL":                   { tag: "anchored",  note: "Off port limits" },
  "FOR INSTRUCTIONS":      { tag: "awaiting", note: "Awaiting instructions" },
  "GULF OF FINLAND":       { tag: "transit",   note: "Approaching Russian Baltic ports" },
  "BLACK SEA":             { tag: "transit",   note: "In transit, Black Sea" },
  "STRAIT OF HORMUZ":      { tag: "choke",     note: "In transit through Strait of Hormuz" },
  "SUEZ CANAL":            { tag: "choke",     note: "In Suez Canal transit" },
  "ANCHORAGE":             { tag: "anchored",  note: "At anchorage" },
};

export interface DestinationParseResult {
  raw: string;
  port?: PortInfo;
  phrase_tag?: string;
  note?: string;
  via_port_code?: string;       // sometimes destination is "X>Y" — origin > destination
  origin?: PortInfo;
  destination?: PortInfo;
}

// AIS destination strings can be in many shapes:
//   "RUULU"          — single LOCODE
//   "RULED>EGSUZ"    — origin>destination (common shadow pattern)
//   "RUTUA-INMUN"    — origin-destination
//   "FOR ORDERS"     — phrase
//   "OPL FUJAIRAH"   — phrase + free text
//   "RUNVS VIA SUEZ" — origin via choke
export function parseDestination(raw: string | null | undefined): DestinationParseResult {
  if (!raw) return { raw: "" };
  const r = raw.trim().toUpperCase();
  if (!r) return { raw };

  // origin>destination split
  const arrowSplit = r.split(/[>\-]/);
  if (arrowSplit.length === 2) {
    const a = PORT_INDEX.get(arrowSplit[0]!.trim());
    const b = PORT_INDEX.get(arrowSplit[1]!.trim());
    if (a || b) return { raw, origin: a, destination: b };
  }

  // single LOCODE
  if (r.length >= 5) {
    const code5 = r.slice(0, 5);
    const port = PORT_INDEX.get(code5);
    if (port) return { raw, port };
  }

  // phrase tags
  for (const phrase of Object.keys(PHRASE_TAGS)) {
    if (r.includes(phrase)) {
      return { raw, phrase_tag: PHRASE_TAGS[phrase]!.tag, note: PHRASE_TAGS[phrase]!.note };
    }
  }

  return { raw };
}

// Loaded / partial / ballast inference from current AIS draught
// for given vessel category (rough heuristic; rough but useful at scale).
export type LoadStatus = "loaded" | "partial" | "ballast" | "unknown";

export interface LoadInference {
  status: LoadStatus;
  current_draught_m: number | null;
  category: string;
  reasoning: string;
}

export function inferLoadStatus(ftmType: string | null | undefined, draughtM: number | null | undefined): LoadInference {
  if (!draughtM || draughtM <= 0) {
    return { status: "unknown", current_draught_m: draughtM ?? null, category: "unknown", reasoning: "No current draught broadcast" };
  }

  const t = (ftmType ?? "").toLowerCase();
  let category = "tanker (generic)";
  let ballastMax = 8.0;
  let loadedMin = 12.5;

  if (t.includes("vlcc") || t.includes("very large")) {
    category = "VLCC"; ballastMax = 11; loadedMin = 19;
  } else if (t.includes("suezmax")) {
    category = "Suezmax"; ballastMax = 9; loadedMin = 16;
  } else if (t.includes("aframax") || t.includes("crude")) {
    category = "Aframax / crude"; ballastMax = 8; loadedMin = 13;
  } else if (t.includes("product") || t.includes("oil products")) {
    category = "product tanker"; ballastMax = 5.5; loadedMin = 10;
  } else if (t.includes("chemical")) {
    category = "chemical tanker"; ballastMax = 5; loadedMin = 9.5;
  } else if (t.includes("lng") || t.includes("liquefied")) {
    category = "LNG carrier"; ballastMax = 9; loadedMin = 11;
  } else if (t.includes("lpg")) {
    category = "LPG carrier"; ballastMax = 6; loadedMin = 10;
  }

  let status: LoadStatus;
  if (draughtM <= ballastMax) status = "ballast";
  else if (draughtM >= loadedMin) status = "loaded";
  else status = "partial";

  const reasoning =
    status === "loaded"
      ? `Draught ${draughtM.toFixed(1)} m ≥ ${loadedMin} m typical-loaded for ${category}`
      : status === "ballast"
        ? `Draught ${draughtM.toFixed(1)} m ≤ ${ballastMax} m typical-ballast for ${category}`
        : `Draught ${draughtM.toFixed(1)} m between ballast (≤${ballastMax}) and loaded (≥${loadedMin}) thresholds for ${category}`;

  return { status, current_draught_m: draughtM, category, reasoning };
}

// Cargo-type mapping from FtM vessel type strings to a clean tag.
export function inferCargoType(ftmType: string | null | undefined): { cargo: string; emoji: string } {
  const t = (ftmType ?? "").toLowerCase();
  if (t.includes("lng") || t.includes("liquefied natural")) return { cargo: "LNG", emoji: "❄️" };
  if (t.includes("lpg") || t.includes("liquefied petroleum")) return { cargo: "LPG", emoji: "⛽" };
  if (t.includes("crude")) return { cargo: "Crude oil", emoji: "🛢️" };
  if (t.includes("oil products") || t.includes("product")) return { cargo: "Refined petroleum products", emoji: "⛽" };
  if (t.includes("chemical")) return { cargo: "Chemicals", emoji: "⚗️" };
  if (t.includes("oil tanker") || t.includes("oil ship")) return { cargo: "Oil (unspecified)", emoji: "🛢️" };
  if (t.includes("tanker")) return { cargo: "Tanker (unspecified)", emoji: "🛢️" };
  return { cargo: "—", emoji: "🚢" };
}

// External-photo / reference deep links by IMO. We do NOT fetch — just provide URLs.
// ShipSpotting + VesselFinder + MarineTraffic all have public per-IMO landing pages.
export function externalLinks(imo: number | string, name?: string | null): Array<{ source: string; url: string; label: string }> {
  const i = String(imo);
  const n = name ? encodeURIComponent(name) : "";
  const nameOrImo = encodeURIComponent(String(name ?? imo));
  return [
    { source: "ShipSpotting",  label: "Photos (community)",         url: `https://www.shipspotting.com/photos/gallery?imo=${i}` },
    { source: "VesselFinder",  label: "Profile + photos",           url: `https://www.vesselfinder.com/vessels?name=${n}&imo=${i}` },
    { source: "MarineTraffic", label: "Track + photos",             url: `https://www.marinetraffic.com/en/ais/details/ships/imo:${i}` },
    { source: "Equasis",       label: "Registry (free login)",      url: `https://www.equasis.org/EquasisWeb/restricted/Search?fs=ShipSearch&P_IMO=${i}` },
    { source: "Wikipedia",     label: "Article search",             url: `https://en.wikipedia.org/w/index.php?search=%22${nameOrImo}%22+tanker&fulltext=1` },
    { source: "Wikidata",      label: "Entity search",              url: `https://www.wikidata.org/w/index.php?search=${nameOrImo}+IMO+${i}&fulltext=1` },
    { source: "Lloyd's List",  label: "News mentions (paywalled)",  url: `https://lloydslist.maritimeintelligence.informa.com/ll/?q=${nameOrImo}` },
    { source: "OpenSanctions", label: "Sanctions record",           url: `https://www.opensanctions.org/search/?q=${i}` },
    { source: "Google Images", label: "Photo search",               url: `https://www.google.com/search?q=%22${nameOrImo}%22+tanker+IMO+${i}&tbm=isch` },
    { source: "Bellingcat",    label: "Investigative search",        url: `https://www.bellingcat.com/?s=${nameOrImo}` },
    { source: "OCCRP",         label: "Investigative archive",       url: `https://www.occrp.org/en/search?searchwords=${nameOrImo}` },
    { source: "X / Twitter",   label: "OSINT chatter",               url: `https://twitter.com/search?q=${encodeURIComponent('"' + (name ?? imo) + '" tanker OR sanctions OR IMO')}&src=typed_query&f=live` },
    { source: "EU Sanctions",  label: "EU consolidated lookup",      url: `https://webgate.ec.europa.eu/fsd/fsf/public/files/xmlFullSanctionsList_1_1/content` },
    { source: "UK OFSI",       label: "UK list (HM Treasury)",       url: `https://sanctionssearchapp.ofsi.hmtreasury.gov.uk/?searchTerm=${nameOrImo}` },
  ];
}

// Sentinel-1 SAR (Copernicus Browser) deep-link for verifying AIS dark periods.
// SAR penetrates clouds and works at night — ideal for catching vessels going dark.
// We generate a URL with bounding box, time window (±12h around the gap),
// and Sentinel-1 GRD-IW dataset selected.
export function sentinelVerifyUrl(lat: number, lon: number, fromTs: string, toTs: string): string {
  // Pad time window for satellite revisit (~12h either side)
  const from = new Date(new Date(fromTs).getTime() - 12 * 3600 * 1000).toISOString();
  const to   = new Date(new Date(toTs).getTime()   + 12 * 3600 * 1000).toISOString();
  const params = new URLSearchParams({
    lng: String(lon.toFixed(4)),
    lat: String(lat.toFixed(4)),
    zoom: "11",
    fromTime: from,
    toTime: to,
    datasetId: "S1_GRD",
    visualizationUrl: "S1_GRD_VVVH",
  });
  return `https://browser.dataspace.copernicus.eu/?${params.toString()}`;
}
