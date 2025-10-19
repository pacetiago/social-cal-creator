# ✅ SOLUÇÃO DEFINITIVA APLICADA - Guia de Verificação

## 📋 O Que Foi Implementado

### 1. **Políticas RLS Simplificadas e Limpas** ✅

**ANTES:** 4+ políticas conflitantes usando `storage.foldername()` e `split_part()` de forma inconsistente

**AGORA:** 3 políticas simples e claras:

```sql
-- ✅ SELECT: Permite leitura quando usuário é membro da org
select_post_attachments

-- ✅ INSERT: Permite upload quando usuário é OWNER/ADMIN/EDITOR
insert_post_attachments  

-- ✅ DELETE: Permite remoção quando usuário é OWNER/ADMIN
delete_post_attachments
```

**Formato OBRIGATÓRIO do file_path:** `orgId/postId/filename`

Exemplo: `550e8400-e29b-41d4-a716-446655440001/7c9e6679-7425-40de-944b-e07fc1f90ae7/1729260123-abc.jpg`

### 2. **Código Frontend Atualizado** ✅

- ✅ `file_path` gerado corretamente em `ModernPostForm.tsx` (linha 270)
- ✅ Logs de depuração adicionados em:
  - `BulkImport.tsx` - importação de planilhas
  - `ModernPostForm.tsx` - upload de anexos
  - `AttachmentPopover.tsx` - visualização de anexos

### 3. **Edge Function com Autenticação Obrigatória** ✅

- ✅ `verify_jwt = true` em `config.toml`
- ✅ Validação Zod implementada
- ✅ Tokens de share agora hasheados com SHA-256

---

## 🧪 TESTES OBRIGATÓRIOS

### **Teste 1: Importação de Planilha (Edge Function)**

**Passo a Passo:**

1. **Abra o Console do Navegador** (F12 → Console)

2. **Faça Login** na aplicação

3. **Vá para a página de importação** de planilhas

4. **Selecione um arquivo Excel** (.xlsx)

5. **Clique em "Importar Posts"**

6. **Observe os logs no console:**

```javascript
// ✅ LOGS ESPERADOS (sucesso):
🔐 Frontend Debug: Verificando autenticação antes do import
   - Sessão ativa: true
   - Access token presente: true
   - Token preview: eyJhbGciOiJIUzI1NiIs...
   - User ID: b1f95a56-7a29-4fda-9589-89ff763299d3
   - User email: tiago@marsala.ag
   
📤 Frontend Debug: Invocando Edge Function bulk-import-posts
   - orgId: 550e8400-e29b-41d4-a716-446655440001
   - filename: planilha.xlsx
   - fileContent length: 123456
   
📥 Frontend Debug: Resposta da Edge Function
   - Success: true
   - Data: { success: 10, failed: 0, errors: [] }

// ❌ LOGS ESPERADOS (erro de autenticação):
🔐 Frontend Debug: Verificando autenticação antes do import
   - Sessão ativa: false
   - Erro: Usuário não autenticado

// ❌ LOGS ESPERADOS (erro 401):
📥 Frontend Debug: Resposta da Edge Function
   - Success: false
   - Error: { message: "Not authenticated" }
```

