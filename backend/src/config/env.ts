import 'dotenv/config';

const required = (key: string): string => {
  const v = process.env[key];
  if (v == null || v === '') {
    const msg = `Missing required env: ${key}. Set it in your environment or .env.`;
    console.error(msg);
    throw new Error(msg);
  }
  return v;
};

const optional = (key: string, fallback: string): string => {
  return process.env[key] ?? fallback;
};

export const env = {
  NODE_ENV: optional('NODE_ENV', 'development'),
  PORT: parseInt(optional('PORT', '3001'), 10),
  DATABASE_URL: required('DATABASE_URL'),
  JWT_SECRET: required('JWT_SECRET'),
  JWT_EXPIRES_IN: optional('JWT_EXPIRES_IN', '7d'),
  ADMIN_EMAIL: optional('ADMIN_EMAIL', 'admin@example.com'),
  ADMIN_PASSWORD: optional('ADMIN_PASSWORD', 'replace_me'),
} as const;
