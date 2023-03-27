import { z } from "zod";

const envSchema = z.object({
  // Server-side
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  SECRET: z.string(),
  NEXTAUTH_URL: z.string(),
});

export const env = envSchema.parse(process.env);
