export function buildColoredLogoText(logoText: string): string {
  let charIndex = 0;
  return logoText
    .split('')
    .map((char) => {
      if (char.trim() === '') return char;
      charIndex += 1;
      return `<span class="logo-char-${charIndex}">${char}</span>`;
    })
    .join('');
}

export function buildLogoSpan(span: string): string {
  return span.replace(/\.$/, '<span class="logo-dot">.</span>');
}

export function resolveAssetPath(path: string): string {
  if (path.startsWith('http') || path.startsWith('/')) {
    return path;
  }
  return `/${path.replace(/^public\//, '')}`;
}
