import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const AIRTABLE_API_TOKEN = Deno.env.get('AIRTABLE_API_TOKEN');
    const AIRTABLE_BASE_ID = Deno.env.get('AIRTABLE_BASE_ID');
    const AIRTABLE_TABLE_NAME = Deno.env.get('AIRTABLE_TABLE_NAME') || 'Imported Table';

    if (!AIRTABLE_API_TOKEN || !AIRTABLE_BASE_ID) {
      console.error('Missing Airtable configuration');
      return new Response(
        JSON.stringify({ error: 'Airtable configuration missing' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { action, recordId } = await req.json();
    console.log(`Airtable proxy request: action=${action}, recordId=${recordId}`);

    const baseURL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}`;
    let url = `${baseURL}/${AIRTABLE_TABLE_NAME}`;
    
    if (action === 'getRecord' && recordId) {
      url = `${url}/${recordId}`;
    }

    console.log(`Making request to: ${url}`);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Airtable API error: ${response.status} - ${errorText}`);
      return new Response(
        JSON.stringify({ error: `Airtable API error: ${response.status}` }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log(`Airtable response received successfully`);

    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in airtable-proxy function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
