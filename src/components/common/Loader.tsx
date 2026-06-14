import ErrorMessage from '@/components/common/ErrorMessage';

interface LoaderProps {
  visible: boolean;
  display: 'flex' | 'none';
  error?: string | null;
  onRetry?: () => void;
}

export default function Loader({ visible, display, error, onRetry }: LoaderProps) {
  return (
    <div
      id="loader"
      style={{
        opacity: visible ? 1 : 0,
        display,
      }}
      aria-live="polite"
      aria-busy={!error && visible}
    >
      {error ? (
        <ErrorMessage
          title="Failed to load content"
          message={error}
          onRetry={onRetry}
          fullscreen
        />
      ) : (
        <div className="loader-spinner" aria-label="Loading" role="status" />
      )}
    </div>
  );
}
