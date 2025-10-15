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

// Function to ensure required schema columns exist
export async function ensureSchema() {
  try {
    console.log('🔧 Verificando schema do banco de dados...');
    
    // Verificar e adicionar font_size na tabela slides
    await client`
      DO $$ 
      BEGIN
          IF NOT EXISTS (
              SELECT 1 FROM information_schema.columns 
              WHERE table_name = 'slides' AND column_name = 'font_size'
          ) THEN
              ALTER TABLE slides ADD COLUMN font_size integer DEFAULT 16 NOT NULL;
              RAISE NOTICE 'Coluna font_size adicionada na tabela slides';
          END IF;
      END $$;
    `;
    
    // Verificar e adicionar font_size na tabela fixed_content
    await client`
      DO $$ 
      BEGIN
          IF NOT EXISTS (
              SELECT 1 FROM information_schema.columns 
              WHERE table_name = 'fixed_content' AND column_name = 'font_size'
          ) THEN
              ALTER TABLE fixed_content ADD COLUMN font_size integer DEFAULT 14 NOT NULL;
              RAISE NOTICE 'Coluna font_size adicionada na tabela fixed_content';
          END IF;
      END $$;
    `;
    
    console.log('✅ Schema verificado e atualizado');
    return true;
  } catch (error) {
    console.error('❌ Erro ao verificar schema:', error);
    return false;
  }
}

// Function to close database connection
export async function closeConnection() {
  await client.end();
}