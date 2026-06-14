const DEFAULT_EMAILJS = {
  publicKey: '0angy-FFhuMJiDUal',
  serviceId: 'service_rtmlnoj',
  templateId: 'template_o7kynn5',
};

export function getContactApiUrl(): string {
  return import.meta.env.VITE_CONTACT_API_URL?.trim() ?? '';
}

export function isContactApiConfigured(): boolean {
  return Boolean(getContactApiUrl());
}

export function getEmailJsConfig() {
  return {
    publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY?.trim() || DEFAULT_EMAILJS.publicKey,
    serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID?.trim() || DEFAULT_EMAILJS.serviceId,
    templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID?.trim() || DEFAULT_EMAILJS.templateId,
  };
}
