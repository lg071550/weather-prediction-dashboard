import { useUiStore } from '../../store/uiStore';
import { THEME_NAMES, themes, type ThemeName } from '../../config/themes';

export function ThemePicker() {
  const theme = useUiStore((state) => state.theme);
  const setTheme = useUiStore((state) => state.setTheme);

  return (
    <select
      value={theme}
      onChange={(event) => setTheme(event.target.value as ThemeName)}
      className="glow-accent px-3 py-2 rounded-lg bg-surface-700/50 hover:bg-surface-700 text-surface-300 hover:text-surface-100 text-sm font-medium transition-all duration-200 border border-surface-600/30 hover:border-surface-600 focus:outline-none focus:ring-2 focus:ring-accent-500/50 cursor-pointer"
    >
      {THEME_NAMES.map((name) => (
        <option key={name} value={name}>
          🎨 {themes[name].label}
        </option>
      ))}
    </select>
  );
}
