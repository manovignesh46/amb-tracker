# 🔧 Render Deployment Fix

## Problem
Render is running `node index.js` instead of `node server.js`, causing the application to exit immediately.

**Why this happens:**
- Render's dashboard settings override `render.yaml` and `package.json`
- You likely created the service manually in the dashboard
- The dashboard is using the default Node.js start command

## ✅ Solution (Choose ONE)

### Option 1: Update Start Command in Dashboard (QUICKEST)

1. Go to your Render dashboard: https://dashboard.render.com
2. Click on your `amb-tracker` service
3. Go to **Settings** tab
4. Scroll to **Build & Deploy** section
5. Find **Start Command**
6. Change it from `node index.js` to:
   ```bash
   npm start
   ```
   OR directly:
   ```bash
   node server.js
   ```
7. Click **Save Changes**
8. Render will automatically redeploy

### Option 2: Deploy Using Blueprint (RECOMMENDED)

This ensures `render.yaml` is used for all future deployments.

1. **Delete current service:**
   - Go to Render dashboard
   - Click on your service
   - Settings → Delete Web Service

2. **Create new service using Blueprint:**
   - Click **New** → **Blueprint**
   - Connect to `manovignesh46/amb-tracker` repository
   - Render will detect and use `render.yaml`
   - Click **Deploy**

## 🔍 Verification

After redeploying, check the logs. You should see:
```
==> Running 'npm start' or 'node server.js'
🚀 AMB Tracker Server is running!
📊 Server listening on port XXXXX
```

**NOT:**
```
==> Running 'node index.js'  ❌ (This is wrong!)
```

## 📋 What's Configured

Our files are already set up correctly:

**package.json:**
```json
{
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  }
}
```

**render.yaml:**
```yaml
services:
  - type: web
    startCommand: npm start
```

**server.js:**
```javascript
const PORT = process.env.PORT || 3000;
// Express server with /api/analyze endpoint
```

## 🚀 After Fix

Once deployed correctly:
- Visit your Render URL (e.g., `https://amb-tracker.onrender.com`)
- You should see the upload interface
- Drag & drop your HDFC PDF statement
- See your AMB analysis

## 💡 Remember

- `index.js` = CLI tool (for local use only)
- `server.js` = Web server (for deployment)
- Always use `npm start` or `node server.js` for deployment
