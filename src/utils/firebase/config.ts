import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator, enableNetwork, disableNetwork } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "demo-api-key",
  authDomain: "brandkit-ai-studio.firebaseapp.com",
  projectId: "brandkit-ai-studio",
  storageBucket: "brandkit-ai-studio.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdefghijklmnop"
};

// Initialize Firebase (reuse existing default app if present)
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Initialize Firestore with offline support
const firestore = getFirestore(app);

// Enhanced offline handling
let isOfflineMode = false;
let networkCheckInterval: NodeJS.Timeout | null = null;

// Check if we're in a development environment and should use emulator
const isDevelopment = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

// Function to handle network state changes
const handleNetworkChange = async () => {
  if (typeof window === 'undefined') return;
  
  const isOnline = navigator.onLine;
  
  if (isOnline && isOfflineMode) {
    try {
      // Network detected, attempting to reconnect to Firestore (silent)
      await enableNetwork(firestore);
      isOfflineMode = false;
      // Firebase reconnected successfully (silent)
    } catch (error) {
      // Failed to reconnect to Firestore - staying offline (silent)
      isOfflineMode = true; // Ensure we stay offline if reconnection fails
    }
  } else if (!isOnline && !isOfflineMode) {
    try {
      // Network lost, switching to offline mode (silent)
      await disableNetwork(firestore);
      isOfflineMode = true;
      // Firebase offline mode activated (silent)
    } catch (error) {
      // Even if disabling fails, mark as offline
      isOfflineMode = true;
      // Failed to cleanly disable Firestore network, forcing offline mode (silent)
    }
  }
};

// Set up network monitoring
if (typeof window !== 'undefined') {
  // Initial network check - be more aggressive about going offline
  if (!navigator.onLine) {
    isOfflineMode = true;
    disableNetwork(firestore).catch(err => 
      console.warn('Failed to initially disable network:', err)
    );
  } else {
    // Even if navigator thinks we're online, disable network initially to prevent errors
    // We'll re-enable it only if we successfully connect
    isOfflineMode = true;
    disableNetwork(firestore).catch(() => {
      // Ignore errors when initially disabling
    });
    
    // Try to re-enable after a short delay
    setTimeout(async () => {
      try {
        await enableNetwork(firestore);
        isOfflineMode = false;
        // Firebase connection established (silent)
      } catch {
        // Stay offline if connection fails
        // Firebase connection failed - staying in offline mode (silent)
      }
    }, 2000);
  }
  
  // Listen for network changes
  window.addEventListener('online', handleNetworkChange);
  window.addEventListener('offline', handleNetworkChange);
  
  // Periodic network check (less aggressive - every 30 seconds)
  networkCheckInterval = setInterval(() => {
    handleNetworkChange();
  }, 30000);
}

// Export the configured firestore instance
export const db = firestore;

// Export utility functions
export const getNetworkState = () => ({
  isOffline: isOfflineMode,
  isOnline: typeof window !== 'undefined' ? navigator.onLine : true
});

export const forceOfflineMode = async () => {
  try {
    await disableNetwork(firestore);
    isOfflineMode = true;
    console.log('Forced offline mode enabled');
  } catch (error) {
    console.error('Failed to force offline mode:', error);
  }
};

export const forceOnlineMode = async () => {
  try {
    await enableNetwork(firestore);
    isOfflineMode = false;
    console.log('Forced online mode enabled');
  } catch (error) {
    console.error('Failed to force online mode:', error);
  }
};

// Cleanup function
export const cleanupNetworkMonitoring = () => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('online', handleNetworkChange);
    window.removeEventListener('offline', handleNetworkChange);
  }
  
  if (networkCheckInterval) {
    clearInterval(networkCheckInterval);
    networkCheckInterval = null;
  }
};

export default app;
