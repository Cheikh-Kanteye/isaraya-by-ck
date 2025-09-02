import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, User, Store, ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
import { z } from "zod";
import ImageUpload from "@/components/ui/ImageUpload"; 
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; 
import { useAuthStore } from "@/stores/authStore";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import config from "@/config";
import { CreateMerchantProfileDto } from "@/types";

const API_BASE_URL = config.api.url;

const useToast = () => ({ toast: (options: any) => {} });

// Step 1 Schema: User Profile Update
const userProfileSchema = z.object({
  firstName: z.string().min(1, "Le prénom est requis."),
  lastName: z.string().min(1, "Le nom est requis."),
  email: z.string().email("Adresse email invalide."),
});

type UserProfileFormData = z.infer<typeof userProfileSchema>;

// Step 2 Schema: Merchant Information
const merchantProfileSchema = z.object({
  shopName: z.string().min(1, "Le nom de la boutique est requis."),
  shopDescription: z.string().min(10, "La description de la boutique est requise (min 10 caractères)."),
  address: z.string().min(1, "L'adresse est requise."),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Numéro de téléphone invalide (Ex: +221771223344)."),
  website: z.string().url("L'URL du site web est invalide.").optional().or(z.literal('')),
  // Re-add logoUrl to schema for validation and state management
  logoUrl: z.union([
    z.string().url("L'URL du site web est invalide."),
    z.instanceof(File),
    z.literal(''),
    z.null(),
  ]).optional(),
  businessType: z.enum(["RESTAURANT", "GROCERY", "PHARMACY", "ELECTRONICS", "CLOTHING", "OTHER"]).default("OTHER"), // New field
  orangeMoneyNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Numéro Orange Money invalide.").optional().or(z.literal('')),
  waveMoneyNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Numéro Wave Money invalide.").optional().or(z.literal('')),
});

type MerchantProfileFormData = z.infer<typeof merchantProfileSchema>;

