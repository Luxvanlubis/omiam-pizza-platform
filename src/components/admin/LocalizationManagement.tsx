"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Trash2, Edit, Plus, Globe, DollarSign, Languages, Settings, Star, 
  Download, Upload, Search, Filter, RefreshCw, Save, X, Check, 
  AlertCircle, Info, FileText, Database, Cloud, Zap 
} from 'lucide-react';
import { useI18n, SUPPORTED_LANGUAGES } from '@/hooks/useI18n';
import { useLocalizedFormat } from '@/hooks/useLocalizedFormat';
import { toast } from 'sonner';

// Types étendus
interface Language {
  id: string;
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  isActive: boolean;
  isDefault: boolean;
  isRTL?: boolean;
  completionPercentage: number;
  totals: number;
  translateds: number;
  lastUpdated: string;
}

interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
  exchangeRate: number;
  isActive: boolean;
  isDefault: boolean;
  lastUpdated: string;
  autoUpdate: boolean;
  decimalPlaces: number;
}

interface Translation {
  id: string;
  key: string;
  value: string;
  category: string;
  description?: string;
  isPlural?: boolean;
  context?: string;
  lastModified: string;
  modifiedBy: string;
}

interface LocaleSettings {
  defaultLanguage: string;
  defaultCurrency: string;
  dateFormat: string;
  timeFormat: string;
  numberFormat: string;
  firstDayOfWeek: string;
  autoDetectLanguage: boolean;
  fallbackLanguage: string;
  rtlSupport: boolean;
  pluralizationRules: boolean;
}

interface ImportExportOptions {
  format: 'json' | 'csv' | 'xlsx';
  includeMetadata: boolean;
  selectedLanguages: string[];
  selectedCategories: string[];
}

export default function LocalizationManagement() {
  const { t, currentLanguage, changeLanguage } = useI18n();
  const { formatCurrency, formatDate, formatNumber } = useLocalizedFormat();
  
  // États pour les données
  const [languages, setLanguages] = useState<Language[]>([]);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [localeSettings, setLocaleSettings] = useState<LocaleSettings>({
    defaultLanguage: 'fr',
    defaultCurrency: 'EUR',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    numberFormat: 'fr-FR',
    firstDayOfWeek: 'monday',
    autoDetectLanguage: true,
    fallbackLanguage: 'en',
    rtlSupport: false,
    pluralizationRules: true
  });
  
  // États pour l'interface
  const [activeTab, setActiveTab] = useState('languages');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [importExportOptions, setImportExportOptions] = useState<ImportExportOptions>({
    format: 'json',
    includeMetadata: true,
    selectedLanguages: [],
    selectedCategories: []
  });

  // Chargement initial des données
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Simulation de chargement des données
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Données mock pour la démonstration
      setLanguages([
        {
          id: '1',
          code: 'fr',
          name: 'Français',
          nativeName: 'Français',
          flag: '🇫🇷',
          isActive: true,
          isDefault: true,
          isRTL: false,
          completionPercentage: 100,
          totals: 1250,
          translateds: 1250,
          lastUpdated: new Date().toISOString()
        },
        {
          id: '2',
          code: 'en',
          name: 'English',
          nativeName: 'English',
          flag: '🇺🇸',
          isActive: true,
          isDefault: false,
          isRTL: false,
          completionPercentage: 95,
          totals: 1250,
          translateds: 1188,
          lastUpdated: new Date().toISOString()
        }
      ]);
      
      setCurrencies([
        {
          id: '1',
          code: 'EUR',
          name: 'Euro',
          symbol: '€',
          exchangeRate: 1.0,
          isActive: true,
          isDefault: true,
          lastUpdated: new Date().toISOString(),
          autoUpdate: true,
          decimalPlaces: 2
        },
        {
          id: '2',
          code: 'USD',
          name: 'US Dollar',
          symbol: '$',
          exchangeRate: 1.08,
          isActive: true,
          isDefault: false,
          lastUpdated: new Date().toISOString(),
          autoUpdate: true,
          decimalPlaces: 2
        }
      ]);
      
      setTranslations([
        {
          id: '1',
          key: 'menu.appetizers',
          value: 'Entrées',
          category: 'menu',
          description: 'Section des entrées du menu',
          lastModified: new Date().toISOString(),
          modifiedBy: 'admin'
        },
        {
          id: '2',
          key: 'menu.main_courses',
          value: 'Plats principaux',
          category: 'menu',
          description: 'Section des plats principaux',
          lastModified: new Date().toISOString(),
          modifiedBy: 'admin'
        }
      ]);
      
      toast.success('Données de localisation chargées avec succès');
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Gestion de la Localisation</h2>
          <p className="text-muted-foreground">
            Gérez les langues, devises et traductions de votre restaurant
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => setShowImportDialog(true)}>
            <Upload className="h-4 w-4 mr-2" />
            Importer
          </Button>
          <Button variant="outline" onClick={() => setShowExportDialog(true)}>
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
          <Button onClick={loadData} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="languages" className="flex items-center space-x-2">
            <Languages className="h-4 w-4" />
            <span>Langues</span>
          </TabsTrigger>
          <TabsTrigger value="currencies" className="flex items-center space-x-2">
            <DollarSign className="h-4 w-4" />
            <span>Devises</span>
          </TabsTrigger>
          <TabsTrigger value="translations" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Traductions</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Paramètres</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="languages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Languages className="h-5 w-5" />
                <span>Gestion des Langues</span>
              </CardTitle>
              <CardDescription>
                Configurez les langues disponibles dans votre restaurant
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {languages.map((language) => (
                  <div key={language.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <span className="text-2xl">{language.flag}</span>
                      <div>
                        <div className="font-medium">{language.name}</div>
                        <div className="text-sm text-muted-foreground">{language.nativeName}</div>
                      </div>
                      {language.isDefault && (
                        <Badge variant="default">
                          <Star className="h-3 w-3 mr-1" />
                          Par défaut
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-sm font-medium">{language.completionPercentage}%</div>
                        <Progress value={language.completionPercentage} className="w-20" />
                      </div>
                      <Switch checked={language.isActive} />
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="currencies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="h-5 w-5" />
                <span>Gestion des Devises</span>
              </CardTitle>
              <CardDescription>
                Configurez les devises acceptées dans votre restaurant
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {currencies.map((currency) => (
                  <div key={currency.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="text-2xl font-bold">{currency.symbol}</div>
                      <div>
                        <div className="font-medium">{currency.name}</div>
                        <div className="text-sm text-muted-foreground">{currency.code}</div>
                      </div>
                      {currency.isDefault && (
                        <Badge variant="default">
                          <Star className="h-3 w-3 mr-1" />
                          Par défaut
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="text-sm font-medium">Taux: {currency.exchangeRate}</div>
                        <div className="text-xs text-muted-foreground">
                          Mis à jour: {formatDate(new Date(currency.lastUpdated))}
                        </div>
                      </div>
                      <Switch checked={currency.isActive} />
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="translations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Gestion des Traductions</span>
              </CardTitle>
              <CardDescription>
                Gérez les traductions de votre interface
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Rechercher une traduction..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes les catégories</SelectItem>
                      <SelectItem value="menu">Menu</SelectItem>
                      <SelectItem value="ui">Interface</SelectItem>
                      <SelectItem value="errors">Erreurs</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {translations.map((translation) => (
                    <div key={translation.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{translation.key}</div>
                        <div className="text-sm text-muted-foreground">{translation.value}</div>
                        {translation.description && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {translation.description}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary">{translation.category}</Badge>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Paramètres de Localisation</span>
              </CardTitle>
              <CardDescription>
                Configurez les paramètres régionaux par défaut
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="defaultLanguage">Langue par défaut</Label>
                  <Select value={localeSettings.defaultLanguage}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((lang) => (
                        <SelectItem key={lang.id} value={lang.code}>
                          {lang.flag} {lang.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="defaultCurrency">Devise par défaut</Label>
                  <Select value={localeSettings.defaultCurrency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((currency) => (
                        <SelectItem key={currency.id} value={currency.code}>
                          {currency.symbol} {currency.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Détection automatique de la langue</Label>
                    <p className="text-sm text-muted-foreground">
                      Détecter automatiquement la langue du navigateur
                    </p>
                  </div>
                  <Switch checked={localeSettings.autoDetectLanguage} />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Support RTL</Label>
                    <p className="text-sm text-muted-foreground">
                      Activer le support des langues de droite à gauche
                    </p>
                  </div>
                  <Switch checked={localeSettings.rtlSupport} />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Règles de pluralisation</Label>
                    <p className="text-sm text-muted-foreground">
                      Utiliser les règles de pluralisation avancées
                    </p>
                  </div>
                  <Switch checked={localeSettings.pluralizationRules} />
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button>
                  <Save className="h-4 w-4 mr-2" />
                  Sauvegarder les paramètres
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}