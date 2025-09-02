import {
  Search,
  ShoppingCart,
  User,
  Menu,
  LogOut,
  LayoutDashboard,
  X,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/stores";
import { useCartStore } from "@/stores";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

const Header = () => {
  const { user, logout } = useAuthStore();
  const { getTotalItems } = useCartStore();
  const navigate = useNavigate();
  const totalItems = getTotalItems();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-background border-b border-border sticky top-0 z-30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to={"/"}
            className="flex items-center space-x-4"
            onClick={closeMobileMenu}
          >
            <img src="/logo.png" alt="" className="h-20" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-sm text-foreground">
                  Bonjour, {user.firstName}
                </span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-foreground"
                    >
                      <User className="h-4 w-4 mr-2" />
                      {user.roles.some((role) => role.name === "MERCHANT")
                        ? "Dashboard"
                        : "Mon compte"}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <DropdownMenuLabel>Mon compte</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {user.roles.some((role) => role.name === "CLIENT") && (
                      <DropdownMenuItem
                        onClick={() => navigate("/dashboard/client")}
                      >
                        Mon espace client
                      </DropdownMenuItem>
                    )}
                    {user.roles.some((role) => role.name === "MERCHANT") && (
                      <DropdownMenuItem
                        onClick={() => navigate("/dashboard/merchant")}
                      >
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Ma boutique
                      </DropdownMenuItem>
                    )}
                    {user.roles.some((role) => role.name === "ADMIN") && (
                      <DropdownMenuItem
                        onClick={() => navigate("/dashboard/admin")}
                      >
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Dashboard Admin
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Se déconnecter
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="text-foreground hover:text-primary"
                onClick={() => navigate("/auth?method=login")}
              >
                <User className="h-4 w-4 mr-2" />
                Se connecter
              </Button>
            )}
            {user?.roles.some((role) => role.name === "MERCHANT") ? (
              <Button
                size="sm"
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Ajouter produit
              </Button>
            ) : (
              user?.roles.some((role) => role.name === "ADMIN") === false && (
                <Button
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={
                    user ? undefined : () => navigate("/onboarding/merchant")
                  }
                >
                  Devenir merchant
                </Button>
              )
            )}
            <Button
              variant="ghost"
              size="sm"
              className="relative"
              onClick={() => navigate("/cart")}
            >
              <ShoppingCart className="h-4 w-4" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Button>
          </div>

          {/* Mobile Navigation Toggle */}
          <div className="md:hidden flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="relative"
              onClick={() => {
                navigate("/cart");
                closeMobileMenu();
              }}
            >
              <ShoppingCart className="h-4 w-4" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMobileMenu}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <Menu className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background">
            <div className="py-4 space-y-2">
              {user ? (
                <>
                  <div className="px-4 py-2 text-sm text-foreground border-b border-border">
                    Bonjour, {user.firstName}
                  </div>
                  {user.roles.some((role) => role.name === "CLIENT") && (
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => {
                        navigate("/dashboard/client");
                        closeMobileMenu();
                      }}
                    >
                      <User className="mr-2 h-4 w-4" />
                      Mon espace client
                    </Button>
                  )}
                  {user.roles.some((role) => role.name === "MERCHANT") && (
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => {
                        navigate("/dashboard/merchant");
                        closeMobileMenu();
                      }}
                    >
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Ma boutique
                    </Button>
                  )}
                  {user.roles.some((role) => role.name === "ADMIN") && (
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => {
                        navigate("/dashboard/admin");
                        closeMobileMenu();
                      }}
                    >
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard Admin
                    </Button>
                  )}
                  {user?.roles.some((role) => role.name === "MERCHANT") ? (
                    <Button
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                      onClick={closeMobileMenu}
                    >
                      Ajouter produit
                    </Button>
                  ) : (
                    user?.roles.some((role) => role.name === "ADMIN") ===
                      false && (
                      <Button
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                        onClick={() => {
                          if (!user) navigate("/onboarding/merchant");
                          closeMobileMenu();
                        }}
                      >
                        Devenir merchant
                      </Button>
                    )
                  )}
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => {
                      logout();
                      closeMobileMenu();
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Se déconnecter
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      navigate("/auth?method=login");
                      closeMobileMenu();
                    }}
                  >
                    <User className="mr-2 h-4 w-4" />
                    Se connecter
                  </Button>
                  <Button
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                    onClick={() => {
                      navigate("/onboarding/merchant");
                      closeMobileMenu();
                    }}
                  >
                    Devenir merchant
                  </Button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Mobile Search */}
        <div className="md:hidden pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Rechercher des produits..."
              className="pl-10 bg-card border-muted"
            />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
