/**
 * 🔍 Système SEO Avancé O'Miam
 * Optimisation complète pour le référencement naturel
 */

import { Metadata } from 'next';

// =============================================================================
// 📊 INTERFACES & TYPES
// =============================================================================

export interface SEOConfig {
  title: string;
  description: string;
  keywords?: string[];
  canonical?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'product' | 'restaurant';
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
  structuredData?: any;
  noIndex?: boolean;
  noFollow?: boolean;
}

export interface RestaurantSEO {
  name: string;
  description: string;
  address: {
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
  phone: string;
  email: string;
  website: string;
  openingHours: string[];
  priceRange: string;
  cuisine: string[];
  rating?: {
    value: number;
    count: number;
  };
}

export interface ProductSEO {
  name: string;
  description: string;
  price: number;
  currency: string;
  availability: 'InStock' | 'OutOfStock' | 'PreOrder';
  category: string;
  image: string;
  ingredients?: string[];
  nutrition?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
}

// =============================================================================
// 🏪 CONFIGURATION RESTAURANT
// =============================================================================

export const RESTAURANT_INFO: RestaurantSEO = {
  name: "O'Miam",
  description: "Restaurant gastronomique moderne proposant une cuisine créative et des plats authentiques dans une ambiance chaleureuse.",
  address: {
    street: "123 Rue de la Gastronomie",
    city: "Paris",
    postalCode: "75001",
    country: "France"
  },
  phone: "+33 1 23 45 67 89",
  email: "contact@omiam.fr",
  website: "https://omiam.fr",
  openingHours: [
    "Mo-Th 11:30-14:30,18:30-22:30",
    "Fr-Sa 11:30-14:30,18:30-23:00",
    "Su 11:30-14:30,18:30-22:00"
  ],
  priceRange: "€€€",
  cuisine: ["Française", "Méditerranéenne", "Moderne"],
  rating: {
    value: 4.8,
    count: 247
  }
};

// =============================================================================
// 🎯 GÉNÉRATEUR DE MÉTADONNÉES
// =============================================================================

export class SEOGenerator {
  private static baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://omiam.fr';
  private static siteName = "O'Miam";
  private static defaultImage = '/images/og-default.jpg';

  /**
   * 📄 Génère les métadonnées pour une page
   */
  static generateMetadata(config: SEOConfig): Metadata {
    const {
      title,
      description,
      keywords = [],
      canonical,
      ogImage = this.defaultImage,
      ogType = 'website',
      twitterCard = 'summary_large_image',
      noIndex = false,
      noFollow = false
    } = config;

    const fullTitle = title.includes(this.siteName) ? title : `${title} | ${this.siteName}`;
    const canonicalUrl = canonical || this.baseUrl;
    const imageUrl = ogImage.startsWith('http') ? ogImage : `${this.baseUrl}${ogImage}`;

    return {
      title: fullTitle,
      description,
      keywords: keywords.join(', '),
      robots: {
        index: !noIndex,
        follow: !noFollow,
        googleBot: {
          index: !noIndex,
          follow: !noFollow,
          'max-video-preview': -1,
          'max-image-preview': 'large',
          'max-snippet': -1,
        },
      },
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title: fullTitle,
        description,
        url: canonicalUrl,
        siteName: this.siteName,
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: title,
          },
        ],
        locale: 'fr_FR',
        type: ogType,
      },
      twitter: {
        card: twitterCard,
        title: fullTitle,
        description,
        images: [imageUrl],
        creator: '@omiam_restaurant',
        site: '@omiam_restaurant',
      },
      other: {
        'apple-mobile-web-app-title': this.siteName,
        'application-name': this.siteName,
        'msapplication-TileColor': '#ff6b35',
        'theme-color': '#ff6b35',
      },
    };
  }

  /**
   * 🏪 Génère les données structurées pour le restaurant
   */
  static generateRestaurantStructuredData(): any {
    const restaurant = RESTAURANT_INFO;
    
    return {
      '@context': 'https://schema.org',
      '@type': 'Restaurant',
      name: restaurant.name,
      description: restaurant.description,
      url: restaurant.website,
      telephone: restaurant.phone,
      email: restaurant.email,
      address: {
        '@type': 'PostalAddress',
        streetAddress: restaurant.address.street,
        addressLocality: restaurant.address.city,
        postalCode: restaurant.address.postalCode,
        addressCountry: restaurant.address.country,
      },
      openingHoursSpecification: restaurant.openingHours.map(hours => ({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: this.parseDayOfWeek(hours),
        opens: this.parseOpenTime(hours),
        closes: this.parseCloseTime(hours),
      })),
      priceRange: restaurant.priceRange,
      servesCuisine: restaurant.cuisine,
      aggregateRating: restaurant.rating ? {
        '@type': 'AggregateRating',
        ratingValue: restaurant.rating.value,
        reviewCount: restaurant.rating.count,
        bestRating: 5,
        worstRating: 1,
      } : undefined,
      hasMenu: `${this.baseUrl}/menu`,
      acceptsReservations: true,
      paymentAccepted: ['Cash', 'Credit Card', 'Debit Card'],
      currenciesAccepted: 'EUR',
    };
  }

  /**
   * 🍕 Génère les données structurées pour un produit/plat
   */
  static generateProductStructuredData(product: ProductSEO): any {
    return {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: product.description,
      image: product.image.startsWith('http') ? product.image : `${this.baseUrl}${product.image}`,
      category: product.category,
      offers: {
        '@type': 'Offer',
        price: product.price,
        priceCurrency: product.currency,
        availability: `https://schema.org/${product.availability}`,
        seller: {
          '@type': 'Restaurant',
          name: RESTAURANT_INFO.name,
        },
      },
      nutrition: product.nutrition ? {
        '@type': 'NutritionInformation',
        calories: `${product.nutrition.calories} calories`,
        proteinContent: `${product.nutrition.protein}g`,
        carbohydrateContent: `${product.nutrition.carbs}g`,
        fatContent: `${product.nutrition.fat}g`,
      } : undefined,
      recipeIngredient: product.ingredients,
    };
  }

  /**
   * 📰 Génère les données structurées pour un article/blog
   */
  static generateArticleStructuredData(article: {
    title: string;
    description: string;
    author: string;
    publishedDate: string;
    modifiedDate?: string;
    image: string;
    category: string;
  }): any {
    return {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: article.title,
      description: article.description,
      image: article.image.startsWith('http') ? article.image : `${this.baseUrl}${article.image}`,
      author: {
        '@type': 'Person',
        name: article.author,
      },
      publisher: {
        '@type': 'Organization',
        name: RESTAURANT_INFO.name,
        logo: {
          '@type': 'ImageObject',
          url: `${this.baseUrl}/images/logo.png`,
        },
      },
      datePublished: article.publishedDate,
      dateModified: article.modifiedDate || article.publishedDate,
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': this.baseUrl,
      },
      articleSection: article.category,
    };
  }

  /**
   * 🔧 Utilitaires pour parser les horaires
   */
  private static parseDayOfWeek(hours: string): string[] {
    const dayMap: { [key: string]: string } = {
      'Mo': 'Monday',
      'Tu': 'Tuesday', 
      'We': 'Wednesday',
      'Th': 'Thursday',
      'Fr': 'Friday',
      'Sa': 'Saturday',
      'Su': 'Sunday'
    };
    
    const dayRange = hours.split(' ')[0];
    if (dayRange.includes('-')) {
      const [start, end] = dayRange.split('-');
      const days = Object.keys(dayMap);
      const startIndex = days.indexOf(start);
      const endIndex = days.indexOf(end);
      return days.slice(startIndex, endIndex + 1).map(day => dayMap[day]);
    }
    
    return [dayMap[dayRange]];
  }

  private static parseOpenTime(hours: string): string {
    const timeRange = hours.split(' ')[1];
    return timeRange.split(',')[0].split('-')[0];
  }

  private static parseCloseTime(hours: string): string {
    const timeRange = hours.split(' ')[1];
    const ranges = timeRange.split(',');
    return ranges[ranges.length - 1].split('-')[1];
  }
}

