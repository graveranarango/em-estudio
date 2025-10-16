/**
 * Firebase Error Suppression Utility
 * Helps reduce console noise from known offline Firebase errors
 */

interface FirebaseErrorPattern {
  message: string;
  level: 'warn' | 'error' | 'log';
  suppress: boolean;
}

const FIREBASE_ERROR_PATTERNS: FirebaseErrorPattern[] = [
  {
    message: 'WebChannelConnection RPC',
    level: 'warn',
    suppress: true
  },
  {
    message: 'transport errored',
    level: 'warn', 
    suppress: true
  },
  {
    message: 'Failed to get document because the client is offline',
    level: 'error',
    suppress: true
  },
  {
    message: 'Listen stream',
    level: 'warn',
    suppress: true
  },
  {
    message: '@firebase/firestore',
    level: 'warn',
    suppress: true
  },
  {
    message: 'FIRESTORE (',
    level: 'warn',
    suppress: true
  },
  {
    message: 'Error cargando BrandKit: FirebaseError',
    level: 'error',
    suppress: true
  },
  {
    message: 'Error loading BrandKit: Error: No se pudo cargar el BrandKit',
    level: 'error',
    suppress: true
  },
  {
    message: 'Firestore (12.3.0)',
    level: 'warn',
    suppress: true
  }
];

let originalConsoleError: typeof console.error;
let originalConsoleWarn: typeof console.warn;
let originalConsoleLog: typeof console.log;
let suppressionEnabled = false;

function shouldSuppressMessage(message: string): boolean {
  if (!suppressionEnabled) return false;
  
  return FIREBASE_ERROR_PATTERNS.some(pattern => 
    pattern.suppress && message.includes(pattern.message)
  );
}

function createFilteredConsoleMethod(
  originalMethod: typeof console.error, 
  methodName: string
) {
  return (...args: any[]) => {
    const message = args.join(' ');
    
    if (shouldSuppressMessage(message)) {
      // Silently suppress Firebase offline errors - no logging to avoid noise
      return;
    }
    
    // Call original method for non-suppressed messages
    originalMethod.apply(console, args);
  };
}

export function enableFirebaseErrorSuppression(): void {
  if (suppressionEnabled) return;
  
  // Store original methods
  originalConsoleError = console.error;
  originalConsoleWarn = console.warn;
  originalConsoleLog = console.log;
  
  // Replace with filtered versions
  console.error = createFilteredConsoleMethod(originalConsoleError, 'error');
  console.warn = createFilteredConsoleMethod(originalConsoleWarn, 'warn');
  
  suppressionEnabled = true;
  
  // Use the original console.log to avoid circular calls
  originalConsoleLog('🔇 Firebase error suppression enabled - offline connection errors will be filtered');
}

export function disableFirebaseErrorSuppression(): void {
  if (!suppressionEnabled) return;
  
  // Restore original methods
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
  console.log = originalConsoleLog;
  
  suppressionEnabled = false;
  originalConsoleLog('🔊 Firebase error suppression disabled');
}

export function isSuppressionEnabled(): boolean {
  return suppressionEnabled;
}

// Auto-enable suppression when this module loads
if (typeof window !== 'undefined') {
  enableFirebaseErrorSuppression();
}