import { FC } from "react";
import { Notification } from "@/types";
import { Button } from "@/components/ui/button";
import { Bell, ShoppingCart, Star, AlertTriangle, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
}

const notificationIcons = {
  order: <ShoppingCart className="h-5 w-5" />,
  review: <Star className="h-5 w-5" />,
  system: <AlertTriangle className="h-5 w-5" />,
  stock: <Package className="h-5 w-5" />,
  default: <Bell className="h-5 w-5" />,
};

const NotificationItem: FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
}) => {
  const Icon =
    notificationIcons[notification.type] || notificationIcons.default;

  return (
    <div
      className={cn(
        "flex items-start gap-4 p-4 border-b border-border",
        !notification.read && "bg-primary/5 font-medium"
      )}
    >
      <div className="text-primary mt-1">{Icon}</div>
      <div className="flex-1 space-y-1">
        <p className="text-sm text-foreground">{notification.message}</p>
        <p className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(notification.createdAt), {
            addSuffix: true,
            locale: fr,
          })}
        </p>
      </div>
      {!notification.read && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onMarkAsRead(notification.id)}
        >
          Marquer comme lu
        </Button>
      )}
    </div>
  );
};

export default NotificationItem;
