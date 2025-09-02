import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryClient';
import { toast } from 'sonner';
import type { Product } from '@/types';

// Interface pour les éléments du panier
export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
  addedAt: string;
}

// Interface pour l'état du panier
interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
}

// Simuler un service de panier (en attendant l'API)
const cartService = {
  getItems: (): CartItem[] => {
    try {
      const stored = localStorage.getItem('cart-items');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  },

  setItems: (items: CartItem[]): void => {
    localStorage.setItem('cart-items', JSON.stringify(items));
  },

  addItem: (product: Product, quantity: number): CartItem[] => {
    const items = cartService.getItems();
    const existingItem = items.find(item => item.product.id === product.id);

    let newItems: CartItem[];
    if (existingItem) {
      newItems = items.map(item =>
        item.product.id === product.id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
    } else {
      const newItem: CartItem = {
        id: `${product.id}-${Date.now()}`,
        product,
        quantity,
        addedAt: new Date().toISOString(),
      };
      newItems = [...items, newItem];
    }

    cartService.setItems(newItems);
    return newItems;
  },

  removeItem: (productId: string): CartItem[] => {
    const items = cartService.getItems();
    const newItems = items.filter(item => item.product.id !== productId);
    cartService.setItems(newItems);
    return newItems;
  },

  updateQuantity: (productId: string, quantity: number): CartItem[] => {
    const items = cartService.getItems();
    const newItems = items.map(item =>
      item.product.id === productId
        ? { ...item, quantity: Math.max(1, quantity) }
        : item
    );
    cartService.setItems(newItems);
    return newItems;
  },

  clearCart: (): CartItem[] => {
    cartService.setItems([]);
    return [];
  },
};

// Hook pour récupérer les éléments du panier
export function useCartItems() {
  return useQuery({
    queryKey: queryKeys.cart.items(),
    queryFn: () => cartService.getItems(),
    staleTime: 0, // Toujours frais pour le panier
    refetchOnWindowFocus: true,
    select: (items): CartState => {
      const total = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
      const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
      return { items, total, itemCount };
    },
  });
}

// Hook pour ajouter un produit au panier
export function useAddToCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ product, quantity = 1 }: { product: Product; quantity?: number }) =>
      Promise.resolve(cartService.addItem(product, quantity)),

    onMutate: async ({ product, quantity = 1 }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.cart.items() });

      const previousItems = queryClient.getQueryData<CartItem[]>(queryKeys.cart.items()) || [];

      // Optimistic update
      const existingItem = previousItems.find(item => item.product.id === product.id);
      let newItems: CartItem[];

      if (existingItem) {
        newItems = previousItems.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        const newItem: CartItem = {
          id: `${product.id}-${Date.now()}`,
          product,
          quantity,
          addedAt: new Date().toISOString(),
        };
        newItems = [...previousItems, newItem];
      }

      // Mettre à jour le cache immédiatement
      queryClient.setQueryData(queryKeys.cart.items(), newItems);

      toast.success(`${product.name} ajouté au panier`, { duration: 2000 });

      return { previousItems };
    },

    onError: (error, variables, context) => {
      // Rollback
      if (context?.previousItems) {
        queryClient.setQueryData(queryKeys.cart.items(), context.previousItems);
      }
      toast.error('Erreur lors de l\'ajout au panier');
    },

    onSuccess: (newItems) => {
      // Confirmer avec les vraies données
      queryClient.setQueryData(queryKeys.cart.items(), newItems);
    },
  });
}

// Hook pour retirer un produit du panier
export function useRemoveFromCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => Promise.resolve(cartService.removeItem(productId)),

    onMutate: async (productId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.cart.items() });

      const previousItems = queryClient.getQueryData<CartItem[]>(queryKeys.cart.items()) || [];
      const newItems = previousItems.filter(item => item.product.id !== productId);

      queryClient.setQueryData(queryKeys.cart.items(), newItems);

      const removedItem = previousItems.find(item => item.product.id === productId);
      if (removedItem) {
        toast.success(`${removedItem.product.name} retiré du panier`, { duration: 2000 });
      }

      return { previousItems };
    },

    onError: (error, productId, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData(queryKeys.cart.items(), context.previousItems);
      }
      toast.error('Erreur lors de la suppression');
    },

    onSuccess: (newItems) => {
      queryClient.setQueryData(queryKeys.cart.items(), newItems);
    },
  });
}

// Hook pour mettre à jour la quantité
export function useUpdateCartQuantity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ productId, quantity }: { productId: string; quantity: number }) =>
      Promise.resolve(cartService.updateQuantity(productId, quantity)),

    onMutate: async ({ productId, quantity }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.cart.items() });

      const previousItems = queryClient.getQueryData<CartItem[]>(queryKeys.cart.items()) || [];
      const newItems = previousItems.map(item =>
        item.product.id === productId
          ? { ...item, quantity: Math.max(1, quantity) }
          : item
      );

      queryClient.setQueryData(queryKeys.cart.items(), newItems);

      return { previousItems };
    },

    onError: (error, variables, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData(queryKeys.cart.items(), context.previousItems);
      }
      toast.error('Erreur lors de la mise à jour');
    },

    onSuccess: (newItems) => {
      queryClient.setQueryData(queryKeys.cart.items(), newItems);
    },
  });
}

// Hook pour vider le panier
export function useClearCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => Promise.resolve(cartService.clearCart()),

    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: queryKeys.cart.items() });

      const previousItems = queryClient.getQueryData<CartItem[]>(queryKeys.cart.items()) || [];
      queryClient.setQueryData(queryKeys.cart.items(), []);

      toast.success('Panier vidé', { duration: 2000 });

      return { previousItems };
    },

    onError: (error, variables, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData(queryKeys.cart.items(), context.previousItems);
      }
      toast.error('Erreur lors du vidage du panier');
    },

    onSuccess: () => {
      queryClient.setQueryData(queryKeys.cart.items(), []);
    },
  });
}