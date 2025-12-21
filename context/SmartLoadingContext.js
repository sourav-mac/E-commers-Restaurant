import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

const SmartLoadingContext = createContext();

export const SmartLoadingProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  
  // Track what triggered the loading
  const loadingSourceRef = useRef(null); // 'route', 'api', 'manual', 'socket'
  const timeoutRef = useRef(null);
  const activeApiCallsRef = useRef(0);
  const navigationInProgressRef = useRef(false);

  const showLoading = useCallback((message = '', source = 'manual') => {
    // 🚫 IMPORTANT: Skip loader for background events
    // Only show loader for user-initiated actions (manual, route) or API calls
    if (source === 'socket' || source === 'polling' || source === 'auto' || source === 'sse') {
      console.log(`⏭️  [LOADER] Skipping loader for ${source} update: "${message || '(no message)'}"`);
      return;  // Do NOT show loader for background updates!
    }

    // Don't show loading if it's just a WebSocket event
    if (source === 'socket') {
      console.log('🔌 [LOADER] Socket event ignored - not showing loader');
      return;
    }

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    console.log(`✅ [LOADER] Showing loader - Source: ${source}, Message: ${message || '(loading...)'}`);
    loadingSourceRef.current = source;
    setLoadingMessage(message);
    setIsLoading(true);
  }, []);

  const hideLoading = useCallback(() => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    console.log(`✅ [LOADER] Hiding loader - Source was: ${loadingSourceRef.current}`);
    
    // Use a timeout to ensure state transitions properly
    timeoutRef.current = setTimeout(() => {
      setIsLoading(false);
      setLoadingMessage('');
      loadingSourceRef.current = null;
      timeoutRef.current = null;
    }, 50);
  }, []);

  const resetLoading = useCallback(() => {
    // Force reset the loading state
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    console.log('🔄 [LOADER] Resetting loader state');
    setIsLoading(false);
    setLoadingMessage('');
    loadingSourceRef.current = null;
    timeoutRef.current = null;
    activeApiCallsRef.current = 0;
    navigationInProgressRef.current = false;
  }, []);

  // Track API calls
  const trackApiStart = useCallback(() => {
    activeApiCallsRef.current++;
    console.log(`📡 [API] API call started - Active calls: ${activeApiCallsRef.current}`);
    
    // Only show loading if this is the first API call
    if (activeApiCallsRef.current === 1) {
      showLoading('Loading...', 'api');
    }
  }, [showLoading]);

  const trackApiEnd = useCallback(() => {
    activeApiCallsRef.current--;
    console.log(`📡 [API] API call ended - Active calls: ${activeApiCallsRef.current}`);
    
    // Only hide loading when all API calls are done
    if (activeApiCallsRef.current <= 0) {
      activeApiCallsRef.current = 0;
      hideLoading();
    }
  }, [hideLoading]);

  // Track navigation
  const trackNavigationStart = useCallback(() => {
    navigationInProgressRef.current = true;
    console.log('🚀 [NAV] Navigation started');
    showLoading('', 'route');
  }, [showLoading]);

  const trackNavigationEnd = useCallback(() => {
    navigationInProgressRef.current = false;
    console.log('🚀 [NAV] Navigation ended');
    hideLoading();
  }, [hideLoading]);

  const value = {
    isLoading,
    loadingMessage,
    showLoading,
    hideLoading,
    resetLoading,
    trackApiStart,
    trackApiEnd,
    trackNavigationStart,
    trackNavigationEnd,
    // Expose refs for checking current state
    activeApiCallsRef,
    navigationInProgressRef,
  };

  return (
    <SmartLoadingContext.Provider value={value}>
      {children}
    </SmartLoadingContext.Provider>
  );
};

export const useSmartLoading = () => {
  const context = useContext(SmartLoadingContext);
  if (!context) {
    throw new Error('useSmartLoading must be used within SmartLoadingProvider');
  }
  return context;
};
