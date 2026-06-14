import '@/styles/modules/errors.css';

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  retryLabel?: string;
  fullscreen?: boolean;
}

export default function ErrorMessage({
  title = 'Something went wrong',
  message,
  onRetry,
  retryLabel = 'Try Again',
  fullscreen = false,
}: ErrorMessageProps) {
  return (
    <div className={`page-status${fullscreen ? ' page-status--fullscreen' : ''}`} role="alert">
      <div className="error-message">
        <i className="fa-solid fa-circle-exclamation error-message__icon" aria-hidden="true" />
        <h2 className="error-message__title">{title}</h2>
        <p className="error-message__text">{message}</p>
        {onRetry ? (
          <div className="error-message__actions">
            <button type="button" className="btn btn-primary ripple" onClick={onRetry}>
              {retryLabel}
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
