import { useEffect, type ReactNode } from 'react';
import { themes } from '../../config/themes';
import { useUiStore } from '../../store/uiStore';

function toThemeVarSuffix(key: string): string {
  return key
    .replace(/([a-z])([A-Z0-9])/g, '$1-$2')
    .replace(/([0-9])([a-zA-Z])/g, '$1-$2')
    .toLowerCase();
}

function hexToRgb(hex: string): string {
  const normalized = hex.trim();
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(normalized);
  if (!match) {
    return '0,0,0';
  }

  const red = parseInt(match[1], 16);
  const green = parseInt(match[2], 16);
  const blue = parseInt(match[3], 16);
  return `${red},${green},${blue}`;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const selectedTheme = useUiStore((state) => state.theme);
  const theme = themes[selectedTheme] ?? themes['claude-dark'];

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = theme.name;

    for (const [key, value] of Object.entries(theme.colors)) {
      const suffix = toThemeVarSuffix(key);
      root.style.setProperty(`--color-${suffix}`, value);
      root.style.setProperty(`--color-${suffix}-rgb`, hexToRgb(value));
    }
  }, [theme]);

  return <>{children}</>;
}
