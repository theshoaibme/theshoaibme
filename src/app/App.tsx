import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import SmoothScrollProvider from '@/components/layout/SmoothScrollProvider';
import { SiteDataProvider } from '@/app/providers/SiteDataProvider';
import HomePage from '@/pages/HomePage';
import LoaderPage from '@/pages/LoaderPage';
import NotFoundPage from '@/pages/NotFoundPage';
import PrivacyPage from '@/pages/PrivacyPage';
import ProjectsPage from '@/pages/ProjectsPage';
import ResumePage from '@/pages/ResumePage';
import TermsPage from '@/pages/TermsPage';

export default function App() {
  return (
    <ErrorBoundary>
      <SiteDataProvider>
        <SmoothScrollProvider>
          <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '') || undefined}>
            <ErrorBoundary>
              <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/resume" element={<ResumePage />} />
              <Route path="/cv" element={<Navigate to="/resume" replace />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/loader" element={<LoaderPage />} />
              <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </ErrorBoundary>
          </BrowserRouter>
        </SmoothScrollProvider>
      </SiteDataProvider>
    </ErrorBoundary>
  );
}
