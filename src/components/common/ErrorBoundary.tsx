import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, AlertDescription } from '../ui/alert';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Don't log Firebase-related errors to avoid console noise
    const isFirebaseError = error.message?.includes('firebase') || 
                           error.message?.includes('firestore') ||
                           error.message?.includes('offline');
    
    if (!isFirebaseError) {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isFirebaseError = this.state.error?.message?.includes('firebase') || 
                             this.state.error?.message?.includes('firestore') ||
                             this.state.error?.message?.includes('offline');

      return (
        <div className="p-6">
          <Alert className={`${isFirebaseError ? 'border-yellow-200 bg-yellow-50' : 'border-red-200 bg-red-50'}`}>
            <AlertTriangle className={`h-4 w-4 ${isFirebaseError ? 'text-yellow-600' : 'text-red-600'}`} />
            <AlertDescription className={`${isFirebaseError ? 'text-yellow-800' : 'text-red-800'}`}>
              <div className="space-y-3">
                <div>
                  <p className="font-medium">
                    {isFirebaseError ? 'Modo offline activado' : 'Se produjo un error inesperado'}
                  </p>
                  <p className="text-sm">
                    {isFirebaseError 
                      ? 'La aplicación continuará funcionando con datos locales.' 
                      : 'Por favor, actualiza la página o inténtalo de nuevo.'
                    }
                  </p>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={this.handleRetry}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="w-3 h-3" />
                  Reintentar
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      );
    }

    return this.props.children;
  }
}