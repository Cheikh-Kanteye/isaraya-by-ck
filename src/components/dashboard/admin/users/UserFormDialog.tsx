import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { UserForm } from "./UserForm";
import type { User } from "@/types";
import * as z from "zod";

// Définir le type pour les valeurs du formulaire en se basant sur le schéma de UserForm
const formSchema = z.object({
  firstname: z.string().min(2),
  lastname: z.string().min(2),
  email: z.string().email(),
  role: z.enum(["ADMIN", "CLIENT", "MERCHANT"]),
});

interface UserFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user?: User | null;
  onSubmit: (values: z.infer<typeof formSchema>) => void;
  isSubmitting: boolean;
}

export const UserFormDialog: React.FC<UserFormDialogProps> = ({
  isOpen,
  onClose,
  user,
  onSubmit,
  isSubmitting,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px] glass-card-2">
        <DialogHeader>
          <DialogTitle>
            {user ? "Modifier l'utilisateur" : "Ajouter un nouvel utilisateur"}
          </DialogTitle>
          <DialogDescription>
            {user
              ? "Modifiez les informations ci-dessous."
              : "Remplissez les informations pour créer un nouvel utilisateur."}
          </DialogDescription>
        </DialogHeader>
        <UserForm user={user} onSubmit={onSubmit} isSubmitting={isSubmitting} />
      </DialogContent>
    </Dialog>
  );
};
