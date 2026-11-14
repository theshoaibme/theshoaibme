"use client";

import { usePathname } from 'next/navigation';

export function useLocation() {
  const pathname = usePathname();
  return {
    pathname: pathname || '/',
  };
}
