# Fix for Vercel Projection Page Data Issue

## The Problem
The projection page works locally but shows no data when deployed to Vercel because:
1. Vercel serverless functions can't write to the `public/` directory
2. The data file path was pointing to a read-only location

## The Solution Applied

### ✅ Fixed Data Storage Path
- **Local development**: Uses `public/data/events-data.json`
- **Vercel deployment**: Uses `/tmp/events-data.json` (writable in serverless)

### ✅ Added Environment Detection
The serverless function now automatically detects if it's running on Vercel and uses the appropriate file path.

### ✅ Added Debugging
The `/api/status` endpoint now shows:
- Environment (local vs vercel)
- Data file path being used
- Timestamp

## How to Deploy the Fix

### Step 1: Commit and Push Changes
```bash
git add .
git commit -m "Fix Vercel data storage for projection page"
git push origin main
```

### Step 2: Redeploy on Vercel
- Go to your Vercel dashboard
- Find your project
- Click "Redeploy" or it will auto-deploy from the git push

### Step 3: Test the Fix

1. **Check API Status:**
   Visit: `https://your-app.vercel.app/api/status`
   
   You should see:
   ```json
   {
     "status": "ok",
     "timestamp": "2025-09-29T02:44:00.000Z",
     "environment": "vercel",
     "dataFile": "/tmp/events-data.json"
   }
   ```

2. **Test Data Endpoints:**
   - Visit: `https://your-app.vercel.app/api/data`
   - Should return: `{"events":[],"currentEvent":null,"finishedEvents":[],"lastUpdated":"..."}`

3. **Test the App:**
   - Go to your main app: `https://your-app.vercel.app`
   - Add some events
   - Open projection page: `https://your-app.vercel.app/projection.html`
   - The projection page should now show the events!

## Important Notes

### ⚠️ Data Persistence in Vercel
- **Local**: Data persists between server restarts
- **Vercel**: Data is stored in `/tmp` which is temporary
- Each serverless function invocation may start fresh
- For production, consider using a database (Vercel KV, PostgreSQL, etc.)

### ✅ For Development
- Local development still works exactly the same
- Data is saved to `public/data/events-data.json`
- Projection page mirrors main app data

## If It Still Doesn't Work

### Debug Steps:
1. **Check the API status endpoint** to confirm environment detection
2. **Open browser dev tools** on the projection page and check for errors
3. **Verify the main app** can add events successfully
4. **Check Vercel function logs** in the Vercel dashboard

### Alternative Solution:
If file-based storage continues to have issues, we can switch to:
- Vercel KV (Redis-like key-value store)
- Vercel Postgres
- Or use localStorage as fallback

The current fix should resolve the projection page data display issue on Vercel!
