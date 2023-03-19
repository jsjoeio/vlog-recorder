import { z } from "zod";

const clientEnvSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string()
});

// Credit: https://create.t3.gg/en/usage/env-variables/#client-schema
const processEnv = {
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL 
}
export const clientEnv = clientEnvSchema.safeParse(processEnv);