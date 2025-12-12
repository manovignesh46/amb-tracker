# ⚡ Quick Fix for Render Deployment

## The Problem
Render is running `node index.js` (CLI tool) instead of `npm start` (web server).

## The Solution (60 seconds)

### Go to Render Dashboard:
1. Open https://dashboard.render.com
2. Click on your **amb-tracker** service
3. Go to **Settings** tab
4. Find **Build & Deploy** section
5. Locate **Start Command** field

### Change the command:
**From:** `node index.js` ❌  
**To:** `npm start` ✅

### Save and Deploy:
- Click **Save Changes**
- Render will auto-redeploy
- Wait 2-3 minutes

## ✅ Verify It Worked

Check the deployment logs for:
```
✅ ==> Running 'npm start'
✅ 🚀 AMB Tracker Server is running!
✅ 📊 Server listening on port 10000
```

Then visit your app URL - you should see the upload interface!

## 📚 Need More Help?

See detailed guides:
- **RENDER_FIX.md** - Two methods to fix
- **RENDER_DEPLOY_GUIDE.md** - Complete troubleshooting

## 🎯 What's Next?

After successful deployment:
1. Test by uploading your HDFC PDF
2. Check `/health` endpoint works
3. Share your app URL!

---

**Why this happened:** Render uses dashboard settings over config files when you create the service manually. The dashboard was set to run `node index.js` (CLI tool) instead of `npm start` (web server).

**What we fixed:** 
- Added `/health` endpoint for Render to check if app is running
- Updated `render.yaml` with health check path
- Created comprehensive deployment guides
