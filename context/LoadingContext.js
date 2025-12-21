import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

const LoadingContext = createContext();

export const LoadingProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const timeoutRef = useRef(null);

  // ✅ FIXED: Add source parameter to prevent socket/polling from triggering loader
  const showLoading = useCallback((message = 'Loading...', source = 'manual') => {
    // 🚫 IMPORTANT: Skip loader for background events
    // Only show loader for user-initiated actions
    if (source === 'socket' || source === 'polling' || source === 'auto') {
      console.log(`⏭️  [LOADER] Skipping loader for ${source} update: "${message}"`);
      return; // Do NOT show loader for background updates
    }

    // ✅ Only show loader for real user actions
    // Clear any existing timeout to prevent conflicts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    console.log(`✅ [LOADER] Show: ${message} (source: ${source})`);
    setLoadingMessage(message);
    setIsLoading(true);
  }, []);

  const hideLoading = useCallback(() => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    console.log('[LOADER] Hide');
    
    // Use a timeout to ensure state transitions properly
    timeoutRef.current = setTimeout(() => {
      setIsLoading(false);
      setLoadingMessage('');
      timeoutRef.current = null;
    }, 300);
  }, []);

  const resetLoading = useCallback(() => {
    // Force reset the loading state
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    console.log('[LOADER] Reset');
    setIsLoading(false);
    setLoadingMessage('');
    timeoutRef.current = null;
  }, []);

  const value = {
    isLoading,
    loadingMessage,
    showLoading,
    hideLoading,
    resetLoading,
  };

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within LoadingProvider');
  }
  return context;
};
