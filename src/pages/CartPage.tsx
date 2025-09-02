import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { ShoppingCart, ArrowLeft, Trash2, Plus, Minus } from "lucide-react";
import { useCartStore } from "../stores/cartStore";
import { Button } from "../components/ui/button";
import FallbackImage from "@/components/shared/FallbackImage"; // Importation du composant FallbackImage
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "../components/ui/card";
import { Separator } from "../components/ui/separator";
import { formatPrice } from "../lib/utils";

export default function CartPage() {
  const navigate = useNavigate();
  const {
    items,
    getTotalItems,
    getTotalPrice,
    updateQuantity,
    removeFromCart,
    clearCart,
  } = useCartStore();

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateQuantity(productId, newQuantity);
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <ShoppingCart className="w-16 h-16 mx-auto text-gray-400" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Votre panier est vide
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Découvrez nos produits et ajoutez des articles à votre panier
          </p>
          <Button onClick={() => navigate("/")} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Continuer vos achats
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="mr-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>
        <h1 className="text-2xl font-bold">Votre panier</h1>
        <span className="ml-2 text-sm text-gray-500">
          ({getTotalItems()} {getTotalItems() > 1 ? "articles" : "article"})
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <div className="p-4 md:p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="w-full md:w-32 h-32 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                    {item.product.images?.[0]?.url ? (
                      <FallbackImage // Remplacement de <img> par <FallbackImage>
                        src={item.product.images[0].url}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <ShoppingCart className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-lg">
                          <Link
                            to={`/product/${item.product.id}`}
                            className="hover:underline"
                          >
                            {item.product.name}
                          </Link>
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {item.product.brandId || "Marque inconnue"}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            handleQuantityChange(
                              item.product.id,
                              item.quantity - 1
                            )
                          }
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() =>
                            handleQuantityChange(
                              item.product.id,
                              item.quantity + 1
                            )
                          }
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="font-medium">
                        {formatPrice(item.product.price * item.quantity)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}

          <div className="flex justify-end pt-2">
            <Button
              variant="link"
              className="text-destructive"
              onClick={clearCart}
            >
              Vider le panier
            </Button>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Récapitulatif de la commande</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Sous-total ({getTotalItems()} articles)</span>
                  <span>{formatPrice(getTotalPrice())}</span>
                </div>
                <div className="flex justify-between">
                  <span>Livraison</span>
                  <span className="text-green-600">Gratuite</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{formatPrice(getTotalPrice())}</span>
                </div>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={() => navigate("/checkout")}
              >
                Passer la commande
              </Button>

              <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
                <p>
                  Livraison gratuite pour les commandes de plus de 50 000 FCFA
                </p>
                <p>Retours gratuits sous 14 jours</p>
                <p>Paiement sécurisé</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
