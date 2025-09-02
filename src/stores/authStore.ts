import config from "@/config";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { storeObserver } from "./store-helpers";
import {
  User,
  RegisterData,
  LoginDto,
  RegisterDto,
  MerchantProfile,
} from "@/types";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isSubmitting: boolean; // Renommé de isLoading
  isAuthLoading: boolean; // Nouveau loader pour l'authentification
  error: string | null;
  login: (credentials: LoginDto) => Promise<boolean>;
  register: (userData: RegisterDto) => Promise<boolean>;
  logout: () => void;
  getCurrentUser: () => Promise<User | null>;
  fetchMerchantProfile: () => Promise<MerchantProfile | null>;
  setUser: (user: User | null) => void;
  setIsSubmitting: (submitting: boolean) => void; // Nouvelle fonction pour isSubmitting
  setIsAuthLoading: (loading: boolean) => void; // Nouvelle fonction pour isAuthLoading
  setError: (error: string | null) => void;
  setSubmitting: (val: boolean, error?: string | null) => void; // Rendre 'error' optionnel
}

const API_BASE_URL = config.api.url;

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get): AuthState => ({
      user: null,
      accessToken: null,
      isSubmitting: false, // Initialisation
      isAuthLoading: false, // Initialisation
      error: null,

      setUser: (user) => set({ user }),
      setIsSubmitting: (isSubmitting) => set({ isSubmitting }), // Mise à jour de la fonction
      setIsAuthLoading: (isAuthLoading) => set({ isAuthLoading }), // Nouvelle fonction
      setError: (error) => set({ error }),

      // Helper pour centraliser la gestion du loader isSubmitting et des erreurs
      setSubmitting: (val: boolean, error: string | null = null) =>
        set({ isSubmitting: val, error }),

      login: async (credentials: LoginDto) => {
        get().setSubmitting(true);

        try {
          const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(credentials),
          });

          if (response.ok) {
            const responseData = await response.json();

            // Extraction des données depuis la structure de réponse réelle
            const accessToken = responseData?.accessToken;
            const user = responseData?.user;

            if (accessToken && user) {
              set({ user, accessToken });
              get().setSubmitting(false);
              storeObserver.emit("user-logged-in", user);
              return true;
            } else {
              // Message d'erreur plus descriptif selon ce qui manque
              const missingFields = [];
              if (!user) missingFields.push("Email ou mot de passe incorrect");

              get().setSubmitting(false, `${missingFields}`);
              return false;
            }
          } else {
            const errorData = await response.json();
            get().setSubmitting(
              false,
              errorData.message || "Email ou mot de passe incorrect"
            );
            return false;
          }
        } catch (err: any) {
          get().setSubmitting(false, err?.message || "Erreur de connexion");
          return false;
        }
      },

      register: async (userData: RegisterDto) => {
        get().setSubmitting(true);

        try {
          const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(userData),
          });

          if (response.ok) {
            const responseData = await response.json();

            // Extraction des données depuis la structure de réponse réelle d'inscription
            const user = responseData?.data?.data?.user;
            const message =
              responseData?.data?.message || responseData?.message;

            if (user) {
              // Ne pas connecter l'utilisateur automatiquement après inscription
              // Il doit d'abord vérifier son email (isActive: false)
              get().setSubmitting(false);
              storeObserver.emit("user-registered", user);
              return true;
            } else {
              get().setSubmitting(false, "Réponse API register invalide");
              return false;
            }
          } else {
            const errorData = await response.json();
            get().setSubmitting(
              false,
              errorData.message || "Erreur lors de la création du compte"
            );
            return false;
          }
        } catch (err: any) {
          get().setSubmitting(
            false,
            err?.message || "Erreur lors de la création du compte"
          );
          return false;
        }
      },

      logout: () => {
        storeObserver.emit("user-logged-out");
        set({ user: null, accessToken: null, error: null });
      },

      getCurrentUser: async () => {
        const { accessToken, user } = get();
        if (accessToken) {
          set({ isAuthLoading: true });
          try {
            const response = await fetch(`${API_BASE_URL}/auth/profile`, {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            });

            if (response.ok) {
              const { user: updatedUser } = await response.json();
              set({ user: updatedUser });
              return updatedUser;
            } else if (response.status === 401) {
              get().logout();
              return null; // Retourne null en cas d'échec d'authentification
            }
          } catch (err: any) {
            console.error(
              "Erreur lors de la récupération de l'utilisateur:",
              err?.message || "Erreur inconnue"
            );
            // Ne pas appeler logout ici pour éviter une déconnexion intempestive en cas d'erreur réseau temporaire
            // L'utilisateur sera déconnecté si le token est vraiment invalide (status 401)
            set({ error: err?.message || "Erreur de connexion" }); // Affiche l'erreur dans le store
            return null; // Retourne null en cas d'erreur réseau
          } finally {
            set({ isAuthLoading: false });
          }
        }
        return null; // Retourne null si pas d'accessToken ou si l'utilisateur n'a pas pu être récupéré
      },

      fetchMerchantProfile: async () => {
        // TODO: implémenter la récupération du profil du marchand
        return null;
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage), // Changé de sessionStorage à localStorage
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
      }),
    }
  )
);

export default useAuthStore;
