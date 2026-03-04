# L'ArtPéro - Plateforme de Networking Artistique

Une application web complète pour la gestion d'événements de networking artistique, avec système de billetterie, abonnements et boutique en ligne.

## URLs de Production

| Service | URL |
|---------|-----|
| **Site web** | https://lartpero.ainspiration.eu |
| **API** | https://api-lartpero.ainspiration.eu |

## Architecture

```
lartpero2/
├── src/                    # Frontend React (Vite + TypeScript)
│   ├── components/         # Composants UI réutilisables
│   │   ├── ui/            # Composants shadcn/ui
│   │   ├── Header.tsx     # Navigation principale
│   │   ├── Footer.tsx     # Pied de page
│   │   └── ProtectedRoute.tsx  # Protection des routes
│   ├── contexts/           # Contextes React
│   │   └── AuthContext.tsx # Gestion de l'authentification
│   ├── lib/                # Utilitaires
│   │   ├── api.ts         # Client API
│   │   └── utils.ts       # Fonctions utilitaires
│   └── pages/              # Pages de l'application
│       ├── admin/          # Dashboard administrateur
│       └── members/        # Espace membre
├── server/                 # Backend Express.js
│   ├── src/
│   │   ├── routes/         # Routes API
│   │   │   ├── auth.ts    # Authentification
│   │   │   ├── events.ts  # Événements
│   │   │   ├── products.ts # Produits
│   │   │   ├── orders.ts  # Commandes
│   │   │   ├── members.ts # Espace membre
│   │   │   ├── admin.ts   # Administration
│   │   │   ├── messages.ts # Contact
│   │   │   └── webhook.ts # Webhooks Stripe
│   │   ├── middleware/
│   │   │   └── auth.ts    # Middleware JWT
│   │   └── index.ts       # Point d'entrée serveur
│   └── prisma/
│       └── schema.prisma  # Schéma base de données
├── docker-compose.yml      # Configuration Docker production
└── Dockerfile.*           # Dockerfiles frontend/backend
```

## Stack Technique

### Frontend
| Technologie | Version | Usage |
|-------------|---------|-------|
| React | 18.3 | Framework UI |
| TypeScript | 5.5 | Typage statique |
| Vite | 5.4 | Build tool |
| Tailwind CSS | 3.4 | Styling |
| Radix UI | - | Composants accessibles |
| React Router | 7.9 | Navigation |
| React Hook Form | 7.53 | Formulaires |
| Zod | 3.23 | Validation |
| Recharts | 2.12 | Graphiques |
| Lucide React | 0.446 | Icônes |

### Backend
| Technologie | Version | Usage |
|-------------|---------|-------|
| Node.js | 18+ | Runtime |
| Express.js | 4.21 | Framework HTTP |
| TypeScript | 5.6 | Typage statique |
| Prisma | 5.22 | ORM |
| PostgreSQL | 15+ | Base de données |
| JWT | 9.0 | Authentification |
| bcryptjs | 2.4 | Hashage |
| Stripe | 17.3 | Paiements |

### Déploiement
| Technologie | Usage |
|-------------|-------|
| Docker | Conteneurisation |
| Docker Compose | Orchestration |
| Traefik | Reverse proxy + SSL |
| Let's Encrypt | Certificats SSL |
| Hostinger VPS | Hébergement |

## Installation Locale

### Prérequis
- Node.js 18+
- PostgreSQL 15+ (ou Docker)
- Compte Stripe (pour les paiements)

### 1. Cloner et installer

```bash
git clone <repo-url>
cd lartpero2

# Frontend
npm install

# Backend
cd server
npm install
```

### 2. Configuration

**`server/.env`**
```env
DATABASE_URL="postgresql://user:password@localhost:5432/lartpero"
JWT_SECRET="votre-secret-jwt-securise-minimum-32-caracteres"
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
FRONTEND_URL="http://localhost:5173"
ALLOWED_ORIGINS="http://localhost:5173"
PORT=3001
```

**`.env`** (racine du projet)
```env
VITE_API_URL="http://localhost:3001/api"
```

### 3. Base de données

```bash
cd server

# Générer le client Prisma
npm run db:generate

# Créer les tables
npm run db:push

# (Optionnel) Données de test
npm run db:seed
```

### 4. Lancer le projet

```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
npm run dev
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| API | http://localhost:3001 |

## Structure de la Base de Données

### Modèles principaux

```prisma
// Utilisateurs
User          # Comptes utilisateurs (email, password, role)
Session       # Sessions JWT actives
Membership    # Abonnements Stripe

