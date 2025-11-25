#!/bin/bash

# Build script for ReachRoots MERN Stack Application
# This script builds the frontend and packages everything into standalone binaries

set -e  # Exit on any error

echo "🚀 Starting ReachRoots Build Process..."
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -d "Backend" ] || [ ! -d "frontend2" ]; then
    print_error "Please run this script from the root directory of the ReachRoots project"
    exit 1
fi

# Create dist directory
print_status "Creating distribution directory..."
mkdir -p dist

# Build Frontend
print_status "Building React frontend..."
cd frontend2

if [ ! -d "node_modules" ]; then
    print_status "Installing frontend dependencies..."
    npm install
fi

print_status "Building production frontend..."
npm run build

if [ ! -d "dist" ]; then
    print_error "Frontend build failed - dist directory not found"
    exit 1
fi

print_success "Frontend built successfully"

# Go back to root
cd ..

# Build Backend binaries
print_status "Building backend binaries..."
cd Backend

if [ ! -d "node_modules" ]; then
    print_status "Installing backend dependencies..."
    npm install
fi

print_status "Creating standalone binaries for multiple platforms..."
print_status "This may take a few minutes..."

# Build for multiple platforms
npm run build

if [ ! -f "../dist/reachroots-win.exe" ] || [ ! -f "../dist/reachroots-linux" ] || [ ! -f "../dist/reachroots-macos" ]; then
    print_error "Binary creation failed"
    exit 1
fi

print_success "Binaries created successfully!"

# Go back to root
cd ..

# Create a simple .env.example for the binary
print_status "Creating environment configuration template..."
cat > dist/.env.example << 'EOF'
# Environment Configuration for ReachRoots Binary
# Copy this file to .env and fill in your values

# Server Configuration
PORT=5000
NODE_ENV=production

# MongoDB Configuration (Required - MongoDB must be running separately)
MONGODB_URI=mongodb://localhost:27017/reachroots
MONGODB_URI_SECONDARY=mongodb://localhost:27017/reachroots_secondary

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-refresh-secret-key-change-this-too

# Session Configuration
SESSION_SECRET=your-session-secret-key

# Email Configuration (for notifications)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-email-password

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Razorpay Payment Gateway (optional)
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret

# Twilio SMS (optional)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=your-twilio-phone-number

# ImageKit (optional)
IMAGEKIT_PUBLIC_KEY=your-imagekit-public-key
IMAGEKIT_PRIVATE_KEY=your-imagekit-private-key
IMAGEKIT_URL_ENDPOINT=your-imagekit-url-endpoint

# CORS Configuration
CLIENT_URL=http://localhost:3000
EOF

print_success "Build completed successfully!"
echo ""
echo "📦 Generated binaries:"
echo "  - dist/reachroots-win.exe (Windows)"
echo "  - dist/reachroots-linux (Linux)"
echo "  - dist/reachroots-macos (macOS)"
echo ""
echo "📋 Next steps:"
echo "  1. Copy dist/.env.example to dist/.env and configure your settings"
echo "  2. Make sure MongoDB is running on your system"
echo "  3. Run the appropriate binary for your platform:"
echo "     - Windows: ./dist/reachroots-win.exe"
echo "     - Linux: ./dist/reachroots-linux"
echo "     - macOS: ./dist/reachroots-macos"
echo ""
echo "🌐 The application will be available at http://localhost:5000"
echo "🔍 Health check: http://localhost:5000/api/health"