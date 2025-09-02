import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuthStore } from "@/stores";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, ArrowLeft, Mail, CheckCircle } from "lucide-react";
import { Navigate } from "react-router-dom";
// import { useSearchParams } from "react-router-dom"; // Removed for artifact compatibility

interface AuthFormProps {
  onClose: () => void;
}

const AuthForm = ({ onClose }: AuthFormProps) => {
  const { login, register, user, isSubmitting, error } = useAuthStore(); // Utilise isSubmitting pour le chargement des soumissions de formulaire
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  // const [isLoading, setIsLoading] = useState(false); // Removed local isLoading state
  // const [searchParams] = useSearchParams(); // Removed for artifact compatibility
  // const initialTabFromUrl = searchParams.get("method") === "register" ? "register" : "login";
  const initialTabFromUrl = "login"; // Default to login
  const [activeTab, setActiveTab] = useState(initialTabFromUrl);

  // Modal state for email verification
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  });

  const [registerForm, setRegisterForm] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    role: "CLIENT" as "CLIENT" | "MERCHANT",
  });

  const handleLogin = async () => {
    // setIsLoading(true); // No longer needed as isLoading is from store
    console.log("Login");

    const success = await login(loginForm);

    if (success) {
      toast({
        title: "Connexion réussie",
        description: "Bienvenue sur ISaraya !",
      });
      console.log("Login success");
      onClose();
    } else {
      toast({
        title: "Erreur de connexion",
        description: error || "Email ou mot de passe incorrect.",
        variant: "destructive",
      });
      console.log("Login failed");
    }
    // setIsLoading(false); // No longer needed as isLoading is from store
  };

  const handleRegister = async () => {
    // setIsLoading(true); // No longer needed as isLoading is from store

    const success = await register(registerForm);

    if (success) {
      setRegisteredEmail(registerForm.email);
      setShowEmailModal(true); // Show modal instead of inline message
      toast({
        title: "Inscription réussie",
        description: "Un email de vérification vous a été envoyé.",
      });
    } else {
      toast({
        title: "Erreur d'inscription",
        description: error || "Cette adresse email est déjà utilisée.",
        variant: "destructive",
      });
    }
    // setIsLoading(false); // No longer needed as isLoading is from store
  };

  const handleModalClose = () => {
    setShowEmailModal(false);
    setActiveTab("login");
    // Reset registration form
    setRegisterForm({
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      role: "CLIENT",
    });
  };

  if (user && !showEmailModal && activeTab === "login") {
    return <Navigate to="/" />;
  }

  return (
    <>
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Button
            variant="ghost"
            onClick={onClose}
            className="mb-4 text-foreground hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à l'accueil
          </Button>

          <Card className="bg-card border-border">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-card-foreground">
                I<span className="text-primary">Saraya</span>
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Rejoignez la marketplace du Sénégal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs
                defaultValue={initialTabFromUrl}
                value={activeTab}
                onValueChange={setActiveTab}
                className="space-y-4"
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger className="active:text-white" value="login">
                    Se connecter
                  </TabsTrigger>
                  <TabsTrigger value="register">S'inscrire</TabsTrigger>
                </TabsList>

                <TabsContent value="login">
                  <div onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-card-foreground">
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="votre@email.com"
                        value={loginForm.email}
                        onChange={(e) =>
                          setLoginForm({ ...loginForm, email: e.target.value })
                        }
                        required
                        className="bg-card border-border"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="password"
                        className="text-card-foreground"
                      >
                        Mot de passe
                      </Label>
                      <div className="relative">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Votre mot de passe"
                          value={loginForm.password}
                          onChange={(e) =>
                            setLoginForm({
                              ...loginForm,
                              password: e.target.value,
                            })
                          }
                          required
                          className="bg-card border-border pr-10"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {error && (
                      <p className="text-sm font-medium text-destructive">
                        {error}
                      </p>
                    )}

                    <Button
                      type="button"
                      onClick={handleLogin}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                      disabled={isSubmitting} // Utilise isSubmitting du store
                    >
                      {isSubmitting ? "Connexion en cours..." : "Se connecter"}
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="register">
                  <div onSubmit={handleRegister} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="firstName"
                          className="text-card-foreground"
                        >
                          Prénom
                        </Label>
                        <Input
                          id="firstName"
                          placeholder="Prénom"
                          value={registerForm.firstName}
                          onChange={(e) =>
                            setRegisterForm({
                              ...registerForm,
                              firstName: e.target.value,
                            })
                          }
                          required
                          className="bg-card border-border"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="lastName"
                          className="text-card-foreground"
                        >
                          Nom
                        </Label>
                        <Input
                          id="lastName"
                          placeholder="Nom"
                          value={registerForm.lastName}
                          onChange={(e) =>
                            setRegisterForm({
                              ...registerForm,
                              lastName: e.target.value,
                            })
                          }
                          required
                          className="bg-card border-border"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="registerEmail"
                        className="text-card-foreground"
                      >
                        Email
                      </Label>
                      <Input
                        id="registerEmail"
                        type="email"
                        placeholder="votre@email.com"
                        value={registerForm.email}
                        onChange={(e) =>
                          setRegisterForm({
                            ...registerForm,
                            email: e.target.value,
                          })
                        }
                        required
                        className="bg-card border-border"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="registerPassword"
                        className="text-card-foreground"
                      >
                        Mot de passe
                      </Label>
                      <Input
                        id="registerPassword"
                        type="password"
                        placeholder="Mot de passe"
                        value={registerForm.password}
                        onChange={(e) =>
                          setRegisterForm({
                            ...registerForm,
                            password: e.target.value,
                          })
                        }
                        required
                        className="bg-card border-border"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label className="text-card-foreground">
                        Type de compte
                      </Label>
                      <RadioGroup
                        value={registerForm.role}
                        onValueChange={(value) =>
                          setRegisterForm({
                            ...registerForm,
                            role: value as "CLIENT" | "MERCHANT",
                          })
                        }
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="CLIENT" id="client" />
                          <Label
                            htmlFor="client"
                            className="text-card-foreground"
                          >
                            Client (Acheter)
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="MERCHANT" id="merchant" />
                          <Label
                            htmlFor="merchant"
                            className="text-card-foreground"
                          >
                            Merchant (Vendre)
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <Button
                      type="button"
                      onClick={handleRegister}
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                      disabled={isSubmitting} // Utilise isSubmitting du store
                    >
                      {isSubmitting ? "Inscription en cours..." : "S'inscrire"}
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Email Verification Modal */}
      <Dialog open={showEmailModal} onOpenChange={setShowEmailModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-green-100 rounded-full">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <DialogTitle className="text-center text-xl font-bold">
              Inscription Réussie !
            </DialogTitle>
            <DialogDescription className="text-center space-y-3">
              <div className="flex items-center justify-center space-x-2 text-lg">
                <Mail className="w-5 h-5 text-primary" />
                <span>Email de vérification envoyé</span>
              </div>
              <p className="text-sm">
                Nous avons envoyé un email de vérification à{" "}
                <span className="font-semibold text-primary break-all">
                  {registeredEmail}
                </span>
              </p>
              <p className="text-sm text-muted-foreground">
                Veuillez vérifier votre boîte de réception (et vos spams) pour
                activer votre compte.
              </p>
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col space-y-3 mt-6">
            <Button
              onClick={handleModalClose}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Aller à la connexion
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setShowEmailModal(false);
                onClose();
              }}
              className="w-full"
            >
              Retour à l'accueil
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AuthForm;
