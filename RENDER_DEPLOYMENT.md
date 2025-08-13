# Render Deployment Guide for ReachRoots

This guide will help you deploy your ReachRoots platform to Render.com with automatic environment configuration.

## 📋 Prerequisites

1. A Render.com account
2. Your ReachRoots repository pushed to GitHub
3. MongoDB Atlas cluster (already configured in your code)

## 🚀 Deployment Steps

### Step 1: Deploy Backend Service

1. **Create a new Web Service on Render**
   - Connect your GitHub repository
   - Choose the `Backend` directory as the root directory
   - Use these settings:
     ```
     Build Command: ./build.sh
     Start Command: npm start
     Environment: Node
     ```

2. **Set Environment Variables in Render Dashboard**
   ```bash
   NODE_ENV=production
   PORT=10000
   
   # Optional: Set custom URLs if auto-detection doesn't work
   # CLIENT_URL=https://your-frontend-service.onrender.com
   # BACKEND_URL=https://your-backend-service.onrender.com
   
   # For enhanced security, you can override JWT secrets:
   # JWT_ACCESS_SECRET=your-new-secure-secret-here
   # JWT_REFRESH_SECRET=your-new-secure-refresh-secret-here
   ```

3. **Deploy the backend service**
   - Click "Create Web Service"
   - Wait for deployment to complete
   - Note down the service URL (e.g., `https://your-backend-service.onrender.com`)

### Step 2: Deploy Frontend Service

1. **Create a new Static Site on Render**
   - Connect the same GitHub repository
   - Choose the `frontend2` directory as the root directory
   - Use these settings:
     ```
     Build Command: ./build.sh
     Publish Directory: dist
     ```

2. **Set Environment Variables in Render Dashboard**
   ```bash
   VITE_API_URL=https://your-backend-service.onrender.com
   ```
   Replace `your-backend-service` with the actual backend service URL from Step 1.

3. **Deploy the frontend service**
   - Click "Create Static Site"
   - Wait for deployment to complete
   - Note down the frontend URL (e.g., `https://your-frontend-service.onrender.com`)

### Step 3: Update Backend CORS Configuration

1. **Go back to your backend service in Render**
2. **Add/Update environment variables:**
   ```bash
   CLIENT_URL=https://your-frontend-service.onrender.com
   CORS_ORIGIN=https://your-frontend-service.onrender.com
   ```
   Replace `your-frontend-service` with the actual frontend URL from Step 2.

3. **Redeploy the backend service** to apply the new CORS settings

### Step 4: Update Google OAuth (if using)

1. **Go to Google Cloud Console**
2. **Update OAuth redirect URIs:**
   - Add: `https://your-backend-service.onrender.com/api/auth/google/callback`
   - Add: `https://your-frontend-service.onrender.com` (for allowed origins)

## 🔧 Environment Variables Reference

### Backend Environment Variables (Auto-configured)
The build script automatically configures most variables. You only need to set:

**Required:**
- `NODE_ENV=production`
- `PORT=10000` (or let Render set it automatically)

**Optional (for customization):**
- `CLIENT_URL` - Frontend URL (auto-detected)
- `BACKEND_URL` - Backend URL (auto-detected from RENDER_EXTERNAL_URL)
- `JWT_ACCESS_SECRET` - Custom JWT secret (uses default if not set)
- `JWT_REFRESH_SECRET` - Custom refresh secret (uses default if not set)

### Frontend Environment Variables

**Required:**
- `VITE_API_URL` - Your backend service URL

## 🔍 Automatic Features

### Backend Auto-Configuration:
- ✅ PORT: Uses Render's `$PORT` or defaults to 10000
- ✅ Database: Automatically uses MongoDB Atlas
- ✅ URLs: Auto-detects from Render environment variables
- ✅ CORS: Dynamically allows frontend origin
- ✅ Backup: Disabled automatically (Render has no persistent storage)

### Frontend Auto-Configuration:
- ✅ API URL: Uses environment variable or shows error
- ✅ Build: Automatically optimized for production

## 🐛 Troubleshooting

### CORS Errors:
1. Check that `CLIENT_URL` is set correctly in backend
2. Verify frontend URL matches exactly (no trailing slash)
3. Redeploy backend after changing CORS settings

### API Connection Issues:
1. Verify `VITE_API_URL` points to correct backend URL
2. Check backend service is running
3. Test API directly: `https://your-backend-service.onrender.com/api/health`

### Database Connection Issues:
1. MongoDB Atlas should work automatically
2. Check MongoDB Atlas allows connections from 0.0.0.0/0
3. Verify connection string is correct

## 📱 Testing Deployment

1. **Backend Health Check:** 
   - Visit: `https://your-backend-service.onrender.com/api/health`
   - Should return: `{"status":"OK","timestamp":"..."}`

2. **Frontend Loading:**
   - Visit your frontend URL
   - Check browser console for any errors
   - Test user registration/login

3. **Full Integration:**
   - Test product browsing
   - Test cart functionality
   - Test user authentication

## 🔒 Production Security Checklist

- [ ] Generate new JWT secrets for production
- [ ] Enable HTTPS (automatic on Render)
- [ ] Set restrictive CORS origins
- [ ] Disable development debugging
- [ ] Monitor logs for any issues

## 📞 Support

If you encounter issues:
1. Check Render service logs
2. Verify all environment variables are set correctly
3. Test API endpoints directly
4. Check browser network tab for failed requests

Your ReachRoots platform should now be live and fully functional on Render! 🎉
