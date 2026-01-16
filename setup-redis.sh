#!/bin/bash

# Vercel Redis Setup Helper
# Opens Vercel dashboard for one-click Redis setup

set -e

echo "🔧 Vercel Redis Setup for Talent Show App"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}Vercel Redis - Built-in Storage for Your App${NC}"
echo ""
echo "✅ FREE Tier: 256MB storage, 10,000 commands/day"
echo "✅ One-click setup (no separate account needed)"
echo "✅ Automatically integrated with your project"
echo "✅ Environment variables auto-configured"
echo ""

echo -e "${GREEN}Setup Steps (1 minute):${NC}"
echo ""
echo "1. Go to your project on Vercel Dashboard"
echo "2. Click 'Storage' tab"
echo "3. Click 'Create Database'"
echo "4. Select 'Redis'"
echo "5. Click 'Create'"
echo "6. Click 'Connect' to your project"
echo ""
echo "Done! No manual configuration needed."
echo ""

echo -e "${YELLOW}Note:${NC}"
echo "Vercel Redis is powered by Upstash but fully integrated"
echo "into Vercel. You don't need a separate Upstash account."
echo ""

read -p "Press Enter to open Vercel dashboard..."
open "https://vercel.com/dashboard"

echo ""
echo -e "${GREEN}✅ After connecting Redis, your app will automatically use it!${NC}"
echo ""
echo "No redeploy needed - changes take effect immediately."
echo ""
