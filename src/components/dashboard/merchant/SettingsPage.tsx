import React, { useState, useEffect } from "react";
import { Save, User, Store, Bell, Shield, CreditCard, Edit, X } from "lucide-react";
import { useAuthStore } from "@/stores";
import { useMerchantProfile } from "@/hooks/queries/useMerchantQueries";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const SettingsPage: React.FC = () => {
  const { user, setUser } = useAuthStore();
  const { data: merchantProfile, isLoading: merchantLoading, error: merchantError } = useMerchantProfile();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingShop, setIsEditingShop] = useState(false);
  
  // Initialiser avec des valeurs par défaut
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
  });

  const [shopData, setShopData] = useState({
    businessName: "",
    description: "",
    businessType: "",
    businessAddress: "",
    businessPhone: "",
    businessEmail: "",
    website: "",
    orangeMoneyNumber: "",
    waveMoneyNumber: "",
  });

  const [notifications, setNotifications] = useState({
    emailOrders: true,
    emailPromotions: false,
    smsOrders: true,
    pushNotifications: true,
  });

  // Effet pour les données utilisateur
  useEffect(() => {
    if (user) {
      console.log("Updating profile data with user:", user); // Debug
      setProfileData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
      });

      setNotifications({
        emailOrders: user.emailNotifications?.orders ?? true,
        emailPromotions: user.emailNotifications?.promotions ?? false,
        smsOrders: user.smsNotifications?.orders ?? true,
        pushNotifications: user.pushNotifications ?? true,
      });
    }
  }, [user]);

  // Effet pour les données du profil marchand
  useEffect(() => {
    if (merchantProfile) {
      console.log("Updating shop data with merchantProfile:", merchantProfile); // Debug
      setShopData({
        businessName: merchantProfile?.businessName || "",
        description: merchantProfile?.description || "",
        businessType: merchantProfile?.businessType || "",
        businessAddress: merchantProfile?.businessAddress || "",
        businessPhone: merchantProfile?.businessPhone || "",
        businessEmail: merchantProfile?.businessEmail || "",
        website: merchantProfile?.website || "",
        orangeMoneyNumber: merchantProfile?.orangeMoneyNumber || "",
        waveMoneyNumber: merchantProfile?.waveMoneyNumber || "",
      });
    }
  }, [merchantProfile]);

  const handleProfileSave = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (user) {
        setUser({ 
          ...user, 
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          email: profileData.email,
          phone: profileData.phone,
          address: profileData.address,
        });
      }
      
      setIsEditingProfile(false);
      toast({
        title: "Profil mis à jour",
        description: "Vos informations personnelles ont été sauvegardées.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les modifications.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleShopSave = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // TODO: Implementer la mise à jour du profil marchand
      
      setIsEditingShop(false);
      toast({
        title: "Boutique mise à jour",
        description: "Les informations de votre boutique ont été sauvegardées.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les modifications.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationsSave = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (user) {
        setUser({
          ...user,
          emailNotifications: {
            orders: notifications.emailOrders,
            promotions: notifications.emailPromotions,
          },
          smsNotifications: {
            orders: notifications.smsOrders,
          },
          pushNotifications: notifications.pushNotifications,
        });
      }
      
      toast({
        title: "Préférences sauvegardées",
        description: "Vos préférences de notification ont été mises à jour.",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les préférences.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const cancelProfileEdit = () => {
    if (user) {
      setProfileData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
      });
    }
    setIsEditingProfile(false);
  };

  const cancelShopEdit = () => {
    if (merchantProfile) {
      setShopData({
        businessName: merchantProfile?.businessName || "",
        description: merchantProfile?.description || "",
        businessType: merchantProfile?.businessType || "",
        businessAddress: merchantProfile?.businessAddress || "",
        businessPhone: merchantProfile?.businessPhone || "",
        businessEmail: merchantProfile?.businessEmail || "",
        website: merchantProfile?.website || "",
        orangeMoneyNumber: merchantProfile?.orangeMoneyNumber || "",
        waveMoneyNumber: merchantProfile?.waveMoneyNumber || "",
      });
    }
    setIsEditingShop(false);
  };

  // Fonction pour afficher les informations de debug
  const renderDebugInfo = () => {
    if (process.env.NODE_ENV === 'development') {
      return (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <h4 className="font-medium mb-2">Debug Info:</h4>
          <p>Merchant Loading: {merchantLoading ? 'true' : 'false'}</p>
          <p>Merchant Error: {merchantError ? 'true' : 'false'}</p>
          <p>Merchant Profile: {merchantProfile ? 'exists' : 'null'}</p>
          <p>Shop Data: {JSON.stringify(shopData, null, 2)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Paramètres</h1>
      </div>

      {/* {renderDebugInfo()} */}

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Profil</TabsTrigger>
          <TabsTrigger value="shop">Boutique</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Sécurité</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informations personnelles
                </CardTitle>
              </div>
              <div className="flex gap-2">
                {!isEditingProfile ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditingProfile(true)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Modifier
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={cancelProfileEdit}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Annuler
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleProfileSave}
                      disabled={isLoading}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Sauvegarder
                    </Button>
                  </>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Informations du compte (lecture seule) */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">ID Utilisateur</Label>
                  <p className="text-sm font-mono">{user?.id}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Membre depuis</Label>
                  <p className="text-sm">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR') : 'N/A'}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Rôles</Label>
                  <div className="flex gap-1 mt-1">
                    {user?.roles?.map((role, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {role.name}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Statut</Label>
                  <Badge variant={user?.isActive ? "default" : "destructive"} className="text-xs">
                    {user?.isActive ? "Actif" : "Inactif"}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Prénom</Label>
                  <Input
                    id="firstName"
                    value={profileData.firstName}
                    onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                    disabled={!isEditingProfile}
                    className={!isEditingProfile ? "bg-muted" : ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Nom</Label>
                  <Input
                    id="lastName"
                    value={profileData.lastName}
                    onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                    disabled={!isEditingProfile}
                    className={!isEditingProfile ? "bg-muted" : ""}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  disabled={!isEditingProfile}
                  className={!isEditingProfile ? "bg-muted" : ""}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  disabled={!isEditingProfile}
                  className={!isEditingProfile ? "bg-muted" : ""}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Adresse</Label>
                <Textarea
                  id="address"
                  value={profileData.address}
                  onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                  disabled={!isEditingProfile}
                  className={!isEditingProfile ? "bg-muted" : ""}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shop">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Store className="h-5 w-5" />
                  Informations de la boutique
                </CardTitle>
                {merchantLoading && (
                  <p className="text-sm text-muted-foreground">Chargement en cours...</p>
                )}
                {merchantError && (
                  <p className="text-sm text-red-500">
                    Erreur: {merchantError instanceof Error ? merchantError.message : "Erreur inconnue"}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                {!isEditingShop ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditingShop(true)}
                    disabled={merchantLoading}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Modifier
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={cancelShopEdit}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Annuler
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleShopSave}
                      disabled={isLoading}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Sauvegarder
                    </Button>
                  </>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="businessName">Nom de la boutique</Label>
                <Input
                  id="businessName"
                  value={shopData.businessName}
                  onChange={(e) => setShopData({ ...shopData, businessName: e.target.value })}
                  disabled={!isEditingShop || merchantLoading}
                  className={(!isEditingShop || merchantLoading) ? "bg-muted" : ""}
                  placeholder={merchantLoading ? "Chargement..." : "Nom de la boutique"}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={shopData.description}
                  onChange={(e) => setShopData({ ...shopData, description: e.target.value })}
                  disabled={!isEditingShop || merchantLoading}
                  className={(!isEditingShop || merchantLoading) ? "bg-muted" : ""}
                  placeholder={merchantLoading ? "Chargement..." : "Description de la boutique"}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="businessType">Type d'entreprise</Label>
                  <Input
                    id="businessType"
                    value={shopData.businessType}
                    onChange={(e) => setShopData({ ...shopData, businessType: e.target.value })}
                    disabled={!isEditingShop || merchantLoading}
                    className={(!isEditingShop || merchantLoading) ? "bg-muted" : ""}
                    placeholder={merchantLoading ? "Chargement..." : "Type d'entreprise"}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="businessAddress">Adresse commerciale</Label>
                  <Input
                    id="businessAddress"
                    value={shopData.businessAddress}
                    onChange={(e) => setShopData({ ...shopData, businessAddress: e.target.value })}
                    disabled={!isEditingShop || merchantLoading}
                    className={(!isEditingShop || merchantLoading) ? "bg-muted" : ""}
                    placeholder={merchantLoading ? "Chargement..." : "Adresse commerciale"}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="businessPhone">Téléphone commercial</Label>
                  <Input
                    id="businessPhone"
                    value={shopData.businessPhone}
                    onChange={(e) => setShopData({ ...shopData, businessPhone: e.target.value })}
                    disabled={!isEditingShop || merchantLoading}
                    className={(!isEditingShop || merchantLoading) ? "bg-muted" : ""}
                    placeholder={merchantLoading ? "Chargement..." : "Téléphone commercial"}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="businessEmail">Email commercial</Label>
                  <Input
                    id="businessEmail"
                    type="email"
                    value={shopData.businessEmail}
                    onChange={(e) => setShopData({ ...shopData, businessEmail: e.target.value })}
                    disabled={!isEditingShop || merchantLoading}
                    className={(!isEditingShop || merchantLoading) ? "bg-muted" : ""}
                    placeholder={merchantLoading ? "Chargement..." : "Email commercial"}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Site web</Label>
                <Input
                  id="website"
                  value={shopData.website}
                  onChange={(e) => setShopData({ ...shopData, website: e.target.value })}
                  disabled={!isEditingShop || merchantLoading}
                  className={(!isEditingShop || merchantLoading) ? "bg-muted" : ""}
                  placeholder={merchantLoading ? "Chargement..." : "URL du site web"}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="orangeMoneyNumber">Numéro Orange Money</Label>
                  <Input
                    id="orangeMoneyNumber"
                    value={shopData.orangeMoneyNumber}
                    onChange={(e) => setShopData({ ...shopData, orangeMoneyNumber: e.target.value })}
                    disabled={!isEditingShop || merchantLoading}
                    className={(!isEditingShop || merchantLoading) ? "bg-muted" : ""}
                    placeholder={merchantLoading ? "Chargement..." : "Numéro Orange Money"}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="waveMoneyNumber">Numéro Wave Money</Label>
                  <Input
                    id="waveMoneyNumber"
                    value={shopData.waveMoneyNumber}
                    onChange={(e) => setShopData({ ...shopData, waveMoneyNumber: e.target.value })}
                    disabled={!isEditingShop || merchantLoading}
                    className={(!isEditingShop || merchantLoading) ? "bg-muted" : ""}
                    placeholder={merchantLoading ? "Chargement..." : "Numéro Wave Money"}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Préférences de notification
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Notifications par email</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="emailOrders">Nouvelles commandes</Label>
                    <Switch
                      id="emailOrders"
                      checked={notifications.emailOrders}
                      onCheckedChange={(checked) => 
                        setNotifications({ ...notifications, emailOrders: checked })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="emailPromotions">Promotions et offres</Label>
                    <Switch
                      id="emailPromotions"
                      checked={notifications.emailPromotions}
                      onCheckedChange={(checked) => 
                        setNotifications({ ...notifications, emailPromotions: checked })
                      }
                    />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Notifications SMS</h4>
                <div className="flex items-center justify-between">
                  <Label htmlFor="smsOrders">Nouvelles commandes</Label>
                  <Switch
                    id="smsOrders"
                    checked={notifications.smsOrders}
                    onCheckedChange={(checked) => 
                      setNotifications({ ...notifications, smsOrders: checked })
                    }
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Notifications push</h4>
                <div className="flex items-center justify-between">
                  <Label htmlFor="pushNotifications">Notifications push</Label>
                  <Switch
                    id="pushNotifications"
                    checked={notifications.pushNotifications}
                    onCheckedChange={(checked) => 
                      setNotifications({ ...notifications, pushNotifications: checked })
                    }
                  />
                </div>
              </div>

              <div className="pt-4">
                <Button onClick={handleNotificationsSave} disabled={isLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  Sauvegarder les préférences
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Sécurité
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Les paramètres de sécurité seront disponibles prochainement.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;