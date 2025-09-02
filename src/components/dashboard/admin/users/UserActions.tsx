import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  Shield,
  Trash2,
  User as UserIcon,
  UserCheck,
  UserCog,
} from "lucide-react";
import type { User } from "@/types";
import { useUpdateUser, useDeleteUser } from "@/hooks/queries/useUserQueries";
import { useToast } from "@/hooks/use-toast";

type UserRole = "ADMIN" | "MERCHANT" | "CLIENT";

const roles: { role: UserRole; label: string; icon: React.ElementType }[] = [
  { role: "ADMIN", label: "Admin", icon: UserCog },
  { role: "MERCHANT", label: "Merchant", icon: UserCheck },
  { role: "CLIENT", label: "Client", icon: UserIcon },
];

export const UserActions = ({ user }: { user: User }) => {
  const { toast } = useToast();
  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();

  const handleRoleChange = (role: UserRole) => {
    if (user.roles.some(r => r.name === role)) return; // Vérifier si le rôle existe déjà dans le tableau

    updateUserMutation.mutate(
      { id: user.id, data: { role } },
      {
        onSuccess: () => {
          toast({
            title: "Rôle mis à jour",
            description: `Le rôle de ${user.firstName} a été changé en ${role}.`,
          });
        },
        onError: () => {
          toast({
            title: "Erreur",
            description: "La mise à jour du rôle a échoué.",
            variant: "destructive",
          });
        },
      }
    );
  };

  const handleDelete = () => {
    deleteUserMutation.mutate(user.id, {
      onSuccess: () => {
        toast({
          title: "Utilisateur supprimé",
          description: `${user.firstName} a été supprimé.`,
        });
      },
      onError: () => {
        toast({
          title: "Erreur",
          description: "La suppression de l'utilisateur a échoué.",
          variant: "destructive",
        });
      },
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Ouvrir le menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="glass-card">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Shield className="mr-2 h-4 w-4" />
            <span>Changer le rôle</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent className="glass-card">
              <DropdownMenuLabel>Choisir un rôle</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {roles.map(({ role, label, icon: Icon }) => (
                <DropdownMenuItem
                  key={role}
                  onClick={() => handleRoleChange(role)}
                  disabled={user.roles.some(r => r.name === role)} // Vérifier si le rôle existe déjà
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-destructive" onClick={handleDelete}>
          <Trash2 className="mr-2 h-4 w-4" />
          Supprimer
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
