import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Heart, MapPin, Settings } from "lucide-react";

const QuickActions = () => {
  const actions = [
    {
      icon: ShoppingBag,
      label: "Nouvelle commande",
      onClick: () => console.log("Nouvelle commande"),
    },
    {
      icon: Heart,
      label: "Mes favoris",
      onClick: () => console.log("Mes favoris"),
    },
    {
      icon: MapPin,
      label: "Mes adresses",
      onClick: () => console.log("Mes adresses"),
    },
    {
      icon: Settings,
      label: "Paramètres",
      onClick: () => console.log("Paramètres"),
    },
  ];

  return (
    <Card className="bg-white border-2 border-gray-200 shadow-lg">
      <CardHeader>
        <CardTitle className="text-gray-900 text-xl font-bold">
          Actions rapides
        </CardTitle>
        <CardDescription className="text-gray-700 font-medium">
          Accès rapide aux fonctionnalités principales
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {actions.map((action, index) => (
            <QuickActionButton
              key={index}
              icon={action.icon}
              label={action.label}
              onClick={action.onClick}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

interface QuickActionButtonProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
}

const QuickActionButton = ({
  icon: Icon,
  label,
  onClick,
}: QuickActionButtonProps) => {
  return (
    <Button
      variant="outline"
      className="h-20 flex-col border-2 border-gray-300 text-gray-800 font-medium hover:bg-orange-50 hover:border-orange-400 hover:text-orange-700 transition-colors"
      onClick={onClick}
    >
      <Icon className="h-6 w-6 mb-2 text-orange-600" />
      {label}
    </Button>
  );
};

export default QuickActions;
