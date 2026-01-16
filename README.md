# Talent Show Management App

A web application for managing talent shows with real-time projection capabilities.

## 🚀 Quick Start

```
1. Deploy (2 min)              →  2. Setup Redis (1 min)         →  3. You're Live! 🎉
   npm run deploy:quick            Vercel Dashboard → Storage        Test your app
```

**Documentation:**
- [QUICKSTART.md](QUICKSTART.md) - Deploy in 2 minutes
- [DEPLOYMENT.md](DEPLOYMENT.md) - Complete deployment guide

## Features

- **Split-Screen Interface** - Current event on left, upcoming events on right
- **Projection Display** - Full-screen view for audience
- **Event Management** - Add, edit, delete, and reorder events
- **Photo Support** - Upload files, use Imgur/external URLs, or local images
- **Real-time Updates** - Auto-sync between main and projection views
- **Vercel Redis** - Persistent data storage (FREE tier)

## Local Development

```bash
npm install
npm run dev
```

Open:
- Main app: `http://localhost:3000`
- Projection: `http://localhost:3000/projection.html`

## Deployment

### Quick Deploy
```bash
npm run deploy:quick
```

### Setup Redis Storage
After deployment, add Redis for data persistence:

1. Go to [Vercel Dashboard](https://vercel.com/dashboard) → Your Project
2. Click **Storage** → **Create Database** → **Redis**
3. Click **Create** and **Connect**

Done! The `REDIS_URL` environment variable is automatically added.

**Cost: $0/month** (FREE tier: 256MB storage, 10K commands/day)

## Photo Management

### Three Ways to Add Photos

**1. Upload Files**
- Click file picker
- Select image
- Auto-uploads to server

**2. External URLs**
- Imgur: Right-click image → Copy Image Address
- Google Photos: Share and copy image URL
- Any direct image URL (`.jpg`, `.png`, `.gif`)

**3. Local Images**
- Place in `public/images/` folder
- Reference as: `images/filename.jpg`

### Imgur Tips

**Single images:** Paste any URL - auto-converts to direct link ✅

**Albums:** 
1. Open album
2. Right-click on image
3. Copy Image Address
4. Paste URL

## Usage

### Managing Events
- **Add Event**: Manage Items → Add New Item
- **Reorder**: Drag and drop or use arrow buttons
- **Start Next**: Moves first event to current
- **Finish**: Moves current to finished list

### Projection Display
- Open `projection.html` in full-screen
- Auto-refreshes every 3 seconds
- Optimized for projectors

## Commands

```bash
# Development
npm run dev              # Local server

# Deployment
npm run deploy:quick     # Fast automated deploy
npm run deploy          # Interactive deploy
npm run deploy:prod     # Production deploy

# Setup
npm run setup:redis     # Redis setup guide
npm run verify          # Verify configuration
```

## Technology

- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Backend**: Node.js, Express (local), Vercel Functions (production)
- **Database**: Vercel Redis (FREE tier)
- **Hosting**: Vercel (FREE tier)

## Cost

- Vercel Hosting: **FREE** (100GB bandwidth/month)
- Vercel Redis: **FREE** (256MB, 10K commands/day)
- **Total: $0/month**

## Troubleshooting

### Data not persisting
1. Check Redis is connected: `https://your-app.vercel.app/api/status`
2. Verify `REDIS_URL` exists in Vercel environment variables
3. Redeploy after connecting Redis

### Images not showing
- Verify file exists in `images/` folder
- Check URL is publicly accessible
- For Imgur: Use direct image link (right-click → Copy Image Address)

### API errors
- Check Vercel logs: `vercel logs`
- Verify Redis connection in `/api/status`

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed troubleshooting.

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Mobile: Responsive design

## License

MIT License
