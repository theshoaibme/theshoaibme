import { Link } from 'react-router-dom';
import PageStatus from '@/components/common/PageStatus';
import PolicyHeader from '@/components/layout/PolicyHeader';
import ProjectCard from '@/components/sections/ProjectCard';
import { useDocumentTitle, useSiteData } from '@/hooks/data/useSiteData';
import { usePolicyTheme } from '@/hooks/ui/useTheme';
import { sanitizeHtml } from '@/utils/sanitize';
import { getSiteSection } from '@/utils/siteSections';

export default function ProjectsPage() {
  const { data, loading, error, retry } = useSiteData();
  const section = data ? getSiteSection(data.site.sections, 'portfolio') : undefined;

  usePolicyTheme();
  useDocumentTitle(section ? `${section.title} | Projects` : 'All Projects');

  return (
    <PageStatus loading={loading} error={error} onRetry={retry}>
      <PolicyHeader
        logoText={data?.site.logo.text ?? 'Dev'}
        logoSpan={data?.site.logo.span ?? 'Portfolio.'}
        favicon={data?.site.favicon}
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

          <div className="portfolio-grid projects-page-grid">
            {data?.projects.map((project, index) => (
              <ProjectCard key={project.name} project={project} index={index} animate={false} />
            ))}
          </div>
        </div>
      </main>

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
