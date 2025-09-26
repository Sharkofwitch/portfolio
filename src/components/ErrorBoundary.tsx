'use client';

import React, { Component, ReactNode } from 'react';

interface ErrorInfo {
  componentStack: string;
}

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

// Simple SVG icons to replace lucide-react
const AlertTriangleIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path 
      d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);

const RefreshIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path 
      d="M23 4v6h-6M1 20v-6h6M20.49 9A9 9 0 0 0 5.64 5.64L1 10.92M3.51 15a9 9 0 0 0 14.85 3.36L23 13.08" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <ErrorDisplay 
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onRetry={this.handleRetry}
        />
      );
    }

    return this.props.children;
  }
}

interface ErrorDisplayProps {
  error: Error | null;
  errorInfo: ErrorInfo | null;
  onRetry: () => void;
}

function ErrorDisplay({ error, errorInfo, onRetry }: ErrorDisplayProps) {
  const isDevelopment = process.env.NODE_ENV === 'development';

  // Safe error message extraction with proper null checking
  const errorMessage = error?.message || 'An unexpected error occurred';
  const errorName = error?.name || 'Error';
  
  // Safe stack trace extraction with proper null checking
  const errorStack = error?.stack || 'No stack trace available';
  const componentStack = errorInfo?.componentStack || 'No component stack available';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 dark:bg-red-900/20 rounded-full mb-4">
            <div className="w-6 h-6 text-red-600 dark:text-red-400">
              <AlertTriangleIcon />
            </div>
          </div>
          
          <div className="text-center">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Oops! Something went wrong
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              We apologize for the inconvenience. Please try refreshing the page.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onRetry}
              className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              <div className="w-4 h-4 mr-2">
                <RefreshIcon />
              </div>
              Try Again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Reload Page
            </button>
          </div>

          {isDevelopment && (
            <details className="mt-6">
              <summary className="cursor-pointer text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                Error Details (Development)
              </summary>
              <div className="mt-3 space-y-3">
                <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-md">
                  <h4 className="text-sm font-medium text-red-800 dark:text-red-400 mb-1">
                    {errorName}: {errorMessage}
                  </h4>
                  <pre className="text-xs text-gray-700 dark:text-gray-300 overflow-x-auto whitespace-pre-wrap">
                    {errorStack}
                  </pre>
                </div>
                {componentStack && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
                    <h4 className="text-sm font-medium text-blue-800 dark:text-blue-400 mb-1">
                      Component Stack:
                    </h4>
                    <pre className="text-xs text-gray-700 dark:text-gray-300 overflow-x-auto whitespace-pre-wrap">
                      {componentStack}
                    </pre>
                  </div>
                )}
              </div>
            </details>
          )}
        </div>
      </div>
    </div>
  );
}

// Hook version for functional components with proper error handling
export function useErrorBoundary() {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  const captureError = React.useCallback((error: Error) => {
    setError(error);
  }, []);

  return { captureError, resetError };
}

// Utility function to safely filter arrays with comprehensive null checking
export function safeFilter<T>(array: T[] | null | undefined, predicate: (item: T) => boolean): T[] {
  // Check if array is null, undefined, or not an actual array
  if (!array || !Array.isArray(array)) {
    return [];
  }
  
  try {
    // Additional safety: ensure predicate is a function
    if (typeof predicate !== 'function') {
      console.warn('safeFilter: predicate is not a function, returning original array');
      return array;
    }
    
    return array.filter(predicate);
  } catch (error) {
    console.error('safeFilter: Error during filtering:', error);
    return [];
  }
}

// Utility function to safely map arrays with comprehensive null checking
export function safeMap<T, U>(array: T[] | null | undefined, mapper: (item: T, index: number) => U): U[] {
  // Check if array is null, undefined, or not an actual array
  if (!array || !Array.isArray(array)) {
    return [];
  }
  
  try {
    // Additional safety: ensure mapper is a function
    if (typeof mapper !== 'function') {
      console.warn('safeMap: mapper is not a function, returning empty array');
      return [];
    }
    
    return array.map(mapper);
  } catch (error) {
    console.error('safeMap: Error during mapping:', error);
    return [];
  }
}

// Utility function to safely find array elements with null checking
export function safeFind<T>(array: T[] | null | undefined, predicate: (item: T) => boolean): T | undefined {
  // Check if array is null, undefined, or not an actual array
  if (!array || !Array.isArray(array)) {
    return undefined;
  }
  
  try {
    // Additional safety: ensure predicate is a function
    if (typeof predicate !== 'function') {
      console.warn('safeFind: predicate is not a function, returning undefined');
      return undefined;
    }
    
    return array.find(predicate);
  } catch (error) {
    console.error('safeFind: Error during find operation:', error);
    return undefined;
  }
}

// Higher-order component for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WithErrorBoundaryComponent = (props: P) => {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  };

  WithErrorBoundaryComponent.displayName = `withErrorBoundary(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return WithErrorBoundaryComponent;
}

export default ErrorBoundary;