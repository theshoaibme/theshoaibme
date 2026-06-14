import { Link } from 'react-router-dom';
import '@/styles/modules/errors.css';
import { useDocumentTitle } from '@/hooks/data/useSiteData';

export default function NotFoundPage() {
  useDocumentTitle('Page Not Found');

  return (
    <div className="page-status page-status--fullscreen" role="alert">
      <div className="error-message">
        <i className="fa-solid fa-circle-exclamation error-message__icon" aria-hidden="true" />
        <h2 className="error-message__title">Page Not Found</h2>
        <p className="error-message__text">
          The page you are looking for does not exist or may have been moved.
        </p>
        <div className="error-message__actions">
          <Link to="/" className="btn btn-primary ripple">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
