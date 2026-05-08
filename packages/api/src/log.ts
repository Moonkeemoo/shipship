type Level = "debug" | "info" | "warn" | "error";

const LEVEL_NUM: Record<Level, number> = { debug: 0, info: 1, warn: 2, error: 3 };
const enabledLevel = (process.env.LOG_LEVEL ?? "info") as Level;
const enabledNum = LEVEL_NUM[enabledLevel] ?? 1;

function emit(level: Level, fields: Record<string, unknown>, msg?: string): void {
  if (LEVEL_NUM[level] < enabledNum) return;
  const line = JSON.stringify({ ts: new Date().toISOString(), level, msg, ...fields });
  if (level === "error" || level === "warn") console.error(line);
  else console.log(line);
}

export const logger = {
  debug: (fields: Record<string, unknown>, msg?: string) => emit("debug", fields, msg),
  info: (fields: Record<string, unknown>, msg?: string) => emit("info", fields, msg),
  warn: (fields: Record<string, unknown>, msg?: string) => emit("warn", fields, msg),
  error: (fields: Record<string, unknown>, msg?: string) => emit("error", fields, msg),
};
