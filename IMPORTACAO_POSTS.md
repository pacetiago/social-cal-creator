# Guia de Importação em Massa de Posts

Este documento descreve o formato da planilha para importação em massa de posts no sistema social-cal-creator.

## 📋 Formato do Arquivo

- **Tipos aceitos**: Excel (.xlsx, .xls) ou CSV (.csv)
- A primeira linha deve conter os cabeçalhos das colunas
- O sistema aceita variações de maiúsculas/minúsculas e acentos nos nomes das colunas
- **Mapeamento inteligente**: O sistema normaliza nomes de colunas removendo acentos e caracteres especiais

## 📊 Colunas da Planilha

### 1. Cliente (Obrigatório)

**Variações aceitas**: `Cliente`, `Client`, `cliente`, `Nome do Cliente`, `CLIENTE`

Nome do cliente conforme cadastrado no sistema. O sistema realiza busca case-insensitive e remove espaços extras automaticamente.

**Exemplo**: `Empresa ABC`, `Acme Corp`

---

### 2. Empresa (Opcional)

**Variações aceitas**: `Empresa`, `Company`, `empresa`, `Nome da Empresa`, `EMPRESA`

Nome da empresa/marca dentro do cliente. Busca normalizada e case-insensitive. Se fornecida mas não encontrada, um aviso será gerado mas a importação continua.

**Exemplo**: `Filial SP`, `Marca Premium`

---

### 3. Data (Opcional)

**Variações aceitas**: `Data`, `Date`, `data`, `DATA`, `Data de Publicação`

Data de publicação do post. Formatos aceitos:
- Data do Excel (número serial) - convertido automaticamente
- String de data (ex: `2024-03-15`, `15/03/2024`)
- **Validação**: Datas inválidas serão convertidas para `null` com aviso no log

**Exemplo**: `2025-01-15`, `15/01/2025`

---

### 4. Canal / Rede Social (Opcional)

**Variações aceitas**: `Canal`, `Rede Social`, `Channel`, `canal`, `CANAL`, `Social Network`

Nome ou chave do canal de publicação (ex: Instagram, Facebook, LinkedIn). A busca compara tanto o nome quanto a chave (key) do canal de forma case-insensitive. Se não encontrado, um aviso é gerado.

**Exemplo**: `Instagram`, `Facebook`, `LinkedIn`

---

### 5. Tipo de Mídia (Opcional)

**Variações aceitas**: `Tipo de Mídia`, `Media Type`, `tipo_midia`, `TIPO DE MIDIA`, `Tipo`

Tipo de conteúdo do post. Valores aceitos (case-insensitive, sem acentos):
- `imagem`, `image`, `img`, `foto` → **image**
- `vídeo`, `video`, `vid` → **video**
- `carrossel`, `carousel`, `album` → **carousel**
- `texto`, `text`, `txt`, `artigo` → **text**

**Mapeamento inteligente**: Remove acentos e normaliza automaticamente.

**Exemplo**: `Imagem`, `Vídeo`, `Carrossel`

---

### 6. Assunto / Título (Obrigatório)

**Variações aceitas**: `Assunto`, `Subject`, `assunto`, `ASSUNTO`, `Título`, `Title`

Título do post. Campo obrigatório - se vazio, será usado "Post Importado" como padrão.

**Exemplo**: `Promoção de Verão 2025`, `Lançamento Produto X`

---

### 7. Conteúdo (Opcional)

**Variações aceitas**: `Conteúdo`, `Content`, `conteudo`, `CONTEUDO`, `Texto`

Texto principal do post. Suporta múltiplas linhas.

**Exemplo**: `Aproveite 50% de desconto em toda a loja! Válido até 31/01.`

---

### 8. Responsabilidade (Opcional)

**Variações aceitas**: `Responsabilidade`, `Responsibility`, `responsabilidade`, `RESPONSABILIDADE`

Define quem é responsável pelo conteúdo:
- `cliente`, `client` → **Responsabilidade do cliente**
- Qualquer outro valor → **Responsabilidade da agência** (padrão)

**Exemplo**: `Agência`, `Cliente`

---

### 9. Linha Editorial / Tema (Opcional)

**Variações aceitas**: `Linha Editorial`, `Theme`, `linha_editorial`, `LINHA EDITORIAL`, `Tema`

Tema ou linha editorial do post. Útil para categorização.

**Exemplo**: `Promocional`, `Institucional`, `Educativo`

---

### 10. Insight / Insights (Opcional)

