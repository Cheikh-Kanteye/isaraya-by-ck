import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Package,
  X,
  Home,
  Package2,
  ShoppingBag,
  BarChart3,
  Users,
  Settings,
  Bell,
  Layout,
  PanelLeft,
  ArrowLeftFromLine,
} from "lucide-react";
import { useAuthStore } from "@/stores";
import { cn } from "@/lib/utils";

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

const adminSidebarItems = [
  {
    id: "dashboard",
    path: "/dashboard/admin",
    icon: Home,
    label: "Tableau de bord",
  },
  {
    id: "users",
    path: "/dashboard/admin/users",
    icon: Users,
    label: "Utilisateurs",
  },
  {
    id: "products",
    path: "/dashboard/admin/produit",
    icon: Package2,
    label: "Produits",
  },
  {
    id: "orders",
    path: "/dashboard/admin/orders",
    icon: ShoppingBag,
    label: "Commandes",
  },
  {
    id: "analytics",
    path: "/dashboard/admin/analytics",
    icon: BarChart3,
    label: "Analytiques",
  },
  {
    id: "settings",
    path: "/dashboard/admin/settings",
    icon: Settings,
    label: "Paramètres",
  },
];

const merchantSidebarItems = [
  {
    id: "dashboard",
    path: "/dashboard/merchant",
    icon: Home,
    label: "Tableau de bord",
  },
  {
    id: "products",
    path: "/dashboard/merchant/products",
    icon: Package2,
    label: "Produits",
  },
  {
    id: "orders",
    path: "/dashboard/merchant/orders",
    icon: ShoppingBag,
    label: "Commandes",
  },
  {
    id: "analytics",
    path: "/dashboard/merchant/analytics",
    icon: BarChart3,
    label: "Analytiques",
  },
  {
    id: "customers",
    path: "/dashboard/merchant/customers",
    icon: Users,
    label: "Clients",
  },
  {
    id: "settings",
    path: "/dashboard/merchant/settings",
    icon: Settings,
    label: "Paramètres",
  },
];

const Sidebar: React.FC<SidebarProps> = ({
  sidebarOpen,
  setSidebarOpen,
  isCollapsed,
  setIsCollapsed,
}) => {
  const { user, fetchMerchantProfile } = useAuthStore();
  const location = useLocation();
  const [isFetchingMerchant, setIsFetchingMerchant] = React.useState(false);

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

  const isAdmin = user?.roles?.some((role) => role.name === "ADMIN") || false;
  const isMerchant =
    user?.roles?.some((role) => role.name === "MERCHANT") || false;
  const isClient = user?.roles?.some((role) => role.name === "CLIENT") || false;

  const getInitials = () => {
    if (isFetchingMerchant) return null;

    if (user?.merchantProfile?.businessName) {
      return user.merchantProfile.businessName.charAt(0).toUpperCase();
    }

    if (user?.firstName && user?.lastName) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(
        0
      )}`.toUpperCase();
    }

    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }

    return "U";
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

  const getRoleLabel = () => {
    if (isFetchingMerchant) return null;

    if (isAdmin) return "Administrateur";
    if (isMerchant) return "Marchand";
    if (isClient) return "Client";
    return "Utilisateur";
  };

  const sidebarItems = isAdmin ? adminSidebarItems : merchantSidebarItems;
  const roleLabel = getRoleLabel();

  const handleNavigation = () => {
    // Fermer la sidebar sur mobile après navigation
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  return (
    <div
      className={cn(
        "fixed inset-y-0 left-0 z-50 bg-sidebar-background border-r border-sidebar-border transition-all duration-300 ease-in-out",
        "lg:relative lg:translate-x-0 bg-background",
        isCollapsed ? "w-24" : "w-64",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center justify-between p-6 border-b border-sidebar-border">
          <div
            className={`flex items-center space-x-3 w-full overflow-hidden transition-all duration-300`}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
              <Package className="h-6 w-6 text-white" />
            </div>
            <div className={`${isCollapsed ? "opacity-0" : "opacity-100"}`}>
              <h1 className="text-lg font-bold text-primary">
                <span className="text-sidebar-foreground">i</span>Saraya
              </h1>
              <p className="text-xs text-sidebar-foreground">{roleLabel} Hub</p>
            </div>
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:block absolute -right-5 p-2 rounded-full bg-primary/15 hover:bg-primary/20 text-sidebar-foreground"
          >
            <PanelLeft
              className={`h-5 w-5 transition-transform duration-300 ${
                isCollapsed ? "rotate-180" : ""
              }`}
            />
          </button>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-sidebar-accent text-sidebar-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              location.pathname === item.path ||
              (item.path === "/dashboard/merchant" &&
                location.pathname === "/dashboard/merchant/");

            return (
              <NavLink
                key={item.id}
                to={item.path}
                onClick={handleNavigation}
                className={cn(
                  "flex items-center rounded-xl transition-all duration-200 group",
                  isCollapsed
                    ? "justify-center h-12 w-12 mx-auto"
                    : "justify-start px-4 py-3 w-full",
                  isActive
                    ? "bg-gradient-to-r from-primary to-accent text-white shadow-lg shadow-primary/20"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <div
                  className={cn(
                    "flex items-center",
                    isCollapsed ? "justify-center" : "justify-start"
                  )}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5 flex-shrink-0",
                      isActive
                        ? "text-white"
                        : "text-sidebar-foreground group-hover:text-sidebar-accent-foreground"
                    )}
                  />
                  <span
                    className={cn(
                      "font-medium transition-all duration-200",
                      isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100 ml-3"
                    )}
                  >
                    {item.label}
                  </span>
                </div>
              </NavLink>
            );
          })}
        </nav>

        {/* Divider and Return Link */}
        <div className="px-4 my-2">
          <div className="border-t border-sidebar-border"></div>
        </div>

        <div className="px-4 py-2">
          <NavLink
            to="/"
            className={cn(
              "flex items-center rounded-xl transition-all duration-200 group text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              isCollapsed
                ? "justify-center h-12 w-12 mx-auto"
                : "justify-start px-4 py-3 w-full"
            )}
          >
            <div
              className={cn(
                "flex items-center",
                isCollapsed ? "justify-center" : "justify-start"
              )}
            >
              <ArrowLeftFromLine className="h-5 w-5 flex-shrink-0" />
              <span
                className={cn(
                  "font-medium transition-all duration-200",
                  isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100 ml-3"
                )}
              >
                Retour au site
              </span>
            </div>
          </NavLink>
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-sidebar-border">
          <div
            className={cn(
              "flex items-center p-3 rounded-xl bg-sidebar-accent overflow-hidden",
              isCollapsed ? "justify-center" : ""
            )}
          >
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
              {isFetchingMerchant ? (
                <div className="animate-pulse w-6 h-6 rounded-full bg-white/30"></div>
              ) : (
                getInitials()
              )}
            </div>
            <div
              className={cn(
                "flex-1 min-w-0 transition-all duration-200",
                isCollapsed ? "w-0 opacity-0" : "opacity-100 ml-3"
              )}
            >
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {isFetchingMerchant ? (
                  <div className="h-4 w-32 bg-sidebar-accent/50 rounded animate-pulse"></div>
                ) : (
                  getDisplayName()
                )}
              </p>
              <p className="text-xs text-sidebar-foreground/60 truncate">
                {isFetchingMerchant ? (
                  <div className="h-3 w-20 bg-sidebar-accent/50 rounded animate-pulse mt-1"></div>
                ) : (
                  getRoleLabel()
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
