export const CONTACT_FORM_TEXT = {
  fields: {
    name: {
      label: 'Name',
      placeholder: 'Enter your name',
    },
    email: {
      label: 'Email',
      placeholder: 'Enter your email',
    },
    subject: {
      label: 'Subject',
      placeholder: 'Enter your subject',
    },
    message: {
      label: 'Message',
      placeholder: 'Enter your message',
    },
  },
  security: {
    expiredError: 'Security check expired. Please submit the form again.',
    loadError: 'Security verification failed to load. Please refresh and try again.',
  },
  submit: {
    sending: 'Sending...',
    send: 'Send Message',
  },
} as const;
