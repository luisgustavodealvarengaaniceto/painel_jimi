import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL!;

// Disable prefetch as it's not supported for "Transaction" pool mode
const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client, { schema });

// Function to test database connection
export async function testConnection(logSuccess = false) {
  try {
    await client`SELECT 1`;
    if (logSuccess) {
      console.log('✅ Database connection successful');
    }
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

// Function to close database connection
export async function closeConnection() {
  await client.end();
}