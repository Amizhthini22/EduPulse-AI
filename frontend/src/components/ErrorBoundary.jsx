import React from 'react';

/**
 * ErrorBoundary catches render errors so one broken component
 * doesn't take down the whole app — important for low-connectivity
 * and fragmented-data scenarios.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('EduPulse ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          className="max-w-xl mx-auto mt-16 p-8 glass-card rounded-2xl text-center space-y-4"
        >
          <div className="text-4xl">⚠️</div>
          <h2 className="text-xl font-bold text-rose-400">Something went wrong</h2>
          <p className="text-slate-400 text-sm">
            This section couldn't load. This can happen when data is missing or the
            server is unreachable. The rest of the app is still functional.
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 font-bold text-sm"
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
