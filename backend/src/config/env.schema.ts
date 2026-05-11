import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().int().positive().default(8080),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('7d'),
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
  // the email below). Hashed with bcrypt by the AuthService so it can be used
  // to sign in.
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
