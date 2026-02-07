import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
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
    const CLOUD_NAME = Deno.env.get('CLOUDINARY_CLOUD_NAME');
    const API_KEY = Deno.env.get('CLOUDINARY_API_KEY');
    const API_SECRET = Deno.env.get('CLOUDINARY_API_SECRET');

    if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
      console.error('Missing Cloudinary credentials');
      return new Response(
        JSON.stringify({ error: 'Server configuration error: missing Cloudinary credentials' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const formData = await req.formData();
    const videoFile = formData.get('file');

    if (!videoFile || !(videoFile instanceof File)) {
      return new Response(
        JSON.stringify({ error: 'No video file provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Cloudinary upload: Processing file ${videoFile.name} (${videoFile.size} bytes)`);

    // Generate signature for signed upload
    const timestamp = Math.round(new Date().getTime() / 1000).toString();
    const folder = 'pipeline/uploads';

    // Build the string to sign (parameters in alphabetical order)
    const signString = `folder=${folder}&timestamp=${timestamp}${API_SECRET}`;
    
    // Create SHA-1 signature
    const encoder = new TextEncoder();
    const data = encoder.encode(signString);
    const hashBuffer = await crypto.subtle.digest('SHA-1', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const signature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Build Cloudinary upload form data
    const cloudinaryFormData = new FormData();
    cloudinaryFormData.append('file', videoFile);
    cloudinaryFormData.append('api_key', API_KEY);
    cloudinaryFormData.append('timestamp', timestamp);
    cloudinaryFormData.append('signature', signature);
    cloudinaryFormData.append('folder', folder);

    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/upload`;
    
    console.log('Uploading to Cloudinary...');
    const response = await fetch(cloudinaryUrl, {
      method: 'POST',
      body: cloudinaryFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Cloudinary error: ${response.status} - ${errorText}`);
      return new Response(
        JSON.stringify({ error: `Cloudinary upload failed: ${response.status}`, details: errorText }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const result = await response.json();
    console.log('Cloudinary upload successful:', result.public_id);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in cloudinary-upload function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
