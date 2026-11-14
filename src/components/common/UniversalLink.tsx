"use client";

import NextLink from 'next/link';
import { forwardRef, type AnchorHTMLAttributes, type ReactNode } from 'react';
import type { UrlObject } from 'url';

export type LinkDestination = string | UrlObject;

export interface UniversalLinkProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  to?: LinkDestination;
  href?: LinkDestination;
  children?: ReactNode;
  replace?: boolean;
  scroll?: boolean;
  prefetch?: boolean;
}

export const Link = forwardRef<HTMLAnchorElement, UniversalLinkProps>(
  ({ to, href, children, ...props }, ref) => {
    const destination = href || to || '/';
    return (
      <NextLink ref={ref} href={destination} {...props}>
        {children}
      </NextLink>
    );
  }
);

Link.displayName = 'Link';

export default Link;
