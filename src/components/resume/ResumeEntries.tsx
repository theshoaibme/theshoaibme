import type { ReactNode } from 'react';
import type { ResumeEducationItem, ResumeProjectItem } from '@/config/resumeContent';
import { isSafeExternalUrl } from '@/utils/urlValidation';

function ProjectLinks({ github, liveDemo }: { github?: string; liveDemo?: string }) {
  const links = [
    github && isSafeExternalUrl(github) ? { label: 'GitHub', href: github } : null,
    liveDemo && isSafeExternalUrl(liveDemo) ? { label: 'Live Demo', href: liveDemo } : null,
  ].filter(Boolean) as { label: string; href: string }[];

  if (!links.length) return null;

  return (
    <p className="cv-pdf-links">
      {links.map((link, index) => (
        <span key={link.href}>
          {index > 0 ? ' | ' : null}
          <a href={link.href} rel="noreferrer noopener">
            {link.label}
          </a>
        </span>
      ))}
    </p>
  );
}

export function ResumeDatedRow({
  date,
  children,
}: {
  date: string;
  children: ReactNode;
}) {
  return (
    <div className="cv-pdf-row cv-pdf-row--entry">
      <div className="cv-pdf-label-col">
        <p className="cv-pdf-date">{date}</p>
      </div>
      <div className="cv-pdf-content-col">{children}</div>
    </div>
  );
}

export function ProjectEntry({ item }: { item: ResumeProjectItem }) {
  return (
    <ResumeDatedRow date={item.date}>
      <article className="cv-pdf-stack-item">
        <h3 className="cv-pdf-heading">{item.title}</h3>
        <p className="cv-pdf-tech">
          <strong>Tech Stack:</strong> {item.techStack}
        </p>
        <p className="cv-pdf-body">{item.description}</p>
        <ProjectLinks github={item.github} liveDemo={item.liveDemo} />
      </article>
    </ResumeDatedRow>
  );
}

export function EducationEntry({ item }: { item: ResumeEducationItem }) {
  return (
    <ResumeDatedRow date={item.date}>
      <article className="cv-pdf-stack-item">
        <h3 className="cv-pdf-heading">{item.degree}</h3>
        <p className="cv-pdf-institution">{item.institution}</p>
        <p className="cv-pdf-detail">{item.detail}</p>
      </article>
    </ResumeDatedRow>
  );
}
