import { useEffect } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useUsers, useProducts, useOrders } from "@/hooks/queries";
import { useNavigate } from "react-router-dom";
import { File, ShoppingCart, User } from "lucide-react";
import { useSearchStore } from "@/stores/useSearchStore";
import { DialogTitle } from "@radix-ui/react-dialog";

export function GlobalSearch() {
  const { isOpen, onClose, onToggle } = useSearchStore();
  const navigate = useNavigate();

  const { data: users } = useUsers();
  const { data: products } = useProducts();
  const { data: orders } = useOrders();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onToggle();
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [onToggle]);

  const runCommand = (command: () => unknown) => {
    onClose();
    command();
  };

  return (
    <CommandDialog open={isOpen} onOpenChange={onClose}>
      <DialogTitle className="sr-only">Recherche Globale</DialogTitle>
      {/* Ajout de la classe 'dark' et d'un titre pour l'accessibilité */}
      <div className="bg-background">
        <CommandInput
          className=" text-muted-foreground"
          autoFocus
          placeholder="Rechercher un utilisateur, produit, commande..."
        />
        <CommandList>
          <CommandEmpty>Aucun résultat trouvé.</CommandEmpty>

          {users && (
            <CommandGroup heading="Utilisateurs">
              {users.map((user) => (
                <CommandItem
                  key={user.id}
                  onSelect={() =>
                    runCommand(() =>
                      navigate(`/dashboard/admin/users?userId=${user.id}`)
                    )
                  }
                >
                  <User className="mr-2 h-4 w-4" />
                  <span>
                    {user.firstName} {user.lastName}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {products && (
            <CommandGroup heading="Produits">
              {products.map((product) => (
                <CommandItem
                  key={product.id}
                  onSelect={() =>
                    runCommand(() =>
                      navigate(`/dashboard/admin/produit/${product.id}`)
                    )
                  }
                >
                  <File className="mr-2 h-4 w-4" />
                  <span>{product.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}

          {orders && Array.isArray(orders) && (
            <CommandGroup heading="Commandes">
              {orders.map((order) => (
                <CommandItem
                  key={order.id}
                  onSelect={() =>
                    runCommand(() =>
                      navigate(`/dashboard/admin/orders/${order.id}`)
                    )
                  }
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  <span>Commande #{order.id}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </div>
    </CommandDialog>
  );
}
