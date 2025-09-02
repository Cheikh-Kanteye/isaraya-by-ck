import { useState, useEffect } from "react";

interface Order {
  id: string;
  productName: string;
  orderNumber: string;
  price: number;
  status: string;
  imageUrl?: string;
}

export const useRecentOrders = () => {
  const [orders, setOrders] = useState<Order[]>([
    {
      id: "1",
      productName: "iPhone 14 Pro Max 256GB Noir",
      orderNumber: "001",
      price: 850000,
      status: "En attente de paiement",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // TODO: Récupérer les vraies commandes depuis l'API
    // setIsLoading(true);
    // fetchRecentOrders().then(setOrders).finally(() => setIsLoading(false));
  }, []);

  return { orders, isLoading };
};
