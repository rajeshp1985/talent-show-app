#!/bin/bash

# Configuration Verification Script
# Checks if the app is properly configured for Vercel deployment

echo "🔍 Verifying Vercel Configuration"
echo "=================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

ERRORS=0
WARNINGS=0

# Check if required files exist
echo "📁 Checking required files..."

if [ -f "vercel.json" ]; then
    echo -e "${GREEN}✅ vercel.json exists${NC}"
else
    echo -e "${RED}❌ vercel.json missing${NC}"
    ERRORS=$((ERRORS + 1))
fi

if [ -f "package.json" ]; then
    echo -e "${GREEN}✅ package.json exists${NC}"
else
    echo -e "${RED}❌ package.json missing${NC}"
    ERRORS=$((ERRORS + 1))
fi

if [ -f "api/index.js" ]; then
    echo -e "${GREEN}✅ api/index.js exists${NC}"
else
    echo -e "${RED}❌ api/index.js missing${NC}"
    ERRORS=$((ERRORS + 1))
fi

if [ -d "public" ]; then
    echo -e "${GREEN}✅ public directory exists${NC}"
else
    echo -e "${RED}❌ public directory missing${NC}"
    ERRORS=$((ERRORS + 1))
fi

echo ""
echo "📦 Checking dependencies..."

if [ -d "node_modules" ]; then
    echo -e "${GREEN}✅ node_modules exists${NC}"
else
    echo -e "${YELLOW}⚠️  node_modules missing - run 'npm install'${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

# Check package.json for required dependencies
if grep -q "express" package.json; then
    echo -e "${GREEN}✅ express dependency found${NC}"
else
    echo -e "${RED}❌ express dependency missing${NC}"
    ERRORS=$((ERRORS + 1))
fi

if grep -q "ioredis" package.json; then
    echo -e "${GREEN}✅ ioredis dependency found${NC}"
else
    echo -e "${RED}❌ ioredis dependency missing${NC}"
    ERRORS=$((ERRORS + 1))
fi

echo ""
echo "🔧 Checking Vercel configuration..."

# Check vercel.json structure
if grep -q "api/index.js" vercel.json; then
    echo -e "${GREEN}✅ API route configured${NC}"
else
    echo -e "${RED}❌ API route not configured${NC}"
    ERRORS=$((ERRORS + 1))
fi

echo ""
echo "🚀 Checking deployment scripts..."

if [ -f "deploy.sh" ] && [ -x "deploy.sh" ]; then
    echo -e "${GREEN}✅ deploy.sh exists and is executable${NC}"
else
    echo -e "${YELLOW}⚠️  deploy.sh not executable - run 'chmod +x deploy.sh'${NC}"
    WARNINGS=$((WARNINGS + 1))
fi

echo ""
echo "=================================="
echo "Summary:"
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed! Ready to deploy.${NC}"
    echo ""
    echo "To deploy, run:"
    echo "  npm run deploy"
    echo ""
    echo "Or:"
    echo "  ./deploy.sh"
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  $WARNINGS warning(s) found${NC}"
    echo "You can still deploy, but consider fixing the warnings."
    echo ""
    echo "To deploy, run:"
    echo "  npm run deploy"
else
    echo -e "${RED}❌ $ERRORS error(s) found${NC}"
    echo "Please fix the errors before deploying."
    exit 1
fi
