#!/bin/bash
# Render Build Script for Frontend

echo "🚀 Starting Render Frontend Build Process..."

echo "📦 Installing dependencies..."
npm install

echo "🔧 Setting up environment for production..."

# Create production environment file
if [ ! -z "$VITE_API_URL" ]; then
    echo "✅ Using VITE_API_URL from environment: $VITE_API_URL"
    echo "VITE_API_URL=$VITE_API_URL" > .env.production
else
    echo "⚠️ VITE_API_URL not set in environment variables"
    echo "📝 Please set VITE_API_URL in your Render service environment variables"
    echo "🔗 Example: https://your-backend-service.onrender.com"
    
    # Create a placeholder that will need to be updated
    echo "VITE_API_URL=https://your-backend-service.onrender.com" > .env.production
    echo "⚠️ Using placeholder API URL - update in Render dashboard!"
fi

echo "🏗️ Building the application for production..."
npm run build

echo "✅ Frontend build completed successfully!"
echo "📋 Next steps for Render deployment:"
echo "   1. Set VITE_API_URL environment variable to your backend service URL"
echo "   2. Deploy this frontend service"
echo "   3. Update backend CORS settings with this frontend URL"
echo "🚀 Ready for deployment!"
