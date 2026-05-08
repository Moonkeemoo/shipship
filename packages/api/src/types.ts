// AISStream wire-shape types — see https://aisstream.io/documentation
//
// Every message arrives wrapped:
//   { MessageType: "PositionReport" | "ShipStaticData" | ..., MetaData: {...}, Message: {...} }
// where Message contains a key matching MessageType (e.g. Message.PositionReport).
// MetaData is a denormalized convenience block with MMSI, latitude, longitude, time_utc.

export interface AISMetaData {
  MMSI: number;
  ShipName?: string;
  latitude: number;
  longitude: number;
  time_utc: string; // ISO 8601 with microseconds
}

export interface AISPositionReport {
  MessageID: number;
  RepeatIndicator: number;
  UserID: number;
  Valid: boolean;
  NavigationalStatus: number;
  RateOfTurn?: number;
  Sog: number;
  PositionAccuracy?: boolean;
  Longitude: number;
  Latitude: number;
  Cog: number;
  TrueHeading: number; // 511 = "not available"
  Timestamp: number;
  SpecialManoeuvreIndicator?: number;
  Spare?: number;
  Raim?: boolean;
  CommunicationState?: number;
}

export interface AISDimension {
  A: number;
  B: number;
  C: number;
  D: number;
}

export interface AISShipStaticData {
  MessageID: number;
  RepeatIndicator: number;
  UserID: number;
  Valid: boolean;
  AisVersion: number;
  ImoNumber: number; // 0 if unknown
  CallSign: string;
  Name: string;
  Type: number; // ship type code (0-99)
  Dimension: AISDimension;
  FixType?: number;
  Eta?: { Day: number; Hour: number; Minute: number; Month: number };
  MaximumStaticDraught: number;
  Destination: string;
  Dte?: boolean;
  Spare?: boolean;
}

// Wire envelope before narrowing — what every parsed message looks like.
export interface AISEnvelope {
  MessageType: string;
  MetaData: AISMetaData;
  Message: Record<string, unknown>;
}

// Discriminated union for the message types we handle.
// Anything else (e.g. AddressedSafetyMessage, BinaryBroadcast, etc.) doesn't narrow here —
// the caller checks MessageType first via isHandledMessage().
export type AISMessage =
  | { MessageType: "PositionReport"; MetaData: AISMetaData; Message: { PositionReport: AISPositionReport } }
  | { MessageType: "ShipStaticData"; MetaData: AISMetaData; Message: { ShipStaticData: AISShipStaticData } };

export function isHandledMessage(env: AISEnvelope): env is AISMessage {
  return env.MessageType === "PositionReport" || env.MessageType === "ShipStaticData";
}

// AIS ship_type codes per ITU-R M.1371 / IEC 62287
// 60-69: Passenger
// 70-79: Cargo (general/container/bulk/hazardous A-D)
// 80-89: Tanker (sub-categories 81-87 = hazardous categories A-D + reserved)
// We persist 60-89 (commercial-fleet) and discard 0-59 + 90-99 (fishing/military/etc).
export const TANKER_SHIP_TYPES: ReadonlySet<number> = new Set([80, 81, 82, 83, 84, 85, 86, 87, 88, 89]);
export const COMMERCIAL_SHIP_TYPES: ReadonlySet<number> = new Set([
  60, 61, 62, 63, 64, 65, 66, 67, 68, 69, // passenger
  70, 71, 72, 73, 74, 75, 76, 77, 78, 79, // cargo
  80, 81, 82, 83, 84, 85, 86, 87, 88, 89, // tanker
]);

export function isTanker(shipType: number | null | undefined): boolean {
  return shipType != null && TANKER_SHIP_TYPES.has(shipType);
}
export function isCommercial(shipType: number | null | undefined): boolean {
  return shipType != null && COMMERCIAL_SHIP_TYPES.has(shipType);
}
