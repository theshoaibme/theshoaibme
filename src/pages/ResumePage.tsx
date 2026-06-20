import { Link } from 'react-router-dom';
import PageStatus from '@/components/common/PageStatus';
import PolicyHeader from '@/components/layout/PolicyHeader';
import { useDocumentTitle, useSiteData } from '@/hooks/data/useSiteData';
import { usePolicyTheme } from '@/hooks/ui/useTheme';
import { sanitizeHtml } from '@/utils/sanitize';
import { getSkillCategoryTitle, sortSkills } from '@/utils/skills';
import { isSafeExternalUrl } from '@/utils/urlValidation';

export default function ResumePage() {
  const { data, loading, error, retry } = useSiteData();
  const resume = data?.site.resume;

  usePolicyTheme();
  useDocumentTitle(resume?.title ?? 'Resume | MD Shoaib Khan');

  const featuredProjects = data?.projects.filter((project) => project.featured) ?? [];

  const handlePrint = () => {
    window.print();
  };

  return (
    <PageStatus loading={loading} error={error} onRetry={retry}>
      <PolicyHeader
        logoText={data?.site.logo.text ?? 'Dev'}
        logoSpan={data?.site.logo.span ?? 'Portfolio.'}
        favicon={data?.site.favicon}
      />

      <main className="cv-page reveal active">
        <div className="container">
          <div className="cv-page-toolbar">
            <Link to="/" className="back-home">
              <i className="fa-solid fa-arrow-left" aria-hidden="true" /> Back to Home
            </Link>
            <button type="button" className="btn btn-outline cv-print-btn" onClick={handlePrint}>
              <i className="fa-solid fa-print" aria-hidden="true" />
              Print / Save PDF
            </button>
          </div>

          <article className="cv-document" aria-labelledby="resume-heading">
            <header className="cv-header">
              <p className="section-subtitle">{resume?.subtitle ?? 'Professional Resume'}</p>
              <h1 id="resume-heading" className="cv-name">
                {data?.profile.name}
              </h1>
              <p className="cv-role">{data?.profile.subtitle}</p>

              <ul className="cv-contact-list">
                {data?.contact.email ? (
                  <li>
                    <i className="fa-solid fa-envelope" aria-hidden="true" />
                    <a href={`mailto:${data.contact.email}`}>{data.contact.email}</a>
                  </li>
                ) : null}
                {data?.contact.phone ? (
                  <li>
                    <i className="fa-solid fa-phone" aria-hidden="true" />
                    <a href={`tel:${data.contact.phone.replace(/\s/g, '')}`}>{data.contact.phone}</a>
                  </li>
                ) : null}
                {data?.contact.location ? (
                  <li>
                    <i className="fa-solid fa-location-dot" aria-hidden="true" />
                    <span>{data.contact.location}</span>
                  </li>
                ) : null}
              </ul>

              {data?.profile.social.length ? (
                <ul className="cv-social-list">
                  {data.profile.social.map((link) =>
                    isSafeExternalUrl(link.url) ? (
                      <li key={link.url}>
                        <a href={link.url} rel="noreferrer noopener">
                          <i className={link.icon} aria-hidden="true" />
                          <span>{link.url.replace(/^https?:\/\/(www\.)?/, '')}</span>
                        </a>
                      </li>
                    ) : null,
                  )}
                </ul>
              ) : null}
            </header>

            <section className="cv-section" aria-labelledby="resume-summary-heading">
              <h2 id="resume-summary-heading">Professional Summary</h2>
              <p>{data?.profile.description}</p>
              {data?.about.text[0] ? <p>{data.about.text[0]}</p> : null}
            </section>

            <section className="cv-section" aria-labelledby="resume-experience-heading">
              <h2 id="resume-experience-heading">Work Experience</h2>
              <div className="cv-experience-list">
                {data?.experience.map((item) => (
                  <article key={`${item.role}-${item.duration}`} className="cv-experience-item">
                    <div className="cv-experience-meta">
                      <h3>{item.role}</h3>
                      <span className="cv-experience-date">{item.duration}</span>
                    </div>
                    <p className="cv-experience-company">{item.company}</p>
                    <p>{item.description}</p>
                  </article>
                ))}
              </div>
            </section>

            <section className="cv-section" aria-labelledby="resume-skills-heading">
              <h2 id="resume-skills-heading">Technical Skills</h2>
              <div className="cv-skills-grid">
                {data
                  ? Object.entries(data.skills).map(([key, skills]) => (
                      <div key={key} className="cv-skill-group">
                        <h3>{getSkillCategoryTitle(key)}</h3>
                        <p>{sortSkills(skills).join(', ')}</p>
                      </div>
                    ))
                  : null}
              </div>
            </section>

            {featuredProjects.length > 0 ? (
              <section className="cv-section" aria-labelledby="resume-projects-heading">
                <h2 id="resume-projects-heading">Selected Projects</h2>
                <div className="cv-projects-list">
                  {featuredProjects.map((project) => (
                    <article key={project.name} className="cv-project-item">
                      <div className="cv-project-header">
                        <h3>{project.name}</h3>
                        {project.live_preview && isSafeExternalUrl(project.live_preview) ? (
                          <a href={project.live_preview} rel="noreferrer noopener">
                            Live preview
                          </a>
                        ) : null}
                      </div>
                      <p>{project.description}</p>
                      <p className="cv-project-stack">{project.tech_stack.join(' · ')}</p>
                    </article>
                  ))}
                </div>
              </section>
            ) : null}
          </article>
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
