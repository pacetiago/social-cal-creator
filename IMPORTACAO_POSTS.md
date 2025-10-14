# Guia de Importação em Massa de Posts

## Formato da Planilha

A planilha para importação de posts deve conter as seguintes colunas (podem estar em português ou inglês):

### Colunas Obrigatórias

| Nome da Coluna (PT) | Nome da Coluna (EN) | Descrição | Exemplo |
|---------------------|---------------------|-----------|---------|
| Cliente | CLIENT | Nome do cliente (deve existir no sistema) | "Empresa ABC" |
| Assunto | SUBJECT | Título do post | "Promoção de Verão" |

### Colunas Opcionais

| Nome da Coluna (PT) | Nome da Coluna (EN) | Descrição | Exemplo | Valores Aceitos |
|---------------------|---------------------|-----------|---------|-----------------|
| Empresa | COMPANY | Nome da empresa do cliente | "Filial SP" | Deve existir no cliente |
| Data | DATE | Data de publicação | "2025-01-15" ou número Excel | Formato: YYYY-MM-DD |
| Canal / Rede Social | CHANNEL | Canal de publicação | "Instagram" | Deve existir no sistema |
| Tipo de Mídia | MEDIA TYPE | Tipo de conteúdo | "Imagem" | imagem, vídeo, carrossel, texto |
| Conteúdo | CONTENT | Texto do post | "Aproveite nossas ofertas..." | Qualquer texto |
| Responsabilidade | - | Quem cria o conteúdo | "Agência" | agência, cliente |
| Linha Editorial | THEME | Tema/linha editorial | "Promocional" | Qualquer texto |
| Insight | INSIGHTS | Insights para o post | "Público jovem 18-25" | Qualquer texto |

## Exemplos de Valores

### Tipo de Mídia (Media Type)
- `Imagem` / `Image`
- `Vídeo` / `Video`
- `Carrossel` / `Carousel`
- `Texto` / `Text`

### Responsabilidade
- `Agência` (padrão)
- `Cliente`

### Data
Aceita dois formatos:
1. **Texto**: `2025-01-15`, `15/01/2025`
2. **Número do Excel**: Números seriais de data do Excel são automaticamente convertidos

## Exemplo de Planilha

| Cliente | Empresa | Data | Canal | Tipo de Mídia | Assunto | Conteúdo | Responsabilidade | Linha Editorial | Insight |
|---------|---------|------|-------|---------------|---------|----------|------------------|-----------------|---------|
| Empresa ABC | Filial SP | 2025-01-15 | Instagram | Imagem | Promoção de Verão | Aproveite 50% OFF em toda loja! | Agência | Promocional | Público jovem |
| Empresa ABC | Filial RJ | 2025-01-16 | Facebook | Vídeo | Lançamento Produto | Conheça nossa nova linha de produtos | Cliente | Institucional | Inovação |

## Notas Importantes

1. **Clientes e Empresas**: Devem existir previamente no sistema
2. **Canais**: Devem estar configurados na organização
3. **Status Inicial**: Todos os posts importados iniciam com status "rascunho" (draft)
4. **Criador**: O usuário que fizer a importação será registrado como criador dos posts
5. **Organização**: Os posts são associados à organização selecionada no momento da importação

## Tratamento de Erros

Se houver erros na importação:
- Posts com sucesso serão importados normalmente
- Posts com erro serão listados com o número da linha e mensagem de erro
- Verifique se:
  - Os nomes de clientes e empresas estão corretos
  - As datas estão em formato válido
  - Os canais existem no sistema

## Como Importar

1. Acesse a página de Administração
2. Vá para a seção "Importação em Massa"
3. Selecione sua planilha (.xlsx, .xls ou .csv)
4. Clique em "Importar Posts"
5. Aguarde o processamento
6. Verifique o resumo da importação

## Suporte

Em caso de dúvidas ou problemas na importação, verifique:
- Os logs do sistema (se você for administrador)
- Se todos os dados obrigatórios estão preenchidos
- Se os nomes correspondem exatamente aos cadastrados no sistema
