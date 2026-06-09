# Coolify Deployment Guide

## 🔒 Security Configuration for Coolify with Nixpacks

### Nixpacks + HTTP-Server (Recommended)

Using Nixpacks with http-server for simple and secure deployment.

## 🚀 Deployment Steps

1. **Upload files to your repository:**

   - `package.json` (updated with security flags)
   - `nixpacks.toml` (Nixpacks configuration)
   - `schizodio/index.html` (prevents directory listing)
   - `.htaccess` (additional security)
   - `robots.txt` (search engine protection)

2. **In Coolify Dashboard:**

   - Create new application
   - Select "Source" (Git repository)
   - Choose your repository
   - Set domain: `techshaman.42024769.xyz`
   - Enable HTTPS (Coolify handles SSL automatically)
   - Nixpacks will automatically detect and build

3. **Environment Variables (optional):**
   ```
   PORT=3000
   NODE_ENV=production
   ```

## 🔧 Security Features

### Directory Listing Prevention

- ✅ `schizodio/index.html` - Prevents directory listing
- ✅ `--no-dotfiles --no-cors --no-cache --no-logs --no-robots` - http-server security flags
- ✅ `.htaccess` - Additional Apache security (if applicable)

### Access Control

- ✅ `/schizodio/` - Shows "Access Restricted" page
- ✅ `/metadata/` - Blocked by robots.txt
- ✅ `/.git/` - Blocked by robots.txt
- ✅ Hidden files - Blocked by http-server flags

### Security Headers

- ✅ Coolify/Traefik handles SSL automatically
- ✅ HTTPS redirect handled by Coolify
- ✅ Domain routing managed by Traefik

## 🌐 Nixpacks Integration

Coolify automatically:

- ✅ Detects Node.js application
- ✅ Installs dependencies via npm
- ✅ Runs `npm run start` command
- ✅ Handles SSL certificates via Let's Encrypt
- ✅ Routes traffic through Traefik
- ✅ Provides HTTPS redirect

## 📝 Notes

- Nixpacks automatically detects your Node.js app
- The `$PORT` environment variable is set by Coolify
- Directory listing is disabled via http-server flags
- Your server IP is better protected from directory browsing
- No Docker configuration needed - Nixpacks handles everything

## 🔍 Testing

After deployment, test:

1. `https://techshaman.42024769.xyz/` - Should show your main site
2. `https://techshaman.42024769.xyz/schizodio/` - Should show "Access Restricted"
3. `https://techshaman.42024769.xyz/metadata/` - Should be blocked

## 🛠️ Troubleshooting

If you see directory listing:

1. Ensure `schizodio/index.html` exists
2. Check that http-server is running with security flags
3. Verify Coolify deployment logs for any errors
