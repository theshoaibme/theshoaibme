import emailjs from '@emailjs/browser';
import { useCallback, useState } from 'react';
import { getContactApiUrl, getEmailJsConfig } from '@/config/contact';
import { isRecaptchaConfigured } from '@/config/recaptcha';
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
  onResetCaptcha?: () => void;
}

function getValidationError(values: ContactFormValues): string | null {
  if (values.honey_pot.trim()) {
    return null;
  }

  if (!values.user_name.trim() || !values.user_email.trim() || !values.message.trim()) {
    return 'Please fill in all required fields before sending your message.';
  }

  if (!isRecaptchaConfigured()) {
    return 'Robot verification is not configured. Set VITE_RECAPTCHA_SITE_KEY to enable form submissions.';
  }

  return null;
}

export function useContactForm(options: UseContactFormOptions = {}) {
  const { onResetCaptcha } = options;
  const [values, setValues] = useState<ContactFormValues>(INITIAL_VALUES);
  const [status, setStatus] = useState<ContactFormStatus>({ type: 'idle', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const updateField = useCallback((field: keyof ContactFormValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
  }, []);

  const validateForm = useCallback((): boolean => {
    const validationError = getValidationError(values);

    if (validationError) {
      setStatus({ type: 'error', message: validationError });
      return false;
    }

    return true;
  }, [values]);

  const sendMessage = useCallback(
    async (captchaToken: string) => {
      const validationError = getValidationError(values);

      if (validationError) {
        setStatus({ type: 'error', message: validationError });
        return false;
      }

      setSubmitting(true);
      setStatus({ type: 'idle', message: '' });

      try {
        const apiUrl = getContactApiUrl();

        if (apiUrl) {
          await sendContactViaApi(apiUrl, {
            name: values.user_name.trim(),
            email: values.user_email.trim(),
            subject: values.subject.trim(),
            message: values.message.trim(),
            captchaToken,
          });
        } else {
          const emailJs = getEmailJsConfig();
          emailjs.init(emailJs.publicKey);

          await emailjs.send(emailJs.serviceId, emailJs.templateId, {
            from_name: values.user_name.trim(),
            from_email: values.user_email.trim(),
            subject: values.subject.trim(),
            message: values.message.trim(),
            'g-recaptcha-response': captchaToken,
          });
        }

        setStatus({
          type: 'success',
          message: 'Message sent successfully! I will get back to you soon.',
        });
        setValues(INITIAL_VALUES);
        onResetCaptcha?.();
        return true;
      } catch (error) {
        console.error('Contact form error:', error);
        setStatus({
          type: 'error',
          message: getErrorMessage(error, 'Failed to send message. Please try again later.'),
        });
        onResetCaptcha?.();
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [onResetCaptcha, values],
  );

  const requestVerification = useCallback(() => {
    const validationError = getValidationError(values);

    if (validationError) {
      setStatus({ type: 'error', message: validationError });
      return false;
    }

    setStatus({
      type: 'info',
      message: 'Please complete the robot verification below to send your message.',
    });
    return true;
  }, [values]);

  const clearStatus = useCallback(() => {
    setStatus({ type: 'idle', message: '' });
  }, []);

  return {
    values,
    status,
    submitting,
    updateField,
    validateForm,
    requestVerification,
    sendMessage,
    clearStatus,
  };
}
