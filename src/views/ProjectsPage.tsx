"use client";

import { Link } from '@/components/common/UniversalLink';
import PageStatus from '@/components/common/PageStatus';
import ImageModal from '@/components/effects/ImageModal';
import Header from '@/components/layout/Header';
import ProjectCard from '@/components/sections/ProjectCard';
import { useDocumentTitle, useSiteData } from '@/hooks/data/useSiteData';
import { useImageModal } from '@/hooks/ui/useImageModal';
import { usePolicyTheme } from '@/hooks/ui/useTheme';
import { sanitizeHtml } from '@/utils/sanitize';
import { getSiteSection } from '@/utils/siteSections';

export default function ProjectsPage() {
  const { data, loading, error, retry } = useSiteData();
  const section = data ? getSiteSection(data.site.sections, 'portfolio') : undefined;
  const { isOpen, imageSrc, variant, openModal, closeModal, clearModal } = useImageModal();

  usePolicyTheme();
  useDocumentTitle(section ? `${section.title} | Projects` : 'All Projects');

  return (
    <PageStatus loading={loading} error={error} onRetry={retry}>
      <Header
        scrollEnabled
        logoText={data?.site.logo.text ?? 'the'}
        logoSpan={data?.site.logo.span ?? 'shoaib.me'}
        favicon={data?.site.favicon}
        nav={data?.site.nav ?? []}
      />

      <main className="projects-page reveal active">
        <div className="container">
          <Link to="/" className="back-home">
            <i className="fa-solid fa-arrow-left" aria-hidden="true" /> Back to Home
          </Link>

          <div className="section-header projects-page-header active">
            <span className="section-subtitle">{section?.subtitle ?? 'My Works'}</span>
            <h1 className="section-title">All Projects</h1>
            <p className="projects-page-description">
              Explore the full collection of apps, platforms, and tools I have built.
            </p>
          </div>

          <div className="projects-page-grid">
            {data?.projects.map((project, index) => (
              <ProjectCard
                key={project.name}
                project={project}
                index={index}
                animate={false}
                onImageClick={(url) => openModal(url, 'video')}
              />
            ))}
          </div>
        </div>
      </main>

      <ImageModal
        isOpen={isOpen}
        imageSrc={imageSrc ?? ''}
        variant={variant}
        onClose={closeModal}
        onClosed={clearModal}
      />

      <footer className="footer">
        <div className="container footer-content">
          <p
            dangerouslySetInnerHTML={{
              __html: sanitizeHtml(
                data?.site.footer ?? '&copy; 2026 MD Shoaib Khan. All rights reserved.',
              ),
            }}
          />
        </div>
      </footer>
    </PageStatus>
  );
}
