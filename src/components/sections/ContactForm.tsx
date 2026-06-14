import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import type { ServiceInquiryTemplate } from '@/config/serviceInquiryTemplates';
import { getTurnstileSiteKey, isTurnstileConfigured } from '@/config/turnstile';
import { useContactForm } from '@/hooks/forms/useContactForm';
import { getCookie } from '@/utils/cookies';

interface ContactFormProps {
  className?: string;
  inquiryTemplate?: ServiceInquiryTemplate | null;
}

export default function ContactForm({
  className = 'contact-form',
  inquiryTemplate = null,
}: ContactFormProps) {
  const turnstileRef = useRef<TurnstileInstance>(null);
  const turnstileContainerRef = useRef<HTMLDivElement>(null);
  const [showTurnstile, setShowTurnstile] = useState(false);
  const [turnstileTheme, setTurnstileTheme] = useState<'light' | 'dark' | 'auto'>(() =>
    document.documentElement.classList.contains('dark') ? 'dark' : 'light',
  );
  const {
    values,
    status,
    submitting,
    updateField,
    validateForm,
    requestVerification,
    sendMessage,
    clearStatus,
    applyInquiryTemplate,
  } = useContactForm({
    onResetSecurity: () => {
      turnstileRef.current?.reset();
      setShowTurnstile(false);
    },
  });
  const turnstileSiteKey = getTurnstileSiteKey();

  useEffect(() => {
    const savedTheme = getCookie('theme') || 'light';
    setTurnstileTheme(savedTheme === 'dark' ? 'dark' : 'light');
  }, []);

  useEffect(() => {
    if (!showTurnstile) return;

    turnstileContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [showTurnstile]);

  useEffect(() => {
    if (!inquiryTemplate) return;

    applyInquiryTemplate(inquiryTemplate);
    setShowTurnstile(false);
    turnstileRef.current?.reset();

    window.setTimeout(() => {
      document.getElementById('contact-message')?.focus();
    }, 350);
  }, [applyInquiryTemplate, inquiryTemplate]);

  const handleFieldChange = (field: Parameters<typeof updateField>[0], value: string) => {
    updateField(field, value);

    if (showTurnstile) {
      turnstileRef.current?.reset();
      setShowTurnstile(false);
      clearStatus();
    }
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateForm()) {
      setShowTurnstile(false);
      turnstileRef.current?.reset();
      return;
    }

    const shouldShowTurnstile = requestVerification();
    if (shouldShowTurnstile) {
      setShowTurnstile(true);
    }
  };

  const onTurnstileSuccess = async (token: string) => {
    if (!showTurnstile || submitting || !token) {
      return;
    }

    await sendMessage(token);
  };

  return (
    <form className={className} id="contact-form" onSubmit={onSubmit} noValidate>
      <div style={{ display: 'none' }}>
        <input
          type="text"
          name="honey_pot"
          id="honey-pot"
          value={values.honey_pot}
          onChange={(event) => handleFieldChange('honey_pot', event.target.value)}
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
          onChange={(event) => handleFieldChange('user_name', event.target.value)}
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
          onChange={(event) => handleFieldChange('user_email', event.target.value)}
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
          onChange={(event) => handleFieldChange('subject', event.target.value)}
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
          onChange={(event) => handleFieldChange('message', event.target.value)}
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

      {showTurnstile && isTurnstileConfigured() ? (
        <div ref={turnstileContainerRef} className="form-group contact-turnstile contact-turnstile--visible">
          <Turnstile
            ref={turnstileRef}
            siteKey={turnstileSiteKey}
            onSuccess={onTurnstileSuccess}
            options={{ theme: turnstileTheme }}
          />
        </div>
      ) : null}

      <button type="submit" className="btn btn-primary ripple" id="submit-btn" disabled={submitting}>
        {submitting ? (
          <>
            <i className="fa-solid fa-spinner fa-spin" />
            Sending...
          </>
        ) : (
          <>
            <i className="fa-solid fa-paper-plane" />
            Send Message
          </>
        )}
      </button>

      {!isTurnstileConfigured() ? (
        <p className="contact-turnstile__notice" role="alert">
          Security verification is not configured. Set `VITE_TURNSTILE_SITE_KEY` to enable form
          submissions.
        </p>
      ) : null}
    </form>
  );
}
