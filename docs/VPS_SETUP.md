# VPS Video Backend Setup Guide

This guide explains how to set up the VPS backend for video hosting with HLS streaming.

## Prerequisites

- Ubuntu 20.04+ VPS with SSD storage
- Node.js 18+ or Bun
- FFmpeg installed
- Nginx installed
- Domain with SSL certificate (Let's Encrypt recommended)

## 1. Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install FFmpeg
sudo apt install ffmpeg -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install nodejs -y

# Install Nginx
sudo apt install nginx -y

# Install Certbot for SSL
sudo apt install certbot python3-certbot-nginx -y
```

## 2. Create Video Storage Directory

```bash
sudo mkdir -p /srv/course_videos
sudo chown -R www-data:www-data /srv/course_videos
sudo chmod -R 755 /srv/course_videos
```

## 3. VPS Backend API (Node.js)

Create the backend API at `/var/www/video-api`:

```bash
sudo mkdir -p /var/www/video-api
cd /var/www/video-api
npm init -y
npm install express multer crypto uuid
```

Create `index.js`:

```javascript
const express = require('express');
const multer = require('multer');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(express.json());

const API_KEY = process.env.VPS_API_KEY || 'your-secure-api-key-here';
const VIDEO_DIR = '/srv/course_videos';
const WEBHOOK_URL = process.env.WEBHOOK_URL; // Your Supabase function URL

// Middleware to verify API key
const verifyApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== API_KEY) {
    return res.status(401).json({ error: 'Invalid API key' });
  }
  next();
};

// Generate signed streaming URL
app.post('/api/generate-stream-url', verifyApiKey, (req, res) => {
  const { videoPath, userId, expiresIn = 300 } = req.body;
  
  const expires = Math.floor(Date.now() / 1000) + expiresIn;
  const signature = crypto
    .createHmac('sha256', API_KEY)
    .update(`${videoPath}:${expires}:${userId}`)
    .digest('hex');
  
  const signedUrl = `https://your-domain.com/videos/${videoPath}/index.m3u8?expires=${expires}&sig=${signature}`;
  
  res.json({ signedUrl });
});

// Generate upload URL
const pendingUploads = new Map();

app.post('/api/generate-upload-url', verifyApiKey, (req, res) => {
  const { videoPath, filename, lectureId } = req.body;
  
  const uploadId = uuidv4();
  const uploadDir = path.join(VIDEO_DIR, 'uploads', uploadId);
  
  fs.mkdirSync(uploadDir, { recursive: true });
  
  pendingUploads.set(uploadId, {
    videoPath,
    filename,
    lectureId,
    uploadDir,
    createdAt: Date.now(),
  });
  
  // Clean up old pending uploads after 1 hour
  setTimeout(() => pendingUploads.delete(uploadId), 3600000);
  
  res.json({
    uploadUrl: `https://your-domain.com/api/upload/${uploadId}`,
    uploadId,
  });
});

// Handle video upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadInfo = pendingUploads.get(req.params.uploadId);
    if (!uploadInfo) {
      return cb(new Error('Invalid upload ID'));
    }
    cb(null, uploadInfo.uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, 'source' + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 * 1024 }, // 2GB
  fileFilter: (req, file, cb) => {
    const allowed = ['.mp4', '.mov', '.webm', '.mkv'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  },
});

app.post('/api/upload/:uploadId', upload.single('video'), async (req, res) => {
  const uploadInfo = pendingUploads.get(req.params.uploadId);
  if (!uploadInfo) {
    return res.status(404).json({ error: 'Upload not found' });
  }
  
  const sourceFile = path.join(uploadInfo.uploadDir, req.file.filename);
  const outputDir = path.join(VIDEO_DIR, uploadInfo.videoPath);
  
  fs.mkdirSync(outputDir, { recursive: true });
  
  // Convert to HLS
  const ffmpegCmd = `ffmpeg -i "${sourceFile}" \
    -codec:v libx264 -preset fast -crf 22 \
    -codec:a aac -b:a 128k \
    -hls_time 10 \
    -hls_list_size 0 \
    -hls_segment_filename "${outputDir}/segment_%03d.ts" \
    -f hls "${outputDir}/index.m3u8"`;
  
  res.json({ message: 'Upload received, processing started' });
  
  exec(ffmpegCmd, async (error, stdout, stderr) => {
    // Get video duration
    let durationMinutes = null;
    const durationCmd = `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${sourceFile}"`;
    
    exec(durationCmd, async (err, durationOutput) => {
      if (!err && durationOutput) {
        durationMinutes = Math.ceil(parseFloat(durationOutput) / 60);
      }
      
      // Clean up source file
      fs.rmSync(uploadInfo.uploadDir, { recursive: true, force: true });
      pendingUploads.delete(req.params.uploadId);
      
      // Notify webhook
      if (WEBHOOK_URL) {
        try {
          await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-API-Key': API_KEY,
            },
            body: JSON.stringify({
              lectureId: uploadInfo.lectureId,
              videoPath: uploadInfo.videoPath,
              hlsPath: `${uploadInfo.videoPath}/index.m3u8`,
              durationMinutes,
              status: error ? 'error' : 'success',
              error: error ? error.message : null,
            }),
          });
        } catch (webhookError) {
          console.error('Webhook notification failed:', webhookError);
        }
      }
    });
  });
});

// Verify signed URL (called by Nginx)
app.get('/api/verify-signature', (req, res) => {
  const { path: videoPath, expires, sig, userId } = req.query;
  
  const now = Math.floor(Date.now() / 1000);
  if (now > parseInt(expires)) {
    return res.status(403).send('URL expired');
  }
  
  const expectedSig = crypto
    .createHmac('sha256', API_KEY)
    .update(`${videoPath}:${expires}:${userId || ''}`)
    .digest('hex');
  
  if (sig !== expectedSig) {
    return res.status(403).send('Invalid signature');
  }
  
  res.status(200).send('OK');
});

app.listen(3001, () => {
  console.log('Video API running on port 3001');
});
```

## 4. Nginx Configuration

Create `/etc/nginx/sites-available/video-server`:

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Disable directory listing
    autoindex off;

    # Video streaming location with signature verification
    location /videos/ {
        # Verify signature via internal API
        auth_request /auth;
        
        alias /srv/course_videos/;
        
        # CORS headers
        add_header 'Access-Control-Allow-Origin' '*';
        add_header 'Access-Control-Allow-Methods' 'GET, OPTIONS';
        
        # Cache HLS segments
        location ~* \.ts$ {
            expires 1h;
            add_header Cache-Control "public, immutable";
        }
        
        # Don't cache playlist (for live updates)
        location ~* \.m3u8$ {
            expires -1;
            add_header Cache-Control "no-cache";
        }
    }

    # Internal auth endpoint
    location = /auth {
        internal;
        proxy_pass http://127.0.0.1:3001/api/verify-signature;
        proxy_pass_request_body off;
        proxy_set_header Content-Length "";
        proxy_set_header X-Original-URI $request_uri;
    }

    # API proxy
    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        
        # Upload limits
        client_max_body_size 2G;
        proxy_read_timeout 3600;
        proxy_send_timeout 3600;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/video-server /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 5. SSL Certificate

```bash
sudo certbot --nginx -d your-domain.com
```

## 6. Systemd Service

Create `/etc/systemd/system/video-api.service`:

```ini
[Unit]
Description=Video API Server
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/video-api
Environment=NODE_ENV=production
Environment=VPS_API_KEY=your-secure-api-key-here
Environment=WEBHOOK_URL=https://vzliodyoowytcscysckf.supabase.co/functions/v1/video-webhook
ExecStart=/usr/bin/node index.js
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Start the service:

```bash
sudo systemctl daemon-reload
sudo systemctl enable video-api
sudo systemctl start video-api
```

## 7. Configure Secrets in Lovable

Add these secrets in your Lovable project:

1. **VPS_API_URL**: `https://your-domain.com`
2. **VPS_API_KEY**: The same API key you set in the VPS backend

## 8. Security Checklist

- [ ] Change default API key to a strong random value
- [ ] Enable firewall (ufw) - only allow ports 22, 80, 443
- [ ] Set up fail2ban for SSH protection
- [ ] Regular security updates
- [ ] Monitor disk space usage
- [ ] Set up log rotation
- [ ] Consider rate limiting on upload endpoints

## 9. Monitoring

Monitor disk usage:

```bash
df -h /srv/course_videos
```

Check API logs:

```bash
sudo journalctl -u video-api -f
```

## 10. Backup Strategy

Set up regular backups of `/srv/course_videos` to cloud storage (S3, GCS, etc.)
