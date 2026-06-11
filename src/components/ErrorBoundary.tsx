'use client';

import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  /** Optional section name for contextual error messages */
  section?: string;
  /** Optional className for the error container */
  className?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

/**
 * Section-level error boundary that catches render crashes and displays
 * a graceful fallback with retry capability instead of a white screen.
 *
 * Usage:
 *   <ErrorBoundary section="Skill Marketplace">
 *     <SkillMarketplace />
 *   </ErrorBoundary>
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log to console for debugging — in production this would go to an error service
    console.error(`[ErrorBoundary${this.props.section ? `: ${this.props.section}` : ''}]`, error, errorInfo);
    this.setState({ errorInfo });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      const { section, className = '' } = this.props;
      const isDev = process.env.NODE_ENV === 'development';

      return (
        <div
          className={`flex flex-col items-center justify-center py-16 px-6 text-center ${className}`}
          role="alert"
          aria-live="assertive"
        >
          <div className="max-w-md space-y-4">
            <AlertTriangle className="h-10 w-10 mx-auto text-amber-500" />

            <h2 className="font-['Georgia',_serif] text-xl font-bold text-foreground">
              {section ? `${section} encountered an error` : 'Something went wrong'}
            </h2>

            <p className="text-sm text-muted-foreground leading-relaxed">
              This section failed to render. You can try again or continue exploring other sections.
              {isDev && ' Check the browser console for details.'}
            </p>

            {isDev && this.state.error && (
              <details className="text-left mt-4">
                <summary className="text-xs font-mono text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
                  Error details (dev only)
                </summary>
                <pre className="mt-2 p-3 bg-muted rounded-lg text-xs font-mono text-destructive overflow-x-auto max-h-40 custom-scrollbar">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack && (
                    <>
                      {'\n\nComponent Stack:\n'}
                      {this.state.errorInfo.componentStack}
                    </>
                  )}
                </pre>
              </details>
            )}

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={this.handleRetry}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Try Again
              </button>
              <button
                onClick={this.handleGoHome}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium border border-border rounded-md hover:bg-muted transition-colors cursor-pointer"
              >
                <Home className="h-3.5 w-3.5" />
                Go Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
