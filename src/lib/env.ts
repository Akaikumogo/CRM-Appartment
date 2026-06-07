import { z } from 'zod';

const schema = z.object({
  VITE_API_URL: z.string().url().default('http://localhost:3000'),
  VITE_SHOWROOM_URL: z.string().url().optional(),
  VITE_MQTT_TOPIC_HINT: z.string().optional(),
  VITE_SUPPORT_PHONE: z.string().optional(),
});

export type AppEnv = z.infer<typeof schema>;

function resolveEnv(): AppEnv {
  const parsed = schema.safeParse(import.meta.env);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join('.')}: ${i.message}`)
      .join('\n');
    const msg = `Invalid frontend environment configuration:\n${issues}`;
    if (import.meta.env.PROD) {
      throw new Error(msg);
    }
    // eslint-disable-next-line no-console
    console.warn(msg);
    return schema.parse({
      ...import.meta.env,
      VITE_API_URL:
        (import.meta.env.VITE_API_URL as string | undefined) ??
        'http://localhost:3000',
    });
  }
  return parsed.data;
}

export const env = resolveEnv();
