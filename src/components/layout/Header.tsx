import { useCallback, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import type { NavItem } from '@/types';
import LogoMark from '@/components/common/LogoMark';
import { useActiveNavSection } from '@/hooks/scroll/useActiveNavSection';
import { useHeaderScroll } from '@/hooks/scroll/useHeaderScroll';
import { resolveAssetPath } from '@/utils/logo';
import { isHomePath } from '@/utils/routing';
import { isSafeNavLink } from '@/utils/urlValidation';

interface HeaderProps {
  logoText: string;
  logoSpan: string;
  favicon: string;
  nav: NavItem[];
  scrollEnabled?: boolean;
}

export default function Header({ logoText, logoSpan, favicon, nav, scrollEnabled = true }: HeaderProps) {
  const { pathname } = useLocation();
  const isHomePage = isHomePath(pathname);
  const activeSection = useActiveNavSection();
  const [menuOpen, setMenuOpen] = useState(false);
  const { headerClassName } = useHeaderScroll({ enabled: scrollEnabled });
  const faviconSrc = resolveAssetPath(favicon);

  const toggleMenu = useCallback(() => {
    setMenuOpen((open) => !open);
  }, []);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
  }, []);

  const logoContent = (
    <>
      <img src={faviconSrc} alt="Icon" className="logo-icon" />
      <div>
        <LogoMark logoText={logoText} logoSpan={logoSpan} />
      </div>
    </>
  );

  return (
    <header className={`${headerClassName}${menuOpen ? ' menu-open' : ''}`}>
      <div className="container header-bar">
        {isHomePage ? (
          <a href="#hero" className="logo" id="site-logo" onClick={closeMenu}>
            {logoContent}
          </a>
        ) : (
          <Link to="/" className="logo" id="site-logo" onClick={closeMenu}>
            {logoContent}
          </Link>
        )}
        <nav className={`navbar${menuOpen ? ' active' : ''}`} id="site-nav">
          {nav.map((item) => {
            if (!isSafeNavLink(item.link)) return null;

            const sectionId = item.link.startsWith('#') ? item.link.slice(1) : '';
            const activeClass =
              isHomePage && sectionId && activeSection === sectionId ? 'active' : undefined;

            if (item.link.startsWith('/')) {
              return (
                <Link
                  key={item.link}
                  to={item.link}
                  className={activeClass}
                  onClick={closeMenu}
                >
                  {item.label}
                </Link>
              );
            }

            if (item.link.startsWith('#')) {
              if (isHomePage) {
                return (
                  <a key={item.link} href={item.link} className={activeClass} onClick={closeMenu}>
                    {item.label}
                  </a>
                );
              }

              return (
                <Link
                  key={item.link}
                  to={{ pathname: '/', hash: item.link.slice(1) }}
                  onClick={closeMenu}
                >
                  {item.label}
                </Link>
              );
            }

            return (
              <a key={item.link} href={item.link} className={activeClass} onClick={closeMenu}>
                {item.label}
              </a>
            );
          })}
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
