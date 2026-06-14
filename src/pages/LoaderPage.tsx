import CircularLoader from '@/components/common/CircularLoader';
import { useDocumentTitle } from '@/hooks/data/useSiteData';
import '@/styles/modules/loader.css';

export default function LoaderPage() {
  useDocumentTitle('Loader');

  return (
    <div className="loader-page">
      <div className="loader-page__app" id="App">
        <CircularLoader />
      </div>
    </div>
  );
}
