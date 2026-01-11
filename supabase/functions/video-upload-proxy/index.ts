import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const RAILWAY_UPLOAD_URL = 'https://web-production-4bfe8.up.railway.app/upload-video';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    console.log('Video upload proxy: Receiving upload request');

    // Get the form data from the request
    const formData = await req.formData();
    const videoFile = formData.get('video');

    if (!videoFile || !(videoFile instanceof File)) {
      console.error('No video file provided');
      return new Response(
        JSON.stringify({ error: 'No video file provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Video upload proxy: Uploading file ${videoFile.name} (${videoFile.size} bytes)`);

    // Forward the request to Railway
    const railwayFormData = new FormData();
    railwayFormData.append('video', videoFile);

    const response = await fetch(RAILWAY_UPLOAD_URL, {
      method: 'POST',
      body: railwayFormData,
    });

    console.log(`Railway response status: ${response.status}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Railway upload error: ${response.status} - ${errorText}`);
      return new Response(
        JSON.stringify({ error: `Upload failed: ${response.status}` }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Try to parse response as JSON
    let responseData;
    try {
      responseData = await response.json();
    } catch {
      responseData = { success: true };
    }

    console.log('Video upload proxy: Upload successful');

    return new Response(
      JSON.stringify(responseData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in video-upload-proxy function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
