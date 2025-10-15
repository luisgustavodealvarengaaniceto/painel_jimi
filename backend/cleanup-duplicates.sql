-- Script para limpar dados duplicados mantendo apenas os registros mais recentes

-- 1. Limpar slides duplicados (mantém o mais recente de cada título)
WITH duplicates AS (
  SELECT id, 
         title,
         ROW_NUMBER() OVER (PARTITION BY title ORDER BY created_at DESC) as rn
  FROM slides
)
DELETE FROM slides 
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- 2. Limpar fixed_content duplicados (mantém o mais recente de cada tipo)
WITH duplicates AS (
  SELECT id, 
         type,
         ROW_NUMBER() OVER (PARTITION BY type ORDER BY created_at DESC) as rn
  FROM fixed_content
)
DELETE FROM fixed_content 
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- 3. Adicionar constraints para evitar duplicação futura
ALTER TABLE slides ADD CONSTRAINT slides_title_unique UNIQUE (title);
ALTER TABLE fixed_content ADD CONSTRAINT fixed_content_type_unique UNIQUE (type);

-- 4. Mostrar contagens finais
SELECT 'Slides restantes:' as info, COUNT(*) as count FROM slides
UNION ALL
SELECT 'Fixed content restantes:' as info, COUNT(*) as count FROM fixed_content
UNION ALL
SELECT 'Usuários:' as info, COUNT(*) as count FROM users;
