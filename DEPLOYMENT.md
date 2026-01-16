# Deployment Guide - Talent Show App

## Quick Deploy to Vercel (Single Command)

```bash
npm run deploy
```

This will:
1. Check if Vercel CLI is installed (installs if needed)
2. Authenticate with Vercel (if not already logged in)
3. Install dependencies
4. Deploy your app
5. Provide instructions for setting up data storage

## Prerequisites

- Node.js 18+ installed
- npm or yarn
- A Vercel account (free tier works fine)

## Step-by-Step Deployment

### 1. Initial Setup

```bash
# Install Vercel CLI globally (if not already installed)
npm install -g vercel

# Login to Vercel
vercel login
```

### 2. Deploy the App

**Option A: Using the deployment script (Recommended)**
```bash
./deploy.sh
```

**Option B: Using npm scripts**
```bash
# Preview deployment
npm run deploy:preview

# Production deployment
npm run deploy:prod
```

**Option C: Manual deployment**
```bash
# Preview deployment
vercel

# Production deployment
vercel --prod
```

### 3. Set Up MongoDB Atlas (5 minutes)

After deployment, set up MongoDB Atlas for persistent data storage.

#### Quick Setup

```bash
npm run setup:db
```

#### Manual Setup

**Step 1: Create MongoDB Atlas Account**

1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Sign up with email or Google
3. Choose **FREE** tier

**Step 2: Create a Cluster**

1. Click **"Build a Database"**
2. Choose **M0 FREE** tier (512MB storage)
3. Select cloud provider: **AWS** (recommended for Vercel)
4. Select region: **Closest to your users**
5. Cluster name: `talent-show` (or keep default)
6. Click **"Create"** (wait 1-3 minutes)

**Step 3: Create Database User**

1. Click **"Database Access"** in left sidebar
2. Click **"Add New Database User"**
3. Authentication Method: **Password**
4. Username: `talent-show-admin` (or your choice)
5. Password: Click **"Autogenerate Secure Password"** and **SAVE IT**
6. Database User Privileges: **"Read and write to any database"**
7. Click **"Add User"**

**Step 4: Configure Network Access**

1. Click **"Network Access"** in left sidebar
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (0.0.0.0/0)
   - ⚠️ **CRITICAL**: This is REQUIRED for Vercel serverless functions
   - Vercel functions use dynamic IPs that change with each request
   - This is safe because authentication still requires username/password
4. Click **"Confirm"**
5. **Wait 2-3 minutes** for changes to propagate

**Step 5: Get Connection String**

1. Click **"Database"** in left sidebar
2. Click **"Connect"** button on your cluster
3. Choose **"Connect your application"**
4. Driver: **Node.js**, Version: **6.0 or later**
5. Copy the connection string:

```
mongodb+srv://talent-show-admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

6. Replace `<password>` with your actual password
7. Add database name before the `?`:

```
mongodb+srv://talent-show-admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/talent-show?retryWrites=true&w=majority
```

**Step 6: Add to Vercel**

1. Go to: https://vercel.com/dashboard
2. Select your project: **talent-show-app**
3. Go to **Settings** → **Environment Variables**
4. Click **"Add New"**
5. Name: `MONGODB_URI`
6. Value: Paste your connection string
7. Environment: Select **All** (Production, Preview, Development)
8. Click **"Save"**

### 4. Redeploy After Storage Setup

```bash
vercel --prod
```

## Environment Variables

The app requires the following environment variable for data persistence:

- `MONGODB_URI` - MongoDB Atlas connection string

### Adding Environment Variables

```bash
# Add environment variable via Vercel CLI
vercel env add MONGODB_URI

