import { Component, type ErrorInfo, type ReactNode } from 'react';
import ErrorMessage from '@/components/common/ErrorMessage';
import { getDisplayErrorMessage } from '@/utils/errors';

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
    window.location.reload();
  };

  render() {
    const { error } = this.state;

    if (error) {
      return (
        <ErrorMessage
          title={this.props.fallbackTitle ?? 'Something went wrong'}
          message={getDisplayErrorMessage(error)}
          onRetry={this.handleRetry}
          retryLabel="Refresh page"
          fullscreen
        />
      );
    }

    return this.props.children;
  }
}