// Événements
Event              # Événements
EventRegistration  # Inscriptions (commandes)
Ticket             # Billets générés après paiement

// Produits
Product       # Abonnements, cartes cadeaux
ProductOrder  # Commandes de produits

// Paiements
Payment       # Historique des transactions

// Contenu
Message       # Messages de contact
Testimonial   # Témoignages
TeamMember    # Équipe
```

### Énumérations

| Enum | Valeurs |
|------|---------|
| `Role` | `MEMBER`, `ADMIN` |
| `MembershipStatus` | `NONE`, `ACTIVE`, `CANCELED`, `PAST_DUE` |
| `EventStatus` | `DRAFT`, `PUBLISHED` |
| `RegistrationStatus` | `PENDING`, `PAID`, `CANCELED` |
| `PaymentStatus` | `PENDING`, `PAID`, `FAILED`, `REFUNDED` |
| `ProductCategory` | `SUBSCRIPTION`, `ENTRY`, `GIFT_CARD` |

## API Endpoints

### Authentification (`/api/auth`)

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| `POST` | `/register` | Inscription | - |
| `POST` | `/login` | Connexion | - |
| `GET` | `/me` | Profil utilisateur | ✓ |
| `PUT` | `/profile` | Modifier profil | ✓ |

### Événements (`/api/events`)

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| `GET` | `/` | Liste des événements publiés | - |
| `GET` | `/:slug` | Détails d'un événement | - |
| `POST` | `/:id/register` | S'inscrire à un événement | ✓ |

### Produits (`/api/products`)

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| `GET` | `/` | Liste des produits | - |
| `GET` | `/:slug` | Détails d'un produit | - |
| `POST` | `/checkout` | Créer une session Stripe | ✓ |
| `POST` | `/verify-payment` | Vérifier le paiement | ✓ |
| `GET` | `/orders` | Historique des commandes | ✓ |

### Commandes (`/api/orders`)

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| `GET` | `/:orderId` | Détails d'une commande | ✓ |
| `POST` | `/:orderId/checkout` | Session Stripe événement | ✓ |
| `POST` | `/:orderId/verify` | Vérifier le paiement | ✓ |

### Membres (`/api/members`)

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| `GET` | `/membership` | Statut de l'abonnement | ✓ |
| `GET` | `/tickets` | Mes billets | ✓ |
| `GET` | `/registrations` | Mes inscriptions | ✓ |
| `GET` | `/payments` | Historique paiements | ✓ |
| `POST` | `/redeem-gift` | Utiliser un code cadeau | ✓ |

### Messages (`/api/messages`)

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| `POST` | `/` | Envoyer un message | - |
| `GET` | `/testimonials` | Témoignages publics | - |
| `GET` | `/team` | Équipe publique | - |

### Admin (`/api/admin`)

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| `GET` | `/dashboard` | Statistiques | Admin |
| `GET` | `/members` | Liste des membres | Admin |
| `GET` | `/events` | Tous les événements | Admin |
| `POST` | `/events` | Créer un événement | Admin |
| `PUT` | `/events/:id` | Modifier un événement | Admin |
| `DELETE` | `/events/:id` | Supprimer un événement | Admin |
| `GET` | `/products` | Tous les produits | Admin |
| `POST` | `/products` | Créer un produit | Admin |
| `PUT` | `/products/:id` | Modifier un produit | Admin |
| `DELETE` | `/products/:id` | Supprimer un produit | Admin |
| `GET` | `/payments` | Historique paiements | Admin |
| `GET` | `/messages` | Messages reçus | Admin |

### Webhook (`/api/webhook`)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `POST` | `/stripe` | Webhook Stripe |

## Pages de l'Application

### Pages Publiques
| Route | Page |
|-------|------|
| `/` | Accueil |
| `/notre-histoire` | À propos |
| `/evenements` | Liste des événements |
| `/evenements/:slug` | Détail événement |
| `/boutique` | Produits et abonnements |
| `/contact` | Formulaire de contact |
| `/connexion` | Connexion/Inscription |
| `/devenir-membre` | Page d'inscription |
| `/mentions-legales` | Mentions légales |
| `/conditions-generales` | CGU |
| `/confidentialite` | Politique de confidentialité |

### Espace Membre (protégé)
| Route | Page |
|-------|------|
| `/membres/profil` | Mon profil |
| `/membres/mes-evenements` | Mes inscriptions |
| `/membres/mes-billets` | Mes billets (QR codes) |
| `/membres/abonnement` | Gérer mon abonnement |

### Administration (admin requis)
| Route | Page |
|-------|------|
| `/admin` | Dashboard |
| `/admin/membres` | Gestion des membres |
| `/admin/evenements` | Gestion des événements |
| `/admin/paiements` | Historique des paiements |

### Pages de Paiement
| Route | Page |
|-------|------|
| `/reserver/:slug` | Réserver un événement |
| `/paiement/:orderId` | Finaliser paiement événement |
| `/paiement-produit/:orderId` | Paiement produit |

## Configuration Stripe

### Webhooks à configurer

**URL** : `https://api-lartpero.ainspiration.eu/api/webhook/stripe`

