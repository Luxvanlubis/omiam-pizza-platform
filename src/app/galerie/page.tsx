"use client";

import { useState } from "react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  Search,
  Filter,
  Heart,
  Share2,
  Eye,
  Camera,
  Pizza,
  ChefHat,
  Users,
  MapPin,
  Star,
  Sparkles,
  Award
} from "lucide-react";

const galleryImages = [
  {
    id: 1,
    title: "Pizzeria O'Miam - Intérieur",
    category: "interieur",
    description: "Notre ambiance chaleureuse et conviviale avec décor traditionnel italien",
    image: "/images/restaurant-interior.jpg",
    featured: true,
    likes: 156,
    views: 2340
  },
  {
    id: 2,
    title: "Four à Bois Traditionnel",
    category: "cuisine",
    description: "Notre four à bois atteignant 485°C pour une cuisson parfaite",
    image: "/images/pizza-oven.jpg",
    featured: true,
    likes: 203,
    views: 3120
  },
  {
    id: 3,
    title: "Margherita Royale",
    category: "plats",
    description: "Notre pizza signature avec mozzarella de bufflonne AOP",
    image: "/images/pizza-margherita.jpg",
    featured: true,
    likes: 267,
    views: 4150
  },
  {
    id: 4,
    title: "Chef Pizzaiolo en Action",
    category: "equipe",
    description: "Notre chef préparant une pizza avec passion et savoir-faire",
    image: "/images/pizza-chef.jpg",
    featured: false,
    likes: 189,
    views: 2890
  },
  {
    id: 5,
    title: "Terrasse Extérieure",
    category: "exterieur",
    description: "Profitez de nos pizzas en plein air en saison estivale",
    image: "/images/restaurant-exterior.jpg",
    featured: false,
    likes: 145,
    views: 1980
  },
  {
    id: 6,
    title: "O'Miam Spéciale",
    category: "plats",
    description: "Notre création exclusive avec ingrédients premium",
    image: "/images/pizza-margherita.jpg",
    featured: false,
    likes: 234,
    views: 3670
  },
  {
    id: 7,
    title: "Ingrédients Frais",
    category: "cuisine",
    description: "Nos produits sélectionnés avec soin auprès de producteurs locaux",
    image: "/images/ingredients.jpg",
    featured: false,
    likes: 178,
    views: 2450
  },
  {
    id: 8,
    title: "Clients Heureux",
    category: "ambiance",
    description: "Nos clients profitant d'un moment convivial autour d'une bonne pizza",
    image: "/images/restaurant-interior.jpg",
    featured: false,
    likes: 156,
    views: 2100
  },
  {
    id: 9,
    title: "Dessert Maison Tiramisu",
    category: "plats",
    description: "Notre tiramisu artisanal préparé quotidiennement",
    image: "/images/pizza-margherita.jpg",
    featured: false,
    likes: 134,
    views: 1870
  }
];

const categories = [
  { id: "tout", name: "Toutes les photos", icon: <Camera className="h-4 w-4" /> },
  { id: "interieur", name: "Intérieur", icon: <MapPin className="h-4 w-4" /> },
  { id: "cuisine", name: "Cuisine", icon: <ChefHat className="h-4 w-4" /> },
  { id: "plats", name: "Plats", icon: <Pizza className="h-4 w-4" /> },
  { id: "equipe", name: "Équipe", icon: <Users className="h-4 w-4" /> },
  { id: "exterieur", name: "Extérieur", icon: <MapPin className="h-4 w-4" /> },
  { id: "ambiance", name: "Ambiance", icon: <Star className="h-4 w-4" /> }
];

