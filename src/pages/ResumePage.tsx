import { type ReactNode, useCallback, useMemo, useRef, useState } from 'react';
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile';
import PageStatus from '@/components/common/PageStatus';
import Header from '@/components/layout/Header';
import { EducationEntry, ProjectEntry, ResumeDatedRow } from '@/components/resume/ResumeEntries';
import { ResumeSection } from '@/components/resume/ResumeSection';
import { isResumeDownloadTrackingConfigured } from '@/config/download';
import { RESUME_CONTENT, type ResumeReferenceItem } from '@/config/resumeContent';
import { getTurnstileSiteKey, isTurnstileConfigured } from '@/config/turnstile';
import { useDocumentTitle, useSiteData } from '@/hooks/data/useSiteData';
import { useTheme } from '@/hooks/ui/useTheme';
import type { NavItem } from '@/types';
import { runResumeDownloadPipeline } from '@/utils/resumeDownloadPipeline';
import { resolveImageUrl } from '@/utils/images';
import { sanitizeHtml } from '@/utils/sanitize';

const DEFAULT_NAV: NavItem[] = [
  { label: 'Home', link: '#hero' },
  { label: 'About', link: '#about' },
  { label: 'Skills', link: '#skills' },
  { label: 'Services', link: '#services' },
  { label: 'Portfolio', link: '#portfolio' },
  { label: 'Contact', link: '#contact' },
];

type SectionModifier = 'continued' | 'last-on-page';

interface ResumeSectionConfig {
  key: string;
  label?: string;
  modifier?: SectionModifier;
  useBodyRow?: boolean;
  content: ReactNode;
}

function ReferencesContent({ references }: { references: ResumeReferenceItem[] }) {
  return (
    <div className="cv-pdf-references">
      {references.map((reference) => (
        <article key={reference.name} className="cv-pdf-reference">
          <h3 className="cv-pdf-reference-name">{reference.name}</h3>
          {reference.lines.map((line) => (
            <p key={line}>{line}</p>
          ))}
          <p>
            E-mail:{' '}
            <a
              href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(reference.email)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {reference.email}
            </a>
          </p>
          <p>Cell-phone: {reference.phone}</p>
        </article>
      ))}
    </div>
  );
}

function ResumeSections({ sections }: { sections: ResumeSectionConfig[] }) {
  return (
    <>
      {sections.map(({ key, label, modifier, useBodyRow, content }) => (
        <ResumeSection key={key} label={label} modifier={modifier} useBodyRow={useBodyRow}>
          {content}
        </ResumeSection>
      ))}
    </>
  );
}

