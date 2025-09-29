# Complete Vercel KV Setup Guide

## What This Solves
✅ **Projection page data sharing issue**  
✅ **Data persistence across deployments**  
✅ **Instant global data synchronization**  
✅ **No more temporary file storage problems**

## Step-by-Step Setup

### Step 1: Create Vercel KV Database

1. **Go to Vercel Dashboard**
   - Visit [vercel.com](https://vercel.com)
   - Navigate to your talent-show-app project

2. **Create KV Database**
   - Click on the "Storage" tab
   - Click "Create Database"
   - Select "KV" (Redis-compatible)
   - Name it: `talent-show-data`
   - Click "Create"

3. **Get Environment Variables**
   - After creation, you'll see environment variables:
   ```
   KV_REST_API_URL=https://...
   KV_REST_API_TOKEN=...
   ```
   - These are automatically added to your project

### Step 2: Switch to KV-Enabled API

**Option A: Replace Current API (Recommended)**
```bash
# Backup current API
mv api/index.js api/index-backup.js

# Use KV version
mv api/kv-index.js api/index.js
```

**Option B: Test Side-by-Side**
- Keep both files
- Test KV version at `/api/kv-index` first
- Switch when ready

### Step 3: Deploy the Changes

```bash
# Commit changes
git add .
git commit -m "Add Vercel KV database integration"
git push origin main
```

Vercel will automatically:
- Install `@vercel/kv` dependency
- Connect to your KV database
- Deploy the new API

### Step 4: Verify Setup

1. **Check API Status**
   - Visit: `https://your-app.vercel.app/api/status`
   - Should show: `"storage": "kv"` and `"kvAvailable": true`

2. **Test Data Persistence**
   - Visit: `https://your-app.vercel.app/debug.html`
   - Click "Run Full Test"
   - Should show successful data operations

3. **Test Projection Page**
   - Add events in main app
   - Check projection page - should show events immediately!

## What the KV Integration Does

### Data Storage
- **Events**: Stored in `talent-show:events`
- **Current Event**: Stored in `talent-show:current-event`
- **Finished Events**: Stored in `talent-show:finished-events`
- **Last Updated**: Stored in `talent-show:last-updated`

### Benefits
- ✅ **Instant synchronization** between all API calls
- ✅ **Data persists** across deployments and restarts
- ✅ **Global replication** - fast access worldwide
- ✅ **Automatic fallback** if KV is unavailable
- ✅ **Same API endpoints** - no frontend changes needed

## Cost Information

### Free Tier (Perfect for Talent Shows)
- **30,000 commands per month**
- **Typical usage**: ~100-500 commands per talent show
- **Can handle**: 60+ talent shows per month on free tier

### Commands Used
- Adding event: ~5 commands
- Starting event: ~5 commands
- Viewing projection: ~4 commands
- Each page load: ~1-2 commands

## Troubleshooting

### If KV Setup Fails
The API automatically falls back to in-memory storage, so your app will still work.

### Check KV Status
```bash
# Visit this endpoint to check KV availability
https://your-app.vercel.app/api/status
```

### Common Issues
1. **"KV not available"** - Database not created or env vars missing
2. **"Storage: fallback"** - KV setup incomplete, using fallback mode
3. **"kvAvailable: false"** - Environment variables not set

## Migration from File Storage

The KV version automatically handles the transition:
- No data migration needed (starts fresh)
- Same API endpoints work
- Projection page will work immediately
- All existing frontend code compatible

## Next Steps After Setup

1. **Test thoroughly** with debug tool
2. **Verify projection page** shows data
3. **Run a test talent show** to confirm everything works
4. **Remove backup files** once confirmed working

## Rollback Plan

If anything goes wrong:
```bash
# Restore original API
mv api/index.js api/kv-index.js
mv api/index-backup.js api/index.js
git commit -am "Rollback to file storage"
git push origin main
```

Your talent show app will have **bulletproof data persistence** with Vercel KV! 🎭✨
