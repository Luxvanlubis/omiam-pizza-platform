"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Clock, MapPin, Truck, Settings, Info, Save, RefreshCw } from "lucide-react";

interface RestaurantSettings {
  name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  tvaRate: number;
  currency: string;
  timezone: string;
}

interface OpeningHours {
  day: string;
  open: string;
  close: string;
  isOpen: boolean;
}

interface DeliverySettings {
  enabled: boolean;
  radius: number;
  minOrder: number;
  deliveryFee: number;
  freeDeliveryThreshold: number;
  estimatedTime: number;
}

interface PaymentSettings {
  cashEnabled: boolean;
  cardEnabled: boolean;
  onlinePaymentEnabled: boolean;
  stripePublicKey: string;
  stripeSecretKey: string;
}

export function ParametresSysteme() {
  const [settings, setSettings] = useState<RestaurantSettings>({
    name: "O'Miam Pizza",
    address: "123 Rue de la Pizza, 75000 Paris",
    phone: "+33 1 23 45 67 89",
    email: "contact@omiam-pizza.fr",
    website: "https://omiam-pizza.fr",
    tvaRate: 20,
    currency: "EUR",
    timezone: "Europe/Paris"
  });

  const [openingHours, setOpeningHours] = useState<OpeningHours[]>([
    { day: "Lundi", open: "11:30", close: "22:00", isOpen: true },
    { day: "Mardi", open: "11:30", close: "22:00", isOpen: true },
    { day: "Mercredi", open: "11:30", close: "22:00", isOpen: true },
    { day: "Jeudi", open: "11:30", close: "22:00", isOpen: true },
    { day: "Vendredi", open: "11:30", close: "23:00", isOpen: true },
    { day: "Samedi", open: "11:30", close: "23:00", isOpen: true },
    { day: "Dimanche", open: "12:00", close: "22:00", isOpen: true }
  ]);

  const [delivery, setDelivery] = useState<DeliverySettings>({
    enabled: true,
    radius: 5,
    minOrder: 15,
    deliveryFee: 2.50,
    freeDeliveryThreshold: 30,
    estimatedTime: 30
  });

  const [payment, setPayment] = useState<PaymentSettings>({
    cashEnabled: true,
    cardEnabled: true,
    onlinePaymentEnabled: true,
    stripePublicKey: "",
    stripeSecretKey: ""
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSettingChange = (key: keyof RestaurantSettings, value: string | number) => {
    setSettings({ ...settings, [key]: value });
    setHasChanges(true);
  };

  const handleOpeningHoursChange = (index: number, field: keyof OpeningHours, value: string | boolean) => {
    const newHours = [...openingHours];
    newHours[index] = { ...newHours[index], [field]: value };
    setOpeningHours(newHours);
    setHasChanges(true);
  };

  const handleDeliveryChange = (key: keyof DeliverySettings, value: boolean | number) => {
    setDelivery({ ...delivery, [key]: value });
    setHasChanges(true);
  };

  const handlePaymentChange = (key: keyof PaymentSettings, value: boolean | string) => {
    setPayment({ ...payment, [key]: value });
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setHasChanges(false);
    setIsSaving(false);
  };

  const handleReset = () => {
    // Reset to default values
    setHasChanges(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="h-6 w-6" />
            Paramètres Système
          </h2>
          <p className="text-muted-foreground">Configurez votre restaurant et vos services</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={!hasChanges || isSaving}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Annuler
          </Button>
          <Button
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? "Sauvegarde..." : "Sauvegarder"}
          </Button>
        </div>
      </div>

      {hasChanges && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Des modifications ont été détectées. N'oubliez pas de sauvegarder vos changements.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">Général</TabsTrigger>
          <TabsTrigger value="hours">Horaires</TabsTrigger>
          <TabsTrigger value="delivery">Livraison</TabsTrigger>
          <TabsTrigger value="payment">Paiement</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Informations générales</CardTitle>
              <CardDescription>
                Informations de base sur votre restaurant
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nom du restaurant</Label>
                  <Input
                    id="name"
                    value={settings.name}
                    onChange={(e) => handleSettingChange("name", e.target.value)}
                    placeholder="O'Miam Pizza"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    value={settings.phone}
                    onChange={(e) => handleSettingChange("phone", e.target.value)}
                    placeholder="+33 1 23 45 67 89"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="address">Adresse</Label>
                <Textarea
                  id="address"
                  value={settings.address}
                  onChange={(e) => handleSettingChange("address", e.target.value)}
                  placeholder="123 Rue de la Pizza, 75000 Paris"
                  rows={2}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={settings.email}
                    onChange={(e) => handleSettingChange("email", e.target.value)}
                    placeholder="contact@omiam-pizza.fr"
                  />
                </div>
                <div>
                  <Label htmlFor="website">Site web</Label>
                  <Input
                    id="website"
                    type="url"
                    value={settings.website}
                    onChange={(e) => handleSettingChange("website", e.target.value)}
                    placeholder="https://omiam-pizza.fr"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="tvaRate">Taux TVA (%)</Label>
                  <Input
                    id="tvaRate"
                    type="number"
                    value={settings.tvaRate}
                    onChange={(e) => handleSettingChange("tvaRate", parseFloat(e.target.value))}
                    min="0"
                    max="100"
                    step="0.1"
                  />
                </div>
                <div>
                  <Label htmlFor="currency">Devise</Label>
                  <Select
                    value={settings.currency}
                    onValueChange={(value) => handleSettingChange("currency", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="timezone">Fuseau horaire</Label>
                  <Select
                    value={settings.timezone}
                    onValueChange={(value) => handleSettingChange("timezone", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Europe/Paris">Europe/Paris</SelectItem>
                      <SelectItem value="America/New_York">America/New_York</SelectItem>
                      <SelectItem value="Asia/Tokyo">Asia/Tokyo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hours">
          <Card>
            <CardHeader>
              <CardTitle>Horaires d'ouverture</CardTitle>
              <CardDescription>
                Définissez vos horaires d'ouverture par jour
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {openingHours.map((hours, index) => (
                  <div key={hours.day} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="w-24 font-medium">{hours.day}</div>
                    <Switch
                      checked={hours.isOpen}
                      onCheckedChange={(checked) => handleOpeningHoursChange(index, "isOpen", checked)}
                    />
                    {hours.isOpen ? (
                      <>
                        <Input
                          type="time"
                          value={hours.open}
                          onChange={(e) => handleOpeningHoursChange(index, "open", e.target.value)}
                          className="w-32"
                        />
                        <span>à</span>
                        <Input
                          type="time"
                          value={hours.close}
                          onChange={(e) => handleOpeningHoursChange(index, "close", e.target.value)}
                          className="w-32"
                        />
                      </>
                    ) : (
                      <span className="text-muted-foreground">Fermé</span>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="delivery">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Paramètres de livraison
              </CardTitle>
              <CardDescription>
                Configurez vos options de livraison
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="delivery-enabled">Activer la livraison</Label>
                <Switch
                  id="delivery-enabled"
                  checked={delivery.enabled}
                  onCheckedChange={(checked) => handleDeliveryChange("enabled", checked)}
                />
              </div>
              
              {delivery.enabled && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="radius">Rayon de livraison (km)</Label>
                      <Input
                        id="radius"
                        type="number"
                        value={delivery.radius}
                        onChange={(e) => handleDeliveryChange("radius", parseFloat(e.target.value))}
                        min="0"
                        step="0.1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="minOrder">Commande minimum (€)</Label>
                      <Input
                        id="minOrder"
                        type="number"
                        value={delivery.minOrder}
                        onChange={(e) => handleDeliveryChange("minOrder", parseFloat(e.target.value))}
                        min="0"
                        step="0.1"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="deliveryFee">Frais de livraison (€)</Label>
                      <Input
                        id="deliveryFee"
                        type="number"
                        value={delivery.deliveryFee}
                        onChange={(e) => handleDeliveryChange("deliveryFee", parseFloat(e.target.value))}
                        min="0"
                        step="0.1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="freeThreshold">Livraison gratuite (€)</Label>
                      <Input
                        id="freeThreshold"
                        type="number"
                        value={delivery.freeDeliveryThreshold}
                        onChange={(e) => handleDeliveryChange("freeDeliveryThreshold", parseFloat(e.target.value))}
                        min="0"
                        step="0.1"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="estimatedTime">Temps estimé (minutes)</Label>
                    <Input
                      id="estimatedTime"
                      type="number"
                      value={delivery.estimatedTime}
                      onChange={(e) => handleDeliveryChange("estimatedTime", parseInt(e.target.value))}
                      min="0"
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment">
          <Card>
            <CardHeader>
              <CardTitle>Options de paiement</CardTitle>
              <CardDescription>
                Configurez vos méthodes de paiement acceptées
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="cash-enabled">Espèces</Label>
                  <Switch
                    id="cash-enabled"
                    checked={payment.cashEnabled}
                    onCheckedChange={(checked) => handlePaymentChange("cashEnabled", checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="card-enabled">Carte bancaire</Label>
                  <Switch
                    id="card-enabled"
                    checked={payment.cardEnabled}
                    onCheckedChange={(checked) => handlePaymentChange("cardEnabled", checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="online-enabled">Paiement en ligne</Label>
                  <Switch
                    id="online-enabled"
                    checked={payment.onlinePaymentEnabled}
                    onCheckedChange={(checked) => handlePaymentChange("onlinePaymentEnabled", checked)}
                  />
                </div>
              </div>
              
              {payment.onlinePaymentEnabled && (
                <div className="space-y-4 pt-4 border-t">
                  <div>
                    <Label htmlFor="stripe-public">Stripe Public Key</Label>
                    <Input
                      id="stripe-public"
                      type="password"
                      value={payment.stripePublicKey}
                      onChange={(e) => handlePaymentChange("stripePublicKey", e.target.value)}
                      placeholder="pk_test_..."
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="stripe-secret">Stripe Secret Key</Label>
                    <Input
                      id="stripe-secret"
                      type="password"
                      value={payment.stripeSecretKey}
                      onChange={(e) => handlePaymentChange("stripeSecretKey", e.target.value)}
                      placeholder="sk_test_..."
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}