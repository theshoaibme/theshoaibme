import { Link } from 'react-router-dom';
import type { Profile } from '@/types';
import LogoMark from '@/components/common/LogoMark';
import { sanitizeHtml } from '@/utils/sanitize';
import { isSafeExternalUrl } from '@/utils/urlValidation';

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
          {profile.social.map((link) =>
            isSafeExternalUrl(link.url) ? (
              <a key={link.url} href={link.url} target="_blank" rel="noreferrer noopener">
                <i className={link.icon} />
              </a>
            ) : null,
          )}
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
