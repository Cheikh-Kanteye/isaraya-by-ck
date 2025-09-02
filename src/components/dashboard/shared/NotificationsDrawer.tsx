import { useState, useMemo } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NotificationItem from "@/components/dashboard/shared/NotificationItem";
import type { Notification } from "@/types";
import { Bell } from "lucide-react";

// Données de simulation (à remplacer par une récupération de données via React Query)
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

interface NotificationsDrawerProps {
  children: React.ReactNode; // Le trigger pour ouvrir le drawer
}

export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({
  children,
}) => {
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

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  return (
    <Sheet>
      <SheetTrigger asChild>
        <div className="relative">
          {children}
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 -mt-1 -mr-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
              {unreadCount}
            </span>
          )}
        </div>
      </SheetTrigger>
      <SheetContent className="w-full max-w-md p-0 flex flex-col glass-card-2 border-slate-700">
        <SheetHeader className="p-6 border-b border-slate-700">
          <SheetTitle className="text-muted-foreground">
            Notifications
          </SheetTitle>
        </SheetHeader>
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-slate-700 flex items-center justify-between">
            <Tabs
              defaultValue="all"
              onValueChange={(value) => setFilter(value as "all" | "unread")}
              className="w-full"
            >
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
            </Tabs>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="text-foreground hover:text-muted-foreground"
            >
              Tout marquer comme lu
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto">
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
                {filter === "unread"
                  ? "Vous n'avez aucune notification non lue."
                  : "Aucune notification."}
              </p>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
