import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { 
  Settings, 
  Shield, 
  Mail, 
  Globe,
  Database,
  Save
} from "lucide-react";

const SystemSettings = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Paramètres système</h1>
        <p className="text-muted-foreground">
          Configurez les paramètres généraux de la plateforme
        </p>
      </div>

      <div className="grid gap-6">
        {/* Paramètres généraux */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Paramètres généraux
            </CardTitle>
            <CardDescription>
              Configuration de base de la plateforme
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="siteName">Nom du site</Label>
                <Input id="siteName" defaultValue="MarketPlace Sénégal" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="siteUrl">URL du site</Label>
                <Input id="siteUrl" defaultValue="https://marketplace.sn" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="siteDescription">Description du site</Label>
              <Textarea 
                id="siteDescription" 
                defaultValue="La première marketplace du Sénégal pour connecter vendeurs et acheteurs locaux."
                rows={3}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="maintenance" />
              <Label htmlFor="maintenance">Mode maintenance</Label>
            </div>
          </CardContent>
        </Card>

        {/* Sécurité */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Sécurité
            </CardTitle>
            <CardDescription>
              Paramètres de sécurité et modération
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Approbation automatique des vendeurs</Label>
                <p className="text-sm text-muted-foreground">
                  Les nouveaux vendeurs seront automatiquement approuvés
                </p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Modération des produits</Label>
                <p className="text-sm text-muted-foreground">
                  Les nouveaux produits nécessitent une approbation
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Vérification des emails</Label>
                <p className="text-sm text-muted-foreground">
                  Obliger la vérification email pour les nouveaux comptes
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Email */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Configuration Email
            </CardTitle>
            <CardDescription>
              Paramètres SMTP et notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="smtpHost">Serveur SMTP</Label>
                <Input id="smtpHost" placeholder="smtp.gmail.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="smtpPort">Port SMTP</Label>
                <Input id="smtpPort" placeholder="587" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="smtpUser">Nom d'utilisateur</Label>
                <Input id="smtpUser" placeholder="notifications@marketplace.sn" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fromEmail">Email expéditeur</Label>
                <Input id="fromEmail" placeholder="noreply@marketplace.sn" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* API et Intégrations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              API et Intégrations
            </CardTitle>
            <CardDescription>
              Configuration des services externes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="paymentApi">Clé API Paiement</Label>
              <Input id="paymentApi" type="password" placeholder="pk_test_..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mapsApi">Clé API Google Maps</Label>
              <Input id="mapsApi" type="password" placeholder="AIza..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smsApi">Clé API SMS</Label>
              <Input id="smsApi" type="password" placeholder="sk_..." />
            </div>
          </CardContent>
        </Card>

        {/* Base de données */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Base de données
            </CardTitle>
            <CardDescription>
              Maintenance et sauvegarde
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Sauvegarde automatique</Label>
                <p className="text-sm text-muted-foreground">
                  Sauvegarde quotidienne à 2h du matin
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                Créer une sauvegarde
              </Button>
              <Button variant="outline">
                Nettoyer le cache
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Bouton de sauvegarde */}
        <div className="flex justify-end">
          <Button className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Sauvegarder les paramètres
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;