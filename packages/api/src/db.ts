import postgres from "postgres";
import { env } from "./env.ts";

export const sql = env.DATABASE_URL
  ? postgres(env.DATABASE_URL, {
      // Postgres-js: pass timestamps as strings to avoid Date instance issues
      transform: { undefined: null },
      max: 10,
      idle_timeout: 30,
    })
  : null;

export type Sql = NonNullable<typeof sql>;
