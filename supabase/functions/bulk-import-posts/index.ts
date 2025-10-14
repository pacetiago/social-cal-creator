import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import * as XLSX from 'https://cdn.sheetjs.com/xlsx-0.20.1/package/xlsx.mjs';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // Verify authentication
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Not authenticated' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const { file, filename, orgId } = body;

    console.log('Request body received:', { hasFile: !!file, filename, orgId });

    if (!file || !orgId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: file and orgId are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Processing file:', filename, 'for org:', orgId);

    // Decode base64 file
    let bytes: Uint8Array;
    try {
      const binaryString = atob(file);
      bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      console.log('File decoded successfully, size:', bytes.length, 'bytes');
    } catch (decodeError) {
      console.error('Error decoding base64:', decodeError);
      return new Response(
        JSON.stringify({ error: 'Invalid file format: could not decode base64' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse spreadsheet
    let data: any[];
    try {
      const workbook = XLSX.read(bytes, { type: 'array' });
      if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
        throw new Error('No sheets found in workbook');
      }
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      data = XLSX.utils.sheet_to_json(firstSheet);
      console.log('Spreadsheet parsed successfully. Found', data.length, 'rows');
      
      if (data.length === 0) {
        return new Response(
          JSON.stringify({ error: 'Planilha vazia ou sem dados válidos' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } catch (parseError: any) {
      console.error('Error parsing spreadsheet:', parseError);
      return new Response(
        JSON.stringify({ error: `Erro ao processar planilha: ${parseError.message}` }),
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
      
      try {
        // Map client name to ID
        const clientName = row['Cliente'] || row['CLIENT'] || row['cliente'];
        const client = clients?.find(c => 
          c.name.toLowerCase() === clientName?.toLowerCase()
        );

        if (!client) {
          throw new Error(`Cliente não encontrado: ${clientName}`);
        }

        // Get companies for this client
        const { data: companies } = await supabaseAdmin
          .from('companies')
          .select('id, name')
          .eq('client_id', client.id);

        // Map company name to ID
        const companyName = row['Empresa'] || row['COMPANY'] || row['empresa'];
        const company = companies?.find(c => 
          c.name.toLowerCase() === companyName?.toLowerCase()
        );

        // Parse date
        const dateStr = row['Data'] || row['DATE'] || row['data'];
        let publishAt = null;
        if (dateStr) {
          // Handle Excel date serial number
          if (typeof dateStr === 'number') {
            const excelEpoch = new Date(1899, 11, 30);
            publishAt = new Date(excelEpoch.getTime() + dateStr * 86400000);
          } else {
            publishAt = new Date(dateStr);
          }
        }

        // Map channel/social network
        const channelName = row['Canal'] || row['Rede Social'] || row['CHANNEL'] || row['canal'];
        const channel = channels?.find(c => 
          c.name.toLowerCase() === channelName?.toLowerCase() ||
          c.key.toLowerCase() === channelName?.toLowerCase()
        );

        // Determine media type
        const mediaTypeMap: Record<string, string> = {
          'imagem': 'image',
          'image': 'image',
          'vídeo': 'video',
          'video': 'video',
          'carrossel': 'carousel',
          'carousel': 'carousel',
          'texto': 'text',
          'text': 'text'
        };
        
        const mediaTypeRaw = row['Tipo de Mídia'] || row['MEDIA TYPE'] || row['tipo_midia'] || '';
        const mediaType = mediaTypeMap[mediaTypeRaw.toLowerCase()] || null;

        // Prepare post data
        const postData = {
          org_id: orgId,
          client_id: client.id,
          company_id: company?.id || null,
          channel_id: channel?.id || null,
          title: row['Assunto'] || row['SUBJECT'] || row['assunto'] || 'Post Importado',
          content: row['Conteúdo'] || row['CONTENT'] || row['conteudo'] || '',
          publish_at: publishAt?.toISOString() || null,
          media_type: mediaType,
          responsibility: (row['Responsabilidade'] || 'agency').toLowerCase() === 'cliente' ? 'client' : 'agency',
          status: 'draft',
          created_by: user.id,
          theme: row['Linha Editorial'] || row['THEME'] || row['linha_editorial'] || '',
          insights: row['Insight'] || row['INSIGHTS'] || row['insight'] || '',
        };

        console.log('Inserting post:', { title: postData.title, client: client.name, company: company?.name });

        // Insert post
        const { error: insertError } = await supabaseAdmin
          .from('posts')
          .insert(postData);

        if (insertError) {
          console.error('Insert error for row', i + 2, ':', insertError);
          throw insertError;
        }

        results.success++;
        console.log('Successfully inserted post for row', i + 2);
      } catch (error: any) {
        console.error('Error processing row', i + 2, ':', error);
        results.failed++;
        results.errors.push({
          row: i + 2,
          message: error.message
        });
      }
    }

    console.log('Import complete:', results);

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