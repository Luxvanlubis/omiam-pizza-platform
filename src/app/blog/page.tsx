"use client";

import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, ArrowRight, Heart, MessageCircle, Share2 } from "lucide-react";
import Image from "next/image";

// Articles de blog
const blogPosts = [
  {
    id: 1,
    title: "L'Art de la Pâte à Pizza Napolitaine",
    excerpt: "Découvrez les secrets de notre pâte à pizza traditionnelle, préparée selon les méthodes ancestrales de Naples.",
    content: "La pâte à pizza napolitaine est un art qui se transmet de génération en génération. Chez O'Miam, nous respectons scrupuleusement la tradition...",
    author: "Chef Marco Rossi",
    date: "2024-01-15",
    readTime: "5 min",
    category: "Recettes",
    image: "/images/blog/pate-pizza.jpg",
    tags: ["Pizza", "Tradition", "Naples", "Recette"],
    likes: 42,
    comments: 8,
    featured: true
  },
  {
    id: 2,
    title: "Nos Producteurs Locaux : Rencontre avec la Ferme Bio du Soleil",
    excerpt: "Portrait de nos partenaires producteurs qui nous fournissent les légumes les plus frais pour nos pizzas.",
    content: "À 20 kilomètres de Paris, la Ferme Bio du Soleil cultive avec passion les légumes qui garnissent nos pizzas...",
    author: "Marie Dubois",
    date: "2024-01-10",
    readTime: "7 min",
    category: "Partenaires",
    image: "/images/blog/ferme-bio.jpg",
    tags: ["Bio", "Local", "Producteurs", "Qualité"],
    likes: 35,
    comments: 12,
    featured: false
  },
  {
    id: 3,
    title: "Pizza et Vin : Les Accords Parfaits",
    excerpt: "Guide complet pour marier vos pizzas préférées avec les meilleurs vins italiens et français.",
    content: "L'accord mets-vins n'est pas réservé à la haute gastronomie. Nos pizzas se marient parfaitement avec une sélection de vins...",
    author: "Sommelier Antoine Laurent",
    date: "2024-01-05",
    readTime: "6 min",
    category: "Conseils",
    image: "/images/blog/pizza-vin.jpg",
    tags: ["Vin", "Accords", "Dégustation", "Conseils"],
    likes: 28,
    comments: 5,
    featured: false
  },
  {
    id: 4,
    title: "L'Histoire de la Pizza : De Naples à Paris",
    excerpt: "Voyage dans l'histoire de la pizza, de ses origines napolitaines à son arrivée dans la capitale française.",
    content: "La pizza trouve ses origines dans les rues de Naples au 18ème siècle. Découvrez comment ce plat populaire a conquis le monde...",
    author: "Historien culinaire Jean-Pierre Martin",
    date: "2023-12-28",
    readTime: "8 min",
    category: "Culture",
    image: "/images/blog/histoire-pizza.jpg",
    tags: ["Histoire", "Culture", "Naples", "Tradition"],
    likes: 51,
    comments: 15,
    featured: true
  },
  {
    id: 5,
    title: "Nos Nouvelles Pizzas Végétariennes",
    excerpt: "Découvrez notre nouvelle gamme de pizzas 100% végétariennes, créées avec des ingrédients de saison.",
    content: "Répondant à la demande croissante pour des options végétariennes, nous avons développé une gamme exclusive...",
    author: "Chef Laura Bianchi",
    date: "2023-12-20",
    readTime: "4 min",
    category: "Nouveautés",
    image: "/images/blog/pizza-vegetarienne.jpg",
    tags: ["Végétarien", "Nouveauté", "Saison", "Créativité"],
    likes: 39,
    comments: 9,
    featured: false
  },
  {
    id: 6,
    title: "Les secrets d'une Mozzarella Parfaite",
    excerpt: "Tout ce que vous devez savoir sur la mozzarella : origine, fabrication et utilisation en pizzeria.",
    content: "La mozzarella est l'âme de la pizza. Chez O'Miam, nous travaillons exclusivement avec des fromagers artisanaux...",
    author: "Fromager artisan Paul Dubois",
    date: "2023-12-15",
    readTime: "6 min",
    category: "Ingrédients",
    image: "/images/blog/mozzarella.jpg",
    tags: ["Mozzarella", "Fromage", "Artisan", "Qualité"],
    likes: 33,
    comments: 7,
    featured: false
  }
];

