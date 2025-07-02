import { create } from 'zustand';

const getInitialTheme = () => {
  if (typeof localStorage !== "undefined") {
    return localStorage.getItem("chat-theme") || "light";
  }
  return "light";
};

export const useThemeStore = create((set) => ({
  theme: getInitialTheme(),

  setTheme: (newTheme) => {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("chat-theme", newTheme);
    }
    document.documentElement.setAttribute("data-theme", newTheme);
    set({ theme: newTheme });
  },

  toggleTheme: () => {
    set((state) => {
      const newTheme = state.theme === "light" ? "dark" : "light";
      if (typeof localStorage !== "undefined") {
        localStorage.setItem("chat-theme", newTheme);
      }
      document.documentElement.setAttribute("data-theme", newTheme);
      return { theme: newTheme };
    });
  },
}));
