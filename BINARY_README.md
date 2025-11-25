# ReachRoots Binary Distribution

This document explains how to use the standalone binary version of the ReachRoots MERN stack application.

## Prerequisites

Before running the binary, ensure you have:

1. **MongoDB** running on your system
   - Install MongoDB Community Server from [mongodb.com](https://www.mongodb.com/try/download/community)
   - Or use MongoDB Atlas (cloud)
   - Default connection: `mongodb://localhost:27017/reachroots`

2. **Environment Configuration**
   - Copy `dist/.env.example` to `dist/.env`
   - Edit the `.env` file with your configuration values

## Quick Start

### 1. Build the Application

```bash
# From the project root directory
./build.sh
```

This will:
- Build the React frontend
- Create standalone binaries for Windows, Linux, and macOS
- Generate an environment configuration template

### 2. Configure Environment

```bash
# Copy the example environment file
cp dist/.env.example dist/.env

# Edit the environment file with your settings
nano dist/.env  # or use your preferred editor
```

### 3. Run the Binary

Choose the appropriate binary for your platform:

**Windows:**
```cmd
dist\reachroots-win.exe
```

**Linux:**
```bash
./dist/reachroots-linux
```

**macOS:**
```bash
./dist/reachroots-macos
```

### 4. Access the Application

- **Web Application:** http://localhost:5000
- **API Health Check:** http://localhost:5000/api/health
- **API Documentation:** http://localhost:5000/api (JSON response with available endpoints)

## Environment Variables

### Required

```env
# MongoDB Connection (Required)
MONGODB_URI=mongodb://localhost:27017/reachroots
MONGODB_URI_SECONDARY=mongodb://localhost:27017/reachroots_secondary

# JWT Secrets (Required)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-refresh-secret-key-change-this-too

# Session Secret (Required)
SESSION_SECRET=your-session-secret-key
```

### Optional (but recommended for full functionality)

```env
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-email-password

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Payment Gateway (Razorpay)
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret

# SMS Service (Twilio)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=your-twilio-phone-number

# Image Upload Service (ImageKit)
IMAGEKIT_PUBLIC_KEY=your-imagekit-public-key
IMAGEKIT_PRIVATE_KEY=your-imagekit-private-key
IMAGEKIT_URL_ENDPOINT=your-imagekit-url-endpoint
```

## Features Included

The binary includes the complete MERN stack application with:

- ✅ **Frontend:** React application with modern UI
- ✅ **Backend:** Express.js API server
- ✅ **Database:** MongoDB integration (external)
- ✅ **Authentication:** JWT, Google OAuth, Phone verification
- ✅ **Security:** Rate limiting, CORS, Helmet, RBAC
- ✅ **File Upload:** ImageKit integration
- ✅ **Payments:** Razorpay integration
- ✅ **SMS:** Twilio integration
- ✅ **Email:** Nodemailer integration

## Troubleshooting

### Binary won't start
- Ensure MongoDB is running
- Check that `.env` file exists and has correct values
- Verify the binary has execute permissions (Linux/macOS)

### Database connection errors
- Make sure MongoDB is running on the specified port
- Check `MONGODB_URI` in your `.env` file
- For MongoDB Atlas, use the connection string provided by Atlas

### Port already in use
- Change the `PORT` in your `.env` file
- Default port is 5000

### Frontend not loading
- Ensure the frontend was built correctly during the build process
- Check that the `dist` folder exists in the binary directory

## Development vs Production

This binary is configured for production use. For development:
- Use `npm run dev` in the Backend directory
- Use `npm run dev` in the frontend2 directory
- MongoDB should still be running externally

## File Structure

```
dist/
├── reachroots-win.exe    # Windows binary
├── reachroots-linux      # Linux binary
├── reachroots-macos      # macOS binary
├── .env.example         # Environment template
└── .env                 # Your configuration (create this)
```

## Support

If you encounter issues:
1. Check the console output for error messages
2. Verify all environment variables are set correctly
3. Ensure MongoDB is accessible
4. Check the health endpoint: http://localhost:5000/api/health

## Security Notes

- Change all default secrets in production
- Use strong passwords for database access
- Keep your `.env` file secure and never commit it to version control
- Regularly update MongoDB and your system