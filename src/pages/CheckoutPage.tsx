import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  CreditCard,
  Smartphone,
  Wallet,
  Truck,
  MapPin,
  Loader2,
} from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { formatPrice } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import FallbackImage from "@/components/shared/FallbackImage";
import { useAuthStore } from "@/stores";
import { toast } from "sonner";
import { useOrderStore } from "@/stores/orderStore"; // Import de useOrderStore

type PaymentMethod =
  | "Orange Money"
  | "Wave"
  | "Free Money"
  | "cash_on_delivery";

interface LocationData {
  street?: string;
  city?: string;
  postcode?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
}

interface ShippingFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: LocationData; // Remplacement des champs d'adresse par un objet LocationData
}

export default function CheckoutPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const { items, getTotalPrice } = useCartStore();
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("cash_on_delivery");
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [useCurrentLocation, setUseCurrentLocation] = useState(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false); // Nouvel état pour le soumission de la commande
  const [formData, setFormData] = useState<ShippingFormData>({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: "",
    location: {
      // Initialisation de l'objet location
      street: "",
      city: "",
      postcode: "",
      country: "",
      latitude: undefined,
      longitude: undefined,
    },
  });

  const { createOrder } = useOrderStore(); // Récupérer l'action createOrder du store

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        firstName: user.firstName || prev.firstName,
        lastName: user.lastName || prev.lastName,
        email: user.email || prev.email,
        // Ne pas réinitialiser la location si elle a déjà été définie
        location: prev.location.street
          ? prev.location
          : {
              street: "",
              city: "",
              postcode: "",
              country: "",
              latitude: undefined,
              longitude: undefined,
            },
      }));
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Si l'utilisateur commence à taper dans les champs autres que ceux de la localisation,
    // ou si on force la saisie manuelle, désactiver la localisation automatique.
    if (useCurrentLocation && !(e.target.name in formData.location)) {
      setUseCurrentLocation(false);
    }
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleLocationInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setUseCurrentLocation(false);
    setFormData((prev) => ({
      ...prev,
      location: {
        ...prev.location,
        [e.target.name]: e.target.value,
      },
    }));
  };

  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      toast.error(
        "La géolocalisation n'est pas supportée par votre navigateur."
      );
      return;
    }

    setIsGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
          );

          if (response.ok) {
            const data = await response.json();
            const addr = data.address;

            setFormData((prev) => ({
              ...prev,
              location: {
                street:
                  [
                    addr.city_district,
                    addr.house_number,
                    addr.road,
                    addr.residential,
                  ]
                    .filter(Boolean)
                    .join(" ") || "",
                city: addr.city || addr.town || addr.village || "Dakar",
                postcode: addr.postcode || "",
                country: addr.country || "Sénégal",
                latitude: latitude,
                longitude: longitude,
              },
            }));

            setUseCurrentLocation(true);
            toast.success("Adresse obtenue via GPS.");
          } else {
            // Fallback: utiliser les coordonnées GPS et un message générique
            setFormData((prev) => ({
              ...prev,
              location: {
                street: "Adresse non trouvée",
                city: "Ville inconnue",
                postcode: "",
                country: "",
                latitude: latitude,
                longitude: longitude,
              },
            }));
            setUseCurrentLocation(true);
            toast.warning(
              "Impossible de déterminer l'adresse précise, coordonnées GPS enregistrées."
            );
          }
        } catch (error) {
          console.error("Erreur lors de la récupération de l'adresse:", error);
          setFormData((prev) => ({
            ...prev,
            location: {
              street: "Erreur de récupération de l'adresse",
              city: "",
              postcode: "",
              country: "",
              latitude: latitude,
              longitude: longitude,
            },
          }));
          setUseCurrentLocation(true);
          toast.error("Erreur lors de la récupération de l'adresse.");
        }

        setIsGettingLocation(false);
      },
      (error) => {
        console.error("Erreur de géolocalisation:", error);
        let errorMessage = "Impossible d'obtenir votre position";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Permission de géolocalisation refusée";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Position non disponible";
            break;
          case error.TIMEOUT:
            errorMessage = "Délai d'attente dépassé";
            break;
        }

        toast.error(errorMessage);
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const resetToManualEntry = () => {
    setUseCurrentLocation(false);
    setFormData((prev) => ({
      ...prev,
      location: {
        ...prev.location,
        latitude: undefined,
        longitude: undefined,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) {
      toast.error("Vous devez être connecté pour passer une commande.");
      return;
    }

    setIsSubmittingOrder(true); // Activer l'état de chargement

    const produitIds = items.map((item) => item.product.id);
    const orderItems = items.map((item) => ({
      produitId: item.product.id, // Correction de productId en produitId
      quantity: item.quantity,
      price: item.product.price,
    }));

    // Mapper paymentMethod pour target_payment
    let targetPaymentName = "Paiement à la livraison";
    if (paymentMethod === "Orange Money") targetPaymentName = "Orange Money";
    if (paymentMethod === "Wave") targetPaymentName = "Wave";
    if (paymentMethod === "Free Money") targetPaymentName = "Free Money";

    const orderPayload = {
      clientId: user.id,
      produitIds: produitIds,
      total: getTotalPrice(),
      user: {
        phone_number: formData.phone,
        first_name: formData.firstName,
        last_name: formData.lastName,
      },
      currency: "XOF",
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      location: formData.location,
      paymentMethod: paymentMethod,
      items: orderItems,
    };

    try {
      console.log(orderPayload);
      const result = (await createOrder(orderPayload as any)).data; // Utilisation de l'action du store

      toast.success("Commande passée avec succès!");
      if (result && result.data.paymentUrl) {
        // Suppression de l'assertion 'as any'
        window.location.href = result.data.paymentUrl; // Redirection vers l'URL de paiement externe
      } else {
        navigate("/payment/status/success"); // Redirection vers la page de succès interne
      }
    } catch (error: any) {
      console.error("Erreur lors de la passation de la commande:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Une erreur inattendue est survenue. Veuillez réessayer.";
      toast.error(errorMessage);
    } finally {
      setIsSubmittingOrder(false); // Désactiver l'état de chargement
    }
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Votre panier est vide</h1>
        <Button onClick={() => navigate("/")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour à la boutique
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Retour
      </Button>

      <h1 className="text-2xl font-bold mb-8">Finaliser la commande</h1>

      {user && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-center space-x-2">
            <Check className="w-5 h-5 text-green-600" />
            <span className="text-green-800 dark:text-green-200">
              Connecté en tant que{" "}
              <strong>
                {user.firstName} {user.lastName}
              </strong>
            </span>
          </div>
          <p className="text-sm text-green-700 dark:text-green-300 mt-1">
            Vos informations ont été pré-remplies automatiquement
          </p>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Adresse de livraison</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Prénom *</Label>
                  <Input
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Nom *</Label>
                  <Input
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Email *</Label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Téléphone *</Label>
                <Input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Adresse *</Label>
                  <div className="flex items-center justify-between">
                    {useCurrentLocation ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={resetToManualEntry}
                      >
                        Saisie manuelle
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={getCurrentLocation}
                        disabled={isGettingLocation}
                      >
                        {isGettingLocation ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <MapPin className="h-4 w-4 mr-2" />
                        )}
                        {isGettingLocation
                          ? "Localisation en cours..."
                          : "Utiliser ma position actuelle"}
                      </Button>
                    )}
                  </div>
                </div>
                <Input
                  name="street"
                  value={
                    useCurrentLocation
                      ? [
                          formData.location.street,
                          formData.location.city,
                          formData.location.postcode,
                        ]
                          .filter(Boolean)
                          .join(", ")
                      : formData.location.street || ""
                  }
                  onChange={handleLocationInputChange}
                  required
                  placeholder={
                    useCurrentLocation
                      ? "Adresse complète obtenue automatiquement"
                      : "Entrez votre rue, numéro, ville, code postal"
                  }
                  readOnly={useCurrentLocation}
                  className={
                    useCurrentLocation ? "bg-blue-50 dark:bg-blue-950/20" : ""
                  }
                />
                {useCurrentLocation && formData.location.street && (
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    📍 Adresse obtenue : {formData.location.street},{" "}
                    {formData.location.city}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Ville *</Label>
                  <Input
                    name="city"
                    value={formData.location.city || ""}
                    onChange={handleLocationInputChange}
                    required
                    placeholder={
                      useCurrentLocation
                        ? "Ville obtenue automatiquement"
                        : "Entrez votre ville"
                    }
                    readOnly={useCurrentLocation}
                    className={
                      useCurrentLocation ? "bg-blue-50 dark:bg-blue-950/20" : ""
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Code postal</Label>
                  <Input
                    name="postcode"
                    value={formData.location.postcode || ""}
                    onChange={handleLocationInputChange}
                    placeholder={
                      useCurrentLocation
                        ? "Code postal obtenu automatiquement"
                        : "Entrez votre code postal"
                    }
                    readOnly={useCurrentLocation}
                    className={
                      useCurrentLocation ? "bg-blue-50 dark:bg-blue-950/20" : ""
                    }
                  />
                </div>
              </div>

              {/* Champs cachés pour envoyer les coordonnées exactes */}
              <Input
                type="hidden"
                name="latitude"
                value={formData.location.latitude || ""}
              />
              <Input
                type="hidden"
                name="longitude"
                value={formData.location.longitude || ""}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Méthode de paiement</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={paymentMethod}
                onValueChange={(v: PaymentMethod) => setPaymentMethod(v)}
              >
                <div className="space-y-4">
                  {[
                    {
                      id: "Orange Money",
                      label: "Orange Money",
                      icon: <Smartphone className="h-5 w-5" />,
                      color: "bg-orange-500",
                    },
                    {
                      id: "Wave",
                      label: "Wave",
                      icon: <Wallet className="h-5 w-5" />,
                      color: "bg-primary",
                    },
                    {
                      id: "Free Money",
                      label: "Free Money",
                      icon: <CreditCard className="h-5 w-5" />,
                      color: "bg-emerald-500",
                    },
                    {
                      id: "cash_on_delivery",
                      label: "Paiement à la livraison",
                      icon: <Truck className="h-5 w-5" />,
                      color: "bg-gray-500",
                    },
                  ].map((method) => (
                    <div
                      key={method.id}
                      className="flex items-center space-x-3 p-4 border rounded-md hover:bg-accent/50"
                    >
                      <RadioGroupItem value={method.id} id={method.id} />
                      <Label
                        htmlFor={method.id}
                        className="flex items-center space-x-2 cursor-pointer w-full"
                      >
                        <div
                          className={`${method.color} p-2 rounded-md text-white`}
                        >
                          {method.icon}
                        </div>
                        <span>{method.label}</span>
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Résumé</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-md overflow-hidden">
                        {item.product.images?.[0]?.url && (
                          <FallbackImage
                            src={item.product.images[0].url}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{item.product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Qté: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <p className="font-medium">
                      {formatPrice(item.product.price * item.quantity)}
                    </p>
                  </div>
                ))}

                <Separator className="my-4" />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Sous-total</span>
                    <span>{formatPrice(getTotalPrice())}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Livraison</span>
                    <span className="text-green-600">Gratuite</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>{formatPrice(getTotalPrice())}</span>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full mt-6"
                  size="lg"
                  disabled={isSubmittingOrder}
                >
                  {" "}
                  {/* Désactiver le bouton pendant la soumission */}
                  {isSubmittingOrder ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    "Payer maintenant"
                  )}
                </Button>

                <p className="text-xs text-muted-foreground text-center mt-4">
                  En passant commande, vous acceptez nos conditions générales de
                  vente
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
