"use client";

import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSystemSettingsStore } from "@/store/system-settings-store";
import { 
  Settings, 
  Store, 
  Clock, 
  CreditCard, 
  Phone, 
  Mail, 
  MapPin, 
  Save, 
  RefreshCw, 
  Bell, 
  Shield, 
  Palette,
  Download,
  Upload,
  RotateCcw
} from "lucide-react";

// Les interfaces et valeurs par défaut sont maintenant dans le store

export function SystemSettings() {
  const {
    settings,
    isLoading,
    error,
    updateRestaurantSettings,
    updateOpeningHours,
    updatePaymentSettings,
    updateNotificationSettings,
    updateSystemSettings,
    saveSettings,
    resetToDefaults,
    exportSettings,
    importSettings,
    loadSettings
  } = useSystemSettingsStore();

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleSaveSettings = async (section: string) => {
    await saveSettings();
    if (!error) {
      alert(`Paramètres ${section} sauvegardés avec succès !`);
    } else {
      alert(`Erreur lors de la sauvegarde: ${error}`);
    }
  };

  const handleExportSettings = () => {
    const settingsJson = exportSettings();
    const blob = new Blob([settingsJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'restaurant-settings.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        const success = importSettings(content);
        if (success) {
          alert('Paramètres importés avec succès !');
        } else {
          alert(`Erreur lors de l'importation: ${error}`);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-red-800 dark:text-red-600">Paramètres du système</h2>
          <p className="text-muted-foreground">Configurez les paramètres de votre restaurant</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportSettings}>
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
          <Button variant="outline" onClick={() => document.getElementById('import-settings')?.click()}>
            <Upload className="h-4 w-4 mr-2" />
            Importer
          </Button>
          <input
            id="import-settings"
            type="file"
            accept=".json"
            onChange={handleImportSettings}
            className="hidden"
          />
          <Button variant="outline" onClick={resetToDefaults}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Réinitialiser
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <Tabs defaultValue="restaurant" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="restaurant">Restaurant</TabsTrigger>
          <TabsTrigger value="hours">Horaires</TabsTrigger>
          <TabsTrigger value="payment">Paiement</TabsTrigger>
          <TabsTrigger value="system">Système</TabsTrigger>
        </TabsList>

        <TabsContent value="restaurant" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5" />
                Informations du restaurant
              </CardTitle>
              <CardDescription>
                Informations générales et coordonnées du restaurant
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nom du restaurant</Label>
                  <Input
                    id="name"
                    value={settings.restaurant.name}
                    onChange={(e) => updateRestaurantSettings({ name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    value={settings.restaurant.phone}
                    onChange={(e) => updateRestaurantSettings({ phone: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={settings.restaurant.email}
                    onChange={(e) => updateRestaurantSettings({ email: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="address">Adresse</Label>
                  <Input
                    id="address"
                    value={settings.restaurant.address}
                    onChange={(e) => updateRestaurantSettings({ address: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="city">Ville</Label>
                  <Input
                    id="city"
                    value={settings.restaurant.city}
                    onChange={(e) => updateRestaurantSettings({ city: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="postalCode">Code postal</Label>
                  <Input
                    id="postalCode"
                    value={settings.restaurant.postalCode}
                    onChange={(e) => updateRestaurantSettings({ postalCode: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={settings.restaurant.description}
                  onChange={(e) => updateRestaurantSettings({ description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={() => handleSaveSettings("restaurant")} disabled={isLoading}>
                  {isLoading ? (
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Sauvegarder
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hours" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Horaires d'ouverture
              </CardTitle>
              <CardDescription>
                Définissez les horaires d'ouverture et de fermeture
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {settings.openingHours.map((hours, index) => (
                <div key={hours.day} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{hours.day}</span>
                      <Switch
                        checked={hours.isOpen}
                        onCheckedChange={(checked) => updateOpeningHours(index, { isOpen: checked })}
                      />
                      <span className="text-sm text-muted-foreground">
                        {hours.isOpen ? 'Ouvert' : 'Fermé'}
                      </span>
                    </div>
                  </div>
                  {hours.isOpen && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium">Service midi</Label>
                        <div className="flex gap-2 mt-1">
                          <Input
                            type="time"
                            value={hours.lunch?.open || ''}
                            onChange={(e) => updateOpeningHours(index, { lunch: { ...hours.lunch, open: e.target.value } })}
                          />
                          <span className="flex items-center">à</span>
                          <Input
                            type="time"
                            value={hours.lunch?.close || ''}
                            onChange={(e) => updateOpeningHours(index, { lunch: { ...hours.lunch, close: e.target.value } })}
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Service soir</Label>
                        <div className="flex gap-2 mt-1">
                          <Input
                            type="time"
                            value={hours.dinner?.open || ''}
                            onChange={(e) => updateOpeningHours(index, { dinner: { ...hours.dinner, open: e.target.value } })}
                          />
                          <span className="flex items-center">à</span>
                          <Input
                            type="time"
                            value={hours.dinner?.close || ''}
                            onChange={(e) => updateOpeningHours(index, { dinner: { ...hours.dinner, close: e.target.value } })}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <div className="flex gap-2">
                <Button onClick={() => handleSaveSettings("horaires")} disabled={isLoading}>
                  {isLoading ? (
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Sauvegarder
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Paramètres de paiement
              </CardTitle>
              <CardDescription>
                Configurez les méthodes de paiement et les frais
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Méthodes de paiement</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span>Paiement en espèces</span>
                    </div>
                    <Switch
                      checked={settings.payment.cashEnabled}
                      onCheckedChange={(checked) => updatePaymentSettings({ cashEnabled: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span>Paiement par carte</span>
                    </div>
                    <Switch
                      checked={settings.payment.cardEnabled}
                      onCheckedChange={(checked) => updatePaymentSettings({ cardEnabled: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span>Paiement en ligne</span>
                    </div>
                    <Switch
                      checked={settings.payment.onlineEnabled}
                      onCheckedChange={(checked) => updatePaymentSettings({ onlineEnabled: checked })}
                    />
                  </div>
                </div>
              </div>

              {settings.payment.onlineEnabled && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Configuration du paiement en ligne</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Fournisseur</Label>
                      <Select
                        value={settings.payment.onlineProvider}
                      onValueChange={(value: any) => updatePaymentSettings({ onlineProvider: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="stripe">Stripe</SelectItem>
                          <SelectItem value="paypal">PayPal</SelectItem>
                          <SelectItem value="other">Autre</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Frais et seuils</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="minimumOrder">Commande minimum (€)</Label>
                    <Input
                      id="minimumOrder"
                      type="number"
                      step="0.01"
                      value={settings.payment.minimumOrderAmount}
                      onChange={(e) => updatePaymentSettings({ minimumOrderAmount: parseFloat(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="deliveryFee">Frais de livraison (€)</Label>
                    <Input
                      id="deliveryFee"
                      type="number"
                      step="0.01"
                      value={settings.payment.deliveryFee}
                      onChange={(e) => updatePaymentSettings({ deliveryFee: parseFloat(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="freeDelivery">Livraison gratuite à partir de (€)</Label>
                    <Input
                      id="freeDelivery"
                      type="number"
                      step="0.01"
                      value={settings.payment.freeDeliveryThreshold}
                      onChange={(e) => updatePaymentSettings({ freeDeliveryThreshold: parseFloat(e.target.value) })}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={() => handleSaveSettings("paiement")} disabled={isLoading}>
                  {isLoading ? (
                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Sauvegarder
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Paramètres système
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Mode maintenance</div>
                      <div className="text-sm text-muted-foreground">Désactive le site pour les visiteurs</div>
                    </div>
                    <Switch
                      checked={settings.system.maintenanceMode}
                      onCheckedChange={(checked) => updateSystemSettings({ maintenanceMode: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Mode debug</div>
                      <div className="text-sm text-muted-foreground">Active les informations de débogage</div>
                    </div>
                    <Switch
                      checked={settings.system.debugMode}
                      onCheckedChange={(checked) => updateSystemSettings({ debugMode: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Analytics</div>
                      <div className="text-sm text-muted-foreground">Collecte les données d'utilisation</div>
                    </div>
                    <Switch
                      checked={settings.system.analyticsEnabled}
                      onCheckedChange={(checked) => updateSystemSettings({ analyticsEnabled: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Sauvegarde automatique</div>
                      <div className="text-sm text-muted-foreground">Sauvegarde automatique des données</div>
                    </div>
                    <Switch
                      checked={settings.system.autoBackupEnabled}
                      onCheckedChange={(checked) => updateSystemSettings({ autoBackupEnabled: checked })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="retention">Rétention des données (jours)</Label>
                    <Input
                      id="retention"
                      type="number"
                      value={settings.system.dataRetentionDays}
                      onChange={(e) => updateSystemSettings({ dataRetentionDays: parseInt(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label>Fréquence de sauvegarde</Label>
                    <Select
                      value={settings.system.backupFrequency}
                      onValueChange={(value: any) => updateSystemSettings({ backupFrequency: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Quotidienne</SelectItem>
                        <SelectItem value="weekly">Hebdomadaire</SelectItem>
                        <SelectItem value="monthly">Mensuelle</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Thème</Label>
                    <Select
                      value={settings.system.theme}
                      onValueChange={(value: any) => updateSystemSettings({ theme: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">Clair</SelectItem>
                        <SelectItem value="dark">Sombre</SelectItem>
                        <SelectItem value="auto">Automatique</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Confirmation de commande</div>
                      <div className="text-sm text-muted-foreground">Notification lors de la confirmation</div>
                    </div>
                    <Switch
                      checked={settings.notifications.orderConfirmation}
                      onCheckedChange={(checked) => updateNotificationSettings({ orderConfirmation: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Commande prête</div>
                      <div className="text-sm text-muted-foreground">Notification lorsque la commande est prête</div>
                    </div>
                    <Switch
                      checked={settings.notifications.orderReady}
                      onCheckedChange={(checked) => updateNotificationSettings({ orderReady: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Commande livrée</div>
                      <div className="text-sm text-muted-foreground">Notification lorsque la commande est livrée</div>
                    </div>
                    <Switch
                      checked={settings.notifications.orderDelivered}
                      onCheckedChange={(checked) => updateNotificationSettings({ orderDelivered: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Nouveau client</div>
                      <div className="text-sm text-muted-foreground">Notification pour les nouveaux clients</div>
                    </div>
                    <Switch
                      checked={settings.notifications.newCustomer}
                      onCheckedChange={(checked) => updateNotificationSettings({ newCustomer: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Changement de niveau fidélité</div>
                      <div className="text-sm text-muted-foreground">Notification pour les changements de niveau</div>
                    </div>
                    <Switch
                      checked={settings.notifications.loyaltyLevelUp}
                      onCheckedChange={(checked) => updateNotificationSettings({ loyaltyLevelUp: checked })}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Canaux de notification</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <span>Email</span>
                      </div>
                      <Switch
                        checked={settings.notifications.emailNotifications}
                        onCheckedChange={(checked) => updateNotificationSettings({ emailNotifications: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        <span>SMS</span>
                      </div>
                      <Switch
                        checked={settings.notifications.smsNotifications}
                        onCheckedChange={(checked) => updateNotificationSettings({ smsNotifications: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bell className="h-4 w-4" />
                        <span>Push</span>
                      </div>
                      <Switch
                        checked={settings.notifications.pushNotifications}
                        onCheckedChange={(checked) => updateNotificationSettings({ pushNotifications: checked })}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-2">
              <Button onClick={saveSettings} disabled={isLoading}>
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Sauvegarder tous les paramètres
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}