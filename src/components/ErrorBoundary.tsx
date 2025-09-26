'use client';

import React, { ErrorInfo, ReactNode, Component } from 'react';
import { motion } from 'framer-motion';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo, errorId: string) => void;
  enableLogging?: boolean;
  showErrorDetails?: boolean;
  className?: string;
  context?: 'page' | 'component' | 'photo' | 'gallery' | 'general';
}

interface ErrorDisplayProps {
  error: Error;
  errorInfo: ErrorInfo;
  errorId: string;
  context: ErrorBoundaryProps['context'];
  onRetry: () => void;
  showDetails: boolean;
  onToggleDetails: () => void;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryCount = 0;
  private maxRetries = 3;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return {
      hasError: true,
      error,
      errorId,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { onError, enableLogging = true } = this.props;
    const { errorId } = this.state;

    // Update state with error info
    this.setState({ errorInfo });

    // Log error to console in development
    if (enableLogging && process.env.NODE_ENV === 'development') {
      console.group(`🚨 Error Boundary: ${errorId}`);
      console.error('Error:', error);
      console.error('Component Stack:', errorInfo.componentStack);
      console.error('Error Stack:', error.stack);
      console.groupEnd();
    }

    // Call custom error handler if provided
    if (onError) {
      try {
        onError(error, errorInfo, errorId);
      } catch (handlerError) {
        console.error('Error in error handler:', handlerError);
      }
    }

    // Log to analytics service in production
    if (process.env.NODE_ENV === 'production' && enableLogging) {
      this.logErrorToService(error, errorInfo, errorId);
    }
  }

  private logErrorToService = async (error: Error, errorInfo: ErrorInfo, errorId: string) => {
    try {
      // Replace with your analytics service
      // Example: Sentry, LogRocket, or custom service
      console.warn('Error logged to service:', {
        errorId,
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        context: this.props.context,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
      });
    } catch (loggingError) {
      console.error('Failed to log error to service:', loggingError);
    }
  };

  private handleRetry = () => {
    if (this.retryCount < this.maxRetries) {
      this.retryCount++;
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        errorId: '',
      });
    }
  };

  private handleReset = () => {
    this.retryCount = 0;
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: '',
    });
  };

  render() {
    const { hasError, error, errorInfo, errorId } = this.state;
    const { children, fallback, showErrorDetails = false, className = '', context = 'general' } = this.props;

    if (hasError && error && errorInfo) {
      if (fallback) {
        return fallback;
      }

      return (
        <ErrorDisplay
          error={error}
          errorInfo={errorInfo}
          errorId={errorId}
          context={context}
          onRetry={this.handleRetry}
          showDetails={showErrorDetails}
          onToggleDetails={() => {}}
          className={className}
        />
      );
    }

    return children;
  }
}

// Error display component with context-specific messaging
function ErrorDisplay({ 
  error, 
  errorInfo, 
  errorId, 
  context, 
  onRetry, 
  showDetails, 
  onToggleDetails, 
  className 
}: ErrorDisplayProps & { className?: string }) {
  const [detailsVisible, setDetailsVisible] = React.useState(showDetails);

  const contextMessages = {
    page: {
      title: 'Page Error',
      description: 'Something went wrong loading this page. Please try refreshing or go back to the previous page.',
      icon: '📄',
    },
    component: {
      title: 'Component Error',
      description: 'A component failed to render properly. The rest of the page should still work normally.',
      icon: '⚙️',
    },
    photo: {
      title: 'Photo Error',
      description: 'Unable to load or display this photo. You can try refreshing or view other photos.',
      icon: '📷',
    },
    gallery: {
      title: 'Gallery Error',
      description: 'There was an issue loading the photo gallery. Please try again.',
      icon: '🖼️',
    },
    general: {
      title: 'Something Went Wrong',
      description: 'An unexpected error occurred. Please try again or refresh the page.',
      icon: '⚠️',
    },
  };

  const contextInfo = contextMessages[context] || contextMessages.general;

  const toggleDetails = () => {
    setDetailsVisible(!detailsVisible);
    onToggleDetails();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`min-h-[200px] flex items-center justify-center p-6 ${className}`}
    >
      <div className="max-w-md mx-auto text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: 'spring' }}
          className="text-6xl mb-4"
        >
          {contextInfo.icon}
        </motion.div>
        
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {contextInfo.title}
        </h2>
        
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {contextInfo.description}
        </p>

        <div className="space-y-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onRetry}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
          >
            Try Again
          </motion.button>

          <button
            onClick={toggleDetails}
            className="block mx-auto text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            {detailsVisible ? 'Hide Details' : 'Show Error Details'}
          </button>
        </div>

        {detailsVisible && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-left overflow-hidden"
          >
            <div className="text-sm space-y-2">
              <div>
                <strong className="text-red-600 dark:text-red-400">Error ID:</strong>
                <span className="ml-2 font-mono text-xs">{errorId}</span>
              </div>
              <div>
                <strong className="text-red-600 dark:text-red-400">Message:</strong>
                <span className="ml-2">{error.message}</span>
              </div>
              {process.env.NODE_ENV === 'development' && (
                <>
                  <div>
                    <strong className="text-red-600 dark:text-red-400">Stack Trace:</strong>
                    <pre className="mt-1 text-xs bg-gray-200 dark:bg-gray-700 p-2 rounded overflow-x-auto whitespace-pre-wrap">
                      {error.stack}
                    </pre>
                  </div>
                  <div>
                    <strong className="text-red-600 dark:text-red-400">Component Stack:</strong>
                    <pre className="mt-1 text-xs bg-gray-200 dark:bg-gray-700 p-2 rounded overflow-x-auto whitespace-pre-wrap">
                      {errorInfo.componentStack}
                    </pre>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}

        <p className="mt-4 text-xs text-gray-400">
          If this problem persists, please contact support with the error ID above.
        </p>
      </div>
    </motion.div>
  );
}

// Specialized error boundaries for common use cases
export const PageErrorBoundary = ({ children, ...props }: Omit<ErrorBoundaryProps, 'context'>) => (
  <ErrorBoundary context="page" {...props}>
    {children}
  </ErrorBoundary>
);

export const PhotoErrorBoundary = ({ children, ...props }: Omit<ErrorBoundaryProps, 'context'>) => (
  <ErrorBoundary context="photo" {...props}>
    {children}
  </ErrorBoundary>
);

export const GalleryErrorBoundary = ({ children, ...props }: Omit<ErrorBoundaryProps, 'context'>) => (
  <ErrorBoundary context="gallery" {...props}>
    {children}
  </ErrorBoundary>
);

export const ComponentErrorBoundary = ({ children, ...props }: Omit<ErrorBoundaryProps, 'context'>) => (
  <ErrorBoundary context="component" {...props}>
    {children}
  </ErrorBoundary>
);

// Legacy compatibility - replace PhotoPageErrorBoundary
export const PhotoPageErrorBoundary = PhotoErrorBoundary;

export default ErrorBoundary;