import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // This webhook is called by the VPS after video processing is complete
    const vpsApiKey = Deno.env.get('VPS_API_KEY')
    const requestApiKey = req.headers.get('X-API-Key')

    if (!vpsApiKey || requestApiKey !== vpsApiKey) {
      return new Response(
        JSON.stringify({ error: 'Invalid API key' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { 
      lectureId, 
      videoPath, 
      hlsPath,
      durationMinutes,
      status,
      error: processingError 
    } = await req.json()

    if (!lectureId) {
      return new Response(
        JSON.stringify({ error: 'Lecture ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    if (status === 'success') {
      // Update lecture with HLS path and duration
      const { error: updateError } = await supabaseClient
        .from('lectures')
        .update({ 
          video_path: hlsPath || videoPath,
          duration_minutes: durationMinutes || null,
        })
        .eq('id', lectureId)

      if (updateError) {
        console.error('Failed to update lecture:', updateError)
        return new Response(
          JSON.stringify({ error: 'Failed to update lecture' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      return new Response(
        JSON.stringify({ message: 'Lecture updated successfully' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    } else if (status === 'error') {
      console.error('Video processing failed:', processingError)
      
      // Clear the video path on error
      await supabaseClient
        .from('lectures')
        .update({ video_path: null })
        .eq('id', lectureId)

      return new Response(
        JSON.stringify({ message: 'Error recorded', error: processingError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Invalid status' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
