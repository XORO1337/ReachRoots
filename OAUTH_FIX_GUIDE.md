# Google OAuth 404 Error - Troubleshooting Guide

## Problem Analysis
You're getting a 404 error when trying to login with Google OAuth:
```
GET https://reachroots.onrender.com/auth/callback?token=... 404 (Not Found)
```

## Root Cause
The backend is trying to redirect to `/auth/callback` on the same domain as the backend (`reachroots.onrender.com`) instead of redirecting to your frontend application.

## Solutions

### Solution 1: Fix Environment Variables (Recommended)

#### For Production on Render.com:
1. Go to your Render.com dashboard
2. Navigate to your backend service settings
3. Update the environment variables:

```bash
# If your frontend is served from the same domain as backend
CLIENT_URL=https://reachroots.onrender.com

# If your frontend is served from a different domain
CLIENT_URL=https://your-frontend-domain.com

# Add production callback URL
GOOGLE_CALLBACK_URL_PRODUCTION=https://reachroots.onrender.com/api/auth/google/callback

# Set NODE_ENV
NODE_ENV=production
```

#### For Development:
The current setup should work fine for development/codespaces.

### Solution 2: Google OAuth Configuration Check

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to APIs & Services > Credentials
3. Click on your OAuth 2.0 Client ID
4. Make sure the "Authorized redirect URIs" includes:
   - `https://reachroots.onrender.com/api/auth/google/callback` (for production)
   - Your codespace URL for development

### Solution 3: Frontend Route Configuration

Ensure your frontend properly handles the `/auth/callback` route. The current setup looks correct:

```tsx
// In AppRouter.tsx - This is already correct
<Route path="/auth/callback" element={<OAuthCallback />} />
```

### Solution 4: Backend Route Debugging

I've added debug routes to help troubleshoot:

1. Test if backend routes are working: 
   ```
   GET https://reachroots.onrender.com/api/auth/oauth-debug
   ```

2. Check what happens if someone hits the wrong callback:
   ```
   GET https://reachroots.onrender.com/api/auth/callback
   ```

## Testing the Fix

1. After updating environment variables, redeploy your backend
2. Try the Google OAuth login again
3. Check the browser network tab to see where the redirect goes
4. Check your backend logs for the debug messages I added

## Expected Flow

1. User clicks "Login with Google"
2. Frontend redirects to: `https://reachroots.onrender.com/api/auth/google`
3. Backend redirects to Google OAuth
4. Google redirects back to: `https://reachroots.onrender.com/api/auth/google/callback`
5. Backend processes OAuth and redirects to: `${CLIENT_URL}/auth/callback?token=...`
6. Frontend receives the callback and processes the token

## Quick Fix for Testing

If you want to test quickly, you can temporarily hardcode the CLIENT_URL in the backend:

```javascript
// In Auth_controller.js, line ~290
const callbackUrl = `https://reachroots.onrender.com/auth/callback?token=${accessToken}&user=${encodeURIComponent(JSON.stringify(userData))}&role=${freshUser.role}`;
```

But make sure to revert this and use environment variables for the proper fix.

## Files Modified
- `/Backend/.env` - Added production callback URL and comments
- `/Backend/config/passport.js` - Improved callback URL selection logic
- `/Backend/controllers/Auth_controller.js` - Added debug logging
- `/Backend/routes/Auth_route.js` - Added debug routes
