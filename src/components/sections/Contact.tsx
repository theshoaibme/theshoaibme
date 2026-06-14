import type { ServiceInquiryTemplate } from '@/config/serviceInquiryTemplates';
import ContactForm from '@/components/sections/ContactForm';
import type { Contact, SiteSection } from '@/types';

interface ContactProps {
  section: SiteSection;
  contact: Contact;
  inquiryTemplate?: ServiceInquiryTemplate | null;
}

const CONTACT_ICONS: Record<keyof Contact, string> = {
  location: 'fa-location-dot',
  email: 'fa-envelope',
  phone: 'fa-phone',
};

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
          <ContactForm inquiryTemplate={inquiryTemplate} />
        </div>
      </div>
    </section>
  );
}