const categories = [
  { name: "Tous", count: blogPosts.length },
  { name: "Recettes", count: blogPosts.filter(p => p.category === "Recettes").length },
  { name: "Partenaires", count: blogPosts.filter(p => p.category === "Partenaires").length },
  { name: "Conseils", count: blogPosts.filter(p => p.category === "Conseils").length },
  { name: "Culture", count: blogPosts.filter(p => p.category === "Culture").length },
  { name: "Nouveautés", count: blogPosts.filter(p => p.category === "Nouveautés").length },
  { name: "Ingrédients", count: blogPosts.filter(p => p.category === "Ingrédients").length }
];

const featuredPosts = blogPosts.filter(post => post.featured);
const regularPosts = blogPosts.filter(post => !post.featured);

export default function BlogPage() {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
      <Header />
      
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Le <span className="text-red-600">Blog</span> O'Miam
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Découvrez l'univers de la pizza authentique, nos recettes secrètes, nos partenaires passionnés et toute l'actualité de notre pizzeria.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {categories.map((category) => (
              <Badge
                key={category.name}
                variant="outline"
                className="px-4 py-2 text-sm hover:bg-red-50 cursor-pointer"
              >
                {category.name} ({category.count})
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Posts */}
      {featuredPosts.length > 0 && (
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Articles à la Une
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {featuredPosts.map((post) => (
                <Card key={post.id} className="overflow-hidden hover:shadow-xl transition-shadow duration-300 cursor-pointer">
                  <div className="relative h-64">
                    <div className="w-full h-full bg-gradient-to-r from-red-400 to-orange-400 flex items-center justify-center">
                      <span className="text-white text-lg font-semibold">Image: {post.title}</span>
                    </div>
                    <Badge className="absolute top-4 left-4 bg-red-600 text-white">
                      À la Une
                    </Badge>
                  </div>
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary">{post.category}</Badge>
                      {post.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900 hover:text-red-600 transition-colors">
                      {post.title}
                    </CardTitle>
                    <CardDescription className="text-gray-600">
                      {post.excerpt}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          <span>{post.author}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(post.date)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{post.readTime}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Heart className="h-4 w-4" />
                          <span>{post.likes}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="h-4 w-4" />
                          <span>{post.comments}</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                        Lire la suite <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Regular Posts */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Tous nos Articles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {regularPosts.map((post) => (
              <Card key={post.id} className="hover:shadow-lg transition-shadow duration-300 cursor-pointer">
                <div className="relative h-48">
                  <div className="w-full h-full bg-gradient-to-r from-gray-200 to-gray-300 flex items-center justify-center">
                    <span className="text-gray-600 text-sm font-medium text-center px-4">
                      {post.title}
                    </span>
                  </div>
                </div>
                <CardHeader>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary" className="text-xs">{post.category}</Badge>
                    <Badge variant="outline" className="text-xs">
                      {post.tags[0]}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg font-bold text-gray-900 hover:text-red-600 transition-colors line-clamp-2">
                    {post.title}
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-600 line-clamp-3">
                    {post.excerpt}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span className="truncate">{post.author.split(' ')[0]}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDate(post.date)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{post.readTime}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        <span>{post.likes}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" />
                        <span>{post.comments}</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 text-xs">
                      Lire <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Subscription */}
      <section className="py-16 px-4 bg-red-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Restez Informé
          </h2>
          <p className="text-xl text-red-100 mb-8">
            Abonnez-vous à notre newsletter pour recevoir nos derniers articles, recettes exclusives et offres spéciales directement dans votre boîte mail.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Votre adresse email"
              className="flex-1 px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-white focus:outline-none"
            />
            <Button
              size="lg"
              className="bg-white text-red-600 hover:bg-gray-100 px-8 py-3 font-semibold"
            >
              S'abonner
            </Button>
          </div>
          <p className="text-sm text-red-200 mt-4">
            Pas de spam, désabonnement possible à tout moment.
          </p>
        </div>
      </section>

      {/* Social Sharing */}
      <section className="py-8 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Partagez nos Articles
          </h3>
          <div className="flex justify-center gap-4">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Share2 className="h-4 w-4" />
              Facebook
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Share2 className="h-4 w-4" />
              Twitter
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Share2 className="h-4 w-4" />
              Instagram
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}