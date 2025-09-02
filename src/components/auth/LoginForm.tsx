import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores";
import { useToast } from "@/hooks/use-toast";
import { LoginDto } from "@/types";

interface LoginFormProps {
  onSuccess?: () => void;
}

const LoginForm = ({ onSuccess }: LoginFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { login, isSubmitting: authLoading, error } = useAuthStore(); // Utilise isSubmitting ici
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const credentials: LoginDto = {
      email,
      password,
    };

    const success = await login(credentials);

    if (success) {
      toast({
        title: "Connexion réussie",
        description: "Bienvenue sur ISaraya !",
      });
      onSuccess && onSuccess();
    } else {
      toast({
        title: "Erreur de connexion",
        description: error || "Email ou mot de passe incorrect.",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="email@exemple.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Mot de passe</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="pr-10"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <Button type="submit" className="w-full" disabled={authLoading}>
        {authLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
        Se connecter
      </Button>
    </form>
  );
};

export default LoginForm;
