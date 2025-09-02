import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { useRecentOrders } from "@/hooks/useRecentOrders";

const RecentOrders = () => {
  const { orders, isLoading } = useRecentOrders();

  if (isLoading) {
    return <div className="text-gray-700 font-medium">Chargement...</div>;
  }

  return (
    <Card className="bg-white border-2 border-gray-200 shadow-lg">
      <CardHeader>
        <CardTitle className="text-gray-900 text-xl font-bold">
          Commandes récentes
        </CardTitle>
        <CardDescription className="text-gray-700 font-medium">
          Vos dernières commandes et leur statut
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderItem key={order.id} order={order} />
          ))}
        </div>
        <div className="mt-4">
          <Button
            variant="outline"
            className="w-full border-2 border-orange-500 text-orange-600 font-medium hover:bg-orange-50 hover:border-orange-600 transition-colors"
          >
            Voir toutes les commandes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

interface Order {
  id: string;
  productName: string;
  orderNumber: string;
  price: number;
  status: string;
  imageUrl?: string;
}

interface OrderItemProps {
  order: Order;
}

const OrderItem = ({ order }: OrderItemProps) => {
  return (
    <div className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-gray-200 border border-gray-300 rounded-lg"></div>
        <div>
          <p className="font-semibold text-gray-900">{order.productName}</p>
          <p className="text-sm font-medium text-gray-600">
            Commande #{order.orderNumber}
          </p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-bold text-gray-900">{formatPrice(order.price)}</p>
        <Badge className="bg-orange-500 text-white font-medium border-orange-500 hover:bg-orange-600">
          {order.status}
        </Badge>
      </div>
    </div>
  );
};

export default RecentOrders;
