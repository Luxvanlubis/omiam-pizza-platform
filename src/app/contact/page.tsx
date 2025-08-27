"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Phone, Mail, Clock, Facebook, Instagram, Truck, ExternalLink } from "lucide-react";
import { CONTACT_INFO, formatters } from "@/config/contact";

interface DeliveryChannel {
  name: string;
  url?: string;
  zones: string[];
  active: boolean;
  note?: string;
}

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Message envoyé ! Nous vous répondrons dans les plus brefs délais.");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:to-gray-800">
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-red-800 dark:text-red-600 mb-4">
            Contactez-nous
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Nous sommes à votre disposition pour toute question ou réservation
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Formulaire de contact */}
          <Card className="transform hover:scale-105 transition-transform">
            <CardHeader>
              <CardTitle className="text-red-800 dark:text-red-600">
                Envoyez-nous un message
              </CardTitle>
              <CardDescription>
                Remplissez le formulaire ci-dessous et nous vous répondrons rapidement
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Nom complet</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Votre nom"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="votre@email.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Sujet</label>
                  <input
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Sujet de votre message"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Message</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Votre message..."
                  />
                </div>
                <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white">
                  Envoyer le message
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Informations de contact */}
          <div className="space-y-6">
            <Card className="transform hover:scale-105 transition-transform">
              <CardHeader>
                <CardTitle className="text-red-800 dark:text-red-600">Informations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="font-semibold">Adresse</p>
                    <p className="text-muted-foreground">{CONTACT_INFO.address.full}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="font-semibold">Téléphone</p>
                    <a
                      href={formatters.phoneLink()}
                      className="text-muted-foreground hover:text-red-600 transition-colors"
                    >
                      {CONTACT_INFO.contact.phone}
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="font-semibold">Email</p>
                    <a
                      href={formatters.emailLink()}
                      className="text-muted-foreground hover:text-red-600 transition-colors"
                    >
                      {CONTACT_INFO.contact.email}
                    </a>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="font-semibold">Horaires</p>
                    <p className="text-muted-foreground" style={{whiteSpace: 'pre-line' as const}}>
                      {CONTACT_INFO.hours.display}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="transform hover:scale-105 transition-transform">
              <CardHeader>
                <CardTitle className="text-red-800 dark:text-red-600">Réseaux sociaux</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Suivez-nous sur les réseaux sociaux pour ne rien manquer de nos actualités et offres spéciales !
                </p>
                <div className="flex gap-4">
                  {CONTACT_INFO.social.facebook.active && (
                    <Button
                      variant="outline"
                      className="flex items-center gap-2"
                      onClick={() => window.open(CONTACT_INFO.social.facebook.url, '_blank')}
                    >
                      <Facebook className="h-4 w-4" />
                      Facebook
                    </Button>
                  )}
                  {CONTACT_INFO.social.instagram.active && (
                    <Button
                      variant="outline"
                      className="flex items-center gap-2"
                      onClick={() => window.open(CONTACT_INFO.social.instagram.url, '_blank')}
                    >
                      <Instagram className="h-4 w-4" />
                      Instagram
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="transform hover:scale-105 transition-transform">
              <CardHeader>
                <CardTitle className="text-red-800 dark:text-red-600">Commande & Livraison</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground mb-4">
                  Commandez facilement via nos partenaires de livraison !
                </p>
                <div className="space-y-3">
                  {Object.entries(CONTACT_INFO.delivery.channels).map(([key, channel]) => {
                    const typedChannel = channel as DeliveryChannel;
                    return typedChannel.active && (
                      <div
                        key={key}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Truck className="h-5 w-5 text-red-600" />
                          <div>
                            <p className="font-semibold">{typedChannel.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Zones: {typedChannel.zones.join(", ")}
                            </p>
                            {typedChannel.note && (
                              <p className="text-xs text-green-600">{typedChannel.note}</p>
                            )}
                          </div>
                        </div>
                        {typedChannel.url && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(typedChannel.url, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Commander
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Too Good To Go */}
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-green-600 font-semibold">🌱 Too Good To Go</span>
                  </div>
                  <p className="text-sm text-green-700">
                    {CONTACT_INFO.delivery.antiWaste.tooGoodToGo.description}
                  </p>
                  <p className="text-sm font-semibold text-green-800 mt-1">
                    {CONTACT_INFO.delivery.antiWaste.tooGoodToGo.price}€
                    <span className="text-xs text-green-600 ml-1">
                      (valeur {CONTACT_INFO.delivery.antiWaste.tooGoodToGo.value}€)
                    </span>
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="transform hover:scale-105 transition-transform">
              <CardHeader>
                <CardTitle className="text-red-800 dark:text-red-600">Plan d'accès</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="h-12 w-12 text-gray-500 mx-auto mb-2" />
                    <p className="text-gray-600">Carte interactive</p>
                    <p className="text-sm text-gray-500">{CONTACT_INFO.address.full}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}