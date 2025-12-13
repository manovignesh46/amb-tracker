# 🚀 Render Deployment - Complete Guide

## 🔍 Problem Diagnosis

Your deployment logs show:
```
==> Running 'node index.js'  ❌
[dotenv@17.2.3] injecting env (0) from .env
==> Application exited early
```

**Root Cause:** Render is ignoring your `render.yaml` and running the wrong command.

## ✅ Step-by-Step Fix

### Step 1: Commit Latest Changes
```bash
git add .
git commit -m "Add health check endpoint and update Render config"
git push
```

### Step 2: Fix Render Configuration

**🎯 RECOMMENDED: Update Start Command in Dashboard**

1. Go to: https://dashboard.render.com
2. Find and click your `amb-tracker` service
3. Click **Settings** tab
4. Scroll down to **Build & Deploy**
5. Find **Start Command** field
6. **Change from:** `node index.js` or `node $NODE_VERSION index.js`
7. **Change to:** `npm start`
8. Click **Save Changes**
9. Wait for automatic redeploy

### Step 3: Verify Deployment

Watch the logs. You should see:
```
✅ ==> Running 'npm start'
✅ 🚀 AMB Tracker Server is running!
✅ 📊 Server listening on port 10000
```

**NOT:**
```
❌ ==> Running 'node index.js'
❌ ==> Application exited early
```

### Step 4: Test Your App

1. Visit your Render URL (from dashboard)
2. You should see the AMB Tracker upload interface
3. Test the health endpoint: `https://your-app.onrender.com/health`
   - Should return: `{"status":"ok","service":"AMB Tracker"}`
4. Upload a PDF and test functionality

## 🔄 Alternative: Deploy Using Blueprint

If the above doesn't work, use the Blueprint method:

### 1. Delete Current Service
- Dashboard → Your Service → Settings
- Scroll to bottom → **Delete Web Service**
- Confirm deletion

### 2. Create New Service from Blueprint
- Click **New +** → **Blueprint**
- Select repository: `manovignesh46/amb-tracker`
- Click **Apply**
- Render will use `render.yaml` configuration
- Click **Deploy**

## 📋 What We Fixed

### Files Updated:

**1. render.yaml** (added health check):
```yaml
services:
  - type: web
    startCommand: npm start  # Correct command
    healthCheckPath: /health # New health check
```

**2. server.js** (added health endpoint):
```javascript
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'ok', 
        service: 'AMB Tracker'
    });
});
```

**3. package.json** (already correct):
```json
{
  "main": "server.js",
  "scripts": {
    "start": "node server.js"  # Correct entry point
  }
}
```

## 🎯 Key Points

| File | Purpose | Used By |
|------|---------|---------|
| `index.js` | CLI tool | Local use only (`npm run cli`) |
| `server.js` | Web server | Deployment (Render, Vercel) |
| `render.yaml` | Config | Render (if using Blueprint) |
| `package.json` | Scripts | Render (for `npm start`) |

## 🐛 Troubleshooting

### Problem: Still shows "Running 'node index.js'"
**Solution:** Start command not updated in dashboard. Go to Settings → Build & Deploy → Change Start Command to `npm start`

### Problem: "Application exited early"
**Solution:** Wrong start command. Must use `npm start` or `node server.js`, not `node index.js`

### Problem: Dashboard doesn't have Start Command field
**Solution:** It might be auto-detected. Click "Add Command" or "Override" to manually set it.

### Problem: Changes not reflecting
**Solution:** 
1. Make sure you pushed to GitHub: `git push`
2. Trigger manual deploy in Render dashboard
3. Check you're editing the correct service

## ✅ Success Checklist

- [ ] Committed and pushed latest changes
- [ ] Updated Start Command to `npm start` in Render dashboard
- [ ] Deployment logs show "Running 'npm start'" (not 'node index.js')
- [ ] Logs show "🚀 AMB Tracker Server is running!"
- [ ] Can access the web interface at Render URL
- [ ] Health check works: `/health` returns status ok
- [ ] Can upload PDF and see AMB analysis

## 🆘 Still Having Issues?

1. **Check Environment:** Settings → Environment → Make sure no conflicting env vars
2. **Check Region:** Free tier works in all regions
3. **Check Logs:** Look for any error messages before "Application exited"
4. **GitHub Connection:** Settings → Make sure connected to correct repo/branch

## 📞 Next Steps After Success

Once deployed successfully:
1. Test with a real HDFC statement PDF
2. Share the URL with others (it's publicly accessible)
3. Consider adding custom domain (Settings → Custom Domain)
4. Monitor usage (Dashboard shows requests, CPU, memory)

---

**Note:** Free tier spins down after 15 min of inactivity. First request after spin-down takes ~30 seconds to wake up.
