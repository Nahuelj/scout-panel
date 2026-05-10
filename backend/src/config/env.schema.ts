import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().int().positive().default(8080),
  DATABASE_URL: z.string().url(),
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.string().url().optional(),
  FRONTEND_URL: z.string().url().optional(),
  // Seed the database automatically on application bootstrap. Idempotent:
  // skips if players already exist. Defaults to true in every environment;
  // set SEED_ON_BOOT=false to opt out.
  SEED_ON_BOOT: z
    .union([z.boolean(), z.string()])
    .optional()
    .transform((value) => {
      if (value === undefined) return undefined;
      if (typeof value === 'boolean') return value;
      return value === 'true' || value === '1';
    }),
  // Default user created on boot when the users table is empty (or missing
  // the email below). Created through better-auth so the password hash is
  // compatible with sign-in.
  DEFAULT_USER_EMAIL: z.string().email().default('admin@scout.local'),
  DEFAULT_USER_PASSWORD: z.string().min(8).default('admin12345'),
  DEFAULT_USER_NAME: z.string().min(1).default('Admin'),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): Env {
  const parsed = envSchema.safeParse(config);
  if (!parsed.success) {
    const formatted = parsed.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    throw new Error(`Invalid environment variables:\n${formatted}`);
  }
  return parsed.data;
}
