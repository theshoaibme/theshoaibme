import emailjs from '@emailjs/browser';
import { useCallback, useState, type FormEvent } from 'react';
import { getErrorMessage } from '@/utils/errors';

interface ContactFormValues {
  user_name: string;
  user_email: string;
  subject: string;
  message: string;
  honey_pot: string;
}

type ContactFormStatus = {
  type: 'idle' | 'success' | 'error';
  message: string;
};

const INITIAL_VALUES: ContactFormValues = {
  user_name: '',
  user_email: '',
  subject: '',
  message: '',
  honey_pot: '',
};

export function useContactForm() {
  const [values, setValues] = useState<ContactFormValues>(INITIAL_VALUES);
  const [status, setStatus] = useState<ContactFormStatus>({ type: 'idle', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const updateField = useCallback((field: keyof ContactFormValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
  }, []);

  const handleSubmit = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (values.honey_pot.trim()) {
      return;
    }

    if (!values.user_name.trim() || !values.user_email.trim() || !values.message.trim()) {
      setStatus({
        type: 'error',
        message: 'Please fill in all required fields before sending your message.',
      });
      return;
    }

    setSubmitting(true);
    setStatus({ type: 'idle', message: '' });

    try {
      emailjs.init('0angy-FFhuMJiDUal');

      await emailjs.send('service_rtmlnoj', 'template_o7kynn5', {
        from_name: values.user_name.trim(),
        from_email: values.user_email.trim(),
        subject: values.subject.trim(),
        message: values.message.trim(),
      });

      setStatus({
        type: 'success',
        message: 'Message sent successfully! I will get back to you soon.',
      });
      setValues(INITIAL_VALUES);
    } catch (error) {
      console.error('EmailJS Error:', error);
      setStatus({
        type: 'error',
        message: getErrorMessage(error, 'Failed to send message. Please try again later.'),
      });
    } finally {
      setSubmitting(false);
    }
  }, [values]);

  return {
    values,
    status,
    submitting,
    updateField,
    handleSubmit,
  };
}
