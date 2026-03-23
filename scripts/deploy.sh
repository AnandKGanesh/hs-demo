#!/bin/bash

# ==========================================
# NETLIFY DEPLOYMENT SCRIPT
# ==========================================
# Usage: npm run deploy
# 
# This script:
# 1. Checks for required environment variables
# 2. Replaces localhost with production API URL
# 3. Builds the project
# 4. Deploys to Netlify

set -e

echo "🚀 Starting deployment to Netlify..."
echo ""

# Check if REACT_APP_API_URL is set
if [ -z "$REACT_APP_API_URL" ]; then
    echo "❌ ERROR: REACT_APP_API_URL is not set!"
    echo ""
    echo "Please set your backend URL:"
    echo "  export REACT_APP_API_URL=https://your-api.onrender.com"
    echo ""
    echo "Or create a .env file with:"
    echo "  REACT_APP_API_URL=https://your-api.onrender.com"
    exit 1
fi

echo "✓ Using API URL: $REACT_APP_API_URL"
echo ""

# Check if netlify is authenticated
echo "🔑 Checking Netlify authentication..."
if ! npx netlify status &>/dev/null; then
    echo "❌ Not logged in to Netlify"
    echo "Running: npm run deploy:setup"
    npx netlify login
fi
echo "✓ Authenticated with Netlify"
echo ""

# Check if site is linked
if [ ! -f .netlify/state.json ]; then
    echo "🔗 Linking to Netlify site..."
    npx netlify link
fi
echo "✓ Site linked"
echo ""

# Create production config
echo "⚙️  Updating API configuration..."
cat > client/src/config.js << EOF
// API Configuration - Auto-generated for production
const API_BASE_URL = '${REACT_APP_API_URL}';
export default API_BASE_URL;
EOF
echo "✓ Config updated"
echo ""

# Build the project
echo "🏗️  Building project..."
cd client && npm run build
echo "✓ Build complete"
echo ""

# Deploy to Netlify
echo "📦 Deploying to Netlify..."
npx netlify deploy --prod --dir=dist --message="Deploy v$(date +%Y%m%d-%H%M%S)"
echo ""

# Restore development config
echo "🔄 Restoring development configuration..."
cat > client/src/config.js << 'EOF'
// API Configuration
// Change this to your production backend URL when deploying
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5252';
export default API_BASE_URL;
EOF

echo ""
echo "✅ DEPLOYMENT SUCCESSFUL!"
echo ""
echo "Your site is now live on Netlify 🎉"
echo ""