export default function EnhancedGaleriePage() {
  const [selectedCategory, setSelectedCategory] = useState("tout");
  const [searchTerm, setSearchTerm] = useState("");
  const [likedImages, setLikedImages] = useState<Set<number>>(new Set());

  const filteredImages = galleryImages.filter(image => {
    const matchesCategory = selectedCategory === "tout" || image.category === selectedCategory;
    const matchesSearch = image.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         image.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleLike = (imageId: number) => {
    const newLikedImages = new Set(likedImages);
    if (newLikedImages.has(imageId)) {
      newLikedImages.delete(imageId);
    } else {
      newLikedImages.add(imageId);
    }
    setLikedImages(newLikedImages);
  };

  const featuredImages = galleryImages.filter(img => img.featured);

  return (
    <div className="min-h-screen bg-background">
      
      {/* Gallery Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-purple-600 to-pink-600">
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="absolute inset-0">
          <Image
            src="/images/restaurant-interior.jpg"
            alt="Gallery hero"
            fill
            style={{ objectFit: 'cover' }}
            className="opacity-40"
          />
        </div>
        <div className="relative z-10 container mx-auto px-4 text-center text-white">
          <Badge className="mb-6 bg-white/20 text-white border-white/30 backdrop-blur-sm">
            <Camera className="h-4 w-4 mr-2" />
            Galerie Photo
          </Badge>
          <h1 className="heading-primary text-white mb-6">
            L'Univers O'Miam
          </h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto mb-8 leading-relaxed">
            Plongez dans l'ambiance chaleureuse de notre pizzeria et découvrez les coulisses de notre savoir-faire artisanal à travers notre sélection de photos exclusives.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm px-4 py-2">
              <Star className="h-4 w-4 mr-2" />
              {galleryImages.length} Photos
            </Badge>
            <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm px-4 py-2">
              <Award className="h-4 w-4 mr-2" />
              {featuredImages.length} Coup de cœur
            </Badge>
          </div>
        </div>
      </section>

      {/* Featured Photos */}
      {selectedCategory === "tout" && !searchTerm && (
        <section className="py-16 px-4 bg-orange-50">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2 className="heading-secondary mb-4">Photos Coup de Cœur</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Notre sélection des plus belles images de notre pizzeria
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {featuredImages.slice(0, 3).map((image) => (
                <div key={image.id} className="gallery-item">
                  <div className="relative h-80">
                    <Image
                      src={image.image}
                      alt={image.title}
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                    <div className="gallery-overlay">
                      <h3 className="text-xl font-bold mb-2">{image.title}</h3>
                      <p className="text-sm opacity-90">{image.description}</p>
                    </div>
                    <Badge className="absolute top-4 left-4 bg-yellow-500 text-white">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Coup de cœur
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Main Gallery */}
      <main className="container mx-auto px-4 py-16">
        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-6 items-center justify-between mb-12">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Rechercher une photo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-orange-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                  selectedCategory === category.id
                    ? "bg-red-600 text-white shadow-lg"
                    : "bg-white text-gray-700 hover:bg-orange-50 border border-orange-200 hover:border-red-300"
                }`}
              >
                {category.icon}
                <span className="font-medium">{category.name}</span>
                {category.id !== "tout" && (
                  <Badge variant="secondary" className="ml-1">
                    {galleryImages.filter(img => img.category === category.id).length}
                  </Badge>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Results Info */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-lg font-medium text-red-800">
              {filteredImages.length} photo{filteredImages.length > 1 ? 's' : ''} trouvée{filteredImages.length > 1 ? 's' : ''}
            </p>
            {selectedCategory !== "tout" && (
              <p className="text-sm text-muted-foreground">
                Catégorie : {categories.find(c => c.id === selectedCategory)?.name}
              </p>
            )}
          </div>
          {searchTerm && (
            <Button
              variant="outline"
              onClick={() => setSearchTerm("")}
              className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
            >
              Effacer la recherche
            </Button>
          )}
        </div>

        {/* Gallery Grid */}
        <div className="gallery-grid">
          {filteredImages.map((image) => (
            <div key={image.id} className="gallery-item">
              <div className="relative h-64 group">
                <Image
                  src={image.image}
                  alt={image.title}
                  fill
                  style={{ objectFit: 'cover' }}
                />
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="text-center text-white p-4">
                    <h3 className="text-xl font-bold mb-2">{image.title}</h3>
                    <p className="text-sm opacity-90 mb-4">{image.description}</p>
                    <div className="flex items-center justify-center gap-4">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="secondary"
                            className="bg-white/20 text-white border-white/30 hover:bg-white/30"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Voir
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl">
                          <div className="relative">
                            <Image
                              src={image.image}
                              alt={image.title}
                              width={800}
                              height={600}
                              className="w-full h-auto rounded-lg"
                            />
                            <div className="mt-6">
                              <h3 className="text-2xl font-bold text-red-800 mb-2">{image.title}</h3>
                              <p className="text-muted-foreground mb-4">{image.description}</p>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Eye className="h-4 w-4" />
                                  {image.views} vues
                                </div>
                                <div className="flex items-center gap-1">
                                  <Heart className="h-4 w-4" />
                                  {image.likes + (likedImages.has(image.id) ? 1 : 0)} j'aime
                                </div>
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => toggleLike(image.id)}
                        className={`bg-white/20 text-white border-white/30 hover:bg-white/30 ${
                          likedImages.has(image.id) ? 'bg-red-600 border-red-600' : ''
                        }`}
                      >
                        <Heart className={`h-4 w-4 mr-2 ${likedImages.has(image.id) ? 'fill-current' : ''}`} />
                        {likedImages.has(image.id) ? 'Aimé' : 'Aimer'}
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="secondary"
                        className="bg-white/20 text-white border-white/30 hover:bg-white/30"
                      >
                        <Share2 className="h-4 w-4 mr-2" />
                        Partager
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Top Overlay */}
                <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                  {image.featured && (
                    <Badge className="bg-yellow-500 text-white">
                      <Sparkles className="h-3 w-3 mr-1" />
                      Coup de cœur
                    </Badge>
                  )}
                  <div className="flex gap-2">
                    <Badge variant="secondary" className="bg-black/50 text-white border-white/30">
                      {categories.find(c => c.id === image.category)?.name}
                    </Badge>
                  </div>
                </div>
                
                {/* Bottom Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <h3 className="text-white font-semibold mb-1">{image.title}</h3>
                  <div className="flex items-center gap-4 text-white/80 text-sm">
                    <div className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {image.views}
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="h-4 w-4" />
                      {image.likes + (likedImages.has(image.id) ? 1 : 0)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredImages.length === 0 && (
          <div className="text-center py-20">
            <Camera className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
            <h3 className="text-2xl font-semibold text-red-800 mb-4">Aucune photo trouvée</h3>
            <p className="text-lg text-muted-foreground mb-6">
              {searchTerm ? 'Aucune photo ne correspond à votre recherche.' : 'Aucune photo dans cette catégorie.'}
            </p>
            {(searchTerm || selectedCategory !== "tout") && (
              <Button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("tout");
                }}
                className="btn-primary"
              >
                Réinitialiser les filtres
              </Button>
            )}
          </div>
        )}
      </main>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-red-600 to-orange-600">
        <div className="container mx-auto px-4 text-center text-white">
          <h2 className="heading-primary text-white mb-6">
            Prêt à Vivre l'Expérience O'Miam ?
          </h2>
          <p className="text-xl text-white/90 max-w-2xl mx-auto mb-8">
            Réservez votre table ou commandez en ligne pour déguster nos délicieuses pizzas
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/reservation">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-red-600"
              >
                Réserver une Table
              </Button>
            </a>
            <a href="/menu">
              <Button size="lg" className="btn-primary">
                Commander en Ligne
              </Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}