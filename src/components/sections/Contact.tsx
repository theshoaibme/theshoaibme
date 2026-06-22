import type { ServiceInquiryTemplate } from '@/config/serviceInquiryTemplates';
import ContactForm from '@/components/sections/ContactForm';
import type { Contact, SiteSection } from '@/types';
import { getContactInfoHref, type ContactInfoKey } from '@/utils/contactLinks';

interface ContactProps {
  section: SiteSection;
  contact: Contact;
  inquiryTemplate?: ServiceInquiryTemplate | null;
}

const CONTACT_ICONS: Record<ContactInfoKey, string> = {
  location: 'fa-location-dot',
  email: 'fa-envelope',
  phone: 'fa-phone',
};

const CONTACT_LABELS: Record<ContactInfoKey, string> = {
  location: 'Location',
  email: 'Email',
  phone: 'Phone',
};

const CONTACT_ORDER: ContactInfoKey[] = ['location', 'email', 'phone'];

function ContactInfoItem({ type, value }: { type: ContactInfoKey; value: string }) {
  const href = getContactInfoHref(type, value);
  const label = CONTACT_LABELS[type];
  const content = (
    <>
      <i className={`fa-solid ${CONTACT_ICONS[type]}`} aria-hidden="true" />
      <div>
        <h4>{label}</h4>
        <p>{value}</p>
      </div>
    </>
  );

  if (!href) {
    return <div className="info-item">{content}</div>;
  }

  const external = type === 'location' || type === 'email';

  return (
    <a
      className="info-item info-item--link"
      href={href}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      aria-label={
        type === 'phone'
          ? `Call ${value}`
          : type === 'email'
            ? `Email ${value}`
            : `Open ${value} in Google Maps`
      }
    >
      {content}
    </a>
  );
}

export default function Contact({ section, contact, inquiryTemplate = null }: ContactProps) {
  return (
    <section id="contact" className="section contact">
      <div className="container">
        <div className="section-header reveal">
          <span className="section-subtitle" id="contact-subtitle">
            {section.subtitle}
          </span>
          <h2 className="section-title" id="contact-title">
            {section.title}
          </h2>
        </div>
        <div className="contact-wrapper reveal">
          <div className="contact-info" id="contact-info">
            {CONTACT_ORDER.map((key) => (
              <ContactInfoItem key={key} type={key} value={contact[key]} />
            ))}
          </div>
          <ContactForm inquiryTemplate={inquiryTemplate} />
        </div>
      </div>
    </section>
  );
}
