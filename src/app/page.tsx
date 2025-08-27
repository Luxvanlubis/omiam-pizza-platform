'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Users, Star, MapPin, Phone, ChefHat, Utensils, Wine, Award, BarChart3, Sparkles, Heart, Shield, Zap, TrendingUp, Gift, Building } from 'lucide-react';
import Link from 'next/link';
import Layout from '@/components/layout/Layout';
import { useEffect, useState } from 'react';

export default function Home() {
  const [isVisible, setIsVisible] = useState(false);
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  
  const testimonials = [
    { 
      name: "Marie Dubois", 
      role: "Cliente fidèle", 
      rating: 5, 
      text: "O'MIAM a révolutionné ma façon de commander des pizzas ! L'IA de réservation est incroyable et les pizzas sont tout simplement délicieuses. Un service 5 étoiles !" 
    },
    { 
      name: "Jean-Pierre Martin", 
      role: "Food blogger", 
      rating: 5, 
      text: "En tant que critique culinaire, je peux affirmer qu'O'MIAM propose les meilleures pizzas artisanales de Paris. L'expérience digitale est parfaitement intégrée." 
    },
    { 
      name: "Sophie Laurent", 
      role: "Entrepreneuse", 
      rating: 5, 
      text: "Le programme de fidélité et les notifications en temps réel font d'O'MIAM bien plus qu'une simple pizzeria. C'est une expérience complète et moderne !" 
    }
  ];
  
  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  return (
    <Layout showHeader={true} maxWidth="full" className="px-0">
      {/* Hero Section - Premium Enhanced */}
      <section className="relative min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-yellow-50 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-32 h-32 bg-orange-300 rounded-full animate-pulse"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-red-300 rounded-full animate-bounce delay-1000"></div>
          <div className="absolute bottom-20 left-1/4 w-20 h-20 bg-yellow-300 rounded-full animate-ping delay-2000"></div>
        </div>
        
        <div className={`max-w-7xl mx-auto px-4 py-20 text-center relative z-10 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="flex justify-center mb-6">
            <Badge variant="secondary" className="mb-4 bg-gradient-to-r from-orange-100 to-red-100 text-orange-800 px-6 py-2 text-lg font-semibold border border-orange-200 shadow-lg">
              <Sparkles className="w-5 h-5 mr-2" />
              🍕 Pizzeria Artisanale Premium
            </Badge>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-8 leading-tight">
            Bienvenue chez{' '}
            <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent animate-pulse">
              O'MIAM
            </span>
          </h1>
          
          <p className="text-2xl text-gray-700 mb-12 max-w-4xl mx-auto leading-relaxed">
            🚀 <strong>Révolutionnez votre expérience culinaire</strong> avec notre technologie IA avancée, 
            nos pizzas artisanales d'exception et notre service personnalisé de classe mondiale.
          </p>
          
          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12 max-w-4xl mx-auto">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-orange-100">
              <div className="text-3xl font-bold text-orange-600">25+</div>
              <div className="text-sm text-gray-600">Pizzas Artisanales</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-orange-100">
              <div className="text-3xl font-bold text-orange-600">4.9★</div>
              <div className="text-sm text-gray-600">Note Moyenne</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-orange-100">
              <div className="text-3xl font-bold text-orange-600">10K+</div>
              <div className="text-sm text-gray-600">Clients Satisfaits</div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-orange-100">
              <div className="text-3xl font-bold text-orange-600">IA</div>
              <div className="text-sm text-gray-600">Réservation Smart</div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link href="/reservation">
              <Button size="lg" className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-10 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
                <Calendar className="w-6 h-6 mr-3" />
                🎯 Réservation IA Premium
              </Button>
            </Link>
            <Link href="/menu">
              <Button variant="outline" size="lg" className="px-10 py-4 text-lg font-semibold border-2 border-orange-300 hover:bg-orange-50 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                <ChefHat className="w-6 h-6 mr-3" />
                🍕 Découvrir le Menu
              </Button>
            </Link>
            <Link href="/profile">
              <Button variant="outline" size="lg" className="px-10 py-4 text-lg font-semibold border-2 border-orange-300 hover:bg-orange-50 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
                <Gift className="w-6 h-6 mr-3" />
                🎁 Programme Fidélité
              </Button>
            </Link>
          </div>
          
          {/* Testimonial Carousel */}
          <div className="mt-16 max-w-2xl mx-auto">
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-orange-100 transition-all duration-500">
              <div className="flex justify-center mb-4">
                {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
              <p className="text-lg text-gray-700 italic mb-4">"{testimonials[currentTestimonial].text}"</p>
              <p className="font-semibold text-orange-600">- {testimonials[currentTestimonial].name}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Premium Enhanced */}
      <section className="py-20 px-4 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-6 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 px-4 py-2 text-sm font-semibold">
              <Zap className="w-4 h-4 mr-2" />
              Technologie de Pointe
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Pourquoi choisir <span className="text-orange-600">O'MIAM</span> ?
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Une expérience culinaire révolutionnaire alliant tradition artisanale française 
              et innovation technologique de classe mondiale
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="group text-center hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-0 bg-gradient-to-br from-orange-50 to-red-50 hover:from-orange-100 hover:to-red-100">
              <CardHeader>
                <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <ChefHat className="w-10 h-10 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                  🍕 Pizzas Artisanales Premium
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  Pâte fraîche préparée quotidiennement par nos maîtres pizzaïolos, 
                  ingrédients bio sélectionnés avec passion
                </p>
                <div className="mt-4 flex justify-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card className="group text-center hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-0 bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100">
              <CardHeader>
                <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <BarChart3 className="w-10 h-10 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  🤖 Réservation IA Avancée
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  Intelligence artificielle qui analyse vos préférences pour 
                  trouver la table parfaite au moment idéal
                </p>
                <div className="mt-4">
                  <Badge className="bg-blue-100 text-blue-800 text-xs px-2 py-1">
                    Algorithme Propriétaire
                  </Badge>
                </div>
              </CardContent>
            </Card>
            
            <Card className="group text-center hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-0 bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100">
              <CardHeader>
                <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Zap className="w-10 h-10 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                  ⚡ Suivi Temps Réel
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  Notifications push instantanées, géolocalisation, 
                  suivi précis de votre commande minute par minute
                </p>
                <div className="mt-4">
                  <Badge className="bg-green-100 text-green-800 text-xs px-2 py-1">
                    WebSocket Live
                  </Badge>
                </div>
              </CardContent>
            </Card>
            
            <Card className="group text-center hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border-0 bg-gradient-to-br from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100">
              <CardHeader>
                <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Heart className="w-10 h-10 text-white" />
                </div>
                <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                  💎 Profils VIP Personnalisés
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed">
                  Préférences mémorisées, allergènes, historique complet 
                  et programme de fidélité exclusif
                </p>
                <div className="mt-4">
                  <Badge className="bg-purple-100 text-purple-800 text-xs px-2 py-1">
                    Machine Learning
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Additional Premium Features Row */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
              <Shield className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">🔒 Paiement Sécurisé</h3>
              <p className="text-gray-600">Stripe Premium, Apple Pay, Google Pay, cryptage bancaire</p>
            </div>
            <div className="text-center p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
              <TrendingUp className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">📊 Analytics Avancés</h3>
              <p className="text-gray-600">Dashboard personnel, statistiques de consommation, insights</p>
            </div>
            <div className="text-center p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
              <Gift className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 mb-2">🎁 Récompenses Exclusives</h3>
              <p className="text-gray-600">Points fidélité, pizzas gratuites, accès VIP, événements privés</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Menu Highlights - Premium Enhanced */}
      <section className="py-20 px-4 bg-gradient-to-br from-gray-50 to-orange-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-6 bg-gradient-to-r from-orange-100 to-yellow-100 text-orange-800 px-4 py-2 text-sm font-semibold">
              <Award className="w-4 h-4 mr-2" />
              Créations Signature
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Nos <span className="text-orange-600">Spécialités</span> d'Exception
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Découvrez nos créations culinaires les plus prisées, élaborées par nos maîtres pizzaïolos 
              avec des ingrédients premium sélectionnés avec passion
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <Card className="group overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border-0 bg-white">
              <div className="aspect-video relative overflow-hidden">
                <img 
                  src="/images/pizzas/reine.jpg" 
                  alt="Pizza La Reine" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Badge className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1 font-semibold shadow-lg">
                  🔥 Populaire
                </Badge>
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Heart className="w-5 h-5 text-red-500" />
                </div>
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-xl">
                  🍕 La Reine Premium
                  <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">14.90€</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4 leading-relaxed">
                  Tomate San Marzano, mozzarella di Bufala, jambon de Parme, 
                  champignons de Paris, olives Kalamata
                </p>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                    <span className="ml-2 text-sm font-semibold text-gray-700">4.8 (124 avis)</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Link href="/menu" className="flex-1">
                    <Button className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                      🛒 Commander
                    </Button>
                  </Link>
                  <Button variant="outline" size="icon" className="border-orange-300 hover:bg-orange-50">
                    <Heart className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card className="group overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border-0 bg-white">
              <div className="aspect-video relative overflow-hidden">
                <img 
                  src="/images/pizzas/4-fromages.jpg" 
                  alt="Pizza 4 Fromages" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Badge className="absolute top-4 left-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-1 font-semibold shadow-lg">
                  👨‍🍳 Chef's Choice
                </Badge>
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Heart className="w-5 h-5 text-red-500" />
                </div>
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-xl">
                  🧀 4 Fromages Artisanaux
                  <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">16.50€</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4 leading-relaxed">
                  Mozzarella di Bufala, Gorgonzola DOP, chèvre fermier, 
                  Parmigiano Reggiano 24 mois, crème fraîche épaisse
                </p>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                    <span className="ml-2 text-sm font-semibold text-gray-700">4.9 (89 avis)</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Link href="/menu" className="flex-1">
                    <Button className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                      🛒 Commander
                    </Button>
                  </Link>
                  <Button variant="outline" size="icon" className="border-orange-300 hover:bg-orange-50">
                    <Heart className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card className="group overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-3 border-0 bg-white">
              <div className="aspect-video relative overflow-hidden">
                <img 
                  src="/images/pizzas/calzone.jpg" 
                  alt="Calzone" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Badge className="absolute top-4 left-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 font-semibold shadow-lg">
                  ✨ Signature
                </Badge>
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Heart className="w-5 h-5 text-red-500" />
                </div>
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-xl">
                  🥟 Calzone Traditionnel
                  <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">15.90€</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4 leading-relaxed">
                  Pizza fermée garnie de jambon de Bayonne, mozzarella, 
                  ricotta fraîche, épinards bio, œuf fermier
                </p>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                    <span className="ml-2 text-sm font-semibold text-gray-700">4.7 (156 avis)</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Link href="/menu" className="flex-1">
                    <Button className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                      🛒 Commander
                    </Button>
                  </Link>
                  <Button variant="outline" size="icon" className="border-orange-300 hover:bg-orange-50">
                    <Heart className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="text-center mt-16">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border border-orange-100 max-w-2xl mx-auto">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">🍕 Plus de 25 créations vous attendent !</h3>
              <p className="text-gray-600 mb-6">Pizzas classiques, créations originales, options végétariennes et sans gluten</p>
              <Link href="/menu">
                <Button size="lg" className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-10 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
                  <Utensils className="w-6 h-6 mr-3" />
                  🎯 Découvrir tout le menu
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
      {/* Premium Testimonials Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-orange-50 to-yellow-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-6 bg-gradient-to-r from-green-100 to-blue-100 text-green-800 px-4 py-2 text-sm font-semibold">
              <Users className="w-4 h-4 mr-2" />
              Témoignages Clients
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Ce que disent nos <span className="text-orange-600">Clients</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Plus de 2000 clients nous font confiance chaque mois
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
                <CardContent className="p-8">
                  <div className="flex items-center mb-4">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                      ))}
                    </div>
                  </div>
                  <blockquote className="text-gray-700 mb-6 italic leading-relaxed">
                    "{testimonial.text}"
                  </blockquote>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-400 to-red-400 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div className="ml-4">
                       <div className="font-semibold text-gray-900">{testimonial.name}</div>
                       <div className="text-sm text-gray-600">{testimonial.role}</div>
                     </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center">
            <div className="inline-flex items-center space-x-8 bg-white/90 backdrop-blur-sm rounded-2xl px-8 py-6 shadow-xl">
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">4.9/5</div>
                <div className="text-sm text-gray-600">Note moyenne</div>
              </div>
              <div className="w-px h-12 bg-gray-300"></div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">2000+</div>
                <div className="text-sm text-gray-600">Avis clients</div>
              </div>
              <div className="w-px h-12 bg-gray-300"></div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600">98%</div>
                <div className="text-sm text-gray-600">Recommandent</div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Restaurant Info - Enhanced */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <Badge className="mb-6 bg-gradient-to-r from-orange-100 to-red-100 text-orange-800 px-4 py-2 text-sm font-semibold">
                <MapPin className="w-4 h-4 mr-2" />
                Notre Histoire
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
                À propos d'<span className="text-orange-600">O'MIAM</span>
              </h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Depuis 2018, O'MIAM révolutionne l'expérience de la pizzeria traditionnelle 
                en alliant savoir-faire artisanal et innovation technologique. Notre équipe 
                de maîtres pizzaïolos perpétue les traditions italiennes tout en embrassant 
                les nouvelles technologies pour vous offrir une expérience unique.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6">
                  <MapPin className="w-8 h-8 text-orange-600 mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">Adresse</h3>
                  <p className="text-gray-700">123 Rue des Pizzaïolos<br />75001 Paris</p>
                </div>
                <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6">
                  <Phone className="w-8 h-8 text-orange-600 mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">Téléphone</h3>
                  <p className="text-gray-700">01 23 45 67 89</p>
                </div>
                <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 md:col-span-2">
                  <Clock className="w-8 h-8 text-orange-600 mb-3" />
                  <h3 className="font-semibold text-gray-900 mb-2">Horaires d'ouverture</h3>
                  <p className="text-gray-700">Ouvert tous les jours, 11h30 - 14h30 et 18h - 23h</p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/reservation">
                  <Button size="lg" className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-10 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
                    <Calendar className="w-6 h-6 mr-3" />
                    🎯 Réserver une table
                  </Button>
                </Link>
                <Link href="/profile">
                  <Button size="lg" variant="outline" className="border-2 border-orange-600 text-orange-600 hover:bg-orange-50 px-10 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                    <Gift className="w-6 h-6 mr-3" />
                    🎁 Programme fidélité
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="relative">
              <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
                <img 
                  src="/images/restaurant-interior.jpg" 
                  alt="Intérieur du restaurant O'MIAM" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-8 -right-8 bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl p-8 shadow-2xl text-white transform -rotate-3">
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">2000+</div>
                  <div className="text-sm opacity-90">Clients satisfaits</div>
                </div>
              </div>
              <div className="absolute -top-6 -left-6 bg-white rounded-xl p-4 shadow-xl border border-orange-100">
                <div className="flex items-center space-x-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-gray-700">4.9/5</span>
                </div>
              </div>
            </div>
          </div>
         </div>
       </section>
       
       {/* Premium CTA Section */}
       <section className="py-20 px-4 bg-gradient-to-br from-gray-900 via-orange-900 to-red-900 text-white relative overflow-hidden">
         <div className="absolute inset-0 bg-black/20"></div>
         <div className="absolute inset-0">
           <div className="absolute top-10 left-10 w-20 h-20 bg-orange-500/20 rounded-full blur-xl"></div>
           <div className="absolute bottom-20 right-20 w-32 h-32 bg-red-500/20 rounded-full blur-2xl"></div>
           <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-yellow-500/10 rounded-full blur-3xl"></div>
         </div>
         
         <div className="max-w-7xl mx-auto relative z-10">
           <div className="text-center mb-16">
             <Badge className="mb-6 bg-gradient-to-r from-orange-400 to-red-400 text-white px-6 py-3 text-lg font-bold">
               <Sparkles className="w-5 h-5 mr-2" />
               Expérience Premium
             </Badge>
             <h2 className="text-5xl md:text-6xl font-bold mb-8">
               Rejoignez la <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-400">Révolution</span> Culinaire
             </h2>
             <p className="text-2xl text-gray-200 max-w-4xl mx-auto leading-relaxed mb-12">
               Plus qu'une pizzeria, O'MIAM est une expérience technologique unique qui transforme 
               votre façon de savourer la gastronomie italienne.
             </p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
             <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300">
               <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-red-400 rounded-2xl flex items-center justify-center mb-6">
                 <Zap className="w-8 h-8 text-white" />
               </div>
               <h3 className="text-2xl font-bold mb-4">IA Révolutionnaire</h3>
               <p className="text-gray-200 leading-relaxed">
                 Notre intelligence artificielle apprend vos préférences pour vous proposer 
                 l'expérience parfaite à chaque visite.
               </p>
             </div>
             
             <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300">
               <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-blue-400 rounded-2xl flex items-center justify-center mb-6">
                 <Shield className="w-8 h-8 text-white" />
               </div>
               <h3 className="text-2xl font-bold mb-4">Sécurité Totale</h3>
               <p className="text-gray-200 leading-relaxed">
                 Paiements sécurisés, données protégées et expérience sans contact 
                 pour votre tranquillité d'esprit.
               </p>
             </div>
             
             <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300">
               <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-400 rounded-2xl flex items-center justify-center mb-6">
                 <TrendingUp className="w-8 h-8 text-white" />
               </div>
               <h3 className="text-2xl font-bold mb-4">Fidélité Récompensée</h3>
               <p className="text-gray-200 leading-relaxed">
                 Gagnez des points, débloquez des récompenses exclusives et 
                 profitez d'avantages VIP uniques.
               </p>
             </div>
           </div>
           
           <div className="text-center">
             <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-12 border border-white/20 max-w-4xl mx-auto">
               <h3 className="text-3xl font-bold mb-6">🚀 Prêt pour l'Expérience O'MIAM ?</h3>
               <p className="text-xl text-gray-200 mb-8">
                 Découvrez pourquoi plus de 2000 clients nous font confiance chaque mois
               </p>
               
               <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                 <Link href="/menu">
                   <Button size="lg" className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-12 py-6 text-xl font-bold shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300 border-2 border-white/20">
                     <Utensils className="w-7 h-7 mr-3" />
                     🍕 Commander Maintenant
                   </Button>
                 </Link>
                 
                 <Link href="/reservation">
                   <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-gray-900 px-12 py-6 text-xl font-bold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300">
                     <Calendar className="w-7 h-7 mr-3" />
                     📅 Réserver une Table
                   </Button>
                 </Link>
               </div>
               
               <div className="mt-8 flex items-center justify-center space-x-8 text-sm text-gray-300">
                 <div className="flex items-center">
                   <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                   Livraison 30min
                 </div>
                 <div className="flex items-center">
                   <div className="w-2 h-2 bg-blue-400 rounded-full mr-2"></div>
                   Paiement sécurisé
                 </div>
                 <div className="flex items-center">
                   <div className="w-2 h-2 bg-purple-400 rounded-full mr-2"></div>
                   Support 24/7
                 </div>
               </div>
             </div>
           </div>
         </div>
       </section>
    </Layout>
  );
}