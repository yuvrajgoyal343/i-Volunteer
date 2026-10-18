// ThemeContext.jsx — Global theme state using React Context API
import { useState, useEffect, useCallback, useMemo } from 'react';
import ThemeContext from './ThemeContextValue';

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    try {
      const saved = localStorage.getItem('ivolunteer_theme');
      if (saved === 'dark' || saved === 'light') {
        return saved;
      }
      if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    } catch {
      // Fallback if localStorage or matchMedia fails
    }
    return 'light';
  });

  const isDark = theme === 'dark';

  const setTheme = useCallback((newTheme) => {
    const validTheme = newTheme === 'dark' ? 'dark' : 'light';
    setThemeState(validTheme);
    try {
      localStorage.setItem('ivolunteer_theme', validTheme);
    } catch {
      // Storage access blocked or restricted
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  }, [setTheme, theme]);

  useEffect(() => {
    try {
      document.documentElement.setAttribute('data-theme', theme);
      if (theme === 'dark') {
        document.body.classList.add('dark-theme');
        document.body.classList.remove('light-theme');
      } else {
        document.body.classList.add('light-theme');
        document.body.classList.remove('dark-theme');
      }
    } catch {
      // Ignore during SSR or if document is unavailable
    }
  }, [theme]);

  const value = useMemo(
    () => ({ theme, isDark, toggleTheme, setTheme }),
    [theme, isDark, toggleTheme, setTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
