import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NotificationItem from "@/components/dashboard/shared/NotificationItem";
import type { Notification } from "@/types";

// Données de simulation
const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "order",
    message: "Nouvelle commande #1256 reçue de Jean Dupont.",
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    read: false,
  },
  {
    id: "2",
    type: "review",
    message:
      'Vous avez reçu un nouvel avis 5 étoiles pour le produit "T-shirt en coton bio".',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    read: false,
  },
  {
    id: "3",
    type: "stock",
    message:
      'Le stock du produit "Casquette de baseball" est bas (plus que 5 restants).',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    read: true,
  },
  {
    id: "4",
    type: "system",
    message: "Une maintenance est prévue le 25/12/2023 à 2h00 du matin.",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    read: true,
  },
];

const NotificationsPage = () => {
  const [notifications, setNotifications] =
    useState<Notification[]>(mockNotifications);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const filteredNotifications = useMemo(() => {
    if (filter === "unread") {
      return notifications.filter((n) => !n.read);
    }
    return notifications;
  }, [notifications, filter]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
        <p className="text-muted-foreground">
          Gérez vos alertes et mises à jour.
        </p>
      </div>

      <Card className="glass-card-2 border-slate-700">
        <CardHeader className="flex-row items-center justify-between border-b border-slate-700">
          <CardTitle className="text-muted-foreground">
            Toutes les notifications
          </CardTitle>
          <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
            Tout marquer comme lu
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs
            defaultValue="all"
            onValueChange={(value) => setFilter(value as "all" | "unread")}
            className="w-full"
          >
            <div className="border-b border-slate-700 px-4">
              <TabsList className="bg-transparent p-0">
                <TabsTrigger
                  value="all"
                  className="data-[state=active]:bg-slate-700/50 data-[state=active]:text-muted-foreground text-foreground"
                >
                  Tout
                </TabsTrigger>
                <TabsTrigger
                  value="unread"
                  className="data-[state=active]:bg-slate-700/50 data-[state=active]:text-muted-foreground text-foreground"
                >
                  Non lues
                </TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="all">
              {filteredNotifications.length > 0 ? (
                filteredNotifications.map((n) => (
                  <NotificationItem
                    key={n.id}
                    notification={n}
                    onMarkAsRead={handleMarkAsRead}
                  />
                ))
              ) : (
                <p className="p-6 text-center text-muted-foreground">
                  Aucune notification.
                </p>
              )}
            </TabsContent>
            <TabsContent value="unread">
              {filteredNotifications.length > 0 ? (
                filteredNotifications.map((n) => (
                  <NotificationItem
                    key={n.id}
                    notification={n}
                    onMarkAsRead={handleMarkAsRead}
                  />
                ))
              ) : (
                <p className="p-6 text-center text-muted-foreground">
                  Vous n'avez aucune notification non lue.
                </p>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationsPage;
