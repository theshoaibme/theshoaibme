import { BrowserRouter, Route, Routes } from 'react-router-dom';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { SiteDataProvider } from '@/app/providers/SiteDataProvider';
import ContactPage from '@/pages/ContactPage';
import HomePage from '@/pages/HomePage';
import LoaderPage from '@/pages/LoaderPage';
import NotFoundPage from '@/pages/NotFoundPage';
import PrivacyPage from '@/pages/PrivacyPage';
import ProjectsPage from '@/pages/ProjectsPage';
import TermsPage from '@/pages/TermsPage';

export default function App() {
  return (
    <ErrorBoundary>
      <SiteDataProvider>
        <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '') || undefined}>
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/loader" element={<LoaderPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </ErrorBoundary>
        </BrowserRouter>
      </SiteDataProvider>
    </ErrorBoundary>
  );
}
