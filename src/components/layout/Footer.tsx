import { Link } from 'react-router-dom';
import type { Profile } from '@/types';
import LogoMark from '@/components/common/LogoMark';
import { sanitizeHtml } from '@/utils/sanitize';
import { isSafeExternalUrl } from '@/utils/urlValidation';
import { getSocialLabel } from '@/utils/contactLinks';

interface FooterProps {
  footerText: string;
  logoText: string;
  logoSpan: string;
  profile: Profile;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export default function Footer({
  footerText,
  logoText,
  logoSpan,
  profile,
  theme,
  onToggleTheme,
}: FooterProps) {
  return (
    <footer className="footer">
      <div id="footer-big-logo" className="footer-big-logo">
        <LogoMark logoText={logoText} logoSpan={logoSpan} />
      </div>
      <div className="container footer-content">
        <div className="footer-social" id="footer-social">
          {profile.social.map((link) => {
            if (!isSafeExternalUrl(link.url)) return null;
            const label = getSocialLabel(link.url, link.icon);
            return (
              <a
                key={link.url}
                href={link.url}
                target="_blank"
                rel="noreferrer noopener"
                aria-label={label}
                title={label}
              >
                <i className={link.icon} aria-hidden="true" />
                <span className="sr-only">{label}</span>
              </a>
            );
          })}
        </div>
        <p
          id="footer-text"
          className="footer-text"
          dangerouslySetInnerHTML={{ __html: sanitizeHtml(footerText) }}
        />
        <div className="footer-links">
          <Link to="/terms">Terms of Service</Link>
          <span className="separator">•</span>
          <Link to="/privacy">Privacy Policy</Link>
          <span className="separator">•</span>
          <Link to="/resume">Resume</Link>
          <button id="theme-toggle" className="theme-toggle" aria-label="Toggle Theme" onClick={onToggleTheme}>
            <i className={`fa-solid ${theme === 'dark' ? 'fa-moon' : 'fa-sun'}`} />
          </button>
        </div>
      </div>
    </footer>
  );
}
