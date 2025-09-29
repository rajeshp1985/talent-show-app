# Quick Fix for NPM Authentication Error

## The Problem
Your npm configuration has authentication issues that prevent using `npx vercel build` or installing Vercel CLI.

## The Solution: Deploy Without Vercel CLI

### Option 1: GitHub Integration (Recommended)

**This completely bypasses the npm authentication issue:**

1. **Push your code to GitHub:**
   ```bash
   git add .
   git commit -m "Fix deployment configuration"
   git push origin main
   ```

2. **Deploy via Vercel Dashboard:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will automatically build and deploy
   - **No CLI needed, no npm auth issues!**

### Option 2: Use Railway (Even Easier)

**Railway handles Node.js apps perfectly:**

1. Go to [railway.app](https://railway.app)
2. Sign in with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Railway automatically detects it's a Node.js app
6. It runs `npm install && npm start`
7. Your app is live in minutes!

### Option 3: Local Development Only

**If you just want to run locally:**

```bash
# This should work without authentication issues
npm install express
node server.js
```

Then access:
- Main app: http://localhost:3000
- Projection: http://localhost:3000/projection.html

## Why This Happens

The npm authentication error occurs because:
1. Your `~/.npmrc` file has expired or invalid tokens
2. You're trying to use `npx vercel` which requires npm registry access
3. The Vercel CLI tries to download packages with your current npm config

## The Fix We Applied

1. ✅ Removed Vercel CLI dependency from package.json
2. ✅ Created standalone Express server (server.js)
3. ✅ Fixed API endpoints to use relative URLs
4. ✅ Simplified deployment to not require CLI

## Test Your App Locally

```bash
# Install just the one dependency we need
npm install express

# Start the server
npm start

# Open in browser
open http://localhost:3000
```

## Recommended Next Steps

1. **For deployment:** Use GitHub + Vercel dashboard integration
2. **For local development:** Use `npm start` (no Vercel CLI needed)
3. **Alternative:** Try Railway - it's often easier than Vercel

Your app is now configured to work without any CLI tools or npm authentication issues!
