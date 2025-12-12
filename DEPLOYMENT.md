# Vercel Deployment Guide

## Prerequisites

1. GitHub account
2. Vercel account (sign up at vercel.com with GitHub)

## Step-by-Step Deployment

### Option 1: Deploy via GitHub (Recommended)

1. **Push your code to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - HDFC AMB Tracker"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/amb-tracker.git
   git push -u origin main
   ```

2. **Deploy on Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Click "Deploy"
   
   That's it! Vercel will automatically detect the configuration from `vercel.json`

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   cd /path/to/amb-tracker
   vercel
   ```

4. **Follow the prompts:**
   - Set up and deploy? **Y**
   - Which scope? Select your account
   - Link to existing project? **N**
   - What's your project's name? **amb-tracker** (or your choice)
   - In which directory is your code located? **./**
   - Deploy? **Y**

5. **Production deployment:**
   ```bash
   vercel --prod
   ```

## Configuration Files

The project includes:

- **vercel.json** - Vercel configuration
  - Routes API requests to `/api/analyze.js`
  - Serves static files from root and `public/`
  
- **api/analyze.js** - Serverless function
  - Handles PDF uploads
  - Parses statements
  - Calculates AMB
  
- **.vercelignore** - Files to exclude from deployment
  - node_modules
  - .env
  - local development files

## Environment Variables (Optional)

If you need environment variables:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add variables as needed
3. Redeploy

## Domain Setup

After deployment, you can:

1. Use the free Vercel domain: `your-project.vercel.app`
2. Add custom domain in Vercel Dashboard → Domains

## Monitoring

- View deployment logs in Vercel Dashboard
- Check function logs in the Functions tab
- Monitor performance and usage

## Local Testing

Before deploying, test locally:

```bash
# Install dependencies
npm install

# Run local server
npm start

# Visit http://localhost:3000
```

## Troubleshooting

### Deployment fails
- Check that all dependencies are in `package.json`
- Verify `vercel.json` is in the root directory
- Check Vercel deployment logs

### Function timeout
- Vercel free tier has 10-second timeout
- Large PDFs might need optimization

### File upload issues
- Max file size is 10MB (configured in api/analyze.js)
- Only PDF files are accepted

## Support

For issues:
1. Check Vercel deployment logs
2. Review function logs in Vercel Dashboard
3. Open an issue on GitHub

## Cost

- **Vercel Free Tier** includes:
  - Unlimited deployments
  - 100GB bandwidth/month
  - Serverless function executions
  - Custom domains
  - HTTPS by default

This project fits comfortably within the free tier for personal use!
