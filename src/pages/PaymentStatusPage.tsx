import React from "react";
import { CheckCircle, XCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import { useCartStore } from "@/stores/cartStore";

export default function PaymentStatusPage() {
  const navigate = useNavigate();
  const { status } = useParams<{ status: string }>();
  const { clearCart } = useCartStore();

  useEffect(() => {
    // Rediriger vers la page d'accueil si le statut n'est pas valide
    if (status !== "success" && status !== "cancel") {
      navigate("/");
      return;
    }

    // Vider le panier seulement si le paiement a réussi
    if (status === "success") {
      clearCart();
    }
  }, [status, navigate, clearCart]);

  const isSuccess = status === "success";

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background px-4 text-center">
      {isSuccess ? (
        <CheckCircle className="h-24 w-24 text-green-500 mb-6" />
      ) : (
        <XCircle className="h-24 w-24 text-red-500 mb-6" />
      )}

      <h1 className="text-4xl font-bold text-foreground mb-4">
        {isSuccess ? "Paiement Réussi !" : "Paiement Annulé"}
      </h1>

      <p className="text-lg text-muted-foreground mb-8">
        {isSuccess
          ? "Merci pour votre achat. Votre paiement a été traité avec succès et votre commande est en cours de traitement."
          : "Votre paiement a été annulé. Aucun montant n'a été débité de votre compte."}
      </p>

      <div className="flex gap-4">
        <Button onClick={() => navigate("/")} size="lg">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour à la page d'accueil
        </Button>

        {!isSuccess && (
          <Button onClick={() => navigate("/cart")} variant="outline" size="lg">
            Retour au panier
          </Button>
        )}
      </div>
    </div>
  );
}
