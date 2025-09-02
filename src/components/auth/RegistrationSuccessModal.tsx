import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, Mail } from "lucide-react";

interface RegistrationSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  email: string;
}

export const RegistrationSuccessModal: React.FC<
  RegistrationSuccessModalProps
> = ({ isOpen, onClose, email }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Inscription réussie !
          </DialogTitle>
          <DialogDescription className="mt-2 text-sm text-gray-600">
            Votre compte a été créé avec succès. Pour finaliser votre
            inscription, veuillez vérifier votre boîte email.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 rounded-lg bg-blue-50 p-4">
          <div className="flex items-start">
            <Mail className="h-5 w-5 text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-blue-900">
                Email de vérification envoyé
              </p>
              <p className="mt-1 text-blue-700">
                Nous avons envoyé un lien de vérification à{" "}
                <span className="font-medium">{email}</span>
              </p>
              <p className="mt-2 text-blue-600">
                Cliquez sur le lien dans l'email pour activer votre compte et
                pouvoir vous connecter.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-2">
          <Button onClick={onClose} className="w-full">
            J'ai compris
          </Button>
          <p className="text-xs text-center text-gray-500">
            Vous ne trouvez pas l'email ? Vérifiez vos spams ou contactez le
            support.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
