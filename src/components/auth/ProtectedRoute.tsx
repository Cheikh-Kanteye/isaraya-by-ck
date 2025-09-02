import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "MERCHANT" | "CLIENT" | "ADMIN";
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { user, isAuthLoading } = useAuthStore(); // Ajoute isAuthLoading
  const location = useLocation();

  // Affiche un loader pendant la vérification de l'authentification
  if (isAuthLoading) {
    return <div className="flex justify-center items-center h-screen text-lg">Chargement de l'authentification...</div>; // Ou un composant de loader plus sophistiqué
  }

  if (!user) {
    // Rediriger vers la page de connexion si non authentifié
    return <Navigate to="/auth?method=login" state={{ from: location }} replace />;
  }

  if (requiredRole && !user.roles.some(role => role.name === requiredRole)) {
    return (
      <p>
        {requiredRole} {user.roles.map(role => role.name).join(', ')} -------------
      </p>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
