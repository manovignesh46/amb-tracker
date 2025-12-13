# 🚀 Vercel Deployment - Quick Start

Your HDFC AMB Tracker is now ready for Vercel deployment!

## ✅ What's Been Set Up

1. **Serverless Function**: `api/analyze.js` - handles PDF uploads and AMB calculations
2. **Vercel Configuration**: `vercel.json` - routing and build configuration
3. **Static Files**: HTML, CSS, JS served from root and `public/`
4. **Dependencies**: Updated `package.json` with `formidable` for file uploads

## 🎯 Quick Deploy (3 Steps)

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Add Vercel deployment support"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/amb-tracker.git
git push -u origin main
```

### 2. Deploy on Vercel

- Go to [vercel.com/new](https://vercel.com/new)
- Click "Import Git Repository"
- Select your `amb-tracker` repo
- Click "Deploy"

### 3. Done! 🎉

Your app will be live at: `https://amb-tracker.vercel.app`

## 🧪 Test Locally First

```bash
npm install
npm start
# Visit http://localhost:3000
```

## 📁 Key Files

| File | Purpose |
|------|---------|
| `api/analyze.js` | Serverless function for PDF processing |
| `vercel.json` | Vercel routing configuration |
| `index.html` | Main homepage |
| `public/` | Static assets (CSS, JS) |
| `.vercelignore` | Files to exclude from deployment |

## 🔧 How It Works

1. **User uploads PDF** → Sent to `/api/analyze`
2. **Serverless function** → Parses PDF, calculates AMB
3. **Returns JSON** → Client displays results
4. **No server management** → Fully serverless!

## 💡 Benefits of Vercel

- ✅ **Free hosting** for personal projects
- ✅ **Automatic HTTPS** and SSL certificates
- ✅ **Global CDN** - fast worldwide
- ✅ **Auto-scaling** - handles traffic spikes
- ✅ **Zero configuration** - works out of the box
- ✅ **Git integration** - auto-deploy on push

## 🎨 Features

- 📱 Mobile responsive
- 🖱️ Drag & drop uploads
- 📊 Real-time AMB calculations
- 📈 Transaction history
- ✅ Status indicators
- 🎯 Customizable target AMB

## 📚 Documentation

- Full guide: `DEPLOYMENT.md`
- User manual: `README.md`

## 🆘 Need Help?

Check the deployment logs on Vercel Dashboard if something goes wrong!

---

**Ready to deploy? Follow Step 1 above!** 🚀