const MerchantOnboardingPage: React.FC = () => {
  const { user, isSubmitting, setIsSubmitting, error, accessToken } = useAuthStore(); // Correction ici
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  // const [isStep1Submitting, setIsStep1Submitting] = useState(false); // Removed local loading for Step 1
  // const [isStep2Submitting, setIsStep2Submitting] = useState(false); // Removed local loading for Step 2
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [showSuccessModal, setShowSuccessModal] = useState(false); // State to control the success modal

  // Form data state
  const [userFormData, setUserFormData] = useState<UserProfileFormData>({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
  });

  const [merchantFormData, setMerchantFormData] = useState<MerchantProfileFormData>({
    shopName: "",
    shopDescription: "",
    address: "",
    phone: "",
    website: "",
    logoUrl: null, // Initialize logoUrl as null for file input, consistent with schema
    businessType: "OTHER", // Default value
    orangeMoneyNumber: "",
    waveMoneyNumber: "",
  });

  // Real-time validation
  const validateUserForm = () => {
    try {
      userProfileSchema.parse(userFormData);
      setFormErrors(prev => ({ ...prev, user: "" }));
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const firstError = err.errors[0];
        setFormErrors(prev => ({ ...prev, user: firstError.message }));
      }
      return false;
    }
  };

  const validateMerchantForm = () => {
    try {
      merchantProfileSchema.parse(merchantFormData);
      setFormErrors(prev => ({ ...prev, merchant: "" }));
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const firstError = err.errors[0];
        setFormErrors(prev => ({ ...prev, merchant: firstError.message }));
      }
      return false;
    }
  };

  const isStepValid = (step: number) => {
    if (step === 1) {
      return userFormData.firstName && userFormData.lastName && userFormData.email;
    }
    if (step === 2) {
      const isValid = merchantFormData.shopName && merchantFormData.shopDescription.length >= 10 && 
             merchantFormData.address && merchantFormData.phone &&
             merchantFormData.website !== undefined &&
             (merchantFormData.logoUrl === null || merchantFormData.logoUrl instanceof File || (typeof merchantFormData.logoUrl === 'string' && (merchantFormData.logoUrl === '' || merchantProfileSchema.shape.logoUrl.safeParse(merchantFormData.logoUrl).success))) && // Simplified logoUrl validation
             merchantFormData.businessType !== undefined &&
             merchantProfileSchema.shape.orangeMoneyNumber.safeParse(merchantFormData.orangeMoneyNumber).success &&
             merchantProfileSchema.shape.waveMoneyNumber.safeParse(merchantFormData.waveMoneyNumber).success;
      console.log("isStepValid final result:", isValid);
      return isValid;
    }
    return false;
  };

  const handleNext = async (e: React.FormEvent) => {
  
      e.preventDefault();
      e.stopPropagation();
    
    
    if (currentStep === 1) {
      if (validateUserForm()) {
        setIsSubmitting(true); // Utilise le isSubmitting du store global
        try {
          const response = await fetch(`${API_BASE_URL}/auth/profile`, {
            method: "PUT", // Supposons un endpoint PUT pour la mise à jour du profil utilisateur
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`, // Utilisez le token d'accès
            },
            body: JSON.stringify(userFormData),
          });

          if (response.ok) {
            // const updatedUser = await response.json(); // L'API peut retourner l'utilisateur mis à jour
            // setUser(updatedUser);
            setCompletedSteps(prev => [...prev, 1]);
            toast({
              title: "✅ Profil mis à jour",
              description: "Vos informations personnelles ont été sauvegardées.",
            });
            setCurrentStep(2);
          } else {
            const errorData = await response.json();
            toast({
              title: "❌ Erreur",
              description: errorData.message || error || "Échec de la mise à jour du profil.",
              variant: "destructive",
            });
          }
        } catch (error: any) {
          toast({
            title: "❌ Erreur inattendue",
            description: error.message || "Une erreur est survenue.",
            variant: "destructive",
          });
        } finally {
          setIsSubmitting(false); // Always stop global loading
        }
      }
    } else if (currentStep === 2) {
      console.log("merchantFormData", merchantFormData);
      if (validateMerchantForm()) {
        setIsSubmitting(true); // Utilisez le isSubmitting du store global

        try {
          const merchantProfileData: CreateMerchantProfileDto = {
            businessName: merchantFormData.shopName,
            description: merchantFormData.shopDescription,
            businessAddress: merchantFormData.address,
            businessPhone: merchantFormData.phone,
            businessEmail: user?.email || "", // L'email de l'utilisateur connecté est utilisé
            businessType: merchantFormData.businessType,
            website: merchantFormData.website || undefined,
            logoUrl: (typeof merchantFormData.logoUrl === 'string' && merchantFormData.logoUrl !== '') ? merchantFormData.logoUrl : undefined,
            // Les numéros Mobile Money sont gérés directement comme des champs optionnels si l'API le supporte, sinon ils devraient être imbriqués dans un objet MobileMoneyDetails si le DTO l'exige.
            // Pour l'instant, je les mappe directement comme des champs optionnels.
            siretNumber: undefined, // À ajouter si l'API le supporte
            vatNumber: undefined, // À ajouter si l'API le supporte
            bankAccountNumber: undefined, // À ajouter si l'API le supporte
            bankName: undefined, // À ajouter si l'API le supporte
          };

          const response = await fetch(`${API_BASE_URL}/auth/merchant/profile`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(merchantProfileData),
          });
          
          if (response.ok) {
            setCompletedSteps(prev => [...prev, 2]);
            setShowSuccessModal(true); // Open the success modal
      
            toast({
              title: "🎉 Demande envoyée !",
              description: "Votre profil de boutique est en attente de vérification.",
            });
          } else {
            const errorData = await response.json();
            toast({
              title: "❌ Erreur",
              description: errorData.message || error || "Échec de la création du profil vendeur.",
              variant: "destructive",
            });
          }
        } catch (error: any) {
          console.log("error", error);
          toast({
            title: "❌ Erreur inattendue",
            description: error.message || "Une erreur est survenue.",
            variant: "destructive",
          });
        } finally {
          setIsSubmitting(false); // Always stop global loading
        }
      }
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const ProgressIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center space-x-4">
        {/* Step 1 */}
        <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
          completedSteps.includes(1) 
            ? 'bg-green-500 border-green-500 text-white' 
            : currentStep === 1 
              ? 'bg-blue-500 border-blue-500 text-white' 
              : 'border-gray-300 text-gray-400'
        }`}>
          {completedSteps.includes(1) ? <CheckCircle className="w-6 h-6" /> : <User className="w-5 h-5" />}
        </div>
        <span className={`ml-2 text-sm font-medium ${
          currentStep === 1 ? 'text-blue-600' : completedSteps.includes(1) ? 'text-green-600' : 'text-gray-400'
        }`}>
          Profil
        </span>
      </div>

      {/* Connector */}
      <div className={`w-12 h-1 rounded transition-all duration-300 ${
        completedSteps.includes(1) ? 'bg-green-500' : 'bg-gray-200'
      }`} />

      {/* Step 2 */}
      <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
        completedSteps.includes(2) 
          ? 'bg-green-500 border-green-500 text-white' 
          : currentStep === 2 
            ? 'bg-blue-500 border-blue-500 text-white' 
            : 'border-gray-300 text-gray-400'
      }`}>
        {completedSteps.includes(2) ? <CheckCircle className="w-6 h-6" /> : <Store className="w-5 h-5" />}
      </div>
      <span className={`ml-2 text-sm font-medium ${
        currentStep === 2 ? 'text-blue-600' : completedSteps.includes(2) ? 'text-green-600' : 'text-gray-400'
      }`}>
        Boutique
      </span>
    </div>
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Accès refusé</h2>
            <p className="text-gray-600 mb-4">Veuillez vous connecter pour devenir marchand.</p>
            <Button onClick={() => navigate("/auth?method=login")} className="w-full">
              Se connecter
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          <ProgressIndicator />
          
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl font-bold text-gray-800">
                Devenir Marchand
              </CardTitle>
              <CardDescription className="text-gray-600">
                {currentStep === 1
                  ? "Commençons par vos informations personnelles" 
                  : "Parlez-nous de votre boutique"}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="pt-4">
              {/* Step 1: User Profile */}
              {currentStep === 1 && (
                <form onSubmit={handleNext} className="space-y-6 animate-in slide-in-from-right duration-300">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-sm font-medium">Prénom</Label>
                      <Input 
                        id="firstName" 
                        value={userFormData.firstName}
                        onChange={(e) => {
                          setUserFormData(prev => ({ ...prev, firstName: e.target.value }));
                          setFormErrors(prev => ({ ...prev, user: "" }));
                        }}
                        className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                        placeholder="Votre prénom"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-sm font-medium">Nom</Label>
                      <Input 
                        id="lastName" 
                        value={userFormData.lastName}
                        onChange={(e) => {
                          setUserFormData(prev => ({ ...prev, lastName: e.target.value }));
                          setFormErrors(prev => ({ ...prev, user: "" }));
                        }}
                        className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                        placeholder="Votre nom"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        value={userFormData.email}
                        onChange={(e) => {
                          setUserFormData(prev => ({ ...prev, email: e.target.value }));
                          setFormErrors(prev => ({ ...prev, user: "" }));
                        }}
                        className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                        placeholder="votre@email.com"
                      />
                    </div>
                  </div>

                  {formErrors.user && (
                    <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                      <p className="text-red-600 text-sm">{formErrors.user}</p>
                    </div>
                  )}

                  <Button 
                    type="submit" // Button type is now submit for the form
                    className="w-full py-6 text-lg font-medium bg-blue-600 hover:bg-blue-700 transition-all duration-200 disabled:opacity-50"
                    disabled={!isStepValid(1) || isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Sauvegarde...
                      </>
                    ) : (
                      <>
                        Continuer
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </>
                    )}
                  </Button>
                </form>
              )}

              {/* Step 2: Vendor Information */}
              {currentStep === 2 && (
                <form onSubmit={handleNext} className="space-y-6 animate-in slide-in-from-right duration-300">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="shopName" className="text-sm font-medium">Nom de la boutique</Label>
                      <Input 
                        id="shopName" 
                        value={merchantFormData.shopName}
                        onChange={(e) => {
                          setMerchantFormData(prev => ({ ...prev, shopName: e.target.value }));
                          setFormErrors(prev => ({ ...prev, merchant: "" }));
                        }}
                        className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                        placeholder="Ma Super Boutique"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="shopDescription" className="text-sm font-medium">
                        Description de la boutique
                        <span className="text-xs text-gray-500 ml-2">
                          ({merchantFormData.shopDescription.length}/10 min)
                        </span>
                      </Label>
                      <Textarea 
                        id="shopDescription" 
                        value={merchantFormData.shopDescription}
                        onChange={(e) => {
                          setMerchantFormData(prev => ({ ...prev, shopDescription: e.target.value }));
                          setFormErrors(prev => ({ ...prev, merchant: "" }));
                        }}
                        className="transition-all duration-200 focus:ring-2 focus:ring-blue-500 resize-none"
                        placeholder="Décrivez votre boutique, vos produits, votre spécialité..."
                        rows={4}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="address" className="text-sm font-medium">Adresse de la boutique</Label>
                      <Input 
                        id="address" 
                        value={merchantFormData.address}
                        onChange={(e) => {
                          setMerchantFormData(prev => ({ ...prev, address: e.target.value }));
                          setFormErrors(prev => ({ ...prev, merchant: "" }));
                        }}
                        className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                        placeholder="123 Rue des Commerçants, Dakar"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-sm font-medium">Numéro de téléphone</Label>
                      <Input 
                        id="phone" 
                        value={merchantFormData.phone}
                        onChange={(e) => {
                          setMerchantFormData(prev => ({ ...prev, phone: e.target.value }));
                          setFormErrors(prev => ({ ...prev, merchant: "" }));
                        }}
                        className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                        placeholder="+221771234567"
                      />
                    </div>

                    {/* New fields: Website and Logo URL */}
                    <div className="space-y-2">
                      <Label htmlFor="website" className="text-sm font-medium">Site Web (Optionnel)</Label>
                      <Input 
                        id="website" 
                        value={merchantFormData.website}
                        onChange={(e) => {
                          setMerchantFormData(prev => ({ ...prev, website: e.target.value }));
                          setFormErrors(prev => ({ ...prev, merchant: "" }));
                        }}
                        className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                        placeholder="https://www.masuperboutique.com"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="logoUrl" className="text-sm font-medium">Logo de la boutique (Optionnel)</Label>
                      <ImageUpload
                        value={merchantFormData.logoUrl} // Pass File or string URL
                        onChange={(file: File | string | null) => { // Explicitly type 'file'
                          setMerchantFormData(prev => ({ ...prev, logoUrl: file }));
                          setFormErrors(prev => ({ ...prev, merchant: "" }));
                        }}
                        disabled={isSubmitting} // Use isSubmitting from store
                      />
                    </div>

                    {/* New fields: Business Type and Mobile Money Details */}
                    <div className="space-y-2">
                      <Label htmlFor="businessType" className="text-sm font-medium">Type de Boutique</Label>
                      <Select
                        value={merchantFormData.businessType}
                        onValueChange={(value) => setMerchantFormData(prev => ({ ...prev, businessType: value as typeof prev.businessType }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez un type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="RESTAURANT">Restaurant</SelectItem>
                          <SelectItem value="GROCERY">Épicerie</SelectItem>
                          <SelectItem value="PHARMACY">Pharmacie</SelectItem>
                          <SelectItem value="ELECTRONICS">Électronique</SelectItem>
                          <SelectItem value="CLOTHING">Habillement</SelectItem>
                          <SelectItem value="OTHER">Autre</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="orangeMoneyNumber" className="text-sm font-medium">Numéro Orange Money (Optionnel)</Label>
                      <Input 
                        id="orangeMoneyNumber" 
                        value={merchantFormData.orangeMoneyNumber}
                        onChange={(e) => {
                          setMerchantFormData(prev => ({ ...prev, orangeMoneyNumber: e.target.value }));
                          setFormErrors(prev => ({ ...prev, merchant: "" }));
                        }}
                        className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                        placeholder="+221771234567"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="waveMoneyNumber" className="text-sm font-medium">Numéro Wave Money (Optionnel)</Label>
                      <Input 
                        id="waveMoneyNumber" 
                        value={merchantFormData.waveMoneyNumber}
                        onChange={(e) => {
                          setMerchantFormData(prev => ({ ...prev, waveMoneyNumber: e.target.value }));
                          setFormErrors(prev => ({ ...prev, merchant: "" }));
                        }}
                        className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                        placeholder="+221781234567"
                      />
                    </div>

                  </div>

                  {formErrors.merchant && (
                    <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                      <p className="text-red-600 text-sm">{formErrors.merchant}</p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleBack} 
                      className="flex-1 py-6 text-lg font-medium border-2 hover:bg-gray-50 transition-all duration-200"
                    >
                      <ArrowLeft className="w-5 h-5 mr-2" />
                      Précédent
                    </Button>
                    <Button 
                      type="submit" // Button type is now submit for the form
                      className="flex-1 py-6 text-lg font-medium bg-green-600 hover:bg-green-700 transition-all duration-200 disabled:opacity-50"
                      disabled={!isStepValid(2) || isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Création...
                        </>
                      ) : (
                        <>
                          Devenir Marchand
                          <CheckCircle className="w-5 h-5 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card> 
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Besoin d'aide ? <button className="text-blue-600 hover:underline font-medium">Contactez-nous</button>
            </p>
          </div>
        </div>
      </div>
      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader className="flex flex-col items-center text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
            <DialogTitle className="text-2xl font-bold text-gray-800">Profil Marchand Enregistré !</DialogTitle>
            <DialogDescription className="text-gray-600 mt-2">
              Votre profil de boutique a été enregistré avec succès. Il est maintenant en attente de notre vérification.
              Vous recevrez une confirmation par email une fois votre compte marchand activé.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button onClick={() => {
              setShowSuccessModal(false);
              navigate("/dashboard/merchant");
            }} className="w-full bg-blue-600 hover:bg-blue-700">
              Aller au tableau de bord
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MerchantOnboardingPage;