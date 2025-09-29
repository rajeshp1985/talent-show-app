# Vercel Blob Setup Guide

## What This Solves
✅ **Projection page data sharing issue**  
✅ **Data persistence across deployments**  
✅ **File-based storage with global CDN**  
✅ **Simple JSON file storage approach**

## Vercel Blob vs KV Comparison

| Feature | **Vercel Blob** | **Vercel KV** |
|---------|-----------------|---------------|
| **Best for** | File storage, JSON files | Key-value data, fast access |
| **Free Tier** | 1GB storage | 30,000 commands/month |
| **Speed** | Slower (HTTP requests) | Faster (Redis-like) |
| **Complexity** | Simple file operations | Simple key-value operations |
| **Use Case** | Document/file storage | Database-like operations |
| **For Talent Show** | ✅ Good | ✅ Better |

## Step-by-Step Blob Setup

### Step 1: Create Vercel Blob Storage

1. **Go to Vercel Dashboard**
   - Visit [vercel.com](https://vercel.com)
   - Navigate to your talent-show-app project

2. **Create Blob Storage**
   - Click on the "Storage" tab
   - Click "Create Database"
   - Select "Blob" 
   - Name it: `talent-show-files`
   - Click "Create"

3. **Get Environment Variables**
   - After creation, you'll see:
   ```
   BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...
   ```
   - This is automatically added to your project

### Step 2: Switch to Blob-Enabled API

**Option A: Replace Current API**
```bash
# Backup current API
mv api/index.js api/index-backup.js

# Use Blob version
mv api/blob-index.js api/index.js
```

**Option B: Test Side-by-Side**
- Keep both files
- Test Blob version first
- Switch when ready

### Step 3: Deploy the Changes

```bash
# Commit changes
git add .
git commit -m "Add Vercel Blob storage integration"
git push origin main
```

Vercel will automatically:
- Install `@vercel/blob` dependency
- Connect to your Blob storage
- Deploy the new API

### Step 4: Verify Setup

1. **Check API Status**
   - Visit: `https://your-app.vercel.app/api/status`
   - Should show: `"storage": "blob"` and `"blobAvailable": true`

2. **Test Data Persistence**
   - Visit: `https://your-app.vercel.app/debug.html`
   - Click "Run Full Test"
   - Should show successful data operations

3. **Test Projection Page**
   - Add events in main app
   - Check projection page - should show events!

## How Blob Storage Works

### Data Storage
- **Single File**: `talent-show-data.json` stored in Blob
- **Global CDN**: File replicated worldwide for fast access
- **JSON Format**: Same data structure as before
- **Public Access**: File accessible via HTTPS URL

### Operations
- **Read**: Fetch JSON file from Blob URL
- **Write**: Upload new JSON file (overwrites previous)
- **Initialize**: Creates file if it doesn't exist
- **Fallback**: Uses in-memory data if Blob unavailable

## Cost Information

### Free Tier
- **1GB storage** (more than enough for talent show data)
- **Unlimited reads** from CDN
- **Typical usage**: ~1-10KB per talent show
- **Can handle**: Thousands of talent shows

### Blob Operations
- **File size**: ~1-50KB per talent show
- **Reads**: Fast CDN delivery
- **Writes**: Only when data changes
- **Storage**: Persistent across deployments

## Pros and Cons

### ✅ Pros
- **Simple file-based approach** (familiar concept)
- **Global CDN delivery** (fast worldwide)
- **Large free tier** (1GB storage)
- **Good for file storage** (can store images later)
- **Persistent across deployments**

### ⚠️ Cons
- **Slower than KV** (HTTP requests vs Redis)
- **Overwrites entire file** (less efficient for small changes)
- **Not optimized for frequent updates**

## When to Use Blob vs KV

### Choose **Blob** if:
- You prefer file-based storage
- You might store images/documents later
- You have infrequent data updates
- You want simple backup/restore (just download JSON)

### Choose **KV** if:
- You want fastest performance
- You have frequent data updates
- You prefer database-like operations
- You want optimized key-value storage

## Migration Between Solutions

All three solutions (File, Blob, KV) use the same API endpoints, so you can switch between them without changing your frontend code.

## Recommendation

For your talent show app:
1. **Best**: Vercel KV (fastest, most efficient)
2. **Good**: Vercel Blob (simple, file-based)
3. **Fallback**: File storage (temporary, local dev)

Both Blob and KV will completely solve your projection page data sharing issue!
