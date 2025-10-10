# Configuração do Storage para Anexos

Para que os anexos dos posts funcionem corretamente, você precisa configurar as políticas de acesso ao bucket `post-attachments` no Supabase Dashboard.

## Passos para configurar:

1. Acesse o [Supabase Storage Dashboard](https://supabase.com/dashboard/project/rlymnpiwizkohghvkuje/storage/buckets)

2. Localize o bucket `post-attachments`

3. Vá para a aba "Policies" do bucket

4. Adicione as seguintes políticas:

### Política 1: Permitir usuários autenticados fazerem upload
- **Operation**: INSERT
- **Policy name**: `Authenticated users can upload`
- **Target roles**: `authenticated`
- **Policy definition**:
```sql
bucket_id = 'post-attachments'
```

### Política 2: Permitir usuários autenticados visualizarem arquivos
- **Operation**: SELECT
- **Policy name**: `Authenticated users can view`
- **Target roles**: `authenticated`
- **Policy definition**:
```sql
bucket_id = 'post-attachments'
```

### Política 3: Permitir usuários autenticados atualizarem arquivos
- **Operation**: UPDATE
- **Policy name**: `Authenticated users can update`
- **Target roles**: `authenticated`
- **USING expression**:
```sql
bucket_id = 'post-attachments'
```
- **WITH CHECK expression**:
```sql
bucket_id = 'post-attachments'
```

### Política 4: Permitir usuários autenticados deletarem arquivos
- **Operation**: DELETE
- **Policy name**: `Authenticated users can delete`
- **Target roles**: `authenticated`
- **Policy definition**:
```sql
bucket_id = 'post-attachments'
```

## Funcionalidade de Anexos

Após configurar as políticas, os anexos funcionarão da seguinte forma:

1. **Upload**: Ao criar ou editar um post, você pode selecionar arquivos (imagens, vídeos, PDFs, documentos)
2. **Visualização**: Os anexos existentes são exibidos no formulário de edição com miniaturas para imagens
3. **Download**: Cada anexo tem um link "Baixar" para fazer download do arquivo
4. **Limite**: Cada arquivo tem um limite máximo de 5MB

## Importação de Planilha

A funcionalidade de importação em massa já está disponível:

1. Acesse o painel de administração em `/admin`
2. Ou clique em "Dashboard" no menu lateral (quando estiver logado como administrador)
3. No Dashboard, você verá o componente "Importação em Massa de Posts"
4. Faça upload de um arquivo Excel (.xlsx, .xls) ou CSV (.csv)
5. A planilha será processada e os posts serão criados automaticamente

### Formato da Planilha

A planilha deve conter as seguintes colunas (podem estar em português ou inglês):

- **Cliente** (Cliente/CLIENT): Nome do cliente
- **Empresa** (Empresa/COMPANY): Nome da empresa (opcional)
- **Canal** (Canal/Rede Social/CHANNEL): Nome ou chave do canal (instagram, facebook, etc.)
- **Data** (Data/DATE): Data de publicação
- **Assunto** (Assunto/SUBJECT): Título do post
- **Conteúdo** (Conteúdo/CONTENT): Texto do post
- **Tipo de Mídia** (Tipo de Mídia/MEDIA TYPE): imagem, vídeo, carrossel, ou texto
- **Responsabilidade** (Responsabilidade): cliente ou agência
- **Linha Editorial** (Linha Editorial/THEME): Tema do post (opcional)
- **Insight** (Insight): Insights sobre o post (opcional)

Exemplo de link para planilha modelo: [Ver Exemplo](https://docs.google.com/spreadsheets/d/1Wk1u48wo9ltkaqpL9_gVoeh0KdPn10Dx/edit?usp=sharing)
