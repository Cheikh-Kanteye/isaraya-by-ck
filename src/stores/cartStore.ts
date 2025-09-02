import { Product } from "@/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { storeObserver } from "./store-helpers";

// Helper function to check if user is authenticated
const isUserAuthenticated = (): boolean => {
  try {
    const authStorage = localStorage.getItem("auth-storage");
    if (authStorage) {
      const parsedAuth = JSON.parse(authStorage);
      // Vérifier seulement la présence d'un utilisateur, pas forcément le token
      return !!parsedAuth?.state?.user;
    }
  } catch (error) {
    console.warn(
      "Erreur lors de la vérification de l'authentification:",
      error
    );
  }
  return false;
};

const getCurrentUserId = (): string | null => {
  try {
    const authStorage = localStorage.getItem("auth-storage");
    if (authStorage) {
      const parsedAuth = JSON.parse(authStorage);
      return parsedAuth?.state?.user?.id || null;
    }
  } catch (error) {
    console.warn("Erreur lors de la récupération de l'ID utilisateur:", error);
  }
  return null;
};

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  addedAt: string;
}

export interface ShippingAddress {
  firstname: string;
  lastname: string;
  address: string;
  city: string;
  postalCode: string;
  phone: string;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  shippingAddress: ShippingAddress | null;
  userId: string | null;

  // Actions
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  setCartOpen: (isOpen: boolean) => void;
  setShippingAddress: (address: ShippingAddress) => void;

  // Getters
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getItemQuantity: (productId: string) => number;
  isInCart: (productId: string) => boolean;
}

// Fonction pour générer la clé de stockage
const getStorageKey = (): string => {
  const currentUserId = getCurrentUserId();
  return currentUserId
    ? `cart-storage-${currentUserId}`
    : "cart-storage-anonymous";
};

const createJSONStorage = (storage: Storage) => {
  return {
    getItem: (key: string) => {
      const value = storage.getItem(key);
      return value ? JSON.parse(value) : null;
    },
    setItem: (key: string, value: any) => {
      storage.setItem(key, JSON.stringify(value));
    },
    removeItem: (key: string) => {
      storage.removeItem(key);
    },
  };
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      shippingAddress: null,
      userId: null,

      addToCart: (product: Product, quantity = 1) => {
        // Debug: vérifier l'état d'authentification
        const isAuth = isUserAuthenticated();
        const userId = getCurrentUserId();
        console.log(" Tentative d'ajout au panier:", {
          isAuthenticated: isAuth,
          userId: userId,
          product: product.name,
        });

        // Vérifier que l'utilisateur est connecté
        if (!isAuth) {
          console.warn(
            " Utilisateur non connecté - impossible d'ajouter au panier"
          );
          return;
        }

        const currentUserId = getCurrentUserId();
        const { items, userId: storeUserId } = get();

        console.log(" État du panier:", {
          currentUserId,
          storeUserId,
          itemsCount: items.length,
        });

        // Vérifier que le panier appartient au bon utilisateur
        if (storeUserId && storeUserId !== currentUserId) {
          // Vider le panier s'il appartient à un autre utilisateur
          set({ items: [], userId: currentUserId });
        } else if (!storeUserId) {
          // Associer le panier à l'utilisateur actuel
          set({ userId: currentUserId });
        }

        const existingItem = get().items.find(
          (item) => item.product.id === product.id
        );

        if (existingItem) {
          // Si le produit existe déjà, augmenter la quantité
          set({
            items: get().items.map((item) =>
              item.product.id === product.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            ),
          });
          console.log(" Quantité mise à jour pour:", product.name);
        } else {
          // Ajouter un nouveau produit au panier
          const newItem: CartItem = {
            id: `${product.id}-${Date.now()}`,
            product,
            quantity,
            addedAt: new Date().toISOString(),
          };
          set({ items: [...get().items, newItem] });
          console.log(" Produit ajouté au panier:", product.name);
        }
      },

      removeFromCart: (productId: string) => {
        // Vérifier que l'utilisateur est connecté
        if (!isUserAuthenticated()) {
          console.warn(
            "Utilisateur non connecté - impossible de modifier le panier"
          );
          return;
        }

        const { items } = get();
        set({ items: items.filter((item) => item.product.id !== productId) });
      },

      updateQuantity: (productId: string, quantity: number) => {
        // Vérifier que l'utilisateur est connecté
        if (!isUserAuthenticated()) {
          console.warn(
            "Utilisateur non connecté - impossible de modifier le panier"
          );
          return;
        }

        if (quantity <= 0) {
          get().removeFromCart(productId);
          return;
        }

        const { items } = get();
        set({
          items: items.map((item) =>
            item.product.id === productId ? { ...item, quantity } : item
          ),
        });
      },

      clearCart: () => {
        set({ items: [], shippingAddress: null, userId: null });
      },

      toggleCart: () => {
        const { isOpen } = get();
        set({ isOpen: !isOpen });
      },

      setCartOpen: (isOpen: boolean) => {
        set({ isOpen });
      },

      setShippingAddress: (address: ShippingAddress) => {
        set({ shippingAddress: address });
      },

      getTotalItems: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        const { items } = get();
        return items.reduce(
          (total, item) => total + item.product.price * item.quantity,
          0
        );
      },

      getItemQuantity: (productId: string) => {
        const { items } = get();
        const item = items.find((item) => item.product.id === productId);
        return item ? item.quantity : 0;
      },

      isInCart: (productId: string) => {
        const { items } = get();
        return items.some((item) => item.product.id === productId);
      },
    }),
    {
      name: getStorageKey(),
      storage: createJSONStorage(localStorage),
      partialize: (state) => ({
        items: state.items,
        shippingAddress: state.shippingAddress,
        userId: state.userId,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.log("an error happened during hydration", error);
        } else if (state) {
          // Vérifier que le panier appartient au bon utilisateur après la réhydratation
          const currentUserId = getCurrentUserId();
          if (state.userId && state.userId !== currentUserId) {
            // Vider le panier s'il appartient à un autre utilisateur
            state.items = [];
            state.shippingAddress = null;
            state.userId = currentUserId;
          }
        }
      },
    }
  )
);

// Listen for user logout to clear the cart
storeObserver.on("user-logged-out", () => {
  useCartStore.getState().clearCart();
});

// When a user logs in, we need to switch to their specific cart storage
storeObserver.on("user-logged-in", (user) => {
  const { userId, clearCart } = useCartStore.getState();

  // Si le panier actuel appartient à un autre utilisateur, le vider
  if (userId && userId !== user.id) {
    clearCart();
  }

  // Associer le panier à l'utilisateur connecté
  useCartStore.setState({ userId: user.id });

  // Forcer la réhydratation avec la nouvelle clé de stockage spécifique à l'utilisateur
  const newStorageKey = `cart-storage-${user.id}`;
  try {
    const userCartData = localStorage.getItem(newStorageKey);
    if (userCartData) {
      const parsedData = JSON.parse(userCartData);
      if (parsedData.state) {
        useCartStore.setState({
          items: parsedData.state.items || [],
          shippingAddress: parsedData.state.shippingAddress || null,
          userId: user.id,
        });
      }
    }
  } catch (error) {
    console.warn("Erreur lors du chargement du panier utilisateur:", error);
  }
});
