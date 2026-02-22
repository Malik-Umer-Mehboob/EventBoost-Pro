import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
          return this.props.fallback;
      }
      
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
          <div className="max-w-md w-full glass p-8 rounded-3xl text-center shadow-2xl border border-white/20">
            <div className="bg-rose-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">Something went wrong</h2>
            <p className="text-gray-500 mb-8 font-medium">
              We encountered an error while rendering this page. Please try refreshing or contact support if the problem persists.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full gradient-primary text-white py-4 rounded-2xl font-bold shadow-xl shadow-indigo-100 hover:scale-105 active:scale-95 transition-all"
            >
              Refresh Page
            </button>
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-8 text-left bg-gray-100 p-4 rounded-xl overflow-auto max-h-48">
                <summary className="text-xs font-bold text-gray-400 uppercase tracking-widest cursor-pointer mb-2">Error Details</summary>
                <pre className="text-[10px] text-rose-500 font-mono">{this.state.error?.toString()}</pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
