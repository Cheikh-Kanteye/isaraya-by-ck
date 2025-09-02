import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bell,
  Package,
  CreditCard,
  Tag,
  AlertCircle,
  CheckCircle,
  Trash2,
  BellDot,
} from "lucide-react";

interface Notification {
  id: string;
  type: "order" | "payment" | "promotion" | "system";
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
}

const Notifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");

  useEffect(() => {
    // Simuler des notifications
    const mockNotifications: Notification[] = [
      {
        id: "1",
        type: "order",
        title: "Commande expédiée",
        message:
          "Votre commande #001 (iPhone 14 Pro Max) a été expédiée et arrivera dans 2-3 jours.",
        isRead: false,
        createdAt: "2024-01-25T10:30:00Z",
        actionUrl: "/orders/001",
      },
      {
        id: "2",
        type: "payment",
        title: "Paiement en attente",
        message:
          "Le paiement de votre commande #002 est en attente. Veuillez finaliser le paiement.",
        isRead: false,
        createdAt: "2024-01-24T15:45:00Z",
        actionUrl: "/orders/002",
      },
      {
        id: "3",
        type: "promotion",
        title: "Nouvelle promotion !",
        message:
          "Profitez de -20% sur tous les produits électroniques avec le code TECH20.",
        isRead: false,
        createdAt: "2024-01-24T09:00:00Z",
      },
      {
        id: "4",
        type: "order",
        title: "Commande livrée",
        message:
          "Votre commande #003 a été livrée avec succès. N'oubliez pas de laisser un avis !",
        isRead: true,
        createdAt: "2024-01-23T14:20:00Z",
        actionUrl: "/orders/003",
      },
      {
        id: "5",
        type: "system",
        title: "Mise à jour des conditions",
        message:
          "Nos conditions générales ont été mises à jour. Consultez les changements.",
        isRead: true,
        createdAt: "2024-01-22T08:00:00Z",
      },
    ];

    setNotifications(mockNotifications);
  }, []);

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "unread") return !notification.isRead;
    if (filter === "read") return notification.isRead;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) return "À l'instant";
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    if (diffInHours < 48) return "Hier";
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "order":
        return <Package className="h-5 w-5 text-primary" />;
      case "payment":
        return <CreditCard className="h-5 w-5 text-green-500" />;
      case "promotion":
        return <Tag className="h-5 w-5 text-orange-500" />;
      case "system":
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const handleMarkAsUnread = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === notificationId
          ? { ...notification, isRead: false }
          : notification
      )
    );
  };

  const handleDelete = (notificationId: string) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== notificationId)
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, isRead: true }))
    );
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {unreadCount}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Restez informé de l'activité de votre compte
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Tout marquer comme lu
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={handleClearAll}>
                <Trash2 className="h-4 w-4 mr-2" />
                Tout supprimer
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs
            value={filter}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onValueChange={(value) => setFilter(value as any)}
          >
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">
                Toutes ({notifications.length})
              </TabsTrigger>
              <TabsTrigger value="unread">Non lues ({unreadCount})</TabsTrigger>
              <TabsTrigger value="read">
                Lues ({notifications.length - unreadCount})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={filter} className="mt-6">
              {filteredNotifications.length === 0 ? (
                <div className="text-center py-12">
                  <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">
                    Aucune notification
                  </h3>
                  <p className="text-muted-foreground">
                    {filter === "unread"
                      ? "Vous n'avez aucune notification non lue."
                      : filter === "read"
                      ? "Vous n'avez aucune notification lue."
                      : "Vous n'avez aucune notification."}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredNotifications.map((notification) => (
                    <Card
                      key={notification.id}
                      className={`border transition-colors ${
                        !notification.isRead
                          ? "bg-primary/5 border-primary/20"
                          : ""
                      }`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-4">
                          <div className="flex-shrink-0 mt-1">
                            {getNotificationIcon(notification.type)}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-medium text-foreground">
                                    {notification.title}
                                  </h4>
                                  {!notification.isRead && (
                                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground mb-2">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {formatDate(notification.createdAt)}
                                </p>
                              </div>

                              <div className="flex items-center gap-2 ml-4">
                                {notification.actionUrl && (
                                  <Button variant="outline" size="sm">
                                    Voir
                                  </Button>
                                )}

                                {!notification.isRead ? (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      handleMarkAsRead(notification.id)
                                    }
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                ) : (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      handleMarkAsUnread(notification.id)
                                    }
                                  >
                                    <BellDot className="h-4 w-4" />
                                  </Button>
                                )}

                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDelete(notification.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Paramètres de notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Paramètres de notifications</CardTitle>
          <CardDescription>
            Choisissez les types de notifications que vous souhaitez recevoir
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Notifications de commandes</p>
                <p className="text-sm text-muted-foreground">
                  Statut des commandes, livraisons, etc.
                </p>
              </div>
              <Button variant="outline" size="sm">
                Activé
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Notifications de paiement</p>
                <p className="text-sm text-muted-foreground">
                  Confirmations de paiement, rappels, etc.
                </p>
              </div>
              <Button variant="outline" size="sm">
                Activé
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Promotions et offres</p>
                <p className="text-sm text-muted-foreground">
                  Nouvelles promotions, codes de réduction, etc.
                </p>
              </div>
              <Button variant="outline" size="sm">
                Activé
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Notifications système</p>
                <p className="text-sm text-muted-foreground">
                  Mises à jour importantes, maintenance, etc.
                </p>
              </div>
              <Button variant="outline" size="sm">
                Activé
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Notifications;
