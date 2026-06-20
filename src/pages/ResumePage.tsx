import { type ReactNode, useCallback, useMemo, useRef, useState } from 'react';
import PageStatus from '@/components/common/PageStatus';
import Header from '@/components/layout/Header';
import { EducationEntry, ProjectEntry, ResumeDatedRow } from '@/components/resume/ResumeEntries';
import { ResumeSection } from '@/components/resume/ResumeSection';
import { RESUME_CONTENT, type ResumeReferenceItem } from '@/config/resumeContent';
import { useDocumentTitle, useSiteData } from '@/hooks/data/useSiteData';
import { usePolicyTheme } from '@/hooks/ui/useTheme';
import type { NavItem } from '@/types';
import { downloadResumePdf } from '@/utils/downloadResumePdf';
import { resolveImageUrl } from '@/utils/images';
import { sanitizeHtml } from '@/utils/sanitize';
import { formatSkillsForResume } from '@/utils/skills';

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
            E-mail: <a href={`mailto:${reference.email}`}>{reference.email}</a>
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
  const { data, loading, error, retry } = useSiteData();
  const resume = data?.site.resume;
  const content = RESUME_CONTENT;
  const resumeRef = useRef<HTMLElement>(null);
  const [downloading, setDownloading] = useState(false);
  const photoSrc = resolveImageUrl(content.personal.photo);
  const photoIsCrossOrigin =
    photoSrc.length > 0 &&
    new URL(photoSrc, window.location.origin).origin !== window.location.origin;
  const aboutParts = content.about.split('MD Shoaib Khan');
  const skillGroups = data?.skills ? formatSkillsForResume(data.skills) : [];

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
            {skillGroups.map((group) => (
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
    [content, skillGroups],
  );

  usePolicyTheme();
  useDocumentTitle(resume?.title ?? 'Resume | MD Shoaib Khan');

  const handleDownload = useCallback(async () => {
    if (!resumeRef.current || downloading) return;

    setDownloading(true);
    try {
      await downloadResumePdf(resumeRef.current, 'MD_Shoaib_Khan_Resume.pdf');
    } catch (downloadError) {
      console.error('Failed to generate resume PDF', downloadError);
    } finally {
      setDownloading(false);
    }
  }, [downloading]);

  return (
    <PageStatus loading={loading} error={error} onRetry={retry}>
      <Header
        scrollEnabled
        logoText={data?.site.logo.text ?? 'Dev'}
        logoSpan={data?.site.logo.span ?? 'Portfolio.'}
        favicon={data?.site.favicon ?? '/images/favicon.ico'}
        nav={data?.site.nav ?? DEFAULT_NAV}
      />

      <main className="cv-page reveal active">
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
                          <a href={`mailto:${content.personal.email}`}>{content.personal.email}</a>
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
        </div>
      </footer>
    </PageStatus>
  );
}
