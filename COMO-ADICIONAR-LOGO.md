# 📋 Como Adicionar a Logo da Akroz Group

## 🎯 Passo a Passo

### 1. Prepare o arquivo da logo
- **Nome do arquivo**: `logo-akroz-group-alinhamento-base-horiz.png`
- **Formato**: PNG (preferencialmente com fundo transparente)
- **Tamanho recomendado**: Largura de 600-1200px

### 2. Adicione a logo no projeto

**Caminho correto:**
```
public/logos/logo-akroz-group-alinhamento-base-horiz.png
```

**Estrutura de pastas:**
```
painel_jimi/
├── public/
│   ├── logos/
│   │   └── logo-akroz-group-alinhamento-base-horiz.png  ← AQUI!
│   └── vite.svg
├── src/
└── ...
```

### 3. Onde a logo aparece

A logo será exibida automaticamente em:

✅ **Tela de Login** (`/login` ou `/`)
- Card branco centralizado
- Logo no topo
- Título "Akroz Group" abaixo

✅ **DisplayPage** (quando logado como usuário Akroz)
- Sidebar com logo da Akroz
- Substitui o texto "AKROZ TELEMATICS"

### 4. Rebuild e Deploy

Após adicionar a logo:

```powershell
# 1. Rebuild
npm run build

# 2. Deploy no nginx
docker exec jimi-nginx rm -rf /usr/share/nginx/html/*
docker cp .\dist\. jimi-nginx:/usr/share/nginx/html/
docker exec jimi-nginx nginx -s reload
```

## 🔍 Verificar se funcionou

1. Acesse: `http://localhost:1212/login`
2. A logo deve aparecer no topo do card branco
3. Se não aparecer, verifique:
   - O arquivo está no caminho correto?
   - O nome está exatamente correto?
   - Você fez rebuild?

## ⚠️ Troubleshooting

### Logo não aparece
```powershell
# Verificar se o arquivo foi copiado para dist
ls .\dist\logos\

# Se não existe, copiar manualmente
mkdir .\dist\logos -Force
cp .\public\logos\logo-akroz-group-alinhamento-base-horiz.png .\dist\logos\
```

### Erro 404 na logo
- Verifique o caminho no código: `/logos/logo-akroz-group-alinhamento-base-horiz.png`
- Verifique se o arquivo está em `dist/logos/` após o build
- Certifique-se de que o nginx tem o arquivo

## 📞 Verificação Rápida

```powershell
# Verificar se a logo existe no projeto
Test-Path .\public\logos\logo-akroz-group-alinhamento-base-horiz.png

# Verificar se está no dist após build
Test-Path .\dist\logos\logo-akroz-group-alinhamento-base-horiz.png

# Verificar se está no nginx
docker exec jimi-nginx ls /usr/share/nginx/html/logos/
```

---

**Dica**: Se você ainda não tem a logo, pode adicionar temporariamente qualquer imagem PNG com esse nome para testar o layout!
