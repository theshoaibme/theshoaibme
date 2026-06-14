import type { Contact, SiteSection } from '@/types';
import { useContactForm } from '@/hooks/forms/useContactForm';

interface ContactProps {
  section: SiteSection;
  contact: Contact;
}

const CONTACT_ICONS: Record<keyof Contact, string> = {
  location: 'fa-location-dot',
  email: 'fa-envelope',
  phone: 'fa-phone',
};

export default function Contact({ section, contact }: ContactProps) {
  const { values, status, submitting, updateField, handleSubmit } = useContactForm();

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
          <form className="contact-form" id="contact-form" onSubmit={handleSubmit} noValidate>
            <div style={{ display: 'none' }}>
              <input
                type="text"
                name="honey_pot"
                id="honey-pot"
                value={values.honey_pot}
                onChange={(event) => updateField('honey_pot', event.target.value)}
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            <div className="form-group">
              <label className="floating-label" htmlFor="contact-name">
                Name
              </label>
              <input
                type="text"
                id="contact-name"
                name="user_name"
                required
                placeholder="Enter your name"
                value={values.user_name}
                onChange={(event) => updateField('user_name', event.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="floating-label" htmlFor="contact-email">
                Email
              </label>
              <input
                type="email"
                id="contact-email"
                name="user_email"
                required
                placeholder="Enter your email"
                value={values.user_email}
                onChange={(event) => updateField('user_email', event.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="floating-label" htmlFor="contact-subject">
                Subject
              </label>
              <input
                type="text"
                id="contact-subject"
                name="subject"
                placeholder="Enter your subject"
                value={values.subject}
                onChange={(event) => updateField('subject', event.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="floating-label" htmlFor="contact-message">
                Message
              </label>
              <textarea
                id="contact-message"
                name="message"
                rows={4}
                required
                placeholder="Enter your message"
                value={values.message}
                onChange={(event) => updateField('message', event.target.value)}
              />
            </div>
            <div
              id="contact-status"
              className={`contact-status${status.type !== 'idle' ? ` ${status.type}` : ''}`}
              role="status"
              aria-live="polite"
            >
              {status.message}
            </div>
            <button
              type="submit"
              className="btn btn-primary ripple"
              id="submit-btn"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <i className="fa-solid fa-paper-plane" />
                  <span>Send Message</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