**Variações aceitas**: `Insight`, `Insights`, `insight`, `INSIGHTS`

Observações, insights ou notas sobre o post. Campo de texto livre.

**Exemplo**: `Público-alvo: jovens 18-25 anos`, `Melhor horário: 19h-21h`

---

## 📝 Exemplo de Planilha

| Cliente | Empresa | Data | Canal | Tipo de Mídia | Assunto | Conteúdo | Responsabilidade | Linha Editorial | Insight |
|---------|---------|------|-------|---------------|---------|----------|------------------|-----------------|---------|
| Empresa ABC | Filial SP | 2025-01-15 | Instagram | Imagem | Promoção de Verão | Aproveite 50% OFF! | Agência | Promocional | Público jovem |
| Empresa ABC | Filial RJ | 2025-01-16 | Facebook | Vídeo | Lançamento | Nova linha de produtos | Cliente | Institucional | Inovação |
| Acme Corp | | 2025-01-17 | LinkedIn | Texto | Artigo | Tendências 2025 | Agência | Educativo | Profissionais |

## ⚠️ Notas Importantes

1. **Normalização Automática**: 
   - O sistema remove acentos e caracteres especiais dos cabeçalhos
   - Maiúsculas/minúsculas são ignoradas
   - Espaços extras são removidos automaticamente

2. **Dados Obrigatórios**: 
   - ✅ `Cliente` - **obrigatório** (deve existir na organização)
   - ✅ `Assunto/Título` - **obrigatório** (mínimo 1 caractere)

3. **Validação e Avisos**: 
   - ✅ Clientes não encontrados → **erro, linha rejeitada**
   - ⚠️ Empresas não encontradas → **aviso, continua importação com empresa null**
   - ⚠️ Canais não encontrados → **aviso, continua com canal null**
   - ⚠️ Datas inválidas → **aviso, usa null**
   - ⚠️ Tipos de mídia não reconhecidos → **aviso, usa null**

4. **Logs Detalhados**: 
   - Cada linha processada gera logs no console
   - Erros específicos são reportados com número da linha
   - Sucessos mostram dados importados

5. **Status e Atribuição**: 
   - Status padrão: **draft** (rascunho)
   - Criador: usuário que fez a importação
   - Organização: a selecionada no momento da importação

## 🚀 Como Importar

1. Acesse a página de **Administração**
2. Vá para a seção **"Importação em Massa de Posts"**
3. Clique em **"Selecionar Arquivo"** e escolha sua planilha (.xlsx, .xls ou .csv)
4. Clique em **"Importar Posts"**
5. Aguarde o processamento (progresso será exibido)
6. Verifique o **resumo da importação**:
   - Quantidade de sucessos
   - Quantidade de falhas
   - Detalhes de erros por linha

## 🔧 Solução de Problemas

### Erro: "Cliente não encontrado"
- **Causa**: Nome do cliente na planilha não corresponde exatamente ao cadastrado
- **Solução**: Verifique o nome exato do cliente no sistema (espaços, acentos)

### Erro: "Edge Function returned a non-2xx status code"
- **Causa**: Problema no processamento da planilha ou configuração do sistema
- **Solução**: 
  1. Verifique se o arquivo está no formato correto (.xlsx, .xls, .csv)
  2. Certifique-se de que há pelo menos uma linha de dados além do cabeçalho
  3. Consulte os logs da Edge Function para detalhes (administradores)

### Avisos sobre empresas/canais não encontrados
- **Causa**: Dados opcionais não encontrados no sistema
- **Ação**: A importação continua, mas esses campos ficarão vazios
- **Solução**: Se necessário, cadastre empresas/canais antes da importação

## 📊 Visualizando Logs (Administradores)

Para visualizar logs detalhados da importação:

1. Acesse o painel do Supabase
2. Navegue até **Edge Functions** → **bulk-import-posts** → **Logs**
3. Logs incluem:
   - ✅ `✓` Sucessos (cliente, empresa, canal encontrados)
   - ⚠️ `⚠️` Avisos (dados opcionais não encontrados)
   - ❌ `❌` Erros (falhas na inserção)
   - 📊 Resumo final com taxa de sucesso

## 📞 Suporte

Em caso de dúvidas:
- Verifique se todos os **dados obrigatórios** estão corretos
- Certifique-se de que **clientes, empresas e canais** existem no sistema
- Consulte este guia para formatos aceitos
- Entre em contato com o suporte técnico se o problema persistir