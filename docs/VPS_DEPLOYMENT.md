# VPS Deployment Guide for StudyMeta Video Server

## Prerequisites

- Ubuntu 22.04 LTS VPS
- Root/sudo access
- Domain: studymeta.in pointed to VPS IP

---

## 1. Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install FFmpeg
sudo apt install -y ffmpeg

# Install PM2 globally
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx

# Install Certbot for SSL
sudo apt install -y certbot python3-certbot-nginx
```

---

## 2. Setup Video Storage Directory

```bash
# Create video storage directory
sudo mkdir -p /srv/course_videos

# Set ownership (replace 'ubuntu' with your user)
sudo chown -R ubuntu:ubuntu /srv/course_videos

# Set permissions
sudo chmod -R 755 /srv/course_videos

# Create temp uploads directory
sudo mkdir -p /tmp/uploads
sudo chown -R ubuntu:ubuntu /tmp/uploads
```

---

## 3. Deploy Server Application

```bash
# Clone/upload your repository
cd /var/www
git clone <your-repo-url> studymeta
cd studymeta/server

# Install dependencies
npm install --production

# Create .env file
cp .env.example .env
nano .env
# Fill in your actual values:
# SUPABASE_URL=https://vzliodyoowytcscysckf.supabase.co
# SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
# PORT=3000
# FRONTEND_ORIGIN=https://studymeta.in
```

---

## 4. PM2 Setup

```bash
# Start the application
cd /var/www/studymeta/server
pm2 start index.js --name "studymeta-api"

# Save PM2 process list
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Run the command it outputs

# Useful PM2 commands:
pm2 logs studymeta-api     # View logs
pm2 restart studymeta-api  # Restart app
pm2 stop studymeta-api     # Stop app
pm2 status                 # Check status
pm2 monit                  # Real-time monitoring
```

---

## 5. Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/studymeta
```

Paste the following configuration:

```nginx
server {
    listen 80;
    server_name studymeta.in www.studymeta.in;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name studymeta.in www.studymeta.in;

    # SSL certificates (will be configured by Certbot)
    ssl_certificate /etc/letsencrypt/live/studymeta.in/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/studymeta.in/privkey.pem;

    # SSL settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers off;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Serve HLS video content
    location /videos/ {
        alias /srv/course_videos/;
        
        # CORS headers for video streaming
        add_header Access-Control-Allow-Origin "https://studymeta.in" always;
        add_header Access-Control-Allow-Methods "GET, OPTIONS" always;
        add_header Access-Control-Allow-Headers "Range, Authorization" always;
        
        # Cache settings for video segments
        location ~ \.ts$ {
            add_header Cache-Control "public, max-age=31536000, immutable";
        }
        
        # Don't cache playlist files
        location ~ \.m3u8$ {
            add_header Cache-Control "no-cache, no-store, must-revalidate";
        }

        # Disable directory listing
        autoindex off;
    }

    # Proxy API requests to Node.js backend
    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Increase timeout for video uploads
        proxy_read_timeout 600s;
        proxy_send_timeout 600s;
        
        # Increase max body size for video uploads (2GB)
        client_max_body_size 2G;
    }

    # Frontend (if hosting on same server)
    location / {
        root /var/www/studymeta/dist;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

Enable the site:

```bash
# Create symlink
sudo ln -s /etc/nginx/sites-available/studymeta /etc/nginx/sites-enabled/

# Remove default site
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Get SSL certificate (run BEFORE enabling site if no cert exists)
sudo certbot --nginx -d studymeta.in -d www.studymeta.in

# Reload Nginx
sudo systemctl reload nginx
```

---

## 6. Firewall Setup

```bash
# Allow SSH, HTTP, HTTPS
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
sudo ufw status
```

---

## 7. Verify Installation

```bash
# Check Node.js
node --version

# Check FFmpeg
ffmpeg -version

# Check PM2 status
pm2 status

# Check Nginx
sudo systemctl status nginx

# Test health endpoint
curl http://localhost:3000/api/health
```

---

## 8. Log Locations

```bash
# PM2 logs
pm2 logs studymeta-api

# Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Nginx error logs
sudo tail -f /var/log/nginx/error.log
```

---

## 9. Maintenance Commands

```bash
# Update application
cd /var/www/studymeta
git pull
cd server
npm install --production
pm2 restart studymeta-api

# Clear video cache (if needed)
# WARNING: This deletes all videos!
# sudo rm -rf /srv/course_videos/*

# Renew SSL certificates (auto-renews, but manual if needed)
sudo certbot renew

# Check disk space
df -h

# Check video folder size
du -sh /srv/course_videos/
```

---

## Troubleshooting

### Video upload fails
- Check disk space: `df -h`
- Check FFmpeg: `ffmpeg -version`
- Check permissions: `ls -la /srv/course_videos/`
- Check PM2 logs: `pm2 logs studymeta-api`

### 502 Bad Gateway
- Check if Node.js is running: `pm2 status`
- Restart app: `pm2 restart studymeta-api`

### CORS errors
- Verify FRONTEND_ORIGIN in .env matches your domain
- Check Nginx CORS headers are applied

### SSL certificate issues
- Renew certificate: `sudo certbot renew`
- Check certificate status: `sudo certbot certificates`