**Se receber erro 401:**
- Copie o `access_token` do log
- Vá para [Supabase Dashboard → Edge Functions → bulk-import-posts → Invoke](https://supabase.com/dashboard/project/rlymnpiwizkohghvkuje/functions/bulk-import-posts)
- Cole o token no header `Authorization: Bearer SEU_TOKEN`
- Execute e veja os logs da função

---

### **Teste 2: Upload de Anexo (Storage)**

**Passo a Passo:**

1. **Abra o Console do Navegador** (F12 → Console)

2. **Crie ou edite um post**

3. **Faça upload de uma imagem**

4. **Observe os logs:**

```javascript
// ✅ LOGS ESPERADOS (sucesso):
📁 Frontend Debug: Generated file_path for upload: 
   550e8400-e29b-41d4-a716-446655440001/7c9e6679-7425-40de-944b-e07fc1f90ae7/1729260123-abc.jpg
   - orgId: 550e8400-e29b-41d4-a716-446655440001
   - postId: 7c9e6679-7425-40de-944b-e07fc1f90ae7
   - Padrão esperado: orgId/postId/filename
```

**Se der erro 401:**
- Verifique se o `file_path` está no formato correto
- Verifique se você é OWNER/ADMIN/EDITOR da organização

---

### **Teste 3: Visualização de Anexo (Storage)**

**Passo a Passo:**

1. **Abra um post que tem anexos**

2. **Clique no ícone de anexos**

3. **Observe os logs:**

```javascript
// ✅ LOGS ESPERADOS (sucesso):
🔗 Frontend Debug: Tentando criar signed URL para anexo
   - Asset ID: xyz-123
   - file_path: orgId/postId/filename.jpg
   - Padrão esperado: orgId/postId/filename
   - createSignedUrl result:
     - Success: true
     - signedUrl: https://...supabase.co/storage/v1/object/sign/...

// ❌ LOGS ESPERADOS (erro):
🔗 Frontend Debug: Tentando criar signed URL para anexo
   - file_path: postId/filename.jpg  ← FORMATO ANTIGO INCORRETO
   - Error: { message: "Row level security policy violation" }
```

---

## 🔍 VERIFICAÇÃO DAS POLÍTICAS RLS

Execute no [SQL Editor do Supabase](https://supabase.com/dashboard/project/rlymnpiwizkohghvkuje/sql/new):

```sql
-- 1) Verificar políticas criadas
SELECT 
  policyname,
  cmd,
  'Ativa' as status
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
  AND policyname LIKE '%post_attachment%'
ORDER BY policyname;

-- ✅ RESULTADO ESPERADO:
-- policyname                | cmd    | status
-- --------------------------|--------|--------
-- delete_post_attachments   | DELETE | Ativa
-- insert_post_attachments   | INSERT | Ativa
-- select_post_attachments   | SELECT | Ativa

-- 2) Verificar sua organização e role
SELECT 
  m.user_id,
  m.org_id,
  m.role,
  o.name as org_name
FROM memberships m
JOIN orgs o ON o.id = m.org_id
WHERE m.user_id = auth.uid();

-- ✅ Verifique se você é OWNER, ADMIN ou EDITOR

-- 3) Testar política SELECT manualmente
SELECT 
  name,
  split_part(name, '/', 1) as org_id_extracted,
  split_part(name, '/', 2) as post_id_extracted,
  split_part(name, '/', 3) as filename,
  created_at
FROM storage.objects
WHERE bucket_id = 'post-attachments'
ORDER BY created_at DESC
LIMIT 10;

-- ✅ Se você vir arquivos, as políticas estão funcionando
-- ❌ Se retornar vazio mas você sabe que há arquivos, há problema de RLS
```

---

## 🐛 DIAGNÓSTICO DE PROBLEMAS

### **Problema: Erro 401 na Edge Function**

**Possíveis Causas:**

1. **Token JWT ausente ou inválido**
   - Verifique no console se `Session ativa: true`
   - Verifique se `Access token presente: true`

2. **Token expirado**
   - Faça logout e login novamente
   - Verifique `session.expires_at` no console

3. **verify_jwt incorreto**
   - Confirme que `config.toml` tem `verify_jwt = true`

**Solução Rápida de Depuração:**
```javascript
// Execute no console do navegador:
const { data: { session } } = await supabase.auth.getSession();
console.log("Session válida:", !!session);
console.log("Token:", session?.access_token?.substring(0, 30) + "...");
console.log("Expira em:", new Date(session?.expires_at * 1000));
```

---

### **Problema: Erro 401 no Storage (Anexos)**

**Possíveis Causas:**

1. **file_path no formato antigo**
   - ❌ ERRADO: `postId/filename.jpg`
   - ✅ CORRETO: `orgId/postId/filename.jpg`

2. **Usuário sem permissão (role insuficiente)**
   - SELECT: Precisa ser membro da org
   - INSERT: Precisa ser OWNER/ADMIN/EDITOR
   - DELETE: Precisa ser OWNER/ADMIN

3. **Post não existe ou não pertence à org**
   - Verifique se o `postId` é válido
   - Verifique se o post pertence à `orgId`

**Verificação SQL:**
```sql
-- Verificar se o post existe e pertence à sua org
SELECT 
  p.id,
  p.org_id,
  p.title,
  m.role as sua_role
FROM posts p
JOIN memberships m ON m.org_id = p.org_id
WHERE p.id = 'SEU_POST_ID_AQUI'::uuid
  AND m.user_id = auth.uid();

-- ✅ Se retornar dados, você tem acesso
-- ❌ Se retornar vazio, você NÃO tem acesso
```

---

## 📊 CHECKLIST FINAL

### **Edge Function (bulk-import-posts):**
- [ ] `verify_jwt = true` em `config.toml`
- [ ] Usuário autenticado (session válida)
- [ ] Token JWT sendo enviado no header
- [ ] Logs aparecem no console do navegador
- [ ] Importação funciona sem erro 401

### **Storage (Anexos):**
- [ ] Apenas 3 políticas RLS ativas (select, insert, delete)
- [ ] `file_path` no formato `orgId/postId/filename`
- [ ] Usuário é OWNER/ADMIN/EDITOR da org
- [ ] Upload funciona sem erro 401
- [ ] Visualização funciona sem erro 401

### **Depuração:**
- [ ] Console do navegador mostra logs detalhados
- [ ] SQL Editor do Supabase acessível
- [ ] Edge Function logs disponíveis no dashboard

---

## 🎯 PRÓXIMOS PASSOS SE AINDA HOUVER ERRO

1. **Execute os testes acima** e **copie EXATAMENTE** os logs de erro

2. **Execute as queries SQL de verificação** e copie os resultados

3. **Forneça as seguintes informações:**
   - Log completo do console (erro 401 específico)
   - Resultado da query de verificação de políticas RLS
   - Resultado da query de verificação de memberships
   - Screenshot do erro (se aplicável)

4. **Se o erro persistir**, indique:
   - Qual teste específico está falando (1, 2 ou 3)
   - Mensagem de erro EXATA
   - Logs do console completos

---

## 📞 LINKS ÚTEIS

- [Edge Function Logs - bulk-import-posts](https://supabase.com/dashboard/project/rlymnpiwizkohghvkuje/functions/bulk-import-posts/logs)
- [Storage Bucket - post-attachments](https://supabase.com/dashboard/project/rlymnpiwizkohghvkuje/storage/buckets/post-attachments)
- [SQL Editor](https://supabase.com/dashboard/project/rlymnpiwizkohghvkuje/sql/new)
- [Storage Policies](https://supabase.com/dashboard/project/rlymnpiwizkohghvkuje/storage/policies)

---

**Data da implementação:** 2025-10-18
**Status:** ✅ Implementação completa - aguardando testes do usuário