# Enter your MongoDB connection string when prompted
# Example: mongodb+srv://user:pass@cluster.mongodb.net/talent-show
```

Or via Vercel Dashboard:
1. Go to project Settings → Environment Variables
2. Add `MONGODB_URI`
3. Paste your connection string
4. Select all environments (Production, Preview, Development)

## Deployment Options

### Preview Deployment
- Creates a unique URL for testing
- Doesn't affect production
- Perfect for testing changes

```bash
vercel
# or
npm run deploy:preview
```

### Production Deployment
- Deploys to your production domain
- Updates the live app

```bash
vercel --prod
# or
npm run deploy:prod
```

## Verifying Deployment

After deployment, test these endpoints:

1. **Main App**: `https://your-app.vercel.app/`
2. **Projection View**: `https://your-app.vercel.app/projection.html`
3. **API Status**: `https://your-app.vercel.app/api/status`

The API status endpoint should show:
```json
{
  "status": "ok",
  "environment": "vercel",
  "storage": "mongodb",
  "mongodbAvailable": true
}
```

## Troubleshooting

### Issue: "Redis not configured, using fallback data"

**Symptoms:**
- App works but data doesn't persist
- `/api/status` shows `"storage": "fallback"`

**Cause:** Redis environment variables not properly configured.

**Check your environment variables:**

Visit: `https://your-app.vercel.app/api/status`

Look at the `redisConfig` section to see which variables are set.

**Required variables:**
```
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
```

**Solutions:**

**If you have `REDIS_URL` only:**

