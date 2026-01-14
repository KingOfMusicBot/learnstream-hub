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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the authenticated user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { lectureId } = await req.json()

    if (!lectureId) {
      return new Response(
        JSON.stringify({ error: 'Lecture ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Fetch the lecture
    const { data: lecture, error: lectureError } = await supabaseClient
      .from('lectures')
      .select('id, video_path, video_url, is_preview, course_id, courses!inner(is_published)')
      .eq('id', lectureId)
      .single()

    if (lectureError || !lecture) {
      return new Response(
        JSON.stringify({ error: 'Lecture not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if lecture is accessible
    if (!lecture.is_preview && !user) {
      return new Response(
        JSON.stringify({ error: 'Login required to access this lecture' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // If video_url is already set (external URL or direct), return it
    if (lecture.video_url) {
      return new Response(
        JSON.stringify({ streamUrl: lecture.video_url }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // If video_path is set (VPS storage), generate signed URL
    if (lecture.video_path) {
      const vpsApiUrl = Deno.env.get('VPS_API_URL')
      const vpsApiKey = Deno.env.get('VPS_API_KEY')

      if (!vpsApiUrl || !vpsApiKey) {
        // Fallback: return the path directly (for development)
        return new Response(
          JSON.stringify({ streamUrl: lecture.video_path }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Generate signed URL from VPS
      const signedUrlResponse = await fetch(`${vpsApiUrl}/api/generate-stream-url`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': vpsApiKey,
        },
        body: JSON.stringify({
          videoPath: lecture.video_path,
          userId: user.id,
          expiresIn: 300, // 5 minutes
        }),
      })

      if (!signedUrlResponse.ok) {
        return new Response(
          JSON.stringify({ error: 'Failed to generate stream URL' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const { signedUrl } = await signedUrlResponse.json()

      return new Response(
        JSON.stringify({ streamUrl: signedUrl }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'No video available for this lecture' }),
      { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
