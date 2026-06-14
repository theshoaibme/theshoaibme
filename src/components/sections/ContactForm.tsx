import { useEffect, useRef, useState, type FormEvent } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { getRecaptchaSiteKey, isRecaptchaConfigured } from '@/config/recaptcha';
import { useContactForm } from '@/hooks/forms/useContactForm';
import { getCookie } from '@/utils/cookies';

interface ContactFormProps {
  className?: string;
}

export default function ContactForm({ className = 'contact-form' }: ContactFormProps) {
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const recaptchaContainerRef = useRef<HTMLDivElement>(null);
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [recaptchaTheme, setRecaptchaTheme] = useState<'light' | 'dark'>(() =>
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
  } = useContactForm({
    onResetCaptcha: () => {
      recaptchaRef.current?.reset();
      setShowCaptcha(false);
    },
  });
  const recaptchaSiteKey = getRecaptchaSiteKey();

  useEffect(() => {
    const savedTheme = getCookie('theme') || 'light';
    setRecaptchaTheme(savedTheme === 'dark' ? 'dark' : 'light');
  }, []);

  useEffect(() => {
    if (!showCaptcha) return;

    recaptchaContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [showCaptcha]);

  const handleFieldChange = (field: Parameters<typeof updateField>[0], value: string) => {
    updateField(field, value);

    if (showCaptcha) {
      recaptchaRef.current?.reset();
      setShowCaptcha(false);
      clearStatus();
    }
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!validateForm()) {
      setShowCaptcha(false);
      recaptchaRef.current?.reset();
      return;
    }

    const captchaToken = recaptchaRef.current?.getValue();
    if (captchaToken) {
      await sendMessage(captchaToken);
      return;
    }

    const shouldShowCaptcha = requestVerification();
    if (shouldShowCaptcha) {
      setShowCaptcha(true);
    }
  };

  const onCaptchaChange = async (token: string | null) => {
    if (!token || !showCaptcha || submitting) {
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

      {showCaptcha && isRecaptchaConfigured() ? (
        <div ref={recaptchaContainerRef} className="form-group contact-recaptcha contact-recaptcha--visible">
          <ReCAPTCHA
            ref={recaptchaRef}
            sitekey={recaptchaSiteKey}
            theme={recaptchaTheme}
            onChange={onCaptchaChange}
          />
        </div>
      ) : null}

      {!isRecaptchaConfigured() ? (
        <p className="contact-recaptcha__notice" role="alert">
          Robot verification is not configured. Set `VITE_RECAPTCHA_SITE_KEY` to enable form
          submissions.
        </p>
      ) : null}
    </form>
  );
}
