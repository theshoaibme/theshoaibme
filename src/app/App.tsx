import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import SmoothScrollProvider from '@/components/layout/SmoothScrollProvider';
import { SiteDataProvider } from '@/app/providers/SiteDataProvider';
import HomePage from '@/pages/HomePage';

const ProjectsPage = lazy(() => import('@/pages/ProjectsPage'));
const ResumePage = lazy(() => import('@/pages/ResumePage'));
const PrivacyPage = lazy(() => import('@/pages/PrivacyPage'));
const TermsPage = lazy(() => import('@/pages/TermsPage'));
const LoaderPage = lazy(() => import('@/pages/LoaderPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

export default function App() {
  return (
    <ErrorBoundary>
      <SiteDataProvider>
        <SmoothScrollProvider>
          <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '') || undefined}>
            <ErrorBoundary>
              <Suspense fallback={null}>
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
              </Suspense>
            </ErrorBoundary>
          </BrowserRouter>
        </SmoothScrollProvider>
      </SiteDataProvider>
    </ErrorBoundary>
  );
}
