import { useCallback, useState } from 'react';
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
  const [menuOpen, setMenuOpen] = useState(false);
  const { headerClassName } = useHeaderScroll({ enabled: scrollEnabled });
  const faviconSrc = resolveAssetPath(favicon);

  const toggleMenu = useCallback(() => {
    setMenuOpen((open) => !open);
  }, []);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
  }, []);

  return (
    <header className={`${headerClassName}${menuOpen ? ' menu-open' : ''}`}>
      <div className="container header-bar">
        <a href="#hero" className="logo" id="site-logo" onClick={closeMenu}>
          <img src={faviconSrc} alt="Icon" className="logo-icon" />
          <div>
            <LogoMark logoText={logoText} logoSpan={logoSpan} />
          </div>
        </a>
        <nav className={`navbar${menuOpen ? ' active' : ''}`} id="site-nav">
          {nav.map((item, index) =>
            !isSafeNavLink(item.link) ? null : item.link.startsWith('/') ? (
              <Link
                key={item.link}
                to={item.link}
                className={index === 0 ? 'active' : undefined}
                onClick={closeMenu}
              >
                {item.label}
              </Link>
            ) : (
              <a
                key={item.link}
                href={item.link}
                className={index === 0 ? 'active' : undefined}
                onClick={closeMenu}
              >
                {item.label}
              </a>
            ),
          )}
        </nav>
        <button
          type="button"
          className="mobile-toggle"
          aria-expanded={menuOpen}
          aria-controls="site-nav"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          onClick={toggleMenu}
        >
          <i className={`fa-solid ${menuOpen ? 'fa-xmark' : 'fa-bars'}`} aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}
