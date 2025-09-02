import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";

const merchantRegistrationSchema = z.object({
  companyName: z.string().min(2, "Le nom de l'entreprise doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  phone: z.string().min(10, "Numéro de téléphone invalide"),
  address: z.string().min(10, "Adresse complète requise"),
  city: z.string().min(2, "Ville requise"),
  postalCode: z.string().min(5, "Code postal invalide"),
  description: z.string().min(50, "Description de l'entreprise requise (minimum 50 caractères)"),
  website: z.string().url("URL invalide").optional().or(z.literal("")),
  siret: z.string().min(14, "Numéro SIRET invalide").max(14, "Numéro SIRET invalide"),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: "Vous devez accepter les conditions générales"
  }),
  acceptDataProcessing: z.boolean().refine(val => val === true, {
    message: "Vous devez accepter le traitement des données"
  })
});

type MerchantRegistrationForm = z.infer<typeof merchantRegistrationSchema>;

interface MerchantRegistrationFormProps {
  onClose: () => void;
}

const MerchantRegistrationForm = ({ onClose }: MerchantRegistrationFormProps) => {
  const form = useForm<MerchantRegistrationForm>({
    resolver: zodResolver(merchantRegistrationSchema),
    defaultValues: {
      companyName: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      postalCode: "",
      description: "",
      website: "",
      siret: "",
      acceptTerms: false,
      acceptDataProcessing: false,
    },
  });

  const onSubmit = async (data: MerchantRegistrationForm) => {
    try {
      // Simulation d'envoi des données
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log("Données vendeur:", data);
      toast.success("Demande d'inscription envoyée avec succès ! Nous vous recontacterons sous 48h.");
      onClose();
    } catch (error) {
      toast.error("Erreur lors de l'envoi de la demande");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle>Devenir Vendeur</CardTitle>
          <CardDescription>
            Rejoignez notre marketplace et vendez vos produits
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Informations entreprise */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Informations de l'entreprise</h3>
                
                <FormField
                  control={form.control}
                  name="companyName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom de l'entreprise *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ma Super Entreprise" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="siret"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Numéro SIRET *</FormLabel>
                      <FormControl>
                        <Input placeholder="12345678901234" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description de l'entreprise *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Décrivez votre activité, vos produits, votre expertise..."
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Site web</FormLabel>
                      <FormControl>
                        <Input placeholder="https://mon-site.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Contact */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Informations de contact</h3>
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email professionnel *</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="contact@entreprise.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Téléphone *</FormLabel>
                      <FormControl>
                        <Input placeholder="0123456789" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Adresse */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Adresse</h3>
                
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Adresse complète *</FormLabel>
                      <FormControl>
                        <Input placeholder="123 Rue de la République" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ville *</FormLabel>
                        <FormControl>
                          <Input placeholder="Paris" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="postalCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Code postal *</FormLabel>
                        <FormControl>
                          <Input placeholder="75001" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Conditions */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="acceptTerms"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          J'accepte les conditions générales de vente *
                        </FormLabel>
                        <FormDescription>
                          Vous devez accepter nos conditions pour devenir vendeur
                        </FormDescription>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="acceptDataProcessing"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          J'accepte le traitement de mes données personnelles *
                        </FormLabel>
                        <FormDescription>
                          Conformément au RGPD, nous traiterons vos données pour gérer votre candidature
                        </FormDescription>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex gap-4 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? "Envoi en cours..." : "Envoyer ma demande"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default MerchantRegistrationForm;