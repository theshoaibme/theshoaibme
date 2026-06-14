function isSecureContext(): boolean {
  return typeof window !== 'undefined' && window.location.protocol === 'https:';
}

export function setCookie(name: string, value: string, days?: number): void {
  let expires = '';
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
    expires = `; expires=${date.toUTCString()}`;
  }

  const secure = isSecureContext() ? '; Secure' : '';
  document.cookie = `${name}=${encodeURIComponent(value)}${expires}; path=/; SameSite=Lax${secure}`;
}

export function getCookie(name: string): string | null {
  const nameEQ = `${name}=`;
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1);
    if (c.indexOf(nameEQ) === 0) {
      try {
        return decodeURIComponent(c.substring(nameEQ.length));
      } catch {
        return c.substring(nameEQ.length);
      }
    }
  }
  return null;
}

export function getInitialTheme(): 'light' | 'dark' {
  return getCookie('theme') === 'dark' ? 'dark' : 'light';
}
