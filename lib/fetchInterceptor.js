// Setup global fetch interceptor
// This wraps the native fetch to show loading on all API calls

let loadingCallbacks = {
  showLoading: null,
  hideLoading: null,
};

export const setLoadingCallbacks = (showLoading, hideLoading) => {
  loadingCallbacks = { showLoading, hideLoading };
  console.log('✅ Fetch interceptor callbacks set');
};

// Store original fetch only on client-side
const originalFetch = typeof window !== 'undefined' ? window.fetch : null;

// Counter to manage multiple concurrent requests
let activeRequests = 0;

export const setupFetchInterceptor = () => {
  // Only setup on client-side
  if (typeof window === 'undefined') return;

  console.log('🔧 Setting up fetch interceptor');

  window.fetch = async function(...args) {
    const url = args[0]?.toString() || 'unknown';
    
    // Skip loading for certain requests (optional)
    const skipLoadingPatterns = ['_next', '/static/', '/api/socket'];
    const shouldSkip = skipLoadingPatterns.some(pattern => url.includes(pattern));

    if (!shouldSkip) {
      activeRequests++;
      console.log(`📡 Fetch started [${activeRequests}]: ${url.substring(0, 50)}`);

      if (activeRequests === 1 && loadingCallbacks.showLoading) {
        loadingCallbacks.showLoading('Loading...');
      }
    }

    try {
      const response = await originalFetch.apply(this, args);
      return response;
    } catch (error) {
      console.error('Fetch error:', error);
      throw error;
    } finally {
      if (!shouldSkip) {
        activeRequests--;
        console.log(`📡 Fetch ended [${activeRequests}]: ${url.substring(0, 50)}`);

        if (activeRequests === 0 && loadingCallbacks.hideLoading) {
          // Add a small delay so the loader doesn't flash
          setTimeout(() => {
            loadingCallbacks.hideLoading();
          }, 300);
        }
      }
    }
  };
};

export const resetFetchInterceptor = () => {
  if (typeof window === 'undefined' || !originalFetch) return;
  window.fetch = originalFetch;
};
