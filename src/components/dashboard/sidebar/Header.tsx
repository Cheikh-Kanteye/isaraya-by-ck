import React from "react";
import { Menu, Search, Bell, ChevronDown } from "lucide-react";
import { useAuthStore } from "@/stores";
import { useSearchStore } from "@/stores/useSearchStore";
import { useNavigate } from "react-router-dom";
import { NotificationsDrawer } from "../shared/NotificationsDrawer";
import { Link } from "react-router-dom";

interface HeaderProps {
  setSidebarOpen: (open: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ setSidebarOpen }) => {
  const { user, logout, fetchMerchantProfile } = useAuthStore();
  const { onOpen } = useSearchStore();
  const [isFetchingMerchant, setIsFetchingMerchant] = React.useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = React.useState(false);
  const navigate = useNavigate();

  // Récupérer le profil marchand au chargement si l'utilisateur est un marchand
  React.useEffect(() => {
    const loadMerchantProfile = async () => {
      if (
        user?.roles?.some((role) => role.name === "MERCHANT") &&
        !user.merchantProfile
      ) {
        setIsFetchingMerchant(true);
        try {
          await fetchMerchantProfile();
        } catch (error) {
          console.error("Erreur lors du chargement du profil marchand:", error);
        } finally {
          setIsFetchingMerchant(false);
        }
      }
    };

    loadMerchantProfile();
  }, [user, fetchMerchantProfile]);

  const handleLogout = async () => {
    await logout();
    navigate("/auth?method=login");
  };

  const getDisplayName = () => {
    if (isFetchingMerchant) return null;

    if (user?.merchantProfile?.businessName) {
      return user.merchantProfile.businessName;
    }

    if (user?.firstName && user?.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }

    if (user?.email) {
      return user.email.split("@")[0];
    }

    return "Mon compte";
  };

  return (
    <header className="bg-background border-b border-border/50 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg hover:bg-muted text-foreground"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              Tableau de bord
            </h1>
            <p className="text-sm text-muted-foreground">
              {user?.firstName ? `Bienvenue ${user.firstName}` : "Bienvenue"}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={onOpen}
            className="flex items-center space-x-2 px-4 py-2 w-64 bg-background/50 border border-border rounded-xl hover:bg-muted transition-all text-muted-foreground"
          >
            <div className="flex items-center space-x-2 flex-1">
              <Search className="h-4 w-4" />
              <span>Rechercher...</span>
            </div>
            <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              <span className="text-xs">⌘</span>K
            </kbd>
          </button>
          <NotificationsDrawer>
            <button className="relative p-2 rounded-xl hover:bg-muted transition-colors">
              <Bell className="h-5 w-5 text-foreground" />
            </button>
          </NotificationsDrawer>
          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2 focus:outline-none"
              >
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  {isFetchingMerchant ? (
                    <div className="animate-pulse w-6 h-6 rounded-full bg-primary/30"></div>
                  ) : (
                    <span className="font-medium">
                      {user?.merchantProfile?.businessName
                        ?.charAt(0)
                        ?.toUpperCase() ||
                        user?.firstName?.charAt(0)?.toUpperCase() ||
                        user?.email?.charAt(0)?.toUpperCase() ||
                        "U"}
                    </span>
                  )}
                </div>
                <span className="hidden md:inline-block text-sm font-medium text-foreground">
                  {isFetchingMerchant ? (
                    <div className="h-4 w-24 bg-muted rounded animate-pulse"></div>
                  ) : (
                    getDisplayName()
                  )}
                </span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </button>

              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5">
                  <div className="py-1" role="menu">
                    <Link
                      to="/dashboard/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                      role="menuitem"
                      onClick={() => setIsProfileMenuOpen(false)}
                    >
                      Mon profil
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                      role="menuitem"
                    >
                      Déconnexion
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
