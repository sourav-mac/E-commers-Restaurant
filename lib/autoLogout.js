/**
 * Auto-Logout Module
 * 
 * Implements automatic logout for admin users after inactivity period.
 * Shows warning at 25 minutes and logs out at 30 minutes.
 * 
 * Usage in React component:
 *   import { useAutoLogout } from '@/lib/autoLogout'
 *   
 *   export default function AdminPage() {
 *     useAutoLogout()
 *     return (...)
 *   }
 */

let inactivityTimeout;
let warningTimeout;
let lastActivityTime;

const INACTIVITY_TIME = 30 * 60 * 1000; // 30 minutes in milliseconds
const WARNING_TIME = 25 * 60 * 1000;   // 25 minutes in milliseconds

/**
 * Reset the inactivity timer
 * Called on user activity (mouse move, key press, etc)
 */
function resetInactivityTimer() {
  lastActivityTime = Date.now();
  
  // Clear existing timers
  if (warningTimeout) clearTimeout(warningTimeout);
  if (inactivityTimeout) clearTimeout(inactivityTimeout);
  
  // Set new warning timer
  warningTimeout = setTimeout(() => {
    showInactivityWarning();
  }, WARNING_TIME);
  
  // Set logout timer
  inactivityTimeout = setTimeout(() => {
    performLogout();
  }, INACTIVITY_TIME);
}

/**
 * Show inactivity warning to user
 */
function showInactivityWarning() {
  // Dispatch custom event so components can listen
  const event = new CustomEvent('admin:inactivity-warning', {
    detail: {
      message: 'You will be logged out in 5 minutes due to inactivity',
      timeRemaining: 5 * 60 * 1000 // 5 minutes
    }
  });
  window.dispatchEvent(event);
  
  // Optional: Show browser notification
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification('Petuk Admin - Inactivity Warning', {
      body: 'You will be logged out in 5 minutes due to inactivity. Click to stay logged in.',
      tag: 'admin-inactivity-warning',
      requireInteraction: true,
      badge: '/images/logo.png'
    });
  }
}

/**
 * Perform logout
 */
async function performLogout() {
  try {
    // Call logout API
    await fetch('/api/admin/logout', { method: 'POST' });
    
    // Clear all stored tokens
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_refresh');
    localStorage.removeItem('admin_username');
    
    // Clear cookies
    document.cookie = 'admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
    document.cookie = 'admin_refresh=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
    
    // Redirect to login
    window.location.href = '/admin/login';
  } catch (err) {
    console.error('Auto-logout error:', err);
    // Force logout anyway
    window.location.href = '/admin/login';
  }
}

/**
 * Activity listener events
 */
const activityEvents = [
  'mousedown',
  'mousemove',
  'keypress',
  'scroll',
  'touchstart',
  'click',
  'mousewheel',
  'wheel'
];

/**
 * Initialize auto-logout tracking
 * Call this once in your app (e.g., in _app.js)
 */
export function initAutoLogout() {
  // Check if admin is logged in
  const token = localStorage.getItem('admin_token');
  if (!token) return;
  
  // Start the initial timer
  resetInactivityTimer();
  
  // Add event listeners for user activity
  activityEvents.forEach(event => {
    document.addEventListener(event, resetInactivityTimer, { passive: true });
  });
  
  // Request notification permission
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
  }
}

/**
 * Stop auto-logout tracking (e.g., on logout)
 */
export function stopAutoLogout() {
  activityEvents.forEach(event => {
    document.removeEventListener(event, resetInactivityTimer);
  });
  
  if (warningTimeout) clearTimeout(warningTimeout);
  if (inactivityTimeout) clearTimeout(inactivityTimeout);
}

/**
 * React Hook for auto-logout
 * Use this in any admin page/component
 */
export function useAutoLogout() {
  const [warning, setWarning] = React.useState(false);
  const [timeRemaining, setTimeRemaining] = React.useState(0);
  
  React.useEffect(() => {
    // Initialize auto-logout on mount
    initAutoLogout();
    
    // Listen for inactivity warning
    const handleWarning = (event) => {
      setWarning(true);
      setTimeRemaining(event.detail.timeRemaining);
      
      // Update remaining time every second
      const interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1000) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1000;
        });
      }, 1000);
      
      return () => clearInterval(interval);
    };
    
    window.addEventListener('admin:inactivity-warning', handleWarning);
    
    // Cleanup on unmount
    return () => {
      window.removeEventListener('admin:inactivity-warning', handleWarning);
      stopAutoLogout();
    };
  }, []);
  
  return {
    showWarning: warning,
    timeRemaining: Math.ceil(timeRemaining / 1000), // Convert to seconds
    extendSession: () => {
      setWarning(false);
      resetInactivityTimer();
    }
  };
}

/**
 * React Hook (alternative simple version)
 * For components that just need to show warning
 */
export function useInactivityWarning() {
  const [showWarning, setShowWarning] = React.useState(false);
  
  React.useEffect(() => {
    const handleWarning = () => setShowWarning(true);
    window.addEventListener('admin:inactivity-warning', handleWarning);
    
    return () => {
      window.removeEventListener('admin:inactivity-warning', handleWarning);
    };
  }, []);
  
  const extend = () => {
    setShowWarning(false);
    resetInactivityTimer();
  };
  
  const logout = performLogout;
  
  return { showWarning, extend, logout };
}

/**
 * Get inactivity time left (in seconds)
 */
export function getTimeUntilLogout() {
  if (!lastActivityTime) return INACTIVITY_TIME / 1000;
  
  const elapsed = Date.now() - lastActivityTime;
  const remaining = Math.max(0, INACTIVITY_TIME - elapsed);
  
  return Math.ceil(remaining / 1000);
}

/**
 * Check if admin is inactive
 */
export function isAdminInactive() {
  if (!lastActivityTime) return false;
  
  const elapsed = Date.now() - lastActivityTime;
  return elapsed > INACTIVITY_TIME;
}

export default {
  initAutoLogout,
  stopAutoLogout,
  useAutoLogout,
  useInactivityWarning,
  getTimeUntilLogout,
  isAdminInactive
};