**Événements à écouter** :
- `checkout.session.completed`
- `payment_intent.succeeded`
- `invoice.paid`
- `customer.subscription.updated`
- `customer.subscription.deleted`

### Produits recommandés

Créer dans Stripe Dashboard :
1. **Abonnement mensuel** - Prix récurrent
2. **Abonnement annuel** - Prix récurrent
3. **Cartes cadeaux** - Prix unique (plusieurs montants)

## Déploiement Docker

### docker-compose.yml

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: lartpero
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: lartpero
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build:
      context: ./server
      dockerfile: Dockerfile
    environment:
      DATABASE_URL: postgresql://lartpero:${DB_PASSWORD}@postgres:5432/lartpero
      JWT_SECRET: ${JWT_SECRET}
      STRIPE_SECRET_KEY: ${STRIPE_SECRET_KEY}
      STRIPE_WEBHOOK_SECRET: ${STRIPE_WEBHOOK_SECRET}
      FRONTEND_URL: https://lartpero.ainspiration.eu
      ALLOWED_ORIGINS: https://lartpero.ainspiration.eu
    labels:
      - "traefik.http.routers.lartpero-api.rule=Host(`api-lartpero.ainspiration.eu`)"
      - "traefik.http.routers.lartpero-api.tls.certresolver=letsencrypt"

  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    environment:
      VITE_API_URL: https://api-lartpero.ainspiration.eu/api
    labels:
      - "traefik.http.routers.lartpero.rule=Host(`lartpero.ainspiration.eu`)"
      - "traefik.http.routers.lartpero.tls.certresolver=letsencrypt"

volumes:
  postgres_data:
```

### Commandes

```bash
# Construire et démarrer
docker-compose up -d --build

# Voir les logs
docker-compose logs -f

# Logs d'un service spécifique
docker-compose logs -f backend

# Arrêter
docker-compose down

# Arrêter et supprimer les volumes
docker-compose down -v
```

## Scripts NPM

### Frontend (`/`)
```bash
npm run dev        # Développement avec hot reload
npm run build      # Build production
npm run preview    # Aperçu du build
npm run lint       # Linter ESLint
npm run typecheck  # Vérification TypeScript
```

### Backend (`/server`)
```bash
npm run dev        # Développement avec hot reload (tsx)
npm run build      # Compilation TypeScript
npm run start      # Production (dist/index.js)
npm run db:push    # Synchroniser schéma → DB
npm run db:generate # Générer client Prisma
npm run db:seed    # Insérer données de test
```

## Sécurité

| Mesure | Implémentation |
|--------|----------------|
| Mots de passe | bcryptjs (10 rounds) |
| Authentification | JWT (expire 7j) |
| CORS | Origines autorisées uniquement |
| Webhooks Stripe | Vérification par signature |
| Routes admin | Middleware `requireAdmin` |
| Validation | Zod côté frontend + backend |

## Créer un Administrateur

1. Créer un compte via `/devenir-membre`
2. Se connecter à PostgreSQL :
```sql
UPDATE users SET role = 'ADMIN' WHERE email = 'votre@email.com';
```
3. Se reconnecter pour voir le bouton "Admin" dans le header

## Design

### Palette
- **Noir** : `#000000` - Texte principal, backgrounds
- **Blanc** : `#FFFFFF` - Backgrounds, texte sur noir
- **Gris** : `rgba(0,0,0,0.6)` - Texte secondaire

### Typographie
- Police : **Inter** (sans-serif)
- Titres : `font-light` (300)
- Corps : `font-normal` (400)
- Accents : `font-medium` (500)

## Licence

Projet privé - Tous droits réservés.

---

**Documentation générée le** : Février 2026
