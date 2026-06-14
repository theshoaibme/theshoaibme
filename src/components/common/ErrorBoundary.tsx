import { Component, type ErrorInfo, type ReactNode } from 'react';
import ErrorMessage from '@/components/common/ErrorMessage';
import { getErrorMessage } from '@/utils/errors';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackTitle?: string;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unhandled application error:', error, info.componentStack);
  }

  handleRetry = () => {
    this.setState({ error: null });
  };

  render() {
    const { error } = this.state;

    if (error) {
      return (
        <ErrorMessage
          title={this.props.fallbackTitle ?? 'Application Error'}
          message={getErrorMessage(error, 'An unexpected error occurred. Please refresh the page.')}
          onRetry={this.handleRetry}
          retryLabel="Retry"
          fullscreen
        />
      );
    }

    return this.props.children;
  }
}
