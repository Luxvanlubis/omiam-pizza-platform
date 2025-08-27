// Configuration centralisée des informations de contact O'Miam Guingamp

interface DaySchedule { open: boolean; message?: string; lunch?: string; dinner?: string; special?: string;
}

interface DetailedHours { monday: DaySchedule; tuesday: DaySchedule; wednesday: DaySchedule; thursday: DaySchedule; friday: DaySchedule; saturday: DaySchedule; sunday: DaySchedule;
}

export const CONTACT_INFO: { restaurant: { name: string; tagline: string; description: string; }; address: { street: string; city: string; postalCode: string; country: string; region: string; full: string; }; contact: { phone: string; email: string; website: string; }; hours: { display: string; detailed: DetailedHours; }; social: any; delivery: any; seo: any;
} = { restaurant: { name: "O'Miam", tagline: "Pizzeria artisanale au feu de bois", description: "Découvrez nos pizzas artisanales cuites au feu de bois avec des ingrédients frais et de qualité. Une expérience culinaire authentique au cœur de Guingamp depuis janvier 2021." }, address: { street: "12 Rue des Ponts Saint-Michel", city: "Guingamp", postalCode: "22200", country: "France", region: "Bretagne", full: "12 Rue des Ponts Saint-Michel, 22200 Guingamp, France" }, contact: { phone: "+33 2 96 14 61 53", email: "contact@omiam-guingamp.fr", website: "https://omiam-guingamp.fr" }, hours: { display: "Mar-Ven: 11h30-14h, 18h30-22h\nSam-Dim: 11h30-14h30, 18h30-22h30\nLundi: Fermé", detailed: { monday: { open: false, message: "Fermé" }, tuesday: { open: true, lunch: "11h30-14h00", dinner: "18h30-22h00" }, wednesday: { open: true, lunch: "11h30-14h00", dinner: "18h30-22h00" }, thursday: { open: true, lunch: "11h30-14h00", dinner: "18h30-22h00" }, friday: { open: true, lunch: "11h30-14h00", dinner: "18h30-22h00", special: "Couscous" }, saturday: { open: true, lunch: "11h30-14h30", dinner: "18h30-22h30", special: "Couscous" }, sunday: { open: true, lunch: "11h30-14h30", dinner: "18h30-22h30", special: "Couscous" } } }, social: { facebook: { url: "https://www.facebook.com/omiamguingamp", handle: "@omiamguingamp", active: true }, instagram: { url: "https://www.instagram.com/omiam_guingamp", handle: "@omiam_guingamp", active: true }, tripadvisor: { url: "https://www.tripadvisor.fr/Restaurant_Review-g1075553-d78-Reviews-O_Miam-Guingamp_Cotes_d_Armor_Brittany.html", active: true }, google: { url: "https://g.page/omiam-guingamp", active: true } }, delivery: { channels: { deliveroo: { name: "Deliveroo", url: "https://deliveroo.fr/fr/menu/guingamp/omiam", zones: ["Guingamp", "Ploumagoar", "Grâces"], active: true }, coopcycle: { name: "CoopCycle Breizh Vélo", url: "https://coopcycle.org/fr/", zones: ["Guingamp centre"], active: true, note: "Livraison locale écologique" }, ubereats: { name: "Uber Eats (LOST O'Miam)", zones: ["Guingamp"], active: true } }, antiWaste: { tooGoodToGo: { price: 3.99, value: 12, description: "Panier surprise : pizzas, couscous, salades, desserts", packaging: 0.50 } } }, seo: { words: ["pizza", "pizzeria", "guingamp", "italien", "livraison", "côtes d'armor", "bretagne"], description: "O'Miam, pizzeria italienne authentique à Guingamp. Pizzas artisanales, produits frais, livraison et à emporter. Ouvert du mardi au dimanche." }
};

// Utilitaires pour formater les informations
export const formatters = {
  fullAddress: () => CONTACT_INFO.address.full,
  phoneLink: () => `tel:${CONTACT_INFO.contact.phone.replace(/\s/g, '')}`,
  emailLink: () => `mailto:${CONTACT_INFO.contact.email}`,
  googleMapsLink: () => `https://maps.google.com/?q=${encodeURIComponent(CONTACT_INFO.address.full)}`,
  wazeLink: () => `https://waze.com/ul?q=${encodeURIComponent(CONTACT_INFO.address.full)}`,
  // Formatage des prix
  price: (price: number) => `${price.toFixed(2)}€`,
  // Formatage pour les réseaux sociaux
  socialShareText: () => `Découvrez ${CONTACT_INFO.restaurant.name}, ${CONTACT_INFO.restaurant.tagline} ! 🍕✨`,
  // Données structurées JSON-LD
  jsonLD: () => ({
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "name": CONTACT_INFO.restaurant.name,
    "description": CONTACT_INFO.seo.description,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": CONTACT_INFO.address.street,
      "addressLocality": CONTACT_INFO.address.city,
      "postalCode": CONTACT_INFO.address.postalCode,
      "addressCountry": "FR"
    },
    "telephone": CONTACT_INFO.contact.phone,
    "email": CONTACT_INFO.contact.email,
    "url": CONTACT_INFO.contact.website,
    "servesCuisine": "Italian",
    "priceRange": "€€",
    "openingHours": [
      "Tu-Fr 11:30-14:00",
      "Tu-Fr 18:30-22:00",
      "Sa-Su 11:30-14:30",
      "Sa-Su 18:30-22:30"
    ]
  })
};