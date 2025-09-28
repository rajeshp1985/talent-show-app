#!/bin/bash

echo "🚀 Talent Show App Deployment Script"
echo "======================================"

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📁 Initializing Git repository..."
    git init
    git add .
    git commit -m "Initial commit - Talent Show App"
    echo "✅ Git repository initialized"
else
    echo "📁 Git repository already exists"
    echo "💾 Adding and committing changes..."
    git add .
    git commit -m "Update: $(date)"
    echo "✅ Changes committed"
fi

echo ""
echo "🌐 Deployment Options:"
echo "1. Vercel (with Python backend)"
echo "2. Netlify (static hosting)"
echo "3. GitHub Pages (static hosting)"
echo ""

read -p "Choose deployment option (1-3): " choice

case $choice in
    1)
        echo "🔧 Deploying to Vercel..."
        if command -v vercel &> /dev/null; then
            vercel
        else
            echo "❌ Vercel CLI not found. Installing..."
            npm install -g vercel
            vercel
        fi
        ;;
    2)
        echo "🔧 Preparing for Netlify deployment..."
        echo "📋 Next steps:"
        echo "1. Go to https://netlify.com"
        echo "2. Drag and drop this project folder"
        echo "3. Your app will be live instantly!"
        ;;
    3)
        echo "🔧 Preparing for GitHub Pages..."
        echo "📋 Next steps:"
        echo "1. Create a repository on GitHub"
        echo "2. Push this code:"
        echo "   git remote add origin https://github.com/yourusername/talent-show-app.git"
        echo "   git branch -M main"
        echo "   git push -u origin main"
        echo "3. Enable GitHub Pages in repository settings"
        ;;
    *)
        echo "❌ Invalid option. Please run the script again."
        ;;
esac

echo ""
echo "✨ Deployment preparation complete!"
echo "📖 Check README.md for detailed instructions"
