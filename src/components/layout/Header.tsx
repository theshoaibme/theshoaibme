import type { NavItem } from '@/types';
import { useHeaderScroll } from '@/hooks/scroll/useHeaderScroll';
import { buildColoredLogoText, buildLogoSpan, resolveAssetPath } from '@/utils/logo';

interface HeaderProps {
  logoText: string;
  logoSpan: string;
  favicon: string;
  nav: NavItem[];
  scrollEnabled?: boolean;
}

export default function Header({ logoText, logoSpan, favicon, nav, scrollEnabled = true }: HeaderProps) {
  const { headerClassName } = useHeaderScroll({ enabled: scrollEnabled });
  const coloredText = buildColoredLogoText(logoText);
  const spanHtml = buildLogoSpan(logoSpan);
  const faviconSrc = resolveAssetPath(favicon);

  return (
    <header className={headerClassName}>
      <div className="container">
        <a href="#hero" className="logo" id="site-logo">
          <img src={faviconSrc} alt="Icon" className="logo-icon" />
          <div
            dangerouslySetInnerHTML={{
              __html: `${coloredText}<span>${spanHtml}</span>`,
            }}
          />
        </a>
        <nav className="navbar" id="site-nav">
          {nav.map((item, index) => (
            <a
              key={item.link}
              href={item.link}
              className={index === 0 ? 'active' : undefined}
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div className="mobile-toggle">
          <i className="fa-solid fa-bars" />
        </div>
      </div>
    </header>
  );
}
