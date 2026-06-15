import { Link } from 'react-router-dom';
import type { NavItem } from '@/types';
import LogoMark from '@/components/common/LogoMark';
import { useHeaderScroll } from '@/hooks/scroll/useHeaderScroll';
import { resolveAssetPath } from '@/utils/logo';
import { isSafeNavLink } from '@/utils/urlValidation';

interface HeaderProps {
  logoText: string;
  logoSpan: string;
  favicon: string;
  nav: NavItem[];
  scrollEnabled?: boolean;
}

export default function Header({ logoText, logoSpan, favicon, nav, scrollEnabled = true }: HeaderProps) {
  const { headerClassName } = useHeaderScroll({ enabled: scrollEnabled });
  const faviconSrc = resolveAssetPath(favicon);

  return (
    <header className={headerClassName}>
      <div className="container">
        <a href="#hero" className="logo" id="site-logo">
          <img src={faviconSrc} alt="Icon" className="logo-icon" />
          <div>
            <LogoMark logoText={logoText} logoSpan={logoSpan} />
          </div>
        </a>
        <nav className="navbar" id="site-nav">
          {nav.map((item, index) =>
            !isSafeNavLink(item.link) ? null : item.link.startsWith('/') ? (
              <Link
                key={item.link}
                to={item.link}
                className={index === 0 ? 'active' : undefined}
              >
                {item.label}
              </Link>
            ) : (
              <a
                key={item.link}
                href={item.link}
                className={index === 0 ? 'active' : undefined}
              >
                {item.label}
              </a>
            ),
          )}
        </nav>
        <div className="mobile-toggle">
          <i className="fa-solid fa-bars" />
        </div>
      </div>
    </header>
  );
}
