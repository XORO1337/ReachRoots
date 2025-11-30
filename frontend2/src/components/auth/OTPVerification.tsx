import React, { useState, useEffect } from 'react';
<<<<<<< HEAD
=======
import { useTranslation } from 'react-i18next';
>>>>>>> fixed-repo/main
import { API_CONFIG, buildApiUrl } from '../../config/api';

interface OTPVerificationProps {
  email: string;
  action: 'login' | 'signup';
  onVerified: (userData: any) => void;
  onCancel: () => void;
  devOtpCode?: string;
}

const OTPVerification: React.FC<OTPVerificationProps> = ({
  email,
  action,
  onVerified,
  onCancel,
  devOtpCode
}) => {
<<<<<<< HEAD
=======
  const { t } = useTranslation();
>>>>>>> fixed-repo/main
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [canResend, setCanResend] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return; // Prevent pasting multiple characters
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }

    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerifyOTP = async () => {
    const otpString = otp.join('');
    
    if (otpString.length !== 6) {
<<<<<<< HEAD
      setError('Please enter the complete 6-digit OTP');
=======
      setError(t('otp.enterComplete'));
>>>>>>> fixed-repo/main
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.AUTH.VERIFY_OTP), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email,
          otp: otpString,
          action
        }),
      });

      const data = await response.json();

      if (data.success) {
        onVerified(data.data);
      } else {
<<<<<<< HEAD
        setError(data.message || 'OTP verification failed');
=======
        setError(data.message || t('otp.verificationFailed'));
>>>>>>> fixed-repo/main
        // Clear OTP on error
        setOtp(['', '', '', '', '', '']);
        document.getElementById('otp-0')?.focus();
      }
    } catch (error) {
      console.error('OTP verification error:', error);
<<<<<<< HEAD
      setError('Network error. Please try again.');
=======
      setError(t('otp.networkError'));
>>>>>>> fixed-repo/main
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setResendLoading(true);
    setError('');

    try {
      const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.AUTH.RESEND_OTP), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (data.success) {
        setTimeLeft(300); // Reset timer
        setCanResend(false);
        setOtp(['', '', '', '', '', '']); // Clear current OTP
        document.getElementById('otp-0')?.focus();
      } else {
<<<<<<< HEAD
        setError(data.message || 'Failed to resend OTP');
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      setError('Network error. Please try again.');
=======
        setError(data.message || t('otp.resendFailed'));
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      setError(t('otp.networkError'));
>>>>>>> fixed-repo/main
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
<<<<<<< HEAD
            Verify Email
          </h2>
          <p className="text-gray-600">
            We've sent a 6-digit code to
=======
            {t('otp.verifyEmail')}
          </h2>
          <p className="text-gray-600">
            {t('otp.sentCode')}
>>>>>>> fixed-repo/main
          </p>
          <p className="font-medium text-gray-900">{email}</p>
        </div>

        {devOtpCode && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
<<<<<<< HEAD
            <p className="text-yellow-800 text-sm font-medium">Development Mode OTP: <span className="font-bold text-lg">{devOtpCode}</span></p>
            <p className="text-xs text-yellow-600 mt-1">Use this code to verify (Emails are simulated)</p>
=======
            <p className="text-yellow-800 text-sm font-medium">{t('otp.devModeOtp')}: <span className="font-bold text-lg">{devOtpCode}</span></p>
            <p className="text-xs text-yellow-600 mt-1">{t('otp.devModeHint')}</p>
>>>>>>> fixed-repo/main
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <div className="mb-6">
          <div className="flex justify-center space-x-2 mb-4">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-${index}`}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                disabled={isLoading}
              />
            ))}
          </div>

          <div className="text-center text-sm text-gray-600 mb-4">
            {timeLeft > 0 ? (
<<<<<<< HEAD
              <p>Time remaining: {formatTime(timeLeft)}</p>
            ) : (
              <p className="text-red-600">OTP expired</p>
=======
              <p>{t('otp.timeRemaining')}: {formatTime(timeLeft)}</p>
            ) : (
              <p className="text-red-600">{t('otp.expired')}</p>
>>>>>>> fixed-repo/main
            )}
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleVerifyOTP}
            disabled={isLoading || otp.join('').length !== 6}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
<<<<<<< HEAD
            {isLoading ? 'Verifying...' : 'Verify OTP'}
=======
            {isLoading ? t('otp.verifying') : t('otp.verifyOtp')}
>>>>>>> fixed-repo/main
          </button>

          <button
            onClick={handleResendOTP}
            disabled={!canResend || resendLoading}
            className="w-full text-blue-600 py-2 px-4 rounded-lg font-medium hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
<<<<<<< HEAD
            {resendLoading ? 'Sending...' : 'Resend OTP'}
=======
            {resendLoading ? t('otp.sending') : t('otp.resendOtp')}
>>>>>>> fixed-repo/main
          </button>

          <button
            onClick={onCancel}
            disabled={isLoading}
            className="w-full text-gray-600 py-2 px-4 rounded-lg font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
<<<<<<< HEAD
            Cancel
=======
            {t('common.cancel')}
>>>>>>> fixed-repo/main
          </button>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;
