import { useParams } from "react-router-dom";
import { useOrder, useProduct } from "@/hooks/queries";
import { useUsers } from "@/hooks/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatPrice } from "@/lib/utils";
import { Loader2, Package, User, CreditCard, MapPin, Phone, Mail, Calendar, Hash } from "lucide-react";
import { Order, User as UserType } from "@/types";
import { useMemo } from "react";
import { ORDER_STATUS, ORDER_STATUS_LABELS, OrderStatus } from "@/constants/orderStatus";

// Interfaces pour les données parsées
interface ParsedOrderItem {
  produitId: string;
  quantity: number;
  price: number;
}

interface ParsedDeliveryDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: {
    street: string;
    city: string;
    postcode: string;
    country: string;
    latitude: number;
    longitude: number;
  };
}

// Sous-composant qui s'affiche une fois la commande chargée
const OrderContent = ({
  order,
  customer,
}: {
  order: Order;
  customer: UserType | null;
}) => {
  const { data: merchants } = useUsers();
  const merchantUser = merchants?.find((u: UserType) => u.id === order.merchantId);
  
  // Parse les données JSON de l'API
  const parsedItems = useMemo(() => {
    try {
      if (typeof (order as any).items === 'string') {
        return JSON.parse((order as any).items) as ParsedOrderItem[];
      }
      return order.items || [];
    } catch (error) {
      console.error('Error parsing items:', error);
      return [];
    }
  }, [order]);

  const parsedDeliveryDetails = useMemo(() => {
    try {
      if ((order as any).deliveryDetails && typeof (order as any).deliveryDetails === 'string') {
        return JSON.parse((order as any).deliveryDetails) as ParsedDeliveryDetails;
      }
      return null;
    } catch (error) {
      console.error('Error parsing deliveryDetails:', error);
      return null;
    }
  }, [order]);

  // Get the first product for display
  const firstItem = parsedItems?.[0];
  const { data: product } = useProduct(firstItem?.produitId || "");

  // Mapping complet des statuts avec couleurs
  const getStatusInfo = (status: string) => {
    const statusColorMap: Record<string, string> = {
      [ORDER_STATUS.DRAFT]: "bg-gray-500",
      [ORDER_STATUS.PENDING_PAYMENT]: "bg-orange-500",
      [ORDER_STATUS.PAYMENT_SUCCESSFUL]: "bg-green-600",
      [ORDER_STATUS.PAYMENT_FAILED]: "bg-red-600",
      [ORDER_STATUS.PENDING]: "bg-yellow-500",
      [ORDER_STATUS.CONFIRMED]: "bg-blue-500",
      [ORDER_STATUS.SHIPPED]: "bg-purple-500",
      [ORDER_STATUS.DELIVERED]: "bg-green-500",
      [ORDER_STATUS.CANCELLED]: "bg-red-500",
      [ORDER_STATUS.RETURN_REQUESTED]: "bg-orange-600",
      [ORDER_STATUS.RETURN_IN_PROGRESS]: "bg-yellow-600",
      [ORDER_STATUS.RETURNED]: "bg-gray-600",
    };

    const label = ORDER_STATUS_LABELS[status as OrderStatus] || status;
    const color = statusColorMap[status] || "bg-gray-500"; // Fallback color

    return { text: label, color };
  };

  const statusInfo = getStatusInfo(order.status);

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="bg-card rounded-2xl border shadow-sm p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-xl">
                  <Package className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground">Détails de la commande</h1>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Hash className="h-4 w-4" />
                    <span className="text-sm md:text-base">Commande {order.id}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-start md:items-end gap-3">
              <Badge
                className={`text-white text-sm font-semibold px-4 py-2 rounded-full ${statusInfo.color} shadow-lg`}
              >
                {statusInfo.text}
              </Badge>
              {order.createdAt && (
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(order.createdAt).toLocaleDateString('fr-FR')}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Order Items & Delivery */}
          <div className="lg:col-span-2 space-y-8">
            {/* Order Items */}
            <Card className="rounded-2xl shadow-sm border">
              <CardHeader className="border-b bg-muted/30">
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  Récapitulatif des articles
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {parsedItems?.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 bg-muted/20 rounded-xl border">
                      <Avatar className="w-16 h-16 rounded-xl shadow-sm">
                        <AvatarImage src={product?.images?.[0]?.url} className="object-cover" />
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          P
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <p className="font-semibold text-foreground text-lg">
                          Produit #{item.produitId.slice(0, 8)}...
                        </p>
                        <p className="text-muted-foreground">
                          Quantité: <span className="font-medium text-foreground">{item.quantity}</span>
                        </p>
                        <p className="text-muted-foreground">
                          Prix unitaire: <span className="font-medium text-foreground">{formatPrice(item.price)}</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-xl text-foreground">
                          {formatPrice(item.quantity * item.price)}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  <div className="border-t pt-6 mt-6">
                    <div className="flex justify-between items-center p-4 bg-primary/5 rounded-xl border border-primary/20">
                      <span className="font-bold text-xl text-foreground">Total de la commande:</span>
                      <span className="font-bold text-2xl text-primary">{formatPrice(order.total)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Information */}
            <Card className="rounded-2xl shadow-sm border">
              <CardHeader className="border-b bg-muted/30">
                <CardTitle className="text-foreground flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Informations de livraison
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-muted rounded-lg">
                        <User className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-muted-foreground text-sm font-medium">Nom complet</p>
                        <p className="text-foreground font-semibold">
                          {parsedDeliveryDetails
                            ? `${parsedDeliveryDetails.firstName} ${parsedDeliveryDetails.lastName}`
                            : customer
                            ? `${customer.firstName} ${customer.lastName}`
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-muted rounded-lg">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-muted-foreground text-sm font-medium">Téléphone</p>
                        <p className="text-foreground font-semibold">
                          {parsedDeliveryDetails?.phone || customer?.phone || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-muted rounded-lg">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-muted-foreground text-sm font-medium">Email</p>
                        <p className="text-foreground font-semibold">
                          {parsedDeliveryDetails?.email || customer?.email || "N/A"}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-muted rounded-lg">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      </div>
                      <div>
                        <p className="text-muted-foreground text-sm font-medium">Adresse de livraison</p>
                        <p className="text-foreground font-semibold">
                          {parsedDeliveryDetails?.location ? 
                            `${parsedDeliveryDetails.location.street}, ${parsedDeliveryDetails.location.city}, ${parsedDeliveryDetails.location.postcode}, ${parsedDeliveryDetails.location.country}` 
                            : customer?.address || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Customer, Merchant, Payment */}
          <div className="space-y-8">
            {/* Customer Information */}
            <Card className="rounded-2xl shadow-sm border">
              <CardHeader className="border-b bg-muted/30">
                <CardTitle className="text-foreground flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Informations client
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {customer ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-14 h-14">
                        <AvatarImage src={customer.avatarUrl} />
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                          {customer.firstName?.[0]}{customer.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-foreground text-lg">
                          {`${customer.firstName} ${customer.lastName}`}
                        </p>
                        <p className="text-muted-foreground">{customer.email}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3 pt-4 border-t">
                      <div className="flex items-center gap-3">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-foreground">{customer.phone || "N/A"}</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <span className="text-foreground text-sm">{customer.address || "N/A"}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Client non trouvé.</p>
                )}
              </CardContent>
            </Card>

            {/* Merchant Information */}
            <Card className="rounded-2xl shadow-sm border">
              <CardHeader className="border-b bg-muted/30">
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  Marchand
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <Avatar className="w-14 h-14">
                    <AvatarImage src={merchantUser?.avatarUrl} />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                      {merchantUser?.firstName?.[0]}
                      {merchantUser?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground text-lg">
                      {merchantUser?.firstName} {merchantUser?.lastName}
                    </p>
                    <p className="text-muted-foreground">{merchantUser?.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card className="rounded-2xl shadow-sm border">
              <CardHeader className="border-b bg-muted/30">
                <CardTitle className="text-foreground flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  Paiement
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <CreditCard className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm font-medium">Méthode de paiement</p>
                    <p className="text-foreground font-semibold text-lg">
                      {(order as any).paymentMethod || "N/A"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

const OrderDetailsPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const { data: order, isLoading, error } = useOrder(orderId || "");
  const { data: users} = useUsers();

  const customer = useMemo(() => {
    if (!order || !users) return null;
    return users.find((u: UserType) => u.id === order.clientId) || null;
  }, [order, users]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-3 text-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="text-lg">Chargement des détails de la commande...</span>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="p-6 bg-destructive/10 rounded-xl border border-destructive/20 mb-4">
            <Package className="h-12 w-12 text-destructive mx-auto mb-3" />
            <p className="text-destructive text-lg font-semibold">
              Impossible de charger les détails de la commande.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <OrderContent order={order} customer={customer ?? null} />;
};

export default OrderDetailsPage;