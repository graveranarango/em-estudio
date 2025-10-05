/**
 * Aggressive Firestore Offline Manager
 * This utility completely manages Firestore's offline behavior to prevent connection spam
 */

import { getFirestore, enableNetwork, disableNetwork, terminate, clearIndexedDbPersistence } from 'firebase/firestore';

let firestoreInstance: any = null;
let isCompletelyOffline = false;
let suppressionActive = false;

// Store original console methods before any modification
const originalError = console.error;
const originalWarn = console.warn;

/**
 * Aggressively suppress all Firebase-related console output
 */
export function enableAggressiveFirebaseSupression() {
  if (suppressionActive) return;
  
  suppressionActive = true;
  
  // More comprehensive error patterns
  const firebasePatterns = [
    /firebase/i,
    /firestore/i,
    /webchannel/i,
    /transport errored/i,
    /listen stream/i,
    /rpc.*stream/i,
    /client is offline/i,
    /failed to get document/i,
    /unavailable.*code/i,
    /@firebase\/firestore/i,
    /grpc.*error/i,
    /network.*error/i,
    /connection.*failed/i,
    /timeout/i,
    /cancelled/i
  ];
  
  console.error = (...args: any[]) => {
    const message = args.join(' ').toLowerCase();
    const isFirebaseError = firebasePatterns.some(pattern => pattern.test(message));
    
    if (!isFirebaseError) {
      originalError.apply(console, args);
    }
  };
  
  console.warn = (...args: any[]) => {
    const message = args.join(' ').toLowerCase();
    const isFirebaseWarning = firebasePatterns.some(pattern => pattern.test(message));
    
    if (!isFirebaseWarning) {
      originalWarn.apply(console, args);
    }
  };
  
  // Silently activate suppression without logging
}

/**
 * Disable suppression and restore original console methods
 */
export function disableAggressiveFirebaseSupression() {
  if (!suppressionActive) return;
  
  console.error = originalError;
  console.warn = originalWarn;
  suppressionActive = false;
  
  // Silently deactivate suppression
}

/**
 * Completely terminate Firebase connection to prevent any network attempts
 */
export async function forceFirebaseOffline() {
  if (isCompletelyOffline) return;
  
  try {
    const db = getFirestore();
    
    // First disable network
    await disableNetwork(db);
    
    // Then terminate the instance completely
    await terminate(db);
    
    isCompletelyOffline = true;
    // Firebase terminated silently
    
  } catch (error) {
    // Even if termination fails, mark as offline
    isCompletelyOffline = true;
    // Firebase marked as offline (termination had issues)
  }
}

/**
 * Check if Firebase is completely offline
 */
export function isFirebaseCompletelyOffline(): boolean {
  return isCompletelyOffline;
}

/**
 * Clear any cached offline data to start fresh
 */
export async function clearFirebaseOfflineCache() {
  try {
    await clearIndexedDbPersistence(getFirestore());
    // Firebase offline cache cleared (silent)
  } catch (error) {
    // Could not clear Firebase cache (silent)
  }
}

// Auto-activate aggressive suppression
if (typeof window !== 'undefined') {
  enableAggressiveFirebaseSupression();
  
  // If we detect we're offline immediately, terminate Firebase
  if (!navigator.onLine) {
    forceFirebaseOffline();
  }
  
  // Listen for offline events and immediately terminate
  window.addEventListener('offline', () => {
    forceFirebaseOffline();
  });
  
  // Only attempt to reconnect after being online for a while
  let onlineTimeout: NodeJS.Timeout;
  window.addEventListener('online', () => {
    clearTimeout(onlineTimeout);
    onlineTimeout = setTimeout(() => {
      if (navigator.onLine) {
        // Network stable - Firebase reconnection may be attempted (silent)
        isCompletelyOffline = false;
      }
    }, 5000); // Wait 5 seconds of stable connection
  });
}