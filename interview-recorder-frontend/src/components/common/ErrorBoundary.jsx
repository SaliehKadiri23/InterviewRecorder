import React from 'react';
import { RotateCcw, Bug } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to an error reporting service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReportIssue = () => {
    // In a real app, this would send the error to a reporting service
    console.error('Reporting error:', this.state.error, this.state.errorInfo);
    alert('Error has been reported to our team. Thank you for helping us improve the app!');
  };

  render() {
    if (this.state.hasError) {
      // Fallback UI when there's an error
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <Bug className="h-6 w-6 text-red-600" />
            </div>
            <h2 className="mt-6 text-xl font-bold text-gray-900">Something went wrong</h2>
            <p className="mt-2 text-gray-600">
              An unexpected error occurred. Our team has been notified.
            </p>
            <div className="mt-6">
              <button
                onClick={this.handleReload}
                className="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mx-2"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reload Page
              </button>
              <button
                onClick={this.handleReportIssue}
                className="flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mt-3"
              >
                Report Issue
              </button>
            </div>
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-6 text-left">
                <summary className="text-red-600 cursor-pointer">Error details</summary>
                <div className="mt-2 text-red-600 text-sm">
                  <pre>{this.state.error && this.state.error.toString()}</pre>
                  <pre className="mt-2">{this.state.errorInfo.componentStack}</pre>
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    // Render children if no error occurred
    return this.props.children;
  }
}

export default ErrorBoundary;