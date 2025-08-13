#!/bin/bash
# Render Build Script for Backend

echo "🚀 Starting Render Backend Build Process..."

echo "📦 Installing dependencies..."
npm install

echo "🔧 Setting up environment for production..."

# Create dynamic .env file for production with auto-detection
cat > .env << 'EOF'
# Auto-generated production environment file
NODE_ENV=production

# MongoDB Configuration
MONGO_URI=mongodb+srv://hardikmadaan10c:G1TChvcDVYeVX50A@rootsreach.itowhi7.mongodb.net/?retryWrites=true&w=majority&appName=RootsReach
DB_CONNECTION_STRATEGY=atlas_only
DB_CONNECTION_TIMEOUT=10000
DB_RETRY_ATTEMPTS=5
DB_RETRY_DELAY=3000

# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=gamerroyale441@gmail.com
SMTP_PASS=wrepaofayynytubd
SMTP_FROM=RootsReach <no-reply@rootsreach.com>

# ImageKit Configuration
IMAGEKIT_PUBLIC_KEY=public_aXt4xAkuIVAvZRoYwtnTHDl/Up8=
IMAGEKIT_PRIVATE_KEY=private_AlI0r7y/FO33HZVi87rBh7IzRkY=
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/reelProMe/Rootsreach

# Developer Access (disabled in production)
DEV_ACCESS_KEY=dev-xoro-backend-2025-secure-key

# JWT Configuration
JWT_ACCESS_SECRET=5c2f58d786f111acdbfdfadbcda6681aed0d1378a558fb361d2747ecf78eb4ac0765b980a1a7200aa8aaf3fc5c6af383b7884c42e961c928579be89d6f6bfcb431a9a79314059d313e43dacf529296fbd8a001cd8a29f110125ea3a30316c19b11d99379af56830512cf794e35de0314ae433c1dcdd9df0e49affd21ce0f33b4
JWT_REFRESH_SECRET=ca8b361506ad3552988c2b1fef6b8bf80c15e22c8f4a578e12baa50f5676a17d4b740b877b860b62baa8cc551eb3917a3ab2b25999edd547a8b51afab3f2b5a4984bf6f8c50713a8c97f9192469a89026a38a3ea0308b90703cdf1f4be88cb5bce247eb0999d49641ba12fe30d107e84f350ff9776cd5292f6a36078e372c029
JWT_ACCESS_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# Google OAuth Configuration
GOOGLE_CLIENT_ID=988113983317-4armihmvukshj3fovj0avuhoc9apl33p.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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

# Twilio Configuration
TWILIO_ACCOUNT_SID=ACb1ce3d6601f3f94613aae4c00a63eb12
TWILIO_AUTH_TOKEN=563387d3e7be06109458a7485ee797d4
TWILIO_VERIFY_SERVICE_SID=VA034cd0497849840a2ad697eebc23513d

# Aadhaar Verification API Configuration
AADHAAR_API_BASE_URL=https://api.aadhaarapi.com/v1
AADHAAR_API_KEY=your_aadhaar_api_key_here
AADHAAR_CLIENT_ID=your_aadhaar_client_id_here
AADHAAR_CLIENT_SECRET=your_aadhaar_client_secret_here
AADHAAR_HASH_SALT=your_aadhaar_hash_salt_make_it_very_long_and_random

# Security Configuration
BCRYPT_SALT_ROUNDS=13
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# Rate Limiting Configuration (production settings)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
AUTH_RATE_LIMIT_MAX_REQUESTS=10
OTP_RATE_LIMIT_MAX_REQUESTS=5

# Backup Configuration (disabled for Render - no persistent storage)
BACKUP_ENABLED=false
BACKUP_INTERVAL_HOURS=24
BACKUP_PATH=./backups
AUTO_IMPORT_TO_LOCAL=false
BACKUP_RETRY_ATTEMPTS=1
EOF

echo "✅ Base environment configured"
echo "🔍 Port and URLs will be auto-detected at runtime from Render environment variables"
echo "   - PORT: Render provides this automatically"
echo "   - CLIENT_URL: Auto-detected from service naming or environment variables"
echo "   - BACKEND_URL: Auto-detected from RENDER_EXTERNAL_URL"

echo "✅ Backend build completed successfully!"
echo "🚀 Ready for deployment!"
