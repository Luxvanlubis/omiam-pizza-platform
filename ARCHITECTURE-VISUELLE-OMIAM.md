# 🏗️ ARCHITECTURE VISUELLE - O'MIAM PIZZERIA
*Diagrammes et Schémas du Système Complet*

---

## 🎯 VUE D'ENSEMBLE SYSTÈME

```mermaid
graph TB
    subgraph "🌐 Frontend (Next.js 14)"
        A["🏠 Page Accueil"] --> B["🍕 Menu Pizzas"]
        B --> C["🛒 Panier"]
        C --> D["💳 Checkout"]
        D --> E["📱 Suivi Commande"]
        
        F["👤 Authentification"] --> G["👨‍💼 Profil Client"]
        G --> H["🎁 Programme Fidélité"]
        
        I["🔧 Admin Dashboard"] --> J["📊 Analytics"]
        I --> K["📦 Gestion Stocks"]
        I --> L["🍕 Gestion Menu"]
    end
    
    subgraph "⚡ API Layer (Next.js API Routes)"
        M["🔐 Auth API"]
        N["🛒 Orders API"]
        O["🍕 Products API"]
        P["💳 Payments API"]
        Q["📱 Notifications API"]
    end
    
    subgraph "🗄️ Base de Données (Supabase)"
        R[("👥 Users")]
        S[("🍕 Products")]
        T[("📋 Orders")]
        U[("🎁 Loyalty")]
        V[("📱 Notifications")]
    end
    
    subgraph "🔌 Services Externes"
        W["💳 Stripe"]
        X["📧 Email Service"]
        Y["📱 Push Notifications"]
    end
    
    A --> M
    B --> O
    C --> N
    D --> P
    E --> Q
    
    M --> R
    N --> T
    O --> S
    P --> W
    Q --> V
    
    P --> X
    Q --> Y
```

---

## 🍕 MODÈLE DE DONNÉES PIZZERIA

```mermaid
erDiagram
    USERS {
        uuid id PK
        string email UK
        string full_name
        string phone
        text address
        integer loyalty_points
        timestamp created_at
        timestamp updated_at
    }
    
    PRODUCTS {
        uuid id PK
        string name
        text description
        decimal price
        string category
        string image_url
        text_array ingredients
        text_array allergens
        boolean available
        timestamp created_at
        timestamp updated_at
    }
    
    ORDERS {
        uuid id PK
        uuid user_id FK
        string order_number UK
        string status
        decimal total_amount
        text delivery_address
        string phone
        text notes
        timestamp estimated_delivery
        timestamp created_at
        timestamp updated_at
    }
    
    ORDER_ITEMS {
        uuid id PK
        uuid order_id FK
        uuid product_id FK
        integer quantity
        decimal unit_price
        decimal total_price
        json customizations
        timestamp created_at
    }
    
    LOYALTY_TRANSACTIONS {
        uuid id PK
        uuid user_id FK
        uuid order_id FK
        integer points
        string transaction_type
        text description
        timestamp created_at
    }
    
    REVIEWS {
        uuid id PK
        uuid user_id FK
        uuid product_id FK
        uuid order_id FK
        integer rating
        text comment
        timestamp created_at
    }
    
    NOTIFICATIONS {
        uuid id PK
        uuid user_id FK
        string title
        text message
        string type
        boolean read
        json data
        timestamp created_at
    }
    
    INVENTORY_ITEMS {
        uuid id PK
        string name
        string sku UK
        string category
        string unit
        integer current_stock
        integer min_stock
        decimal cost_price
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }
    
    RESERVATIONS {
        uuid id PK
        uuid user_id FK
        string customer_name
        string customer_phone
        integer party_size
        datetime reservation_time
        string status
        text notes
        timestamp created_at
    }
    
    %% Relations
    USERS ||--o{ ORDERS : "passe"
    USERS ||--o{ LOYALTY_TRANSACTIONS : "gagne/dépense"
    USERS ||--o{ REVIEWS : "écrit"
    USERS ||--o{ NOTIFICATIONS : "reçoit"
    USERS ||--o{ RESERVATIONS : "réserve"
    
    ORDERS ||--o{ ORDER_ITEMS : "contient"
    ORDERS ||--o{ LOYALTY_TRANSACTIONS : "génère"
    ORDERS ||--o{ REVIEWS : "peut_être_évalué"
    
    PRODUCTS ||--o{ ORDER_ITEMS : "commandé_dans"
    PRODUCTS ||--o{ REVIEWS : "évalué_par"
```

---

## 🔄 FLUX DE COMMANDE

```mermaid
sequenceDiagram
    participant C as 👤 Client
    participant F as 🌐 Frontend
    participant A as ⚡ API
    participant D as 🗄️ Database
    participant S as 💳 Stripe
    participant N as 📱 Notifications
    participant R as 🍕 Restaurant
    
    C->>F: 1. Parcourt le menu
    F->>A: 2. GET /api/products
    A->>D: 3. Récupère produits
    D-->>A: 4. Liste pizzas
    A-->>F: 5. Produits disponibles
    F-->>C: 6. Affiche menu
    
    C->>F: 7. Ajoute pizzas au panier
    F->>F: 8. Gestion état local
    
    C->>F: 9. Procède au checkout
    F->>A: 10. POST /api/orders
    A->>D: 11. Crée commande (PENDING)
    
    A->>S: 12. Crée Payment Intent
    S-->>A: 13. Client Secret
    A-->>F: 14. Données paiement
    
    F->>S: 15. Confirme paiement
    S->>A: 16. Webhook paiement réussi
    A->>D: 17. Met à jour commande (CONFIRMED)
    
    A->>N: 18. Envoie notification client
    N-->>C: 19. "Commande confirmée"
    
    A->>N: 20. Notifie restaurant
    N-->>R: 21. "Nouvelle commande"
    
    R->>A: 22. Met à jour statut (PREPARING)
    A->>D: 23. Sauvegarde statut
    A->>N: 24. Notifie client
    N-->>C: 25. "Pizza en préparation"
    
    R->>A: 26. Commande prête (READY)
    A->>D: 27. Met à jour statut
    A->>N: 28. Notifie client
    N-->>C: 29. "Commande prête!"
    
    R->>A: 30. Commande livrée (DELIVERED)
    A->>D: 31. Finalise commande
    A->>D: 32. Ajoute points fidélité
    A->>N: 33. Demande avis
    N-->>C: 34. "Évaluez votre commande"
```

---

## 🎁 SYSTÈME DE FIDÉLITÉ

```mermaid
flowchart TD
    A["👤 Nouveau Client"] --> B["📝 Inscription"]
    B --> C["🎁 +50 Points Bonus"]
    
    D["🛒 Commande"] --> E["💰 Montant Total"]
    E --> F["🔢 1 Point = 1€"]
    F --> G["➕ Ajouter Points"]
    
    H["👥 Parrainage"] --> I["🎉 +100 Points"]
    I --> J["👫 Pour les 2 clients"]
    
    G --> K{"💎 Seuil Atteint?"}
    K -->|25 Points| L["🥤 Boisson Gratuite"]
    K -->|50 Points| M["🍰 Dessert Offert"]
    K -->|100 Points| N["🍕 Pizza Gratuite"]
    
    L --> O["📱 Notification Récompense"]
    M --> O
    N --> O
    
    O --> P["🎫 Code Promo Généré"]
    P --> Q["⏰ Valide 30 jours"]
    
    style C fill:#4CAF50
    style I fill:#FF9800
    style L fill:#2196F3
    style M fill:#9C27B0
    style N fill:#F44336
```

---

## 🔧 ARCHITECTURE ADMIN

```mermaid
graph LR
    subgraph "👨‍💼 Interface Admin"
        A["📊 Dashboard"]
        B["📋 Gestion Commandes"]
        C["🍕 Gestion Menu"]
        D["📦 Gestion Stocks"]
        E["👥 Gestion Clients"]
        F["📈 Analytics"]
        G["⚙️ Paramètres"]
    end
    
    subgraph "📊 Métriques Temps Réel"
        H["💰 CA Journalier"]
        I["📋 Commandes Actives"]
        J["⭐ Satisfaction Client"]
        K["📦 Alertes Stock"]
        L["🎯 Objectifs"]
    end
    
    subgraph "🔔 Notifications Admin"
        M["🆕 Nouvelle Commande"]
        N["⚠️ Stock Faible"]
        O["💳 Paiement Échoué"]
        P["⭐ Nouvel Avis"]
        Q["📱 Problème Technique"]
    end
    
    A --> H
    A --> I
    A --> J
    
    B --> M
    D --> N
    E --> P
    
    F --> L
    G --> Q
    
    style A fill:#1976D2
    style H fill:#4CAF50
    style M fill:#FF5722
```

---

## 📱 NOTIFICATIONS SYSTÈME

```mermaid
stateDiagram-v2
    [*] --> Commande_Créée
    
    Commande_Créée --> Paiement_En_Cours : Checkout initié
    Paiement_En_Cours --> Commande_Confirmée : Paiement réussi
    Paiement_En_Cours --> Paiement_Échoué : Erreur paiement
    
    Commande_Confirmée --> En_Préparation : Restaurant accepte
    En_Préparation --> Prête : Préparation terminée
    Prête --> En_Livraison : Livreur parti
    En_Livraison --> Livrée : Client reçoit
    
    Livrée --> Avis_Demandé : 30min après livraison
    Avis_Demandé --> Points_Ajoutés : Avis soumis
    
    Paiement_Échoué --> [*]
    Points_Ajoutés --> [*]
    
    note right of Commande_Confirmée
        📧 Email confirmation
        📱 Push notification
        💬 SMS si urgent
    end note
    
    note right of En_Préparation
        📱 "Votre pizza est en préparation"
        ⏰ Temps estimé: 15-20min
    end note
    
    note right of Prête
        📱 "Votre commande est prête!"
        📍 Adresse de retrait
    end note
    
    note right of Livrée
        📱 "Commande livrée"
        🎁 Points fidélité ajoutés
        ⭐ Demande d'avis
    end note
```

---

## 🔒 SÉCURITÉ ET CONFORMITÉ

```mermaid
graph TB
    subgraph "🛡️ Sécurité Frontend"
        A["🔐 Authentification"]
        B["🍪 Gestion Cookies"]
        C["🔒 HTTPS Forcé"]
        D["🛡️ CSP Headers"]
    end
    
    subgraph "⚡ Sécurité API"
        E["🚦 Rate Limiting"]
        F["✅ Validation Zod"]
        G["🔑 JWT Tokens"]
        H["🛡️ CORS Policy"]
    end
    
    subgraph "🗄️ Sécurité Database"
        I["🔒 Row Level Security"]
        J["🔐 Chiffrement"]
        K["👥 Rôles Utilisateurs"]
        L["📝 Audit Logs"]
    end
    
    subgraph "📋 Conformité RGPD"
        M["🍪 Consentement"]
        N["📄 Politique Confidentialité"]
        O["🗑️ Droit à l'Oubli"]
        P["📦 Portabilité Données"]
    end
    
    A --> G
    B --> M
    E --> F
    I --> K
    
    style A fill:#4CAF50
    style E fill:#FF9800
    style I fill:#2196F3
    style M fill:#9C27B0
```

---

## 🚀 DÉPLOIEMENT ET INFRASTRUCTURE

```mermaid
graph TB
    subgraph "🌐 CDN & Edge"
        A["☁️ Cloudflare"]
        B["🚀 Vercel Edge"]
    end
    
    subgraph "🖥️ Frontend"
        C["⚡ Vercel"]
        D["📱 Next.js App"]
    end
    
    subgraph "🗄️ Backend Services"
        E["🐘 Supabase"]
        F["💳 Stripe"]
        G["📧 SendGrid"]
        H["📱 Firebase FCM"]
    end
    
    subgraph "📊 Monitoring"
        I["🐛 Sentry"]
        J["📈 Vercel Analytics"]
        K["⚡ Lighthouse CI"]
    end
    
    A --> C
    B --> C
    C --> D
    
    D --> E
    D --> F
    D --> G
    D --> H
    
    C --> I
    C --> J
    C --> K
    
    style C fill:#000000,color:#ffffff
    style E fill:#3ECF8E
    style F fill:#635BFF,color:#ffffff
    style I fill:#362D59,color:#ffffff
```

---

## 📈 MÉTRIQUES ET KPI

```mermaid
pie title Répartition du Chiffre d'Affaires
    "🍕 Pizzas" : 65
    "🥗 Salades" : 15
    "🍰 Desserts" : 12
    "🥤 Boissons" : 8
```

```mermaid
xychart-beta
    title "📊 Évolution des Commandes (7 derniers jours)"
    x-axis [Lun, Mar, Mer, Jeu, Ven, Sam, Dim]
    y-axis "Nombre de commandes" 0 --> 50
    bar [25, 32, 28, 35, 42, 48, 38]
```

---

## 🎯 CONCLUSION ARCHITECTURE

### ✅ **Points Forts de l'Architecture**

1. **🏗️ Scalabilité** - Architecture microservices prête pour la croissance
2. **🔒 Sécurité** - Sécurité multi-niveaux avec RLS et validation
3. **⚡ Performance** - Optimisations Next.js et caching intelligent
4. **📱 Temps Réel** - Notifications et mises à jour instantanées
5. **🔧 Maintenabilité** - Code structuré et documenté

### 🚀 **Prêt pour Production**

Cette architecture représente un **système complet et robuste** pour une pizzeria moderne, intégrant toutes les fonctionnalités nécessaires pour une expérience client exceptionnelle et une gestion efficace du restaurant.

---

*Architecture conçue pour O'Miam Pizzeria Guingamp* 🍕🏗️