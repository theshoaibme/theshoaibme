import { Link } from 'react-router-dom';
import type { Profile } from '@/types';
import { buildColoredLogoText, buildLogoSpan } from '@/utils/logo';

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
  const coloredText = buildColoredLogoText(logoText);
  const spanHtml = buildLogoSpan(logoSpan);

  return (
    <footer className="footer">
      <div
        id="footer-big-logo"
        className="footer-big-logo"
        dangerouslySetInnerHTML={{
          __html: `${coloredText}<span>${spanHtml}</span>`,
        }}
      />
      <div className="container footer-content">
        <div className="footer-social" id="footer-social">
          {profile.social.map((link) => (
            <a key={link.url} href={link.url}>
              <i className={link.icon} />
            </a>
          ))}
        </div>
        <p
          id="footer-text"
          className="footer-text"
          dangerouslySetInnerHTML={{ __html: footerText }}
        />
        <div className="footer-links">
          <Link to="/terms">Terms of Service</Link>
          <span className="separator">•</span>
          <Link to="/privacy">Privacy Policy</Link>
          <button id="theme-toggle" className="theme-toggle" aria-label="Toggle Theme" onClick={onToggleTheme}>
            <i className={`fa-solid ${theme === 'dark' ? 'fa-moon' : 'fa-sun'}`} />
          </button>
        </div>
      </div>
    </footer>
  );
}
