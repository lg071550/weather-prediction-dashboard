import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ThemeName } from '../config/themes';

interface UiState {
  selectedCityId: string;
  setSelectedCityId: (id: string) => void;
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
}

export const useUiStore = create<UiState>()(
  persist(
    (set) => ({
      selectedCityId: 'london',
      setSelectedCityId: (id: string) => set({ selectedCityId: id }),
      theme: 'claude-dark',
      setTheme: (theme: ThemeName) => set({ theme }),
    }),
    {
      name: 'ui-store',
    }
  )
);
