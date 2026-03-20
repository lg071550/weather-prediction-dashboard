export type ThemeName =
  | 'nord'
  | 'catppuccin'
  | 'gruvbox'
  | 'tokyo-night'
  | 'monokai'
  | 'ayu-dark'
  | 'min'
  | 'claude-dark';

export interface Theme {
  name: ThemeName;
  label: string;
  colors: {
    surface900: string;
    surface800: string;
    surface700: string;
    surface600: string;
    surface500: string;
    surface400: string;
    surface300: string;
    surface200: string;
    surface100: string;
    surface50: string;
    accent400: string;
    accent500: string;
    accent600: string;
    success: string;
    warning: string;
    danger: string;
    info: string;
    accentGradient1: string;
    accentGradient2: string;
  };
}

export const themes: Record<ThemeName, Theme> = {
  nord: {
    name: 'nord',
    label: 'Nord (Dark)',
    colors: {
      surface900: '#2e3440',
      surface800: '#3b4252',
      surface700: '#434c5e',
      surface600: '#4c566a',
      surface500: '#61748f',
      surface400: '#81a1c1',
      surface300: '#88c0d0',
      surface200: '#d8dee9',
      surface100: '#e5e9f0',
      surface50: '#eceff4',
      accent400: '#8fbcbb',
      accent500: '#81a1c1',
      accent600: '#5e81ac',
      success: '#a3be8c',
      warning: '#ebcb8b',
      danger: '#bf616a',
      info: '#5e81ac',
      accentGradient1: '#81a1c1',
      accentGradient2: '#5e81ac',
    },
  },
  catppuccin: {
    name: 'catppuccin',
    label: 'Catppuccin',
    colors: {
      surface900: '#11111b',
      surface800: '#181825',
      surface700: '#1e1e2e',
      surface600: '#313244',
      surface500: '#45475a',
      surface400: '#585b70',
      surface300: '#a6adc8',
      surface200: '#bac2de',
      surface100: '#cdd6f4',
      surface50: '#e6e9ff',
      accent400: '#cba6f7',
      accent500: '#89b4fa',
      accent600: '#94e2d5',
      success: '#a6e3a1',
      warning: '#f9e2af',
      danger: '#f38ba8',
      info: '#89b4fa',
      accentGradient1: '#cba6f7',
      accentGradient2: '#89b4fa',
    },
  },
  gruvbox: {
    name: 'gruvbox',
    label: 'Gruvbox',
    colors: {
      surface900: '#1d2021',
      surface800: '#282828',
      surface700: '#32302f',
      surface600: '#3c3836',
      surface500: '#504945',
      surface400: '#665c54',
      surface300: '#a89984',
      surface200: '#bdae93',
      surface100: '#d5c4a1',
      surface50: '#ebdbb2',
      accent400: '#83a598',
      accent500: '#fabd2f',
      accent600: '#b16286',
      success: '#b8bb26',
      warning: '#fabd2f',
      danger: '#fb4934',
      info: '#83a598',
      accentGradient1: '#fabd2f',
      accentGradient2: '#83a598',
    },
  },
  'tokyo-night': {
    name: 'tokyo-night',
    label: 'Tokyo Night',
    colors: {
      surface900: '#1a1b26',
      surface800: '#1f2335',
      surface700: '#24283b',
      surface600: '#2f354f',
      surface500: '#414868',
      surface400: '#565f89',
      surface300: '#a9b1d6',
      surface200: '#c0caf5',
      surface100: '#d5d6db',
      surface50: '#e6ebff',
      accent400: '#7aa2f7',
      accent500: '#bb9af7',
      accent600: '#7dcfff',
      success: '#9ece6a',
      warning: '#e0af68',
      danger: '#f7768e',
      info: '#7dcfff',
      accentGradient1: '#7aa2f7',
      accentGradient2: '#7dcfff',
    },
  },
  monokai: {
    name: 'monokai',
    label: 'Monokai',
    colors: {
      surface900: '#1f201b',
      surface800: '#272822',
      surface700: '#3e3d32',
      surface600: '#49483e',
      surface500: '#625e4c',
      surface400: '#8f908a',
      surface300: '#b6b7a8',
      surface200: '#d7d8c9',
      surface100: '#f8f8f2',
      surface50: '#fcfcef',
      accent400: '#a6e22e',
      accent500: '#f92672',
      accent600: '#66d9ef',
      success: '#a6e22e',
      warning: '#e6db74',
      danger: '#f92672',
      info: '#66d9ef',
      accentGradient1: '#f92672',
      accentGradient2: '#66d9ef',
    },
  },
  'ayu-dark': {
    name: 'ayu-dark',
    label: 'Ayu Dark',
    colors: {
      surface900: '#0b0e14',
      surface800: '#11151d',
      surface700: '#131721',
      surface600: '#1f2430',
      surface500: '#2a3343',
      surface400: '#6c7380',
      surface300: '#a6accd',
      surface200: '#c7c7c7',
      surface100: '#e6e1cf',
      surface50: '#f5efda',
      accent400: '#ffb454',
      accent500: '#39bae6',
      accent600: '#95e6cb',
      success: '#aad94c',
      warning: '#ffb454',
      danger: '#f07178',
      info: '#59c2ff',
      accentGradient1: '#ffb454',
      accentGradient2: '#39bae6',
    },
  },
  min: {
    name: 'min',
    label: 'Min',
    colors: {
      surface900: '#101010',
      surface800: '#171717',
      surface700: '#202020',
      surface600: '#2b2b2b',
      surface500: '#3d3d3d',
      surface400: '#6f6f6f',
      surface300: '#a8a8a8',
      surface200: '#d4d4d4',
      surface100: '#f3f3f3',
      surface50: '#fafafa',
      accent400: '#60a5fa',
      accent500: '#3b82f6',
      accent600: '#a78bfa',
      success: '#4ade80',
      warning: '#fbbf24',
      danger: '#f87171',
      info: '#60a5fa',
      accentGradient1: '#60a5fa',
      accentGradient2: '#a78bfa',
    },
  },
  'claude-dark': {
    name: 'claude-dark',
    label: 'Claude Code Dark',
    colors: {
      surface900: '#0b0f14',
      surface800: '#11141a',
      surface700: '#161a23',
      surface600: '#212836',
      surface500: '#2c3446',
      surface400: '#5a667a',
      surface300: '#93a0b5',
      surface200: '#d4dbe8',
      surface100: '#f8fbfe',
      surface50: '#fbfcfe',
      accent400: '#ffb07a',
      accent500: '#f19a66',
      accent600: '#e18245',
      success: '#34d399',
      warning: '#fbbf24',
      danger: '#f87171',
      info: '#60a5fa',
      accentGradient1: '#ffb07a',
      accentGradient2: '#e18245',
    },
  },
};

export const THEME_NAMES: ThemeName[] = [
  'nord',
  'catppuccin',
  'gruvbox',
  'tokyo-night',
  'monokai',
  'ayu-dark',
  'min',
  'claude-dark',
];
