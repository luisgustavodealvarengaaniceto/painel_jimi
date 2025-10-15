-- Script para garantir que as colunas font_size existam
-- Este script é executado toda vez que o container inicia

-- Adicionar font_size na tabela slides se não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'slides' AND column_name = 'font_size'
    ) THEN
        ALTER TABLE slides ADD COLUMN font_size integer DEFAULT 16 NOT NULL;
    END IF;
END $$;

-- Adicionar font_size na tabela fixed_content se não existir  
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'fixed_content' AND column_name = 'font_size'
    ) THEN
        ALTER TABLE fixed_content ADD COLUMN font_size integer DEFAULT 14 NOT NULL;
    END IF;
END $$;