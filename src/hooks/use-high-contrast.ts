import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'kivara-high-contrast';

export function useHighContrast() {
  const [enabled, setEnabled] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (enabled) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    try {
      localStorage.setItem(STORAGE_KEY, String(enabled));
    } catch {
      // storage unavailable
    }
  }, [enabled]);

  const toggle = useCallback(() => setEnabled((v) => !v), []);

  return { highContrast: enabled, toggleHighContrast: toggle };
}
