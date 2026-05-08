import { z } from "zod";

const schema = z.object({
  AISSTREAM_KEY: z.string().min(10, "AISSTREAM_KEY missing or too short"),
  DATABASE_URL: z.string().optional(),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
  AIS_BBOXES: z
    .string()
    .default("[[[53,-10],[66,31]]]")
    .transform((s, ctx) => {
      try {
        const parsed = JSON.parse(s) as unknown;
        if (!Array.isArray(parsed)) throw new Error("not array");
        return parsed as number[][][];
      } catch (err) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `AIS_BBOXES must be valid JSON array: ${String(err)}`,
        });
        return z.NEVER;
      }
    }),
});

export const env = schema.parse(process.env);