export default function ResumePage() {
  const { data, error, retry } = useSiteData();
  const resume = data?.site.resume;
  const content = RESUME_CONTENT;
  const resumeRef = useRef<HTMLElement>(null);
  const turnstileRef = useRef<TurnstileInstance>(null);
  const pendingDownloadRef = useRef(false);
  const turnstileReadyRef = useRef(false);
  const [downloading, setDownloading] = useState(false);
  const [honeyPot, setHoneyPot] = useState('');
  const [turnstileTheme, setTurnstileTheme] = useState<'light' | 'dark'>(() =>
    document.documentElement.classList.contains('dark') ? 'dark' : 'light',
  );
  const { theme, toggleTheme } = useTheme(() => {
    setTurnstileTheme(document.documentElement.classList.contains('dark') ? 'dark' : 'light');
  });
  const turnstileSiteKey = getTurnstileSiteKey();
  const secureTrackingEnabled =
    isTurnstileConfigured() && isResumeDownloadTrackingConfigured() && Boolean(turnstileSiteKey);
  const photoSrc = resolveImageUrl(content.personal.photo);
  const photoIsCrossOrigin =
    photoSrc.length > 0 &&
    new URL(photoSrc, window.location.origin).origin !== window.location.origin;
  const aboutParts = content.about.split('MD Shoaib Khan');

  const pageOneSections = useMemo<ResumeSectionConfig[]>(
    () => [
      {
        key: 'about',
        label: 'About',
        useBodyRow: true,
        content: (
          <p className="cv-pdf-body">
            {aboutParts[0]}
            <strong>MD Shoaib Khan</strong>
            {aboutParts[1]}
          </p>
        ),
      },
      {
        key: 'work-experience',
        label: 'Work Experience',
        content: (
          <ResumeDatedRow date={content.workExperience.date}>
            <article className="cv-pdf-stack-item">
              <h3 className="cv-pdf-heading">{content.workExperience.role}</h3>
              <p className="cv-pdf-subheading">{content.workExperience.project}</p>
              <p className="cv-pdf-body">{content.workExperience.description}</p>
            </article>
          </ResumeDatedRow>
        ),
      },
      {
        key: 'education',
        label: 'Education',
        content: content.education.map((item) => (
          <EducationEntry key={item.degree} item={item} />
        )),
      },
      {
        key: 'project-page-1',
        label: 'Project',
        modifier: 'last-on-page',
        content: content.projectsPage1.map((item) => (
          <ProjectEntry key={item.title} item={item} />
        )),
      },
    ],
    [aboutParts, content],
  );

  const pageTwoSections = useMemo<ResumeSectionConfig[]>(
    () => [
      {
        key: 'project-page-2',
        modifier: 'continued',
        content: content.projectsPage2.map((item) => (
          <ProjectEntry key={item.title} item={item} />
        )),
      },
      {
        key: 'skills',
        label: 'Skills',
        useBodyRow: true,
        content: (
          <ul className="cv-pdf-skills">
            {content.skills.map((group) => (
              <li key={group.label}>
                <strong>{group.label}:</strong> {group.items}
              </li>
            ))}
          </ul>
        ),
      },
      {
        key: 'references',
        label: 'References',
        useBodyRow: true,
        content: <ReferencesContent references={content.references} />,
      },
    ],
    [content],
  );

  useDocumentTitle(resume?.title ?? 'Resume | MD Shoaib Khan');

  const runDownload = useCallback(
    async (turnstileToken?: string) => {
      if (!resumeRef.current) {
        return;
      }

      setDownloading(true);

      try {
        await runResumeDownloadPipeline({
          article: resumeRef.current,
          filename: 'MD_Shoaib_Khan_Resume.pdf',
          source: 'resume-page',
          turnstileToken,
          honey_pot: honeyPot,
        });
      } catch (downloadError) {
        console.error('Failed to generate resume PDF', downloadError);
      } finally {
        setDownloading(false);
        pendingDownloadRef.current = false;
        turnstileRef.current?.reset();
      }
    },
    [honeyPot],
  );

  const handleTurnstileSuccess = useCallback(
    async (token: string) => {
      if (!pendingDownloadRef.current || !token) {
        return;
      }

      await runDownload(token);
    },
    [runDownload],
  );

  const handleTurnstileError = useCallback(() => {
    if (!pendingDownloadRef.current) {
      return;
    }

    void runDownload();
  }, [runDownload]);

  const handleDownload = useCallback(() => {
    if (!resumeRef.current || downloading) {
      return;
    }

    if (secureTrackingEnabled) {
      pendingDownloadRef.current = true;

      if (!turnstileReadyRef.current) {
        pendingDownloadRef.current = false;
        void runDownload();
        return;
      }

      turnstileRef.current?.execute();
      return;
    }

    void runDownload();
  }, [downloading, runDownload, secureTrackingEnabled]);

  if (error && !data) {
    return (
      <PageStatus loading={false} error={error} onRetry={retry}>
        {null}
      </PageStatus>
    );
  }

  return (
    <>
      <Header
        scrollEnabled
        logoText={data?.site.logo.text ?? 'Dev'}
        logoSpan={data?.site.logo.span ?? 'Portfolio.'}
        favicon={data?.site.favicon ?? '/images/favicon.ico'}
        nav={data?.site.nav ?? DEFAULT_NAV}
      />

      <main className="cv-page">
        <div className="container cv-page-container">
          <div className="cv-page-layout">
            <div className="cv-pdf-scroll">
              <article
                ref={resumeRef}
                className="cv-document cv-pdf-document"
                aria-labelledby="resume-heading"
              >
                <div className="cv-pdf-page cv-pdf-page--1">
                  <section className="cv-pdf-row cv-pdf-row--personal">
                    <div className="cv-pdf-label-col">
                      <h2 className="cv-pdf-label">Personal Information</h2>
                      {photoSrc ? (
                        <img
                          src={photoSrc}
                          alt={content.personal.name}
                          className="cv-pdf-photo"
                          loading="eager"
                          crossOrigin={photoIsCrossOrigin ? 'anonymous' : undefined}
                        />
                      ) : null}
                    </div>
                    <div className="cv-pdf-content-col">
                      <h1 id="resume-heading" className="cv-pdf-name">
                        {content.personal.name}
                      </h1>
                      <ul className="cv-pdf-contact">
                        <li>
                          <i className="fa-solid fa-envelope" aria-hidden="true" />
                          <a
                            href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(content.personal.email)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {content.personal.email}
                          </a>
                        </li>
                        <li>
                          <i className="fa-solid fa-phone" aria-hidden="true" />
                          <a href={`tel:${content.personal.phone.replace(/\s/g, '')}`}>
                            {content.personal.phone}
                          </a>
                        </li>
                        <li>
                          <i className="fa-solid fa-location-dot" aria-hidden="true" />
                          <span>{content.personal.address}</span>
                        </li>
                        <li>
                          <i className="fa-solid fa-globe" aria-hidden="true" />
                          <a
                            href={content.personal.website}
                            className="cv-pdf-link"
                            rel="noreferrer noopener"
                          >
                            {content.personal.website}
                          </a>
                        </li>
                        <li>
                          <i className="fa-brands fa-github" aria-hidden="true" />
                          <a
                            href={content.personal.github}
                            className="cv-pdf-link"
                            rel="noreferrer noopener"
                          >
                            {content.personal.github}
                          </a>
                        </li>
                      </ul>
                      <p className="cv-pdf-meta">
                        Sex {content.personal.sex} | Date Of Birth {content.personal.dateOfBirth}
                      </p>
                    </div>
                  </section>

                  <ResumeSections sections={pageOneSections} />
                </div>

                <div className="cv-pdf-page cv-pdf-page--2">
                  <ResumeSections sections={pageTwoSections} />

                  <footer className="cv-pdf-declaration">
                    <p>{content.declaration}</p>
                    <div className="cv-pdf-signature">
                      <span className="cv-pdf-signature-line" aria-hidden="true" />
                      <p>{content.personal.name}</p>
                    </div>
                  </footer>
                </div>
              </article>
            </div>

            <div className="cv-page-download">
              <div style={{ display: 'none' }} aria-hidden="true">
                <input
                  type="text"
                  name="company"
                  tabIndex={-1}
                  autoComplete="off"
                  value={honeyPot}
                  onChange={(event) => setHoneyPot(event.target.value)}
                />
              </div>

              {secureTrackingEnabled ? (
                <div className="cv-download-turnstile" aria-hidden="true">
                  <Turnstile
                    ref={turnstileRef}
                    siteKey={turnstileSiteKey}
                    options={{
                      size: 'invisible',
                      execution: 'execute',
                      appearance: 'execute',
                      theme: turnstileTheme,
                    }}
                    onWidgetLoad={() => {
                      turnstileReadyRef.current = true;
                    }}
                    onSuccess={handleTurnstileSuccess}
                    onError={handleTurnstileError}
                    onExpire={() => {
                      turnstileReadyRef.current = false;
                      turnstileRef.current?.reset();
                    }}
                  />
                </div>
              ) : null}

              <button
                type="button"
                className="btn btn-outline cv-download-btn"
                onClick={handleDownload}
                disabled={downloading}
              >
                <i className="fa-solid fa-download" aria-hidden="true" />
                {downloading ? 'Generating PDF...' : 'Download Resume'}
              </button>
            </div>
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
          <div className="footer-links">
            <button
              type="button"
              className="theme-toggle"
              aria-label="Toggle Theme"
              onClick={toggleTheme}
            >
              <i className={`fa-solid ${theme === 'dark' ? 'fa-moon' : 'fa-sun'}`} />
            </button>
          </div>
        </div>
      </footer>
    </>
  );
}
