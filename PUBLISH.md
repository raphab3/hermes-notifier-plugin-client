# 📦 Como Publicar no npm

## 🚀 Primeira Publicação

### 1. Login no npm

```bash
npm login
```

Você precisará de:
- Username do npm
- Password
- Email
- 2FA code (se habilitado)

### 2. Verificar o package.json

```bash
cat package.json
```

Certifique-se de que:
- ✅ `name` está correto: `@hermes-notifications/client`
- ✅ `version` está correto: `1.0.0`
- ✅ `main`, `jsdelivr`, `unpkg` estão configurados
- ✅ `files` lista os arquivos a publicar

### 3. Build (minificar)

```bash
npm run build
```

Isso vai criar o `hermes-client.min.js`

### 4. Testar localmente

```bash
# Verificar quais arquivos serão publicados
npm pack --dry-run

# Ou criar um tarball para inspecionar
npm pack
tar -tzf hermes-notifications-client-1.0.0.tgz
```

### 5. Publicar

```bash
# Publicar como público (necessário para pacotes @scope)
npm publish --access public
```

### 6. Verificar

Acesse: https://www.npmjs.com/package/@hermes-notifications/client

Teste o CDN:
```html
<script src="https://cdn.jsdelivr.net/npm/@hermes-notifications/client"></script>
```

---

## 🔄 Atualizar Versão

### 1. Atualizar código

Faça as alterações necessárias em `hermes-client.js`

### 2. Atualizar versão

```bash
# Patch (1.0.0 -> 1.0.1) - Bug fixes
npm version patch

# Minor (1.0.0 -> 1.1.0) - New features
npm version minor

# Major (1.0.0 -> 2.0.0) - Breaking changes
npm version major
```

Ou manualmente no `package.json`:
```json
{
  "version": "1.0.1"
}
```

### 3. Build

```bash
npm run build
```

### 4. Commit e Tag

```bash
git add .
git commit -m "Release v1.0.1"
git tag v1.0.1
git push origin main
git push origin v1.0.1
```

### 5. Publicar

```bash
npm publish
```

---

## 📋 Checklist de Publicação

- [ ] Código testado
- [ ] Versão atualizada no package.json
- [ ] `npm run build` executado
- [ ] `npm pack --dry-run` verificado
- [ ] Commit feito
- [ ] Tag criada
- [ ] `npm publish --access public` executado
- [ ] Verificado em npmjs.com
- [ ] CDN testado

---

## 🌐 URLs após Publicação

### npm
```
https://www.npmjs.com/package/@hermes-notifications/client
```

### CDN jsDelivr
```html
<!-- Latest -->
<script src="https://cdn.jsdelivr.net/npm/@hermes-notifications/client"></script>

<!-- Specific version -->
<script src="https://cdn.jsdelivr.net/npm/@hermes-notifications/client@1.0.0"></script>

<!-- Minified (default) -->
<script src="https://cdn.jsdelivr.net/npm/@hermes-notifications/client"></script>

<!-- Unminified -->
<script src="https://cdn.jsdelivr.net/npm/@hermes-notifications/client/hermes-client.js"></script>
```

### CDN unpkg
```html
<!-- Latest -->
<script src="https://unpkg.com/@hermes-notifications/client"></script>

<!-- Specific version -->
<script src="https://unpkg.com/@hermes-notifications/client@1.0.0"></script>
```

---

## 🔧 Comandos Úteis

### Ver versão atual
```bash
npm version
```

### Ver informações do pacote
```bash
npm info @hermes-notifications/client
```

### Ver todas as versões publicadas
```bash
npm view @hermes-notifications/client versions
```

### Despublicar (cuidado!)
```bash
# Apenas nas primeiras 72 horas
npm unpublish @hermes-notifications/client@1.0.0

# Despublicar tudo (CUIDADO!)
npm unpublish @hermes-notifications/client --force
```

### Deprecar uma versão
```bash
npm deprecate @hermes-notifications/client@1.0.0 "Use version 1.0.1 instead"
```

---

## 🐛 Troubleshooting

### Erro: "You do not have permission to publish"

Certifique-se de:
1. Estar logado: `npm whoami`
2. Usar `--access public` para pacotes @scope
3. Ter permissão no scope `@hermes-notifications`

### Erro: "Package name too similar to existing package"

Mude o nome no package.json ou use um scope diferente.

### Erro: "Version already exists"

Atualize a versão no package.json:
```bash
npm version patch
```

### CDN não atualiza

1. Aguarde alguns minutos (cache)
2. Limpe o cache: https://www.jsdelivr.com/tools/purge
3. Use URL com versão específica

---

## 📝 Exemplo Completo

```bash
# 1. Fazer alterações
vim hermes-client.js

# 2. Atualizar versão
npm version patch

# 3. Build
npm run build

# 4. Verificar
npm pack --dry-run

# 5. Commit e tag
git add .
git commit -m "Release v1.0.1 - Fix bug X"
git push origin main
git push origin v1.0.1

# 6. Publicar
npm publish

# 7. Testar
curl -I https://cdn.jsdelivr.net/npm/@hermes-notifications/client
```

---

## 🎯 Versionamento Semântico

- **MAJOR** (1.0.0 -> 2.0.0): Breaking changes
  - Mudanças na API que quebram compatibilidade
  - Remoção de funcionalidades
  
- **MINOR** (1.0.0 -> 1.1.0): New features
  - Novas funcionalidades
  - Mantém compatibilidade
  
- **PATCH** (1.0.0 -> 1.0.1): Bug fixes
  - Correções de bugs
  - Pequenas melhorias

---

## 🔐 Segurança

### Habilitar 2FA

```bash
npm profile enable-2fa auth-and-writes
```

### Usar tokens de acesso

```bash
# Criar token
npm token create

# Usar token
npm config set //registry.npmjs.org/:_authToken YOUR_TOKEN
```

---

## ✅ Pronto!

Agora o pacote está publicado no npm e automaticamente disponível via CDN! 🎉

**CDN URL:**
```html
<script src="https://cdn.jsdelivr.net/npm/@hermes-notifications/client"></script>
```

