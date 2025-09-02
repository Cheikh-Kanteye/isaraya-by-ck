import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

interface DashboardHeaderProps {
  userName: string;
  onLogout: () => void;
}

const DashboardHeader = ({ userName, onLogout }: DashboardHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Bonjour, {userName} !
        </h1>
        <p className="text-muted-foreground">
          Gérez vos commandes et préférences depuis votre espace personnel
        </p>
      </div>
      <Button variant="outline" onClick={onLogout}>
        <LogOut className="h-4 w-4 mr-2" />
        Se déconnecter
      </Button>
    </div>
  );
};

export default DashboardHeader;
