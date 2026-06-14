import { useCallback, useEffect, useState } from 'react';
import { getCookie, setCookie } from '@/utils/cookies';

export function useTheme(onThemeChange?: () => void) {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const savedTheme = getCookie('theme') || 'light';
    return savedTheme === 'dark' ? 'dark' : 'light';
  });

  const applyTheme = useCallback(
    (nextTheme: 'light' | 'dark') => {
      if (nextTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      setTheme(nextTheme);
      onThemeChange?.();
    },
    [onThemeChange],
  );

  useEffect(() => {
    applyTheme(theme);
  }, [applyTheme, theme]);

  const toggleTheme = useCallback(() => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
    setCookie('theme', nextTheme, 30);
  }, [applyTheme, theme]);

  return { theme, toggleTheme };
}

export function usePolicyTheme() {
  useEffect(() => {
    const savedTheme = getCookie('theme') || 'light';
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);
}
