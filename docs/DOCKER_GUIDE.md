# 🐳 Docker Deployment Guide

## Overview

Your AMB Tracker is now fully containerized with Docker! This makes deployment on Render (and anywhere else) super reliable.

> **⚠️ Important:** This project uses **pdf-parse v1.1.1** for Docker compatibility. Newer versions (2.4.5+) have issues with `process.getBuiltinModule()` in containerized Node.js environments and will fail to start.

## 📦 What's Included

- **Dockerfile** - Builds your app as a Docker image (Node.js 18 Debian base)
- **docker-compose.yml** - For local testing with Docker
- **.dockerignore** - Keeps the image lean
- **Updated render.yaml** - Configured for Docker deployment

## 🚀 Quick Start - Local Docker Testing

### 1. Build the Docker Image
```bash
docker build -t amb-tracker .
```

### 2. Run the Container
```bash
docker run -p 3000:3000 --name amb-tracker amb-tracker
```

### 3. Test the App
- Open browser: http://localhost:3000
- Upload your HDFC PDF statement
- Check health: http://localhost:3000/health

### 4. Stop the Container
```bash
docker stop amb-tracker
docker rm amb-tracker
```

## 🐳 Using Docker Compose (Easier)

### Start the app
```bash
docker-compose up -d
```

### View logs
```bash
docker-compose logs -f
```

### Stop the app
```bash
docker-compose down
```

### Rebuild after changes
```bash
docker-compose up -d --build
```

## 🎯 Deploy to Render with Docker

### Step 1: Commit Docker Files
```bash
git add .
git commit -m "Add Docker support for reliable deployment"
git push
```

### Step 2: Update Render Service

**Option A: Update Existing Service**
1. Go to https://dashboard.render.com
2. Click your `amb-tracker` service
3. Go to **Settings**
4. Change **Environment** from "Node" to "Docker"
5. **Remove** the "Start Command" field (Docker uses CMD from Dockerfile)
6. Click **Save Changes**

**Option B: Create New Service (Recommended)**
1. Delete old service (Settings → Delete Web Service)
2. Click **New +** → **Web Service**
3. Connect to `manovignesh46/amb-tracker`
4. Configure:
   - **Name:** amb-tracker
   - **Environment:** Docker ✅
   - **Plan:** Free
   - **Health Check Path:** /health
5. Click **Create Web Service**

### Step 3: Verify Deployment

Watch the logs for:
```
✅ Building Docker image...
✅ Successfully built image
✅ Starting container...
✅ 🚀 AMB Tracker Server is running!
✅ Health check passed
```

## 🔍 Docker Image Details

**Base Image:** `node:18-alpine`
- Lightweight (only ~170MB)
- Production-ready
- Official Node.js image

**What's Inside:**
- Node.js 18 LTS
- Your application code
- Production dependencies only
- Health check built-in

**Ports:**
- Container listens on PORT env variable (default 3000)
- Render sets PORT automatically (usually 10000)

## ✅ Benefits of Docker

1. **Consistent Environment**
   - Same image runs everywhere (dev, staging, production)
   - No more "works on my machine" issues

2. **Reliable Deployment**
   - Render can't run wrong command
   - All dependencies bundled
   - Predictable behavior

3. **Easy Testing**
   - Test exact production environment locally
   - Quick iterations with docker-compose

4. **Platform Independent**
   - Works on Render, Railway, Fly.io, AWS, etc.
   - Easy to migrate between platforms

## 🐛 Troubleshooting

### Build fails with "npm ci" error
**Solution:** Make sure package-lock.json is committed
```bash
git add package-lock.json
git commit -m "Add package-lock.json"
git push
```

### Container exits immediately
**Solution:** Check logs
```bash
docker logs amb-tracker
```

### Port already in use
**Solution:** Use different port
```bash
docker run -p 8080:3000 --name amb-tracker amb-tracker
# Then visit http://localhost:8080
```

### Changes not reflecting
**Solution:** Rebuild without cache
```bash
docker build --no-cache -t amb-tracker .
```

## 📊 Docker Commands Cheat Sheet

### Images
```bash
# List images
docker images

# Remove image
docker rmi amb-tracker

# Build with tag
docker build -t amb-tracker:v1.0 .
```

### Containers
```bash
# List running containers
docker ps

# List all containers
docker ps -a

# View logs
docker logs amb-tracker
docker logs -f amb-tracker  # Follow logs

# Execute command in container
docker exec -it amb-tracker sh

# Stop container
docker stop amb-tracker

# Remove container
docker rm amb-tracker

# Remove all stopped containers
docker container prune
```

### Docker Compose
```bash
# Start in background
docker-compose up -d

# Start and rebuild
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

## 🔒 Security Best Practices

✅ **Already Implemented:**
- Using official Node.js image
- Running as non-root user (alpine default)
- Only production dependencies included
- Sensitive files excluded (.dockerignore)
- Health checks enabled

## 📈 Performance Tips

**Image Size:** ~170MB (alpine-based)
- Keep it lean with .dockerignore
- Use `npm ci --only=production`
- Multi-stage builds (if needed later)

**Startup Time:** ~2-3 seconds
- Alpine is fast
- Minimal dependencies
- Efficient layering

## 🚀 Next Steps

1. **Test locally with Docker:**
   ```bash
   docker-compose up
   ```

2. **Commit and push:**
   ```bash
   git add .
   git commit -m "Add Docker support"
   git push
   ```

3. **Deploy to Render:**
   - Update to Docker environment
   - Watch it deploy successfully!

4. **Optional: Add to README:**
   - Document Docker commands
   - Help others run your app

## 🎉 Success Checklist

- [ ] Docker image builds successfully
- [ ] Container runs locally
- [ ] Can access app at localhost:3000
- [ ] Health check works
- [ ] Can upload PDF and see results
- [ ] Committed all Docker files
- [ ] Pushed to GitHub
- [ ] Updated Render to use Docker
- [ ] Deployment successful on Render

---

**Pro Tip:** With Docker, your deployment will be rock-solid. No more worrying about which command Render runs - Docker handles everything!
