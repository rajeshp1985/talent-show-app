# Running the Talent Show App Locally

## Prerequisites
- Node.js 18.0.0 or higher
- npm (comes with Node.js)

## Method 1: Using Standalone Express Server (Recommended - No Vercel Required)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Run the Standalone Server
```bash
npm start
```
or
```bash
npm run dev:local
```
or
```bash
node server.js
```

This will start a standalone Express server which:
- Serves static files from the `public/` directory
- Runs all API endpoints at `/api/*`
- Runs on `http://localhost:3000`
- **No Vercel CLI required!**

### Step 3: Access the Application
- **Main App:** `http://localhost:3000` (serves `public/index.html`)
- **Projection View:** `http://localhost:3000/projection.html`
- **API Status:** `http://localhost:3000/api/status`

## Method 2: Using Vercel CLI (Alternative)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Run the Development Server
```bash
npm run dev
```
or
```bash
npx vercel dev
```

This will start the Vercel development server which:
- Serves static files from the `public/` directory
- Runs the serverless API function at `/api/*` endpoints
- Typically runs on `http://localhost:3000`

### Step 3: Access the Application
- **Main App:** `http://localhost:3000` (serves `public/index.html`)
- **Projection View:** `http://localhost:3000/projection.html`
- **API Status:** `http://localhost:3000/api/status`

## Method 2: Alternative Local Server (if Vercel CLI issues)

If you encounter issues with Vercel CLI, you can run a simple static server:

### Step 1: Install a Static Server
```bash
npm install -g http-server
```

### Step 2: Serve Static Files
```bash
cd public
http-server -p 3000 --cors
```

**Note:** This method only serves static files. API endpoints won't work without the Vercel serverless function runtime.

## Method 3: Using Python (Simple Static Server)

If you have Python installed:

```bash
cd public
# Python 3
python -m http.server 3000
# or Python 2
python -m SimpleHTTPServer 3000
```

## API Endpoints

When running with Vercel dev, these API endpoints are available:

- `GET /api/status` - Check API status
- `GET /api/data` - Get all data
- `GET /api/events` - Get pending events
- `POST /api/events` - Add new event
- `GET /api/current` - Get current event
- `POST /api/start-next` - Start next event
- `POST /api/finish-current` - Finish current event
- `GET /api/finished` - Get finished events

## Troubleshooting

### Vercel CLI Authentication Issues
If you see npm authentication errors:
1. Try using `npx vercel dev` instead of global installation
2. Or use Method 2/3 for static file serving only

### Port Already in Use
If port 3000 is busy:
```bash
npx vercel dev --listen 3001
```

### File Permission Issues
Make sure you have read/write permissions in the project directory for the data files.

## Development Workflow

1. Start the development server: `npm run dev`
2. Open `http://localhost:3000` in your browser
3. Use the main interface to manage events
4. Open `http://localhost:3000/projection.html` in a second browser/screen for projection view
5. The app will automatically save data to `public/data/events-data.json`

## Project Structure

```
talent-show-app/
├── api/
│   └── index.js          # Serverless API function
├── public/               # Static files served by web server
│   ├── index.html        # Main application interface
│   ├── projection.html   # Projection/display view
│   ├── styles.css        # Styling
│   ├── script.js         # Main app logic
│   ├── data-service.js   # API communication
│   ├── images/           # Image assets
│   └── data/
│       └── events-data.json  # Data storage
├── package.json          # Project configuration
└── vercel.json          # Vercel deployment config
