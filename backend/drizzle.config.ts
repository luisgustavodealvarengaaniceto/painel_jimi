import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || 'postgresql://painel_user:JimiIOT2024@localhost:5432/painel_jimi'
  },
  verbose: true,
  strict: true
});