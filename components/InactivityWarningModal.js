/**
 * Inactivity Warning Modal Component
 * 
 * Shows when admin is about to be logged out due to inactivity.
 * Allows extending the session by clicking "Stay Logged In" button.
 */

import React from 'react';
import { useInactivityWarning } from '@/lib/autoLogout';

export default function InactivityWarningModal() {
  const { showWarning, extend, logout } = useInactivityWarning();
  const [seconds, setSeconds] = React.useState(0);
  
  React.useEffect(() => {
    if (!showWarning) return;
    
    setSeconds(300); // 5 minutes
    
    const interval = setInterval(() => {
      setSeconds(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [showWarning]);
  
  if (!showWarning) return null;
  
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-sm w-full mx-4">
        {/* Header */}
        <div className="bg-yellow-50 border-b border-yellow-200 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="text-yellow-600 text-2xl">⏱️</div>
            <h2 className="text-lg font-semibold text-gray-900">
              Session About to Expire
            </h2>
          </div>
        </div>
        
        {/* Body */}
        <div className="px-6 py-4">
          <p className="text-gray-700 mb-4">
            You will be automatically logged out due to inactivity.
          </p>
          
          {/* Timer */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-center">
            <p className="text-sm text-gray-600 mb-2">Time remaining:</p>
            <p className="text-3xl font-bold text-gray-900">
              {String(minutes).padStart(2, '0')}:{String(secs).padStart(2, '0')}
            </p>
          </div>
          
          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
            <p className="text-sm text-blue-700">
              💡 Click "Stay Logged In" to continue your session.
            </p>
          </div>
        </div>
        
        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex gap-3">
          <button
            onClick={logout}
            className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            Logout Now
          </button>
          <button
            onClick={extend}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Stay Logged In
          </button>
        </div>
      </div>
    </div>
  );
}
