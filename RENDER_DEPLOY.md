# 🚀 Deploy to Render

## Quick Deploy Steps

### Option 1: One-Click Deploy (Easiest)

Click this button to deploy directly:

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

### Option 2: Manual Deployment

1. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "Add Render deployment support"
   git push
   ```

2. **Create Render Account**:
   - Go to [render.com](https://render.com)
   - Sign up with GitHub

3. **Create New Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repository `amb-tracker`
   - Render will auto-detect the configuration from `render.yaml`

4. **Configure (auto-filled from render.yaml)**:
   - **Name**: `amb-tracker`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

5. **Deploy**:
   - Click "Create Web Service"
   - Wait for deployment (2-3 minutes)
   - Your app will be live at `https://amb-tracker.onrender.com`

## Configuration Files

### render.yaml
```yaml
services:
  - type: web
    name: amb-tracker
    env: node
    plan: free
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_VERSION
        value: 18.18.0
```

This file configures:
- **Service Type**: Web service
- **Runtime**: Node.js 18
- **Build**: Installs dependencies
- **Start**: Runs Express server (`npm start` → `node server.js`)
- **Plan**: Free tier

### package.json
```json
{
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  }
}
```

- **main**: Points to server.js (not index.js CLI tool)
- **start**: Runs the web server

## Environment Variables

Render automatically provides:
- `PORT` - Server port (auto-assigned by Render)

No additional env vars needed!

## Important Notes

### ✅ What Gets Deployed

- **Web Server**: `server.js` - Express app with file upload
- **API Endpoint**: `/api/analyze` - PDF processing
- **Static Files**: HTML, CSS, JS from `public/`
- **Not Deployed**: `index.js` (CLI tool for local use only)

### 🔧 Key Differences from Local

| Feature | Local | Render |
|---------|-------|--------|
| Start Command | `npm start` | `npm start` |
| Port | 3000 | Dynamic (from `PORT` env) |
| File Uploads | `uploads/` folder | Temporary storage |
| CLI Tool | Available | Not used |

### 💡 Free Tier Limits

Render Free Plan includes:
- ✅ 750 hours/month (enough for 1 app)
- ✅ Automatic HTTPS
- ✅ Custom domains
- ⚠️ Spins down after 15 min inactivity
- ⚠️ Cold start: ~30 seconds on first request

### 🐌 Cold Start

On the free tier, your app sleeps after 15 minutes of inactivity. The first request after sleep takes ~30 seconds to wake up.

**Solution**: Upgrade to paid plan ($7/month) for always-on service.

## Deployment Workflow

```bash
# 1. Make changes locally
git add .
git commit -m "Your changes"

# 2. Push to GitHub
git push

# 3. Render auto-deploys
# (if you enabled auto-deploy in Render settings)
```

## Custom Domain

1. Go to Render Dashboard → Your Service → Settings
2. Click "Custom Domain"
3. Add your domain (e.g., `amb-tracker.yourdomain.com`)
4. Update your DNS with provided CNAME

## Monitoring

View in Render Dashboard:
- **Logs**: Real-time application logs
- **Metrics**: CPU, memory, bandwidth usage
- **Events**: Build and deployment history

## Troubleshooting

### Build Fails

**Check:**
- All dependencies in `package.json`
- `render.yaml` is in root directory
- Build logs in Render dashboard

**Common Fix:**
```bash
# Test build locally
npm install
npm start
```

### App Doesn't Start

**Check:**
- `package.json` has `"start": "node server.js"`
- `main` field points to `server.js`
- Server listens on `process.env.PORT`

**Verify:**
```javascript
// In server.js
const PORT = process.env.PORT || 3000;
```

### Upload Fails

**Possible Causes:**
- Render free tier has request timeout (30 seconds)
- Large PDFs might timeout
- Temporary file storage might be full

**Solutions:**
- Keep PDFs under 5MB
- Optimize PDF processing
- Upgrade to paid plan

### Slow Response

**On Free Tier:**
- First request after 15 min: ~30 seconds (cold start)
- Subsequent requests: Fast

**Solutions:**
- Use a ping service (e.g., UptimeRobot) to keep app awake
- Upgrade to paid plan ($7/month)

## Testing

Before deploying, test locally:

```bash
# Install dependencies
npm install

# Set PORT like Render does
PORT=10000 npm start

# Visit http://localhost:10000
# Upload a test PDF
```

## Logs

View logs in Render:
1. Go to your service dashboard
2. Click "Logs" tab
3. View real-time logs

Or use Render CLI:
```bash
npm install -g render-cli
render login
render logs -s amb-tracker
```

## Cost

**Free Plan** (Current):
- ✅ Perfect for personal use
- ✅ 750 hours/month
- ⚠️ Sleeps after 15 min

**Starter Plan** ($7/month):
- ✅ Always on (no sleep)
- ✅ Faster builds
- ✅ More resources

## Alternative: Vercel

If you prefer serverless:
- See `VERCEL_READY.md` for Vercel deployment
- Vercel has no cold start issues
- Both are free for personal use

## Support

- [Render Documentation](https://render.com/docs)
- [Render Community](https://community.render.com)
- Check deployment logs for errors

---

**Ready to deploy?**

```bash
git add .
git commit -m "Ready for Render"
git push
```

Then visit [render.com](https://render.com) and create a new web service!
