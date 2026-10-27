import React, { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { LiquidMetalBorder } from '@/components/ui/LiquidMetalBorder';
import { cn } from '@/lib/utils';
import './LiquidCtaButton.css';

export interface LiquidCtaButtonProps {
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
  href?: string;
  target?: string;
  rel?: string;
  theme?: 'light' | 'dark' | 'auto';
  variant?: 'primary' | 'outline';
  icon?: React.ReactNode | boolean | null;
}

export function LiquidCtaButton({
  children = 'Get Started',
  className,
  onClick,
  href,
  target,
  rel,
  theme = 'auto',
  variant = 'primary',
  icon,
}: LiquidCtaButtonProps) {
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() => {
    if (theme === 'light' || theme === 'dark') return theme;
    if (typeof document !== 'undefined') {
      return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    }
    return 'dark';
  });

  useEffect(() => {
    if (theme === 'light' || theme === 'dark') {
      setResolvedTheme(theme);
      return;
    }

    const checkTheme = () => {
      const isDark = document.documentElement.classList.contains('dark');
      setResolvedTheme(isDark ? 'dark' : 'light');
    };

    checkTheme();

    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, [theme]);

  const isLight = resolvedTheme === 'light';
  const showIcon = icon !== false && icon !== null;
  const renderIcon = showIcon
    ? icon === true || icon === undefined
      ? <ArrowRight className="w-5 h-5" />
      : icon
    : null;

  const content = (
    <div
      className={cn('liquid-cta-btn-wrapper', isLight ? 'theme-light' : 'theme-dark')}
    >
      <LiquidMetalBorder
        borderRadius={9999}
        borderWidth={2}
        theme={resolvedTheme}
        opacity={1}
        speed={1.2}
        scale={3}
      >
        <div className={cn('liquid-cta-inner', variant === 'outline' && 'variant-outline')}>
          <span className="liquid-cta-text">{children}</span>
          {renderIcon && <span className="liquid-cta-icon">{renderIcon}</span>}
        </div>
      </LiquidMetalBorder>
    </div>
  );

  if (href) {
    return (
      <a
        href={href}
        onClick={onClick}
        target={target}
        rel={rel}
        className={cn('liquid-cta-btn-link', className)}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn('liquid-cta-btn', className)}
    >
      {content}
    </button>
  );
}

export default LiquidCtaButton;
