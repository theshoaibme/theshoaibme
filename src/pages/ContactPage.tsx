import { Link } from 'react-router-dom';
import PageStatus from '@/components/common/PageStatus';
import ContactForm from '@/components/sections/ContactForm';
import PolicyHeader from '@/components/layout/PolicyHeader';
import { useDocumentTitle, useSiteData } from '@/hooks/data/useSiteData';
import { usePolicyTheme } from '@/hooks/ui/useTheme';
import { getSiteSection } from '@/utils/siteSections';
import type { Contact } from '@/types';

const CONTACT_ICONS: Record<keyof Contact, string> = {
  location: 'fa-location-dot',
  email: 'fa-envelope',
  phone: 'fa-phone',
};

export default function ContactPage() {
  const { data, loading, error, retry } = useSiteData();
  const section = data ? getSiteSection(data.site.sections, 'contact') : undefined;
  const contact = data?.contact;

  usePolicyTheme();
  useDocumentTitle(section ? `${section.title} | Contact` : 'Contact Me');

  return (
    <PageStatus loading={loading} error={error} onRetry={retry}>
      <PolicyHeader
        logoText={data?.site.logo.text ?? 'Dev'}
        logoSpan={data?.site.logo.span ?? 'Portfolio.'}
        favicon={data?.site.favicon}
      />

      <main className="contact-page reveal active">
        <div className="container">
          <Link to="/" className="back-home">
            <i className="fa-solid fa-arrow-left" aria-hidden="true" /> Back to Home
          </Link>

          <div className="section-header contact-page-header active">
            <span className="section-subtitle">{section?.subtitle ?? 'Get in Touch'}</span>
            <h1 className="section-title">{section?.title ?? 'Contact Me'}</h1>
            <p className="contact-page-description">
              Have a project in mind or want to collaborate? Send me a message and I&apos;ll get
              back to you as soon as possible.
            </p>
          </div>

          {contact ? (
            <div className="contact-wrapper contact-page-wrapper active">
              <div className="contact-info">
                {(Object.keys(contact) as Array<keyof Contact>).map((key) => (
                  <div key={key} className="info-item">
                    <i className={`fa-solid ${CONTACT_ICONS[key]}`} />
                    <div>
                      <h4>{key.charAt(0).toUpperCase() + key.slice(1)}</h4>
                      <p>{contact[key]}</p>
                    </div>
                  </div>
                ))}
              </div>
              <ContactForm />
            </div>
          ) : null}
        </div>
      </main>

      <footer className="footer">
        <div className="container footer-content">
          <p
            dangerouslySetInnerHTML={{
              __html: data?.site.footer ?? '&copy; 2026 MD Shoaib Khan. All rights reserved.',
            }}
          />
        </div>
      </footer>
    </PageStatus>
  );
}
