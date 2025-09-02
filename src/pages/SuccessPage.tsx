import React from 'react';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function SuccessPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background px-4 text-center">
      <CheckCircle className="h-24 w-24 text-green-500 mb-6" />
      <h1 className="text-4xl font-bold text-foreground mb-4">Commande Réussie !</h1>
      <p className="text-lg text-muted-foreground mb-8">
        Merci pour votre achat. Votre commande a été passée avec succès et est en cours de traitement.
      </p>
      <Button onClick={() => navigate('/')} size="lg">
        Retour à la page d'accueil
      </Button>
    </div>
  );
}