// =============================================================================
// 🎯 CONFIGURATIONS SEO PRÉDÉFINIES
// =============================================================================

export const SEO_CONFIGS = {
  home: {
    title: "O'Miam - Restaurant Gastronomique à Paris",
    description: "Découvrez O'Miam, restaurant gastronomique parisien proposant une cuisine créative et authentique. Réservez votre table dès maintenant!",
    keywords: ['restaurant paris', 'gastronomie', 'cuisine française', 'réservation restaurant', 'omiam'],
    ogType: 'website' as const,
  },
  
  menu: {
    title: "Notre Carte - O'Miam",
    description: "Explorez notre carte variée : entrées raffinées, plats signatures et desserts gourmands. Cuisine française moderne avec des ingrédients de saison.",
    keywords: ['carte restaurant', 'menu omiam', 'plats français', 'cuisine gastronomique', 'paris'],
    ogType: 'website' as const,
  },
  
  reservation: {
    title: "Réservation - O'Miam",
    description: "Réservez votre table au restaurant O'Miam. Service en ligne simple et rapide. Disponibilités en temps réel.",
    keywords: ['réservation restaurant', 'table omiam', 'booking restaurant paris'],
    ogType: 'website' as const,
  },
  
  contact: {
    title: "Contact & Localisation - O'Miam",
    description: "Contactez le restaurant O'Miam. Adresse, téléphone, horaires d'ouverture et plan d'accès. Nous sommes à votre disposition.",
    keywords: ['contact omiam', 'adresse restaurant', 'téléphone restaurant', 'horaires'],
    ogType: 'website' as const,
  },
};

// =============================================================================
// 🚀 HOOK REACT POUR SEO
// =============================================================================

export function useSEO(config: SEOConfig) {
  const metadata = SEOGenerator.generateMetadata(config);
  
  // Injection des données structurées
  if (config.structuredData && typeof window !== 'undefined') {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(config.structuredData);
    document.head.appendChild(script);
    
    return () => {
      document.head.removeChild(script);
    };
  }
  
  return metadata;
}

// =============================================================================
// 📊 ANALYTICS & TRACKING
// =============================================================================

export class SEOAnalytics {
  /**
   * 📈 Track page view pour SEO
   */
  static trackPageView(page: string, title: string) {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('config', process.env.NEXT_PUBLIC_GA_ID, {
        page_title: title,
        page_location: window.location.href,
      });
    }
  }
  
  /**
   * 🎯 Track événement SEO
   */
  static trackSEOEvent(action: string, category: string, label?: string) {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', action, {
        event_category: category,
        event_label: label,
      });
    }
  }
}

console.log('🔍 Système SEO O\'Miam initialisé');