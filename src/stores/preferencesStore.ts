import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface PreferencesState {
  // UI Preferences
  theme: "light" | "dark" | "system";
  language: "fr" | "en";
  catalogSortBy: string;
  catalogViewMode: "grid" | "list";

  // App Settings
  notificationsEnabled: boolean;
  emailNotifications: boolean;

  // Actions
  setTheme: (theme: "light" | "dark" | "system") => void;
  setLanguage: (language: "fr" | "en") => void;
  setCatalogSortBy: (sortBy: string) => void;
  setCatalogViewMode: (viewMode: "grid" | "list") => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setEmailNotifications: (enabled: boolean) => void;
  resetPreferences: () => void;
}

const defaultPreferences = {
  theme: "system" as const,
  language: "fr" as const,
  catalogSortBy: "price_asc",
  catalogViewMode: "grid" as const,
  notificationsEnabled: true,
  emailNotifications: true,
};

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set, get) => ({
      ...defaultPreferences,

      setTheme: (theme) => set({ theme }),
      setLanguage: (language) => set({ language }),
      setCatalogSortBy: (catalogSortBy) => set({ catalogSortBy }),
      setCatalogViewMode: (catalogViewMode) => set({ catalogViewMode }),
      setNotificationsEnabled: (notificationsEnabled) =>
        set({ notificationsEnabled }),
      setEmailNotifications: (emailNotifications) =>
        set({ emailNotifications }),

      resetPreferences: () => set({ ...defaultPreferences }),
    }),
    {
      name: "app-preferences",
      storage: createJSONStorage(() => localStorage), // Utilise localStorage pour persister entre les sessions
      partialize: (state) => ({
        theme: state.theme,
        language: state.language,
        catalogSortBy: state.catalogSortBy,
        catalogViewMode: state.catalogViewMode,
        notificationsEnabled: state.notificationsEnabled,
        emailNotifications: state.emailNotifications,
      }),
    }
  )
);
