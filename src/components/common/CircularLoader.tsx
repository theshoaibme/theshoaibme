import '@/styles/modules/loader.css';

export default function CircularLoader() {
  return (
    <div className="loader-page__loader">
      <svg className="loader-page__circular" viewBox="25 25 50 50" aria-hidden="true">
        <circle className="loader-page__path" cx="50" cy="50" r="20" fill="none" strokeWidth="2" />
      </svg>
    </div>
  );
}
