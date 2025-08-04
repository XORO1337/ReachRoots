import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const OAuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Processing authentication...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        setStatus('processing');
        setMessage('Validating authentication...');

        const token = searchParams.get('token');
        const userDataStr = searchParams.get('user');
        const error = searchParams.get('error');

        if (error) {
          console.error('OAuth error:', error);
          setStatus('error');
          setMessage('Authentication failed. Please try again.');
          setTimeout(() => navigate('/login?error=oauth_failed'), 3000);
          return;
        }

        if (!token || !userDataStr) {
          setStatus('error');
          setMessage('Invalid authentication response.');
          setTimeout(() => navigate('/login?error=missing_data'), 3000);
          return;
        }

        setMessage('Processing user data...');
        
        // Simulate a small delay for better UX
        await new Promise(resolve => setTimeout(resolve, 1000));

        const userData = JSON.parse(decodeURIComponent(userDataStr));
        
        // Validate required user data
        if (!userData.id || !userData.name || !userData.email || !userData.role) {
          throw new Error('Incomplete user data received');
        }

        setMessage('Setting up your account...');
        
        // Use the auth context to manage user state
        const userInfo = {
          id: userData.id,
          name: userData.name,
          email: userData.email,
          role: userData.role,
          isEmailVerified: userData.isEmailVerified || true, // Google OAuth users are email verified
          isPhoneVerified: userData.isPhoneVerified || false,
          isIdentityVerified: userData.isIdentityVerified || false
        };
        
        console.log('🔍 OAuth Debug - Calling login with userInfo:', userInfo);
        console.log('🔍 OAuth Debug - Token being stored:', token ? 'Present' : 'Missing');
        
        // Store user data and token
        login(userInfo, token);
        
        // Wait for the auth state to stabilize
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Verify the session was stored correctly
        const storedToken = localStorage.getItem('accessToken');
        const storedRole = localStorage.getItem('userRole');
        console.log('🔍 OAuth Debug - Verification - Stored token:', storedToken ? 'Present' : 'Missing');
        console.log('🔍 OAuth Debug - Verification - Stored role:', storedRole);
        
        if (!storedToken || !storedRole) {
          throw new Error('Failed to store authentication data');
        }
        
        setStatus('success');
        setMessage(`Welcome ${userData.name}! Redirecting to your dashboard...`);
        
        // Redirect based on role after a brief delay
        setTimeout(() => {
          console.log('🔍 OAuth Debug - Redirecting based on role:', userData.role);
          switch (userData.role) {
            case 'artisan':
              console.log('🔍 OAuth Debug - Redirecting to /artisan');
              navigate('/artisan', { replace: true });
              break;
            case 'distributor':
              console.log('🔍 OAuth Debug - Redirecting to /distributor');
              navigate('/distributor', { replace: true });
              break;
            default:
              console.log('🔍 OAuth Debug - Redirecting to / (customer or default)');
              navigate('/', { replace: true });
          }
        }, 1000);

      } catch (error) {
        console.error('Error processing OAuth callback:', error);
        setStatus('error');
        setMessage('Failed to process authentication. Please try again.');
        setTimeout(() => navigate('/login?error=processing_failed'), 3000);
      }
    };

    handleCallback();
  }, [navigate, searchParams, login]);

  const getIcon = () => {
    switch (status) {
      case 'processing':
        return <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>;
      case 'success':
        return (
          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
          </svg>
        );
      case 'error':
        return (
          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
          </svg>
        );
    }
  };

  const getBackgroundColor = () => {
    switch (status) {
      case 'processing':
        return 'from-orange-500 to-orange-600';
      case 'success':
        return 'from-green-500 to-green-600';
      case 'error':
        return 'from-red-500 to-red-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
        <div className={`w-16 h-16 bg-gradient-to-br ${getBackgroundColor()} rounded-full flex items-center justify-center shadow-lg mx-auto mb-6`}>
          {getIcon()}
        </div>
        
        <h2 className="text-xl font-semibold text-gray-800 mb-2">
          {status === 'processing' && 'Signing You In'}
          {status === 'success' && 'Success!'}
          {status === 'error' && 'Authentication Failed'}
        </h2>
        
        <p className="text-gray-600 mb-4">{message}</p>
        
        {status === 'processing' && (
          <div className="flex justify-center space-x-1">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        )}
        
        {status === 'error' && (
          <button
            onClick={() => navigate('/login')}
            className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
          >
            Back to Login
          </button>
        )}
      </div>
    </div>
  );
};

export default OAuthCallback;