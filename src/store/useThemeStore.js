import { create } from 'zustand';

const useThemeStore = create((set, get) => ({
  theme: localStorage.getItem('infrasketch-theme') || 'dark',

  toggleTheme: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('infrasketch-theme', next);
    document.documentElement.setAttribute('data-theme', next);
    set({ theme: next });
  },

  setTheme: (theme) => {
    localStorage.setItem('infrasketch-theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    set({ theme });
  },

  initTheme: () => {
    const saved = localStorage.getItem('infrasketch-theme') || 'dark';
    document.documentElement.setAttribute('data-theme', saved);
    set({ theme: saved });
  },
}));

export default useThemeStore;
