import { useCallback, useState } from 'react';
import { getContactApiUrl } from '@/config/contact';
import { isTurnstileConfigured } from '@/config/turnstile';
import { sendContactViaApi } from '@/utils/contactApi';
import { getErrorMessage } from '@/utils/errors';

interface ContactFormValues {
  user_name: string;
  user_email: string;
  subject: string;
  message: string;
  honey_pot: string;
}

type ContactFormStatusType = 'idle' | 'info' | 'success' | 'error';

type ContactFormStatus = {
  type: ContactFormStatusType;
  message: string;
};

const INITIAL_VALUES: ContactFormValues = {
  user_name: '',
  user_email: '',
  subject: '',
  message: '',
  honey_pot: '',
};

const FIELD_LIMITS = {
  name: 100,
  email: 254,
  subject: 200,
  message: 5000,
} as const;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface UseContactFormOptions {
  onResetSecurity?: () => void;
}

function isHoneypotTriggered(values: ContactFormValues): boolean {
  return Boolean(values.honey_pot.trim());
}

function getValidationError(values: ContactFormValues): string | null {
  if (isHoneypotTriggered(values)) {
    return null;
  }

  const name = values.user_name.trim();
  const email = values.user_email.trim();
  const message = values.message.trim();
  const subject = values.subject.trim();

  if (!name || !email || !message) {
    return 'Please fill in all required fields before sending your message.';
  }

  if (name.length > FIELD_LIMITS.name) {
    return 'Name is too long.';
  }

  if (email.length > FIELD_LIMITS.email || !EMAIL_PATTERN.test(email)) {
    return 'Please provide a valid email address.';
  }

  if (subject.length > FIELD_LIMITS.subject) {
    return 'Subject is too long.';
  }

  if (message.length > FIELD_LIMITS.message) {
    return 'Message is too long.';
  }

  if (!isTurnstileConfigured()) {
    return 'Security verification is not configured. Set VITE_TURNSTILE_SITE_KEY to enable form submissions.';
  }

  if (!getContactApiUrl()) {
    return 'Contact API is not configured. Set VITE_CONTACT_API_URL to enable secure form submissions.';
  }

  return null;
}

function showSilentSuccess(
  setStatus: (status: ContactFormStatus) => void,
  setValues: (values: ContactFormValues) => void,
  onResetSecurity?: () => void,
): void {
  setStatus({
    type: 'success',
    message: 'Message sent successfully! I will get back to you soon.',
  });
  setValues(INITIAL_VALUES);
  onResetSecurity?.();
}

function handleHoneypot(
  values: ContactFormValues,
  setStatus: (status: ContactFormStatus) => void,
  setValues: (values: ContactFormValues) => void,
  onResetSecurity?: () => void,
): boolean {
  if (!isHoneypotTriggered(values)) {
    return false;
  }

  showSilentSuccess(setStatus, setValues, onResetSecurity);
  return true;
}

export function useContactForm(options: UseContactFormOptions = {}) {
  const { onResetSecurity } = options;
  const [values, setValues] = useState<ContactFormValues>(INITIAL_VALUES);
  const [status, setStatus] = useState<ContactFormStatus>({ type: 'idle', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const updateField = useCallback((field: keyof ContactFormValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
  }, []);

  const validateForm = useCallback((): boolean => {
    if (handleHoneypot(values, setStatus, setValues, onResetSecurity)) {
      return false;
    }

    const validationError = getValidationError(values);

    if (validationError) {
      setStatus({ type: 'error', message: validationError });
      return false;
    }

    return true;
  }, [onResetSecurity, values]);

  const sendMessage = useCallback(
    async (turnstileToken: string) => {
      if (handleHoneypot(values, setStatus, setValues, onResetSecurity)) {
        return true;
      }

      const validationError = getValidationError(values);

      if (validationError) {
        setStatus({ type: 'error', message: validationError });
        return false;
      }

      setSubmitting(true);
      setStatus({ type: 'idle', message: '' });

      try {
        await sendContactViaApi(getContactApiUrl(), {
          name: values.user_name.trim(),
          email: values.user_email.trim(),
          subject: values.subject.trim(),
          message: values.message.trim(),
          turnstileToken,
          honey_pot: values.honey_pot.trim(),
        });

        setStatus({
          type: 'success',
          message: 'Message sent successfully! I will get back to you soon.',
        });
        setValues(INITIAL_VALUES);
        onResetSecurity?.();
        return true;
      } catch (error) {
        console.error('Contact form error:', error);
        setStatus({
          type: 'error',
          message: getErrorMessage(error, 'Failed to send message. Please try again later.'),
        });
        onResetSecurity?.();
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [onResetSecurity, values],
  );

  const requestVerification = useCallback(() => {
    if (handleHoneypot(values, setStatus, setValues, onResetSecurity)) {
      return false;
    }

    const validationError = getValidationError(values);

    if (validationError) {
      setStatus({ type: 'error', message: validationError });
      return false;
    }

    setStatus({
      type: 'info',
      message: 'Complete the security check to send your message.',
    });
    return true;
  }, [onResetSecurity, values]);

  const clearStatus = useCallback(() => {
    setStatus({ type: 'idle', message: '' });
  }, []);

  const applyInquiryTemplate = useCallback(
    (template: Pick<ContactFormValues, 'subject' | 'message'>) => {
      setValues((current) => ({
        ...current,
        subject: template.subject,
        message: template.message,
      }));
      setStatus({ type: 'idle', message: '' });
      onResetSecurity?.();
    },
    [onResetSecurity],
  );

  return {
    values,
    status,
    submitting,
    updateField,
    validateForm,
    requestVerification,
    sendMessage,
    clearStatus,
    applyInquiryTemplate,
  };
}
