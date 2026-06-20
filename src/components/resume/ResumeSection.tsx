import type { ReactNode } from 'react';

function ResumeDivider() {
  return <div className="cv-pdf-divider" aria-hidden="true" />;
}

export function ResumeSectionHeader({ label }: { label: string }) {
  return (
    <div className="cv-pdf-header-row">
      <div className="cv-pdf-label-col">
        <h2 className="cv-pdf-label">{label}</h2>
      </div>
      <div className="cv-pdf-content-col">
        <ResumeDivider />
      </div>
    </div>
  );
}

export function ResumeSectionBody({ children }: { children: ReactNode }) {
  return (
    <div className="cv-pdf-body-row">
      <div className="cv-pdf-label-col" aria-hidden="true" />
      <div className="cv-pdf-content-col">{children}</div>
    </div>
  );
}

type ResumeSectionModifier = 'continued' | 'last-on-page';

interface ResumeSectionProps {
  label?: string;
  modifier?: ResumeSectionModifier;
  useBodyRow?: boolean;
  children: ReactNode;
}

const MODIFIER_CLASS: Record<ResumeSectionModifier, string> = {
  continued: 'cv-pdf-section-block--continued',
  'last-on-page': 'cv-pdf-section-block--last-on-page',
};

export function ResumeSection({
  label,
  modifier,
  useBodyRow = false,
  children,
}: ResumeSectionProps) {
  const sectionClassName = modifier
    ? `cv-pdf-section-block ${MODIFIER_CLASS[modifier]}`
    : 'cv-pdf-section-block';

  return (
    <section className={sectionClassName}>
      {label ? <ResumeSectionHeader label={label} /> : null}
      {useBodyRow ? <ResumeSectionBody>{children}</ResumeSectionBody> : children}
    </section>
  );
}
