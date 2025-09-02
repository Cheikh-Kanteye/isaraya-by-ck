import { FC } from "react";
import { User } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, User as UserIcon, Shield, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserDetailsSidebarProps {
  user: User | null;
  onClose: () => void;
  onEdit: (user: User) => void;
}

const UserDetailsSidebar: FC<UserDetailsSidebarProps> = ({
  user,
  onClose,
  onEdit,
}) => {
  if (!user) {
    return null;
  }

  const getStatusVariant = (
    status?: string
  ): "success" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "ACTIVE":
        return "success";
      case "PENDING":
        return "secondary";
      case "INACTIVE":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-background/95 backdrop-blur-sm border-l border-border/50 shadow-2xl animate-in slide-in-from-right-full duration-300">
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">
            Détails de l'utilisateur
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="h-24 w-24 border-4 border-primary/50">
              <AvatarImage
                src={user.avatarUrl}
                alt={`${user.firstName} ${user.lastName}`}
              />
              <AvatarFallback className="text-3xl">
                {user.firstName?.[0]}
                {user.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <h3 className="text-2xl font-bold">{`${user.firstName} ${user.lastName}`}</h3>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-base">
                Informations Générales
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex items-center">
                <UserIcon className="h-4 w-4 mr-3 text-muted-foreground" />
                <span className="font-medium">Nom d'utilisateur:</span>
                <span className="ml-auto text-muted-foreground">
                  {user.firstName + " " + user.lastName || "N/A"}
                </span>
              </div>
              <div className="flex items-center">
                <Shield className="h-4 w-4 mr-3 text-muted-foreground" />
                <span className="font-medium">Rôle:</span>
                <span className="ml-auto">
                  <Badge variant="outline">{user.roles[0].name}</Badge>
                </span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-3 text-muted-foreground" /> 
              </div>
            </CardContent>
          </Card>

          {user.roles.some(role => role.name === "VENDEUR") && user.merchantProfile?.businessName && (
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-base">
                  Informations Merchant
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex items-center">
                  <UserIcon className="h-4 w-4 mr-3 text-muted-foreground" />
                  <span className="font-medium">Boutique:</span>
                  <span className="ml-auto text-muted-foreground font-semibold">
                    {user.merchantProfile?.businessName}
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        <div className="p-4 border-t border-border">
          <Button
            className="w-full"
            variant="outline"
            onClick={() => onEdit(user)}
          >
            Modifier l'utilisateur
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserDetailsSidebar;
