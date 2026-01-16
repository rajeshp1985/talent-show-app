#!/bin/bash

# Talent Show App - Vercel Deployment Script
# This script handles the complete deployment process including Vercel KV setup

set -e  # Exit on error

echo "🚀 Talent Show App - Vercel Deployment"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}❌ Vercel CLI is not installed${NC}"
    echo ""
    echo "Installing Vercel CLI..."
    npm install -g vercel
    echo -e "${GREEN}✅ Vercel CLI installed${NC}"
    echo ""
fi

# Check if user is logged in to Vercel
echo "Checking Vercel authentication..."
if ! vercel whoami &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged in to Vercel${NC}"
    echo "Please log in to Vercel:"
    vercel login
    echo ""
fi

echo -e "${GREEN}✅ Vercel authentication confirmed${NC}"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install
echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
echo ""
echo -e "${BLUE}Choose deployment type:${NC}"
echo "1) Production deployment"
echo "2) Preview deployment (default)"
echo ""
read -p "Enter choice (1 or 2): " deploy_choice

if [ "$deploy_choice" = "1" ]; then
    echo ""
    echo "Deploying to production..."
    DEPLOY_OUTPUT=$(vercel --prod --yes 2>&1)
    DEPLOY_STATUS=$?
else
    echo ""
    echo "Deploying preview..."
    DEPLOY_OUTPUT=$(vercel --yes 2>&1)
    DEPLOY_STATUS=$?
fi

echo "$DEPLOY_OUTPUT"

if [ $DEPLOY_STATUS -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Deployment successful!${NC}"
    
    # Extract deployment URL
    DEPLOY_URL=$(echo "$DEPLOY_OUTPUT" | grep -o 'https://[^ ]*' | head -1)
    
    if [ -n "$DEPLOY_URL" ]; then
        echo ""
        echo -e "${GREEN}🌐 Your app is live at:${NC}"
        echo -e "${BLUE}$DEPLOY_URL${NC}"
        echo ""
        echo -e "${BLUE}📱 Main App: $DEPLOY_URL${NC}"
        echo -e "${BLUE}📺 Projection: $DEPLOY_URL/projection.html${NC}"
        echo ""
    fi
    
    # Storage setup instructions
    echo ""
    echo -e "${YELLOW}⚠️  IMPORTANT: Set up data storage (1 minute)${NC}"
    echo ""
    echo "This app uses Vercel Redis for data persistence."
    echo ""
    echo -e "${BLUE}Quick Setup:${NC}"
    echo "1. Go to: https://vercel.com/dashboard"
    echo "2. Select your project"
    echo "3. Click 'Storage' tab"
    echo "4. Click 'Create Database' → Select 'Redis'"
    echo "5. Click 'Create' and 'Connect'"
    echo ""
    echo "Done! Environment variables are auto-configured."
    echo ""
    echo "Or run: npm run setup:redis (for detailed instructions)"
    echo ""
    echo "Without Redis, the app will work but data won't persist between deployments."
    echo ""
    
    read -p "Open Vercel dashboard now? (y/n): " open_dashboard
    
    if [ "$open_dashboard" = "y" ] || [ "$open_dashboard" = "Y" ]; then
        open "https://vercel.com/dashboard"
        echo ""
        echo "After connecting Redis, your app is ready to use!"
    fi
    
    echo ""
    echo -e "${GREEN}🎉 Deployment complete!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Set up Vercel Redis (see instructions above)"
    echo "2. Test your app at the deployment URL"
    echo "3. For production deployment, run: ./deploy.sh and choose option 1"
    echo ""
    
else
    echo ""
    echo -e "${RED}❌ Deployment failed${NC}"
    echo "Please check the error messages above and try again."
    exit 1
fi
