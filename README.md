# Talent Show Management App

A comprehensive web application for managing talent shows with real-time projection capabilities.

## Features

- **Split-Screen Interface**: Current event on left, upcoming events on right
- **Projection Display**: Full-screen view for audience display
- **Event Management**: Add, edit, delete, and reorder events
- **Photo Support**: Local images and web URLs
- **Real-time Updates**: Automatic synchronization between main and projection views
- **Announcements**: Support for both events and announcements

## Local Development

1. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Start the API server:**
   ```bash
   python api.py
   ```

3. **Open the application:**
   - Main interface: `http://localhost:8001/index.html`
   - Projection view: `http://localhost:8001/projection.html`

## Deployment to Vercel

### Option 1: With Python Backend (Recommended)

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel
   ```

3. **Follow the prompts:**
   - Set up and deploy: `Y`
   - Which scope: Choose your account
   - Link to existing project: `N`
   - Project name: `talent-show-app` (or your preferred name)
   - Directory: `./` (current directory)

### Option 2: Static Hosting (Simplified)

For a simpler deployment without the Python backend, you can use localStorage-only mode:

1. **Create a new repository on GitHub**
2. **Push your code:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/talent-show-app.git
   git push -u origin main
   ```

3. **Deploy to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Deploy

### Option 3: Other Free Hosting Platforms

**Netlify:**
1. Go to [netlify.com](https://netlify.com)
2. Drag and drop your project folder
3. Your app will be live instantly

**GitHub Pages:**
1. Push code to GitHub
2. Go to repository Settings > Pages
3. Select source branch (main)
4. Your app will be available at `https://yourusername.github.io/talent-show-app`

## File Structure

```
talent-show-app/
├── index.html              # Main management interface
├── projection.html         # Full-screen projection display
├── styles.css             # Application styling
├── script.js              # Main application logic
├── data-service.js        # API communication layer
├── api.py                 # Python backend server
├── events-data.json       # Data storage file
├── images/                # Local image storage
│   ├── 1.jpeg
│   └── onam-background.jpg
├── vercel.json            # Vercel deployment configuration
├── requirements.txt       # Python dependencies
└── README.md              # This file
```

## Usage

### Adding Events
1. Go to "Manage Items"
2. Click "+ Add New Item"
3. Fill in event details
4. For photos: Use file picker or enter path like `images/photo.jpg`

### Managing Shows
- **Start Next Event**: Moves first upcoming event to current
- **Finish Event**: Moves current event to finished list
- **Reorder Events**: Drag and drop or use arrow buttons

### Projection Display
- Open projection.html in full-screen mode
- Displays current event with photo and upcoming events
- Auto-refreshes every 3 seconds
- Optimized for large screens and projectors

## Photo Management

### Local Images
1. Place image files in the `images/` folder
2. Reference as `images/filename.jpg` in the form
3. Supported formats: JPG, PNG, GIF, WebP

### Web Images
- Use full URLs: `https://example.com/photo.jpg`
- Images load directly from the web

## Troubleshooting

**Images not showing:**
- Verify file exists in `images/` folder
- Check filename spelling and case
- Ensure correct file extension

**API not working:**
- Check if Python server is running on port 8001
- Verify `api.py` is accessible
- App will fall back to localStorage if API unavailable

## Browser Compatibility

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Mobile browsers: Responsive design included

## License

This project is open source and available under the MIT License.
