import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile';
import { CONTACT_FIELD_LIMITS } from '@/config/contactValidation';
import type { ServiceInquiryTemplate } from '@/config/serviceInquiryTemplates';
import { CONTACT_FORM_TEXT } from '@/data/contactFormData';
import { useContactForm } from '@/hooks/forms/useContactForm';
import { scrollToElement } from '@/utils/smoothScroll';

const MESSAGE_MIN_HEIGHT = 96;
const MESSAGE_MAX_HEIGHT = 360;
const TURNSTILE_SITE_KEY = (process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? '').trim();

interface ContactFormProps {
  className?: string;
  inquiryTemplate?: ServiceInquiryTemplate | null;
}

export default function ContactForm({
  className = 'contact-form',
  inquiryTemplate = null,
}: ContactFormProps) {
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const turnstileRef = useRef<TurnstileInstance | null>(null);
  const appliedInquiryKeyRef = useRef<string | null>(null);
  const [messageScrollable, setMessageScrollable] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState('');
  const [turnstileActive, setTurnstileActive] = useState(false);

  const handleResetSecurity = useCallback(() => {
    setTurnstileToken('');
    turnstileRef.current?.reset();
  }, []);

  const {
    values,
    fieldErrors,
    status,
    submitting,
    updateField,
    validateForm,
    sendMessage,
    applyInquiryTemplate,
  } = useContactForm({ onResetSecurity: handleResetSecurity });

  const adjustMessageHeight = useCallback(() => {
    const textarea = messageRef.current;
    if (!textarea) return;

    textarea.style.height = 'auto';
    const scrollHeight = textarea.scrollHeight;
    const nextHeight = Math.min(Math.max(scrollHeight, MESSAGE_MIN_HEIGHT), MESSAGE_MAX_HEIGHT);
    const isScrollable = scrollHeight > MESSAGE_MAX_HEIGHT;

    textarea.style.height = `${nextHeight}px`;
    textarea.classList.toggle('is-scrollable', isScrollable);
    setMessageScrollable(isScrollable);
  }, []);

  useEffect(() => {
    adjustMessageHeight();
  }, [values.message, adjustMessageHeight]);

  useEffect(() => {
    if (!inquiryTemplate) {
      appliedInquiryKeyRef.current = null;
      return;
    }

    if (appliedInquiryKeyRef.current === inquiryTemplate.key) {
      return;
    }

    appliedInquiryKeyRef.current = inquiryTemplate.key;
    applyInquiryTemplate(inquiryTemplate);

    window.setTimeout(() => {
      adjustMessageHeight();
      messageRef.current && scrollToElement(messageRef.current);
      messageRef.current?.focus();
    }, 400);
  }, [adjustMessageHeight, applyInquiryTemplate, inquiryTemplate]);

  const handleFieldChange = (field: Parameters<typeof updateField>[0], value: string) => {
    updateField(field, value);

    if (field === 'message') {
      window.requestAnimationFrame(adjustMessageHeight);
    }
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTurnstileActive(true);

    if (!validateForm()) {
      return;
    }

    await sendMessage(turnstileToken);
  };

  return (
    <form
      className={className}
      id="contact-form"
      onFocusCapture={() => setTurnstileActive(true)}
      onSubmit={onSubmit}
      noValidate
    >
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
          {CONTACT_FORM_TEXT.fields.name.label}
        </label>
        <input
          type="text"
          id="contact-name"
          name="user_name"
          required
          minLength={CONTACT_FIELD_LIMITS.name.min}
          maxLength={CONTACT_FIELD_LIMITS.name.max}
          autoComplete="name"
          placeholder={CONTACT_FORM_TEXT.fields.name.placeholder}
          value={values.user_name}
          aria-invalid={Boolean(fieldErrors.user_name)}
          aria-describedby={fieldErrors.user_name ? 'contact-name-error' : undefined}
          className={fieldErrors.user_name ? 'is-invalid' : undefined}
          onChange={(event) => handleFieldChange('user_name', event.target.value)}
        />
        {fieldErrors.user_name ? (
          <p className="field-error" id="contact-name-error" role="alert">
            {fieldErrors.user_name}
          </p>
        ) : null}
      </div>
      <div className="form-group">
        <label className="floating-label" htmlFor="contact-email">
          {CONTACT_FORM_TEXT.fields.email.label}
        </label>
        <input
          type="email"
          id="contact-email"
          name="user_email"
          required
          maxLength={CONTACT_FIELD_LIMITS.email.max}
          autoComplete="email"
          placeholder={CONTACT_FORM_TEXT.fields.email.placeholder}
          value={values.user_email}
          aria-invalid={Boolean(fieldErrors.user_email)}
          aria-describedby={fieldErrors.user_email ? 'contact-email-error' : undefined}
          className={fieldErrors.user_email ? 'is-invalid' : undefined}
          onChange={(event) => handleFieldChange('user_email', event.target.value)}
        />
        {fieldErrors.user_email ? (
          <p className="field-error" id="contact-email-error" role="alert">
            {fieldErrors.user_email}
          </p>
        ) : null}
      </div>
      <div className="form-group">
        <label className="floating-label" htmlFor="contact-subject">
          {CONTACT_FORM_TEXT.fields.subject.label}
        </label>
        <input
          type="text"
          id="contact-subject"
          name="subject"
          maxLength={CONTACT_FIELD_LIMITS.subject.max}
          placeholder={CONTACT_FORM_TEXT.fields.subject.placeholder}
          value={values.subject}
          aria-invalid={Boolean(fieldErrors.subject)}
          aria-describedby={fieldErrors.subject ? 'contact-subject-error' : undefined}
          className={fieldErrors.subject ? 'is-invalid' : undefined}
          onChange={(event) => handleFieldChange('subject', event.target.value)}
        />
        {fieldErrors.subject ? (
          <p className="field-error" id="contact-subject-error" role="alert">
            {fieldErrors.subject}
          </p>
        ) : null}
      </div>
      <div className="form-group">
        <div className="form-group__label-row">
          <label className="floating-label" htmlFor="contact-message">
            {CONTACT_FORM_TEXT.fields.message.label}
          </label>
          <span
            className={`field-counter${
              values.message.length >= CONTACT_FIELD_LIMITS.message.max ? ' is-limit' : ''
            }`}
            aria-live="polite"
          >
            {values.message.length}/{CONTACT_FIELD_LIMITS.message.max}
          </span>
        </div>
        <textarea
          ref={messageRef}
          id="contact-message"
          data-lenis-prevent={messageScrollable ? '' : undefined}
          className={`contact-message-input${messageScrollable ? ' is-scrollable' : ''}${
            fieldErrors.message ? ' is-invalid' : ''
          }`}
          name="message"
          rows={4}
          required
          minLength={CONTACT_FIELD_LIMITS.message.min}
          maxLength={CONTACT_FIELD_LIMITS.message.max}
          placeholder={CONTACT_FORM_TEXT.fields.message.placeholder}
          value={values.message}
          aria-invalid={Boolean(fieldErrors.message)}
          aria-describedby={fieldErrors.message ? 'contact-message-error' : undefined}
          onChange={(event) => handleFieldChange('message', event.target.value)}
        />
        {fieldErrors.message ? (
          <p className="field-error" id="contact-message-error" role="alert">
            {fieldErrors.message}
          </p>
        ) : null}
      </div>

      {TURNSTILE_SITE_KEY && turnstileActive ? (
        <div className="contact-turnstile contact-turnstile--visible" style={{ marginBottom: '12px' }}>
          <Turnstile
            ref={turnstileRef}
            siteKey={TURNSTILE_SITE_KEY}
            onSuccess={setTurnstileToken}
            onExpire={() => setTurnstileToken('')}
            onError={() => setTurnstileToken('')}
          />
        </div>
      ) : null}

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
            {CONTACT_FORM_TEXT.submit.sending}
          </>
        ) : (
          <>
            <i className="fa-solid fa-paper-plane" />
            {CONTACT_FORM_TEXT.submit.send}
          </>
        )}
      </button>
    </form>
  );
}
