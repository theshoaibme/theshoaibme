import { useCallback, useState } from 'react';
import {
  clampContactField,
  getContactFieldErrors,
  getFirstContactFieldError,
  type ContactFieldErrors,
  type ContactFieldKey,
} from '@/config/contactValidation';
import { getContactApiUrl } from '@/config/contact';
import { getTurnstileSetupMessage, isTurnstileConfigured } from '@/config/turnstile';
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

interface UseContactFormOptions {
  onResetSecurity?: () => void;
}

function isHoneypotTriggered(values: ContactFormValues): boolean {
  return Boolean(values.honey_pot.trim());
}

function getConfigError(): string | null {
  if (!isTurnstileConfigured()) {
    return getTurnstileSetupMessage();
  }

  if (!getContactApiUrl()) {
    return 'Contact API is not configured. Set VITE_CONTACT_API_URL to enable secure form submissions.';
  }

  return null;
}

function showSilentSuccess(
  setStatus: (status: ContactFormStatus) => void,
  setValues: (values: ContactFormValues) => void,
  setFieldErrors: (errors: ContactFieldErrors) => void,
  onResetSecurity?: () => void,
): void {
  setStatus({
    type: 'success',
    message: 'Message sent successfully! I will get back to you soon.',
  });
  setValues(INITIAL_VALUES);
  setFieldErrors({});
  onResetSecurity?.();
}

function handleHoneypot(
  values: ContactFormValues,
  setStatus: (status: ContactFormStatus) => void,
  setValues: (values: ContactFormValues) => void,
  setFieldErrors: (errors: ContactFieldErrors) => void,
  onResetSecurity?: () => void,
): boolean {
  if (!isHoneypotTriggered(values)) {
    return false;
  }

  showSilentSuccess(setStatus, setValues, setFieldErrors, onResetSecurity);
  return true;
}

function validateValues(values: ContactFormValues): {
  fieldErrors: ContactFieldErrors;
  formError: string | null;
} {
  const fieldErrors = getContactFieldErrors(values);
  const firstFieldError = getFirstContactFieldError(fieldErrors);

  if (firstFieldError) {
    return { fieldErrors, formError: firstFieldError };
  }

  const configError = getConfigError();
  if (configError) {
    return { fieldErrors: {}, formError: configError };
  }

  return { fieldErrors: {}, formError: null };
}

export function useContactForm(options: UseContactFormOptions = {}) {
  const { onResetSecurity } = options;
  const [values, setValues] = useState<ContactFormValues>(INITIAL_VALUES);
  const [fieldErrors, setFieldErrors] = useState<ContactFieldErrors>({});
  const [status, setStatus] = useState<ContactFormStatus>({ type: 'idle', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const updateField = useCallback((field: ContactFieldKey | 'honey_pot', value: string) => {
    const nextValue = field === 'honey_pot' ? value : clampContactField(field, value);

    setValues((current) => ({ ...current, [field]: nextValue }));

    if (field !== 'honey_pot') {
      setFieldErrors((current) => {
        if (!current[field]) {
          return current;
        }

        const next = { ...current };
        delete next[field];
        return next;
      });
    }
  }, []);

  const validateForm = useCallback((): boolean => {
    if (handleHoneypot(values, setStatus, setValues, setFieldErrors, onResetSecurity)) {
      return false;
    }

    const { fieldErrors: nextFieldErrors, formError } = validateValues(values);

    if (formError) {
      setFieldErrors(nextFieldErrors);
      setStatus({ type: 'error', message: formError });
      return false;
    }

    setFieldErrors({});
    return true;
  }, [onResetSecurity, values]);

  const sendMessage = useCallback(
    async (turnstileToken: string) => {
      if (handleHoneypot(values, setStatus, setValues, setFieldErrors, onResetSecurity)) {
        return true;
      }

      const { fieldErrors: nextFieldErrors, formError } = validateValues(values);

      if (formError) {
        setFieldErrors(nextFieldErrors);
        setStatus({ type: 'error', message: formError });
        return false;
      }

      setSubmitting(true);
      setStatus({ type: 'idle', message: '' });
      setFieldErrors({});

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
        setFieldErrors({});
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
    if (handleHoneypot(values, setStatus, setValues, setFieldErrors, onResetSecurity)) {
      return false;
    }

    const { fieldErrors: nextFieldErrors, formError } = validateValues(values);

    if (formError) {
      setFieldErrors(nextFieldErrors);
      setStatus({ type: 'error', message: formError });
      return false;
    }

    setFieldErrors({});
    setStatus({
      type: 'info',
      message: 'Complete the security check to send your message.',
    });
    return true;
  }, [onResetSecurity, values]);

  const clearStatus = useCallback(() => {
    setStatus({ type: 'idle', message: '' });
  }, []);

  const setFormError = useCallback((message: string) => {
    setStatus({ type: 'error', message });
  }, []);

  const applyInquiryTemplate = useCallback(
    (template: Pick<ContactFormValues, 'subject' | 'message'>) => {
      setValues((current) => ({
        ...current,
        subject: clampContactField('subject', template.subject),
        message: clampContactField('message', template.message),
      }));
      setFieldErrors({});
      setStatus({ type: 'idle', message: '' });
      onResetSecurity?.();
    },
    [onResetSecurity],
  );

  return {
    values,
    fieldErrors,
    status,
    submitting,
    updateField,
    validateForm,
    requestVerification,
    sendMessage,
    clearStatus,
    setFormError,
    applyInquiryTemplate,
  };
}
