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
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    // Get auth user from request
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check if user is admin
    const { data: roles } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')

    if (!roles || roles.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Admin access required' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { lectureId, filename, fileSize } = await req.json()

    if (!lectureId || !filename) {
      return new Response(
        JSON.stringify({ error: 'Lecture ID and filename are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate file type
    const allowedExtensions = ['.mp4', '.mov', '.webm', '.mkv']
    const fileExt = filename.toLowerCase().substring(filename.lastIndexOf('.'))
    if (!allowedExtensions.includes(fileExt)) {
      return new Response(
        JSON.stringify({ error: 'Invalid file type. Allowed: mp4, mov, webm, mkv' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate file size (max 2GB)
    const maxSize = 2 * 1024 * 1024 * 1024
    if (fileSize && fileSize > maxSize) {
      return new Response(
        JSON.stringify({ error: 'File too large. Maximum size is 2GB' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify lecture exists
    const { data: lecture, error: lectureError } = await supabaseClient
      .from('lectures')
      .select('id, course_id')
      .eq('id', lectureId)
      .single()

    if (lectureError || !lecture) {
      return new Response(
        JSON.stringify({ error: 'Lecture not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Generate unique video path
    const randomId = crypto.randomUUID()
    const videoPath = `${lecture.course_id}/${lectureId}/${randomId}`

    // Request upload URL from VPS
    const vpsApiUrl = Deno.env.get('VPS_API_URL')
    const vpsApiKey = Deno.env.get('VPS_API_KEY')

    if (!vpsApiUrl || !vpsApiKey) {
      return new Response(
        JSON.stringify({ 
          error: 'VPS not configured',
          message: 'Please configure VPS_API_URL and VPS_API_KEY secrets'
        }),
        { status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const uploadResponse = await fetch(`${vpsApiUrl}/api/generate-upload-url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': vpsApiKey,
      },
      body: JSON.stringify({
        videoPath,
        filename,
        fileSize,
        lectureId,
      }),
    })

    if (!uploadResponse.ok) {
      const error = await uploadResponse.text()
      console.error('VPS upload URL generation failed:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to generate upload URL' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { uploadUrl, uploadId } = await uploadResponse.json()

    // Update lecture with pending video path
    await supabaseClient
      .from('lectures')
      .update({ video_path: videoPath })
      .eq('id', lectureId)

    return new Response(
      JSON.stringify({ 
        uploadUrl, 
        uploadId,
        videoPath,
        message: 'Upload URL generated. Upload your video directly to the provided URL.'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
