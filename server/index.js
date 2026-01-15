require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const { promisify } = require('util');
const { v4: uuidv4 } = require('uuid');
const { createClient } = require('@supabase/supabase-js');

const execAsync = promisify(exec);

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || 'https://studymeta.in',
  credentials: true
}));
app.use(express.json());

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: 'Too many requests, please try again later.' }
});

const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 uploads per hour
  message: { error: 'Upload limit exceeded, please try again later.' }
});

app.use('/api/', generalLimiter);

// Configure multer for file uploads
const uploadDir = '/tmp/uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-matroska'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only MP4, MOV, WebM, and MKV are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024 * 1024 // 2GB max
  }
});

// Auth middleware - validates Supabase JWT and checks admin role
async function requireAdmin(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No authorization token provided' });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Verify the JWT and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Check if user has admin role using the user_roles table
    const { data: roles, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin');

    if (roleError || !roles || roles.length === 0) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(500).json({ error: 'Authentication failed' });
  }
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

// Video upload endpoint
app.post('/api/admin/upload', uploadLimiter, requireAdmin, upload.single('video'), async (req, res) => {
  const tempFilePath = req.file?.path;
  
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file provided' });
    }

    const { lectureId } = req.body;
    
    if (!lectureId) {
      // Clean up temp file
      if (tempFilePath) fs.unlinkSync(tempFilePath);
      return res.status(400).json({ error: 'Lecture ID is required' });
    }

    // Verify lecture exists
    const { data: lecture, error: lectureError } = await supabase
      .from('lectures')
      .select('id, course_id')
      .eq('id', lectureId)
      .single();

    if (lectureError || !lecture) {
      if (tempFilePath) fs.unlinkSync(tempFilePath);
      return res.status(404).json({ error: 'Lecture not found' });
    }

    // Generate unique ID for the video
    const videoId = uuidv4();
    const outputDir = `/srv/course_videos/${videoId}`;
    const hlsOutputPath = `${outputDir}/index.m3u8`;

    // Create output directory
    fs.mkdirSync(outputDir, { recursive: true });

    console.log(`Processing video for lecture ${lectureId}...`);
    console.log(`Input: ${tempFilePath}`);
    console.log(`Output: ${outputDir}`);

    // Get video duration
    const durationCmd = `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${tempFilePath}"`;
    const { stdout: durationOutput } = await execAsync(durationCmd);
    const durationSeconds = Math.round(parseFloat(durationOutput.trim()));
    const durationMinutes = Math.round(durationSeconds / 60);

    // Convert to HLS using ffmpeg
    const ffmpegCmd = `ffmpeg -i "${tempFilePath}" \
      -codec: copy \
      -start_number 0 \
      -hls_time 10 \
      -hls_list_size 0 \
      -hls_segment_filename "${outputDir}/segment%03d.ts" \
      -f hls \
      "${hlsOutputPath}"`;

    await execAsync(ffmpegCmd);

    // Clean up temp file
    fs.unlinkSync(tempFilePath);

    // Update lecture with video path and duration
    const { error: updateError } = await supabase
      .from('lectures')
      .update({
        video_path: videoId,
        duration_minutes: durationMinutes,
        updated_at: new Date().toISOString()
      })
      .eq('id', lectureId);

    if (updateError) {
      console.error('Failed to update lecture:', updateError);
      // Don't fail the upload, just log the error
    }

    const streamUrl = `https://studymeta.in/videos/${videoId}/index.m3u8`;

    console.log(`Video processed successfully: ${streamUrl}`);

    res.json({
      success: true,
      videoId,
      streamUrl,
      duration: durationMinutes,
      message: 'Video uploaded and processed successfully'
    });

  } catch (error) {
    console.error('Upload error:', error);
    
    // Clean up temp file if it exists
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }

    res.status(500).json({ 
      error: 'Failed to process video',
      details: error.message 
    });
  }
});

// Get signed stream URL for a lecture
app.post('/api/stream-url', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const { lectureId } = req.body;

    if (!lectureId) {
      return res.status(400).json({ error: 'Lecture ID is required' });
    }

    // Get lecture data
    const { data: lecture, error: lectureError } = await supabase
      .from('lectures')
      .select('id, video_path, is_preview, is_published, course_id')
      .eq('id', lectureId)
      .single();

    if (lectureError || !lecture) {
      return res.status(404).json({ error: 'Lecture not found' });
    }

    // Check if lecture has video
    if (!lecture.video_path) {
      return res.status(404).json({ error: 'No video available for this lecture' });
    }

    // For non-preview lectures, require authentication
    if (!lecture.is_preview) {
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authentication required for this content' });
      }

      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);

      if (authError || !user) {
        return res.status(401).json({ error: 'Invalid or expired token' });
      }
    }

    const streamUrl = `https://studymeta.in/videos/${lecture.video_path}/index.m3u8`;

    res.json({
      streamUrl,
      expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString() // 4 hours
    });

  } catch (error) {
    console.error('Stream URL error:', error);
    res.status(500).json({ error: 'Failed to generate stream URL' });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 2GB.' });
    }
    return res.status(400).json({ error: error.message });
  }
  
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📁 Upload directory: ${uploadDir}`);
  console.log(`🎬 Video output: /srv/course_videos/`);
});
