import '@/styles/modules/errors.css';
import CircularLoader from './CircularLoader';
import ErrorMessage from './ErrorMessage';

interface PageStatusProps {
  loading: boolean;
  error?: string | null;
  onRetry?: () => void;
  fullscreen?: boolean;
  loadingLabel?: string;
  errorTitle?: string;
  children: React.ReactNode;
}

export default function PageStatus({
  loading,
  error,
  onRetry,
  fullscreen = false,
  loadingLabel = 'Loading content...',
  errorTitle = 'Unable to load page',
  children,
}: PageStatusProps) {
  if (loading) {
    return (
      <div
        className={`page-status${fullscreen ? ' page-status--fullscreen' : ''}`}
        aria-live="polite"
        aria-busy="true"
      >
        <div className="loader-page">
          <div className="loader-page__app">
            <CircularLoader />
          </div>
          <span className="sr-only">{loadingLabel}</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorMessage
        title={errorTitle}
        message={error}
        onRetry={onRetry}
        fullscreen={fullscreen}
      />
    );
  }

  return children;
}
