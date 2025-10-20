import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import * as XLSX from 'https://cdn.sheetjs.com/xlsx-0.20.1/package/xlsx.mjs';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

// Função para normalizar cabeçalhos de colunas
const normalizeHeader = (header: string): string => {
  return header
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9]/g, ''); // Remove caracteres especiais
};

// Função para buscar valor de célula com mapeamento flexível
const getCellValue = (row: any, possibleHeaders: string[]): any => {
  for (const header of possibleHeaders) {
    const normalizedTarget = normalizeHeader(header);
    for (const key in row) {
      if (normalizeHeader(key) === normalizedTarget) {
        return row[key];
      }
    }
  }
  return undefined;
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Extract token from Authorization header
    const authHeader = req.headers.get('Authorization');
    console.log("Edge Function: Authorization header received:", authHeader?.substring(0, 20) + "...");
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error("Edge Function: Missing or invalid Authorization header");
      return new Response(
        JSON.stringify({ error: 'Missing authorization token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    console.log("Edge Function: Extracted token:", token.substring(0, 20) + "...");

    // Create admin client for token validation
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Validate token using admin client
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    console.log("Edge Function: Token validation result:", { 
      userId: user?.id, 
      email: user?.email,
      hasError: !!userError 
    });
    
    if (userError || !user) {
      console.error("Edge Function: Token validation failed:", userError);
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Define and validate input schema
    const BulkImportSchema = z.object({
      file: z.string().min(1, "File content is required"),
      filename: z.string().min(1).max(255, "Filename must be between 1 and 255 characters"),
      orgId: z.string().uuid("Invalid organization ID format")
    });

    // Parse and validate request body
    const body = await req.json();
    let validatedData;
    try {
      validatedData = BulkImportSchema.parse(body);
    } catch (validationError: any) {
      console.error('Validation error:', validationError);
      return new Response(
        JSON.stringify({ error: 'Invalid input', details: validationError.errors }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const { file, filename, orgId } = validatedData;
    console.log('Request body validated:', { hasFile: !!file, filename, orgId });

    console.log('Processing file:', filename, 'for org:', orgId);

    // Decode base64 file
    let bytes: Uint8Array;
    try {
      const binaryString = atob(file);
      bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      console.log('✅ Arquivo decodificado com sucesso. Tamanho:', bytes.length, 'bytes');
    } catch (decodeError: any) {
      console.error('❌ Erro ao decodificar base64:', decodeError);
      return new Response(
        JSON.stringify({ 
          error: 'Formato de arquivo inválido',
          details: 'Não foi possível decodificar o arquivo. Certifique-se de enviar um arquivo Excel (.xlsx, .xls) válido.'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse spreadsheet
    let data: any[];
    try {
      console.log('📊 Iniciando parse da planilha...');
      const workbook = XLSX.read(bytes, { type: 'array' });
      
      if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
        throw new Error('Planilha não contém nenhuma aba/sheet');
      }
      
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      data = XLSX.utils.sheet_to_json(firstSheet);
      
      console.log(`✅ Planilha processada com sucesso. ${data.length} linhas encontradas`);
      console.log('📋 Colunas detectadas:', data.length > 0 ? Object.keys(data[0]).join(', ') : 'Nenhuma');
      
      if (data.length === 0) {
        return new Response(
          JSON.stringify({ 
            error: 'Planilha vazia',
            details: 'A planilha não contém dados válidos. Certifique-se de que há pelo menos uma linha de dados além do cabeçalho.'
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } catch (parseError: any) {
      console.error('❌ Erro ao processar planilha:', parseError);
      return new Response(
        JSON.stringify({ 
          error: 'Erro ao processar planilha', 
          details: parseError.message || 'Formato de planilha inválido. Use Excel (.xlsx, .xls).'
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results = {
      success: 0,
      failed: 0,
      warnings: 0,
      errors: [] as any[]
    };

    // Get clients and companies for mapping
    const { data: clients, error: clientsError } = await supabaseAdmin
      .from('clients')
      .select('id, name')
      .eq('org_id', orgId);

    if (clientsError) {
      console.error('Error fetching clients:', clientsError);
      return new Response(
        JSON.stringify({ error: 'Erro ao buscar clientes da organização' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: channels, error: channelsError } = await supabaseAdmin
      .from('channels')
      .select('id, name, key')
      .eq('org_id', orgId);

    if (channelsError) {
      console.error('Error fetching channels:', channelsError);
      return new Response(
        JSON.stringify({ error: 'Erro ao buscar canais da organização' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Found', clients?.length || 0, 'clients and', channels?.length || 0, 'channels for org');

    // Process each row
    for (let i = 0; i < data.length; i++) {
      const row: any = data[i];
      const rowNumber = i + 2; // +2 porque linha 1 é cabeçalho e array é 0-indexed
      
      try {
        console.log(`\n🔄 Processando linha ${rowNumber}...`);
        
        // Map client name to ID com busca flexível
        const clientName = getCellValue(row, ['Cliente', 'Client', 'cliente', 'Nome do Cliente', 'CLIENTE']);
        
        if (!clientName) {
          throw new Error(`Coluna "Cliente" não encontrada ou vazia`);
        }
        
        const client = clients?.find(c => 
          c.name.toLowerCase().trim() === clientName.toString().toLowerCase().trim()
        );

        if (!client) {
          throw new Error(`Cliente '${clientName}' não encontrado ou não pertence à organização. Clientes disponíveis: ${clients?.map(c => c.name).join(', ') || 'nenhum'}`);
        }
        
        console.log(`   ✓ Cliente encontrado: ${client.name}`);

        // Get companies for this client
        const { data: companies, error: companiesError } = await supabaseAdmin
          .from('companies')
          .select('id, name')
          .eq('client_id', client.id);

        if (companiesError) {
          console.warn(`   ⚠️  Erro ao buscar empresas do cliente ${client.name}:`, companiesError);
        }

        // Map company name to ID com busca flexível
        const companyName = getCellValue(row, ['Empresa', 'Company', 'empresa', 'Nome da Empresa', 'EMPRESA']);
        const company = companies?.find(c => 
          c.name.toLowerCase().trim() === companyName?.toString().toLowerCase().trim()
        );
        
        if (companyName && !company) {
          console.warn(`   ⚠️  Empresa "${companyName}" não encontrada para o cliente ${client.name}`);
        } else if (company) {
          console.log(`   ✓ Empresa encontrada: ${company.name}`);
        }

        // Parse date com validação aprimorada
        const dateStr = getCellValue(row, ['Data', 'Date', 'data', 'DATA', 'Data de Publicação']);
        let publishAt = null;
        if (dateStr) {
          try {
            // Handle Excel date serial number
            if (typeof dateStr === 'number') {
              const excelEpoch = new Date(1899, 11, 30);
              publishAt = new Date(excelEpoch.getTime() + dateStr * 86400000);
            } else {
              publishAt = new Date(dateStr);
            }
            
            // Validar se a data é válida
            if (isNaN(publishAt.getTime())) {
              throw new Error(`Formato de data inválido: "${dateStr}"`);
            }
            console.log(`   ✓ Data: ${publishAt.toISOString().split('T')[0]}`);
          } catch (dateParseError: any) {
            console.warn(`   ⚠️  Data inválida na linha ${rowNumber}: ${dateStr}. Erro: ${dateParseError.message}`);
            publishAt = null;
          }
        }

        // Map channel/social network com busca flexível
        const channelName = getCellValue(row, ['Canal', 'Rede Social', 'Channel', 'canal', 'CANAL', 'Social Network']);
        const channel = channels?.find(c => 
          c.name.toLowerCase().trim() === channelName?.toString().toLowerCase().trim() ||
          c.key.toLowerCase().trim() === channelName?.toString().toLowerCase().trim()
        );
        
        if (channelName && !channel) {
          console.warn(`   ⚠️  Canal "${channelName}" não encontrado na organização`);
        } else if (channel) {
          console.log(`   ✓ Canal: ${channel.name}`);
        }

        // Determine media type com mapeamento expandido
        const mediaTypeMap: Record<string, string> = {
          'imagem': 'image',
          'image': 'image',
          'img': 'image',
          'foto': 'image',
          'vídeo': 'video',
          'video': 'video',
          'vid': 'video',
          'carrossel': 'carousel',
          'carousel': 'carousel',
          'album': 'carousel',
          'texto': 'text',
          'text': 'text',
          'txt': 'text',
          'artigo': 'text'
        };
        
        const mediaTypeRaw = getCellValue(row, ['Tipo de Mídia', 'Media Type', 'tipo_midia', 'TIPO DE MIDIA', 'Tipo']) || '';
        const mediaTypeNormalized = normalizeHeader(mediaTypeRaw.toString());
        const mediaType = mediaTypeMap[mediaTypeNormalized] || null;
        
        if (mediaTypeRaw && !mediaType) {
          console.warn(`   ⚠️  Tipo de mídia "${mediaTypeRaw}" não reconhecido. Usando null.`);
        } else if (mediaType) {
          console.log(`   ✓ Tipo de mídia: ${mediaType}`);
        }

        // Prepare post data com validação
        const title = getCellValue(row, ['Assunto', 'Subject', 'assunto', 'ASSUNTO', 'Título', 'Title']) || 'Post Importado';
        const content = getCellValue(row, ['Conteúdo', 'Content', 'conteudo', 'CONTEUDO', 'Texto']) || '';
        const responsibility = getCellValue(row, ['Responsabilidade', 'Responsibility', 'responsabilidade', 'RESPONSABILIDADE']) || 'agency';
        const theme = getCellValue(row, ['Linha Editorial', 'Theme', 'linha_editorial', 'LINHA EDITORIAL', 'Tema']) || '';
        const insights = getCellValue(row, ['Insight', 'Insights', 'insight', 'INSIGHTS']) || '';
        
        const postData = {
          org_id: orgId,
          client_id: client.id,
          company_id: company?.id || null,
          channel_id: channel?.id || null,
          title: title,
          content: content,
          publish_at: publishAt?.toISOString() || null,
          media_type: mediaType,
          responsibility: responsibility.toString().toLowerCase().includes('cliente') ? 'client' : 'agency',
          status: 'idea',
          created_by: user.id,
          theme: theme,
          insights: insights,
        };

        console.log(`   📝 Dados do post:`, {
          title: postData.title,
          client: client.name,
          company: company?.name || 'N/A',
          channel: channel?.name || 'N/A',
          status: postData.status
        });

        // Insert post
        const { error: insertError } = await supabaseAdmin
          .from('posts')
          .insert(postData);

        if (insertError) {
          console.error(`   ❌ Erro ao inserir post na linha ${rowNumber}:`, insertError);
          throw new Error(`Erro de banco de dados: ${insertError.message || 'Falha ao inserir post'}`);
        }

        results.success++;
        console.log(`   ✅ Post inserido com sucesso! (Linha ${rowNumber})`);
      } catch (error: any) {
        console.error(`   ❌ Erro ao processar linha ${rowNumber}:`, error.message);
        results.failed++;
        results.errors.push({
          row: rowNumber,
          message: error.message || 'Erro desconhecido ao processar linha'
        });
      }
    }

    console.log('\n📊 Importação concluída:', {
      total: data.length,
      sucesso: results.success,
      falhas: results.failed,
      taxa_sucesso: `${((results.success / data.length) * 100).toFixed(1)}%`
    });

    return new Response(
      JSON.stringify(results),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});