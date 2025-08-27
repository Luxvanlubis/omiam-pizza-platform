"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  LinkIcon, 
  Plus, 
  Edit, 
  Trash2, 
  ExternalLink, 
  Copy, 
  Share2, 
  Phone, 
  Mail, 
  MapPin, 
  Clock,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
  Music,
  Star,
  Globe
} from 'lucide-react';

interface SocialLink {
  id: string;
  name: string;
  url: string;
  icon: string;
  category: string;
  isActive: boolean;
}

interface ContactLink {
  id: string;
  name: string;
  type: string;
  displayText: string;
  isActive: boolean;
}

interface CustomLink {
  id: string;
  name: string;
  url: string;
  description: string;
  category: string;
  openInNewTab: boolean;
  isActive: boolean;
}

const mockSocialLinks: SocialLink[] = [
  {
    id: '1',
    name: 'Facebook',
    url: 'https://facebook.com/omiam',
    icon: 'facebook',
    category: 'social',
    isActive: true
  },
  {
    id: '2',
    name: 'Instagram',
    url: 'https://instagram.com/omiam',
    icon: 'instagram',
    category: 'social',
    isActive: true
  }
];

const mockContactLinks: ContactLink[] = [
  {
    id: '1',
    name: 'Téléphone',
    type: 'phone',
    displayText: '+33 1 23 45 67 89',
    isActive: true
  },
  {
    id: '2',
    name: 'Email',
    type: 'email',
    displayText: 'contact@omiam.fr',
    isActive: true
  }
];

const mockCustomLinks: CustomLink[] = [
  {
    id: '1',
    name: 'Menu PDF',
    url: '/menu.pdf',
    description: 'Télécharger notre menu complet',
    category: 'documents',
    openInNewTab: true,
    isActive: true
  }
];

const platformOptions = [
  { value: 'facebook', label: 'Facebook' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'twitter', label: 'Twitter' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'youtube', label: 'YouTube' },
  { value: 'tiktok', label: 'TikTok' }
];

const contactTypeOptions = [
  { value: 'phone', label: 'Téléphone' },
  { value: 'email', label: 'Email' },
  { value: 'address', label: 'Adresse' },
  { value: 'hours', label: 'Horaires' }
];

const getIconComponent = (iconName: string) => {
  switch (iconName) {
    case "facebook":
      return <Facebook className="h-5 w-5" />;
    case "instagram":
      return <Instagram className="h-5 w-5" />;
    case "twitter":
      return <Twitter className="h-5 w-5" />;
    case "linkedin":
      return <Linkedin className="h-5 w-5" />;
    case "youtube":
      return <Youtube className="h-5 w-5" />;
    case "tiktok":
      return <Music className="h-5 w-5" />;
    case "star":
      return <Star className="h-5 w-5" />;
    case "message-circle":
      return <Share2 className="h-5 w-5" />;
    default:
      return <Globe className="h-5 w-5" />;
  }
};

const getContactIcon = (type: string) => {
  switch (type) {
    case "phone":
      return <Phone className="h-5 w-5" />;
    case "email":
      return <Mail className="h-5 w-5" />;
    case "address":
      return <MapPin className="h-5 w-5" />;
    case "hours":
      return <Clock className="h-5 w-5" />;
    default:
      return <LinkIcon className="h-5 w-5" />;
  }
};

export function LinksManagement() {
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(mockSocialLinks);
  const [contactLinks, setContactLinks] = useState<ContactLink[]>(mockContactLinks);
  const [customLinks, setCustomLinks] = useState<CustomLink[]>(mockCustomLinks);
  const [isAddingSocial, setIsAddingSocial] = useState(false);
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [isAddingCustom, setIsAddingCustom] = useState(false);

  const handleToggleSocial = (id: string) => {
    setSocialLinks(socialLinks.map(link => 
      link.id === id ? { ...link, isActive: !link.isActive } : link
    ));
  };

  const handleToggleContact = (id: string) => {
    setContactLinks(contactLinks.map(link => 
      link.id === id ? { ...link, isActive: !link.isActive } : link
    ));
  };

  const handleToggleCustom = (id: string) => {
    setCustomLinks(customLinks.map(link => 
      link.id === id ? { ...link, isActive: !link.isActive } : link
    ));
  };

  const handleDeleteSocial = (id: string) => {
    setSocialLinks(socialLinks.filter(link => link.id !== id));
  };

  const handleDeleteContact = (id: string) => {
    setContactLinks(contactLinks.filter(link => link.id !== id));
  };

  const handleDeleteCustom = (id: string) => {
    setCustomLinks(customLinks.filter(link => link.id !== id));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-red-800 dark:text-red-600 flex items-center gap-2">
            <LinkIcon className="h-5 w-5" />
            Gestion des Liens
          </CardTitle>
          <CardDescription>
            Gérez les réseaux sociaux, contacts et liens personnalisés
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="social" className="space-y-6">
            <TabsList>
              <TabsTrigger value="social" className="flex items-center gap-2">
                <Share2 className="h-4 w-4" />
                Réseaux Sociaux
              </TabsTrigger>
              <TabsTrigger value="contact" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Contacts
              </TabsTrigger>
              <TabsTrigger value="custom" className="flex items-center gap-2">
                <LinkIcon className="h-4 w-4" />
                Liens Personnalisés
              </TabsTrigger>
            </TabsList>

            <TabsContent value="social">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-lg">Liens des réseaux sociaux</CardTitle>
                      <CardDescription>Gérez vos profils sur les réseaux sociaux</CardDescription>
                    </div>
                    <Dialog open={isAddingSocial} onOpenChange={setIsAddingSocial}>
                      <DialogTrigger asChild>
                        <Button className="bg-red-600 hover:bg-red-700">
                          <Plus className="h-4 w-4 mr-2" />
                          Ajouter un réseau
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Ajouter un réseau social</DialogTitle>
                          <DialogDescription>
                            Ajoutez un nouveau lien vers un réseau social
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="platform">Plateforme</Label>
                            <Select>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner une plateforme" />
                              </SelectTrigger>
                              <SelectContent>
                                {platformOptions.map((platform) => (
                                  <SelectItem key={platform.value} value={platform.value}>
                                    {platform.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="social-url">URL</Label>
                            <Input id="social-url" placeholder="https://..." />
                          </div>
                          <Button className="w-full bg-red-600 hover:bg-red-700">
                            Ajouter
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {socialLinks.map((link) => (
                      <div key={link.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="text-blue-600">
                            {getIconComponent(link.icon)}
                          </div>
                          <div>
                            <h3 className="font-semibold">{link.name}</h3>
                            <p className="text-sm text-muted-foreground">{link.url}</p>
                            <div className="flex gap-2 mt-1">
                              <Badge variant="outline">{link.category}</Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Label htmlFor={`social-active-${link.id}`} className="text-sm">Actif</Label>
                            <Switch 
                              id={`social-active-${link.id}`} 
                              checked={link.isActive} 
                              onCheckedChange={() => handleToggleSocial(link.id)} 
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive" 
                              onClick={() => handleDeleteSocial(link.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="contact">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-lg">Informations de contact</CardTitle>
                      <CardDescription>Gérez vos coordonnées et informations pratiques</CardDescription>
                    </div>
                    <Dialog open={isAddingContact} onOpenChange={setIsAddingContact}>
                      <DialogTrigger asChild>
                        <Button className="bg-red-600 hover:bg-red-700">
                          <Plus className="h-4 w-4 mr-2" />
                          Ajouter un contact
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Ajouter une information de contact</DialogTitle>
                          <DialogDescription>
                            Ajoutez une nouvelle information de contact
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="contact-type">Type</Label>
                            <Select>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner un type" />
                              </SelectTrigger>
                              <SelectContent>
                                {contactTypeOptions.map((type) => (
                                  <SelectItem key={type.value} value={type.value}>
                                    {type.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="contact-name">Nom</Label>
                            <Input id="contact-name" placeholder="Nom du contact" />
                          </div>
                          <div>
                            <Label htmlFor="contact-value">Valeur</Label>
                            <Input id="contact-value" placeholder="Numéro, email, adresse..." />
                          </div>
                          <Button className="w-full bg-red-600 hover:bg-red-700">
                            Ajouter
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {contactLinks.map((link) => (
                      <div key={link.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="text-green-600">
                            {getContactIcon(link.type)}
                          </div>
                          <div>
                            <h3 className="font-semibold">{link.name}</h3>
                            <p className="text-sm text-muted-foreground">{link.displayText}</p>
                            <Badge variant="outline" className="mt-1">{link.type}</Badge>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Label htmlFor={`contact-active-${link.id}`} className="text-sm">Actif</Label>
                            <Switch 
                              id={`contact-active-${link.id}`} 
                              checked={link.isActive} 
                              onCheckedChange={() => handleToggleContact(link.id)} 
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Copy className="h-3 w-3" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive" 
                              onClick={() => handleDeleteContact(link.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="custom">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-lg">Liens personnalisés</CardTitle>
                      <CardDescription>Gérez les liens personnalisés de votre site</CardDescription>
                    </div>
                    <Dialog open={isAddingCustom} onOpenChange={setIsAddingCustom}>
                      <DialogTrigger asChild>
                        <Button className="bg-red-600 hover:bg-red-700">
                          <Plus className="h-4 w-4 mr-2" />
                          Ajouter un lien
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Ajouter un lien personnalisé</DialogTitle>
                          <DialogDescription>
                            Ajoutez un nouveau lien personnalisé
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="custom-name">Nom</Label>
                            <Input id="custom-name" placeholder="Nom du lien" />
                          </div>
                          <div>
                            <Label htmlFor="custom-url">URL</Label>
                            <Input id="custom-url" placeholder="https://... ou /chemin/local" />
                          </div>
                          <div>
                            <Label htmlFor="custom-description">Description</Label>
                            <Input id="custom-description" placeholder="Description du lien" />
                          </div>
                          <div>
                            <Label htmlFor="custom-category">Catégorie</Label>
                            <Input id="custom-category" placeholder="ex: documents, external, internal" />
                          </div>
                          <Button className="w-full bg-red-600 hover:bg-red-700">
                            Ajouter
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {customLinks.map((link) => (
                      <div key={link.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="text-purple-600">
                            <LinkIcon className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{link.name}</h3>
                            <p className="text-sm text-muted-foreground">{link.url}</p>
                            <p className="text-xs text-muted-foreground">{link.description}</p>
                            <div className="flex gap-2 mt-1">
                              <Badge variant="outline">{link.category}</Badge>
                              {link.openInNewTab && (
                                <Badge variant="outline">Nouvel onglet</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Label htmlFor={`custom-active-${link.id}`} className="text-sm">Actif</Label>
                            <Switch 
                              id={`custom-active-${link.id}`} 
                              checked={link.isActive} 
                              onCheckedChange={() => handleToggleCustom(link.id)} 
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive" 
                              onClick={() => handleDeleteCustom(link.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}