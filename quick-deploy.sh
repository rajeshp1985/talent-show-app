#!/bin/bash

# Quick Deploy Script - Complete automated deployment
# This script handles everything: install, deploy, and setup instructions

set -e

echo "⚡ Quick Deploy - Talent Show App"
echo "=================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Step 1: Check/Install Vercel CLI
echo "Step 1/4: Checking Vercel CLI..."
if ! command -v vercel &> /dev/null; then
    echo "Installing Vercel CLI..."
    npm install -g vercel
    echo -e "${GREEN}✅ Vercel CLI installed${NC}"
else
    echo -e "${GREEN}✅ Vercel CLI already installed${NC}"
fi
echo ""

# Step 2: Check authentication
echo "Step 2/4: Checking Vercel authentication..."
if ! vercel whoami &> /dev/null; then
    echo "Please log in to Vercel:"
    vercel login
fi
echo -e "${GREEN}✅ Authenticated${NC}"
echo ""

# Step 3: Install dependencies
echo "Step 3/4: Installing dependencies..."
npm install
echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Step 4: Deploy
echo "Step 4/4: Deploying to Vercel..."
echo ""

# Deploy and capture output
DEPLOY_OUTPUT=$(vercel --yes 2>&1)
echo "$DEPLOY_OUTPUT"

# Extract URL
DEPLOY_URL=$(echo "$DEPLOY_OUTPUT" | grep -o 'https://[^ ]*' | head -1)

echo ""
echo -e "${GREEN}✅ Deployment successful!${NC}"
echo ""
echo -e "${BLUE}🌐 Your app is live at:${NC}"
echo -e "${GREEN}$DEPLOY_URL${NC}"
echo ""
echo -e "${BLUE}📱 Main App:${NC} $DEPLOY_URL"
echo -e "${BLUE}📺 Projection:${NC} $DEPLOY_URL/projection.html"
echo -e "${BLUE}🔧 API Status:${NC} $DEPLOY_URL/api/status"
echo ""

# Storage setup instructions
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${YELLOW}⚠️  IMPORTANT: Set up data storage (1 minute)${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Your app is deployed but needs Vercel Redis for data persistence."
echo ""
echo -e "${BLUE}Quick Setup:${NC}"
echo "1. Go to: https://vercel.com/dashboard"
echo "2. Select your project"
echo "3. Click 'Storage' tab"
echo "4. Click 'Create Database' → Select 'Redis'"
echo "5. Click 'Create' and 'Connect'"
echo ""
echo "For detailed instructions: npm run setup:redis"
echo ""

read -p "Open Vercel dashboard now? (y/n): " open_dashboard

if [ "$open_dashboard" = "y" ] || [ "$open_dashboard" = "Y" ]; then
    open "https://vercel.com/dashboard"
    echo ""
    echo "After connecting Redis, your app is ready!"
fi

echo ""
echo -e "${GREEN}🎉 Quick deploy complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Set up Vercel KV (see instructions above)"
echo "2. Test your app at: $DEPLOY_URL"
echo "3. For production: vercel --prod"
echo ""
