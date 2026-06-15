export const CONTACT_FIELD_LIMITS = {
  name: { min: 2, max: 100 },
  email: { max: 254 },
  subject: { max: 200 },
  message: { min: 10, max: 5000 },
} as const;

export type ContactFieldKey = 'user_name' | 'user_email' | 'subject' | 'message';

export type ContactFieldErrors = Partial<Record<ContactFieldKey, string>>;

export interface ContactValidationValues {
  user_name: string;
  user_email: string;
  subject: string;
  message: string;
  honey_pot?: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validateName(value: string): string | null {
  const name = value.trim();

  if (!name) {
    return 'Please enter your name.';
  }

  if (name.length < CONTACT_FIELD_LIMITS.name.min) {
    return `Name must be at least ${CONTACT_FIELD_LIMITS.name.min} characters.`;
  }

  if (name.length > CONTACT_FIELD_LIMITS.name.max) {
    return `Name must be ${CONTACT_FIELD_LIMITS.name.max} characters or less.`;
  }

  const letterCount = (name.match(/[\p{L}\p{M}]/gu) ?? []).length;
  if (letterCount < CONTACT_FIELD_LIMITS.name.min) {
    return 'Please enter a valid name.';
  }

  if (!/^[\p{L}\p{M}0-9\s'.-]+$/u.test(name)) {
    return 'Please enter a valid name.';
  }

  return null;
}

function validateEmail(value: string): string | null {
  const email = value.trim();

  if (!email) {
    return 'Please enter your email address.';
  }

  if (email.length > CONTACT_FIELD_LIMITS.email.max) {
    return `Email must be ${CONTACT_FIELD_LIMITS.email.max} characters or less.`;
  }

  if (!EMAIL_PATTERN.test(email)) {
    return 'Please enter a valid email address.';
  }

  return null;
}

function validateSubject(value: string): string | null {
  const subject = value.trim();

  if (subject.length > CONTACT_FIELD_LIMITS.subject.max) {
    return `Subject must be ${CONTACT_FIELD_LIMITS.subject.max} characters or less.`;
  }

  return null;
}

function validateMessage(value: string): string | null {
  const message = value.trim();

  if (!message) {
    return 'Please enter your message.';
  }

  if (message.length < CONTACT_FIELD_LIMITS.message.min) {
    return `Message must be at least ${CONTACT_FIELD_LIMITS.message.min} characters.`;
  }

  if (message.length > CONTACT_FIELD_LIMITS.message.max) {
    return `Message must be ${CONTACT_FIELD_LIMITS.message.max} characters or less.`;
  }

  return null;
}

export function getContactFieldErrors(values: ContactValidationValues): ContactFieldErrors {
  const errors: ContactFieldErrors = {};

  const nameError = validateName(values.user_name);
  if (nameError) errors.user_name = nameError;

  const emailError = validateEmail(values.user_email);
  if (emailError) errors.user_email = emailError;

  const subjectError = validateSubject(values.subject);
  if (subjectError) errors.subject = subjectError;

  const messageError = validateMessage(values.message);
  if (messageError) errors.message = messageError;

  return errors;
}

export function getFirstContactFieldError(errors: ContactFieldErrors): string | null {
  const order: ContactFieldKey[] = ['user_name', 'user_email', 'subject', 'message'];

  for (const field of order) {
    if (errors[field]) {
      return errors[field] ?? null;
    }
  }

  return null;
}

export function clampContactField(field: ContactFieldKey, value: string): string {
  switch (field) {
    case 'user_name':
      return value.slice(0, CONTACT_FIELD_LIMITS.name.max);
    case 'user_email':
      return value.slice(0, CONTACT_FIELD_LIMITS.email.max);
    case 'subject':
      return value.slice(0, CONTACT_FIELD_LIMITS.subject.max);
    case 'message':
      return value.slice(0, CONTACT_FIELD_LIMITS.message.max);
    default:
      return value;
  }
}
