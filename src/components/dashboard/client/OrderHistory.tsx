import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Package, Eye, Download } from "lucide-react";
import { formatDate, formatPrice } from "@/lib/utils";
import { useAuthStore } from "@/stores";
import { useOrdersByUser } from "@/hooks/queries";
import type { Order } from "@/types";

const OrderHistory = () => {
  const { user } = useAuthStore();
  const {
    data: orders = [],
    isLoading,
    error,
  } = useOrdersByUser(user?.userId || "");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Debug orders: et la vérification !Array.isArray(orders) sont supprimés car ils violaient les Règles des Hooks
  // console.log("Debug orders:", orders);
  // if (!Array.isArray(orders)) {
  //   console.error("Orders est de type inattendu, ce n'est pas un tableau:", orders);
  //   return (
  //     <Card className="bg-white border-2 border-gray-200 shadow-lg">
  //       <CardContent className="flex items-center justify-center h-64">
  //         <div className="text-center text-red-600">
  //           <p className="font-medium">
  //             Erreur de données: La liste des commandes n'est pas valide.
  //           </p>
  //         </div>
  //       </CardContent>
  //     </Card>
  //   );
  // }

  const filteredOrders = useMemo(() => {
    let filtered = orders;

    if (searchTerm) {
      // With new Order structure, productTitle is not directly available on Order.
      // For now, filter by order ID. A more complex solution would involve fetching product details.
      filtered = filtered.filter(
        (order) =>
          order.id.toLowerCase().includes(searchTerm.toLowerCase()) 
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilter);
    }

    return filtered;
  }, [orders, searchTerm, statusFilter]);

  const handleViewOrder = (orderId: string) => {
    console.log("Voir commande:", orderId);
    // TODO: Implémenter la vue détaillée de la commande
  };

  const handleDownloadInvoice = (orderId: string) => {
    console.log("Télécharger facture:", orderId);
    // TODO: Implémenter le téléchargement de facture
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: {
        variant: "secondary" as const,
        label: "En attente",
        className: "bg-yellow-100 text-yellow-800 border-yellow-200",
      },
      CONFIRMED: {
        variant: "default" as const,
        label: "Confirmée",
        className: "bg-blue-100 text-blue-800 border-blue-200",
      },
      SHIPPED: {
        variant: "default" as const,
        label: "Expédiée",
        className: "bg-purple-100 text-purple-800 border-purple-200",
      },
      DELIVERED: {
        variant: "default" as const,
        label: "Livrée",
        className: "bg-green-100 text-green-800 border-green-200",
      },
      CANCELLED: {
        variant: "destructive" as const,
        label: "Annulée",
        className: "bg-red-100 text-red-800 border-red-200",
      },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || {
      variant: "secondary" as const,
      label: status,
      className: "bg-gray-100 text-gray-800 border-gray-200",
    };

    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Card className="bg-white border-2 border-gray-200 shadow-lg">
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <Package className="h-8 w-8 animate-pulse mx-auto mb-4 text-gray-500" />
            <p className="text-gray-700 font-medium">
              Chargement de vos commandes...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-white border-2 border-gray-200 shadow-lg">
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center text-red-600">
            <p className="font-medium">
              Erreur lors du chargement des commandes.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white border-2 border-gray-200 shadow-lg">
        <CardHeader>
          <CardTitle className="text-gray-900 text-xl font-bold">
            Historique des commandes
          </CardTitle>
          <CardDescription className="text-gray-700 font-medium">
            Consultez et gérez toutes vos commandes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Filtres */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
              <Input
                type="search"
                placeholder="Rechercher par produit ou ID..."
                className="pl-10 w-full bg-white border-2 border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-orange-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select onValueChange={setStatusFilter} defaultValue="all">
              <SelectTrigger className="w-full md:w-[200px] bg-white border-2 border-gray-300 text-gray-900">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent className="bg-white border-2 border-gray-200">
                <SelectItem value="all" className="text-gray-900">
                  Tous les statuts
                </SelectItem>
                <SelectItem
                  value="PENDING"
                  className="text-gray-900"
                >
                  En attente
                </SelectItem>
                <SelectItem value="CONFIRMED" className="text-gray-900">
                  Confirmée
                </SelectItem>
                <SelectItem value="SHIPPED" className="text-gray-900">
                  Expédiée
                </SelectItem>
                <SelectItem value="DELIVERED" className="text-gray-900">
                  Livrée
                </SelectItem>
                <SelectItem value="CANCELLED" className="text-gray-900">
                  Annulée
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Liste des commandes */}
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 mx-auto mb-4 text-gray-500" />
              <h3 className="text-lg font-semibold mb-2 text-gray-900">
                Aucune commande trouvée
              </h3>
              <p className="text-gray-600 font-medium">
                {orders.length === 0
                  ? "Vous n'avez pas encore passé de commande."
                  : "Aucune commande ne correspond à vos critères de recherche."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <Card
                  key={order.id}
                  className="border-2 border-gray-200 bg-gray-50 shadow-sm"
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <h3 className="font-semibold text-gray-900">
                            Commande #{order.id} {/* Display order ID as primary identifier */}
                          </h3>
                          {getStatusBadge(order.status)}
                        </div>
                        <div className="text-sm text-gray-600 font-medium space-y-1">
                          <p>Total: {formatPrice(order.total)}</p> {/* Display total price */}
                          <p>Passée le {formatDate(order.createdAt)}</p>
                        </div>
                      </div>

                      <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
                        <div className="text-right">
                          <p className="text-lg font-bold text-gray-900">
                            {formatPrice(order.total)}
                          </p>
                          {/* Removed individual product price * quantity display */}
                        </div>

                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewOrder(order.id)}
                            className="border-2 border-gray-300 text-gray-700 font-medium hover:bg-gray-100 hover:border-gray-400"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Voir
                          </Button>
                          {order.status === "DELIVERED" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownloadInvoice(order.id)}
                              className="border-2 border-orange-300 text-orange-700 font-medium hover:bg-orange-50 hover:border-orange-400"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Facture
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderHistory;
