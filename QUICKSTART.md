# Quick Start - Deploy in 2 Minutes

## One-Command Deploy

```bash
npm run deploy:quick
```

That's it! The script will:
1. ✅ Install Vercel CLI (if needed)
2. ✅ Authenticate with Vercel
3. ✅ Install dependencies
4. ✅ Deploy your app
5. ✅ Give you the live URL

## After Deployment (1 minute)

Set up Vercel Redis for data persistence:

### One-Click Setup

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Click **Storage** tab
4. Click **Create Database**
5. Select **Redis** (Vercel's built-in Redis storage)
6. Click **Create**
7. Click **Connect** to your project

Done! Environment variables are automatically configured. No separate account needed!

**Or use the helper script:**
```bash
npm run setup:redis
```

Your app now has persistent storage with Vercel's FREE tier:
- ✅ 256MB storage
- ✅ 10,000 commands/day
- ✅ Integrated with your Vercel project
- ✅ Perfect for talent shows!

## Deploy to Production

```bash
npm run deploy:prod
```

## Verify Configuration

Before deploying, check everything is set up correctly:

```bash
npm run verify
```

## Local Development

```bash
npm run dev
```

Open: http://localhost:3000

## Need Help?

- Full deployment guide: [DEPLOYMENT.md](DEPLOYMENT.md)
- Main README: [README.md](README.md)
- MongoDB Atlas docs: https://docs.atlas.mongodb.com/

## Common Commands

```bash
# Quick deploy (preview)
npm run deploy:quick

# Production deploy
npm run deploy:prod

# Verify configuration
npm run verify

# Set up Redis
npm run setup:redis

# Local development
npm run dev
```
