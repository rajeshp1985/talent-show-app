# Deployment Guide

## Vercel Deployment

### Option 1: Using Vercel Serverless Functions (Recommended for Vercel)

The app is configured to deploy to Vercel using serverless functions. The current setup should work without npm authentication issues.

**Steps:**
1. Push your code to GitHub
2. Connect your GitHub repository to Vercel
3. Deploy automatically

**Configuration:**
- `vercel.json` is configured with the correct Node.js runtime
- Static files are served from the `public/` directory
- API endpoints are handled by the serverless function in `api/index.js`

### Option 2: Using Vercel CLI (If you have access)

If you have Vercel CLI access and want to deploy manually:

```bash
# Install Vercel CLI globally (if not already installed)
npm install -g vercel

# Deploy
vercel --prod
```

### Troubleshooting Vercel Deployment

**If you encounter npm authentication errors:**

1. **Remove node_modules and package-lock.json** (if they exist):
   ```bash
   rm -rf node_modules package-lock.json
   ```

2. **Clear npm cache:**
   ```bash
   npm cache clean --force
   ```

3. **Try deploying again**

4. **Alternative: Use GitHub integration** instead of CLI deployment

## Alternative Deployment Options

### Option 1: Railway

Railway is a great alternative to Vercel for Node.js apps:

1. Go to [railway.app](https://railway.app)
2. Connect your GitHub repository
3. Railway will automatically detect it's a Node.js app
4. It will run `npm start` which starts the Express server
5. Your app will be available at the provided URL

### Option 2: Render

1. Go to [render.com](https://render.com)
2. Create a new Web Service
3. Connect your GitHub repository
4. Set the build command to: `npm install`
5. Set the start command to: `npm start`
6. Deploy

### Option 3: Heroku

1. Install Heroku CLI
2. Create a new Heroku app:
   ```bash
   heroku create your-talent-show-app
   ```
3. Deploy:
   ```bash
   git push heroku main
   ```

### Option 4: DigitalOcean App Platform

1. Go to DigitalOcean App Platform
2. Connect your GitHub repository
3. It will auto-detect the Node.js app
4. Deploy with default settings

## Local Development

For local development, you don't need Vercel CLI:

```bash
# Install dependencies
npm install

# Start the server
npm start
# or
npm run dev

# Access the app
# Main app: http://localhost:3000
# Projection: http://localhost:3000/projection.html
```

## Environment Variables

The app doesn't require any environment variables for basic functionality. All data is stored in JSON files.

If you want to customize the port:
```bash
PORT=8080 npm start
```

## File Structure for Deployment

```
talent-show-app/
├── api/
│   └── index.js          # Vercel serverless function
├── public/               # Static files
│   ├── index.html
│   ├── projection.html
│   ├── styles.css
│   ├── script.js
│   ├── data-service.js
│   ├── images/
│   └── data/
│       └── events-data.json
├── server.js            # Standalone Express server
├── package.json         # Dependencies and scripts
├── vercel.json         # Vercel configuration
└── README.md
```

## Notes

- **For Vercel**: Uses serverless functions (`api/index.js`)
- **For other platforms**: Uses Express server (`server.js`)
- **Data persistence**: JSON files in `public/data/`
- **No database required**: Everything is file-based
- **No build step**: Static files are served directly

## Recommended Deployment

For the easiest deployment experience, use **Railway** or **Render** as they handle Node.js apps very well and don't have the npm authentication issues that can occur with Vercel CLI.
