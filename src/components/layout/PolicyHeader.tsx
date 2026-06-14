import { Link } from 'react-router-dom';
import { useHeaderScroll } from '@/hooks/scroll/useHeaderScroll';
import { buildColoredLogoText, buildLogoSpan, resolveAssetPath } from '@/utils/logo';

interface PolicyHeaderProps {
  logoText: string;
  logoSpan: string;
  favicon?: string;
}

export default function PolicyHeader({ logoText, logoSpan, favicon }: PolicyHeaderProps) {
  const { headerClassName } = useHeaderScroll();
  const coloredText = buildColoredLogoText(logoText);
  const spanHtml = buildLogoSpan(logoSpan);

  return (
    <header className={headerClassName}>
      <div className="container">
        <Link to="/" className="logo" id="site-logo">
          {favicon ? <img src={resolveAssetPath(favicon)} alt="Icon" className="logo-icon" /> : null}
          <div
            dangerouslySetInnerHTML={{
              __html: `${coloredText}<span>${spanHtml}</span>`,
            }}
          />
        </Link>
        <nav className="navbar">
          <Link to="/">Home</Link>
          <Link to={{ pathname: '/', hash: 'contact' }}>Contact</Link>
        </nav>
      </div>
    </header>
  );
}