This is a connection string format (redis://...) that doesn't work with our REST API client.

1. **Delete the old Redis** in Vercel Dashboard → Storage
2. **Create a new Redis database:**
   - Vercel Dashboard → Your Project → Storage
   - Create Database → Select **Redis**
   - Click Create and Connect
3. This creates the correct `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`
4. Redeploy or wait a few seconds for changes to take effect

**If you created Redis but variables aren't showing:**

1. Vercel Dashboard → Your Project → Settings → Environment Variables
2. Check if `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` exist
3. If not, go to Storage tab → Click **Connect** on your Redis database
4. Redeploy: `vercel --prod`

**If variables exist but still not working:**

1. Verify variables are set for all environments (Production/Preview/Development)
2. Redeploy: `vercel --prod`
3. Check `/api/status` again after deployment completes

### Issue: "npm error code E401" during Vercel deployment

**Error message:**
```
npm error Unable to authenticate, your authentication token seems to be invalid.
```

**Cause:** You have a private npm registry (like Amazon CodeArtifact) configured in your `~/.npmrc` file.

**Solution:**

1. Create a `.npmrc` file in your project root:
```bash
echo "registry=https://registry.npmjs.org/" > .npmrc
```

2. Clean and reinstall dependencies:
```bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

3. Commit the changes:
```bash
git add .npmrc package-lock.json
git commit -m "Fix npm registry for Vercel deployment"
```

4. Redeploy:
```bash
npm run deploy:prod
```

The `.npmrc` file in your project will override your global npm configuration for this project only.

### Issue: "MongoDB not available"

**Solution**: Set up MongoDB Atlas or add MONGODB_URI environment variable

```bash
npm run setup:db
```

Follow the [MongoDB Atlas Setup](#3-set-up-mongodb-atlas-5-minutes) section above.

### Issue: "SSL routines:ssl3_read_bytes:tlsv1 alert internal error"

**Error in Vercel logs:**
```
MongoServerSelectionError: SSL routines:ssl3_read_bytes:tlsv1 alert internal error
```

**Root Cause:** This is a known compatibility issue between MongoDB Atlas M0 (free tier) clusters and Vercel's Node.js serverless runtime. The SSL/TLS handshake fails due to certificate validation issues in the serverless environment.

**Solutions:**

**Option 1: Use Upstash Redis Instead (Recommended)**

Upstash Redis is specifically designed for serverless platforms and has no SSL issues:

1. Go to Vercel Dashboard → Your Project → Storage
2. Create Database → Select **Upstash Redis**
3. Connect to your project (auto-configures environment variables)
4. See [UPSTASH-ALTERNATIVE.md](UPSTASH-ALTERNATIVE.md) for code changes

**Benefits:**
- ✅ No SSL issues
- ✅ Faster setup (2 minutes via Vercel)
- ✅ Better performance for serverless
- ✅ Free tier: 10K commands/day

**Option 2: Try MongoDB Atlas M2+ Tier**

The SSL issue is specific to M0 (free) clusters. Upgrading to M2 ($9/month) often resolves it:
1. Upgrade cluster in MongoDB Atlas
2. Get new connection string
3. Update MONGODB_URI in Vercel
4. Redeploy

**Option 3: Verify MongoDB Configuration (if staying with M0)**

1. **Verify connection string format** - Must include `retryWrites=true&w=majority`:
```
mongodb+srv://username:password@cluster.mongodb.net/talent-show?retryWrites=true&w=majority
```

2. **Check MongoDB Atlas Network Access:**
   - Go to MongoDB Atlas → Network Access
   - Ensure `0.0.0.0/0` is allowed (required for Vercel serverless)
   - Wait 2-3 minutes after adding for changes to propagate

3. **Verify database user permissions:**
   - Go to MongoDB Atlas → Database Access
   - User must have "Read and write to any database" permission

4. **Check MONGODB_URI in Vercel:**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Verify `MONGODB_URI` is set correctly
   - Make sure there are no extra spaces or line breaks
   - Redeploy after any changes

5. **Test connection string locally:**
```bash
# Add to .env file
MONGODB_URI=your_connection_string

# Test locally
npm run dev
```

If it works locally but not on Vercel, the issue is likely network access configuration in MongoDB Atlas.

### Issue: "Authentication failed"

**Causes:**
- Incorrect username or password
- Special characters in password not URL-encoded

**Solutions:**
- Verify username and password are correct
- URL-encode special characters in password
- Regenerate password without special characters

### Issue: "Connection timeout"

**Causes:**
- Network access not configured
- Incorrect connection string

**Solutions:**
- Verify Network Access allows 0.0.0.0/0
- Check connection string format
- Ensure cluster is running (not paused)

### Issue: "Database not found"

**Solution**: Database is created automatically on first write. This is normal and not an error.

### Issue: "Vercel CLI not found"

**Solution**: Install Vercel CLI globally

```bash
npm install -g vercel
```

### Issue: "Not logged in to Vercel"

**Solution**: Login to Vercel

```bash
vercel login
```

### Issue: Data not persisting

**Cause**: MongoDB not configured

**Solution**: 
1. Set up MongoDB Atlas (see [MONGODB-SETUP.md](MONGODB-SETUP.md))
2. Add MONGODB_URI to Vercel environment variables
3. Redeploy the app
4. Check `/api/status` endpoint to verify MongoDB connection

### Issue: Images not loading

**Cause**: Images are stored locally and not deployed

**Solution**: 
- Upload images through the app's upload feature
- Or use external image URLs (https://...)

## Custom Domain

To add a custom domain:

1. Go to your project in Vercel Dashboard
2. Navigate to **Settings** → **Domains**
3. Add your domain
4. Follow DNS configuration instructions

## Monitoring

Monitor your deployment:

1. **Vercel Dashboard**: View logs, analytics, and performance
2. **API Status**: Check `/api/status` for health information
3. **Vercel Logs**: `vercel logs` command

## Rollback

To rollback to a previous deployment:

1. Go to Vercel Dashboard
2. Select your project
3. Go to **Deployments**
4. Find the previous working deployment
5. Click **Promote to Production**

## Local Development

To run locally:

```bash
npm run dev
```

Access at: `http://localhost:3000`

## Cost

- **Vercel Hosting**: Free tier includes:
  - Unlimited deployments
  - 100GB bandwidth/month
  - Automatic HTTPS
  
- **MongoDB Atlas**: Free tier (M0 Sandbox) includes:
  - 512MB storage
  - Shared RAM
  - 500 concurrent connections
  - Perfect for talent show events

Total cost: **$0/month** for most use cases!

## Support

For issues:
1. Check the [Vercel Documentation](https://vercel.com/docs)
2. Review deployment logs: `vercel logs`
3. Check API status: `https://your-app.vercel.app/api/status`
