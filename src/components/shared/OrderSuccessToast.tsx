import React, { useEffect, useState } from "react";
import { CheckCircle, ExternalLink, X } from "lucide-react";
import { useOrderStore } from "@/stores/orderStore";

interface OrderSuccessToastProps {
  onClose?: () => void;
}

export const OrderSuccessToast: React.FC<OrderSuccessToastProps> = ({
  onClose,
}) => {
  const { successMessage, lastCreatedOrder, clearMessages } = useOrderStore();
  const [countdown, setCountdown] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (successMessage && lastCreatedOrder) {
      setIsVisible(true);

      // Si une URL de paiement existe, démarrer le countdown
      if (lastCreatedOrder.data.data.paymentUrl) {
        setCountdown(5);
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        return () => clearInterval(timer);
      }
    }
  }, [successMessage, lastCreatedOrder]);

  const handleClose = () => {
    setIsVisible(false);
    clearMessages();
    onClose?.();
  };

  const handleRedirectNow = () => {
    if (lastCreatedOrder?.data.data.paymentUrl) {
      window.location.href = lastCreatedOrder.data.data.paymentUrl;
    }
  };

  if (!isVisible || !successMessage || !lastCreatedOrder) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <div className="bg-white border border-green-200 rounded-lg shadow-lg p-4 animate-in slide-in-from-top-2">
        <div className="flex items-start gap-3">
          <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />

          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">
              Commande créée avec succès !
            </h3>

            <p className="text-sm text-gray-600 mb-3">{successMessage}</p>

            <div className="space-y-2">
              <div className="text-xs text-gray-500">
                <span className="font-medium">ID:</span>{" "}
                {lastCreatedOrder.data.data.id}
              </div>
              <div className="text-xs text-gray-500">
                <span className="font-medium">Total:</span>{" "}
                {lastCreatedOrder.data.data.total} FCFA
              </div>
              <div className="text-xs text-gray-500">
                <span className="font-medium">Statut:</span>{" "}
                {lastCreatedOrder.data.data.status}
              </div>
            </div>

            {lastCreatedOrder.data.data.paymentUrl && (
              <div className="mt-4 p-3 bg-blue-50 rounded-md">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-900">
                    Redirection vers le paiement
                  </span>
                  {countdown > 0 && (
                    <span className="text-xs text-blue-600 font-mono">
                      {countdown}s
                    </span>
                  )}
                </div>

                <button
                  onClick={handleRedirectNow}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  Procéder au paiement maintenant
                </button>
              </div>
            )}
          </div>

          <button
            onClick={handleClose}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
