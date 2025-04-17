'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { toast } from 'react-hot-toast';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary component to catch JavaScript errors in dashboard components
 * and prevent the entire dashboard from crashing
 */
class DashboardErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Dashboard error caught:', error, errorInfo);
    toast.error('Something went wrong in the dashboard. Trying to recover...');
    
    // Log to analytics or error tracking service here
    // e.g., Sentry.captureException(error);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
    // Optional: reload specific data
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-[300px] p-8 bg-white rounded-lg shadow-sm border border-red-100">
          <div className="text-red-500 text-xl mb-4">⚠️ Dashboard Error</div>
          <p className="text-gray-700 mb-6 text-center">
            {this.state.error?.message || 'Something went wrong loading this component.'}
          </p>
          <div className="flex gap-4">
            <button
              onClick={this.handleRetry}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            >
              Try Again
            </button>
            <button
              onClick={this.handleReset}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default DashboardErrorBoundary; 