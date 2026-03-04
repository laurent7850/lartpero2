# L'ArtPéro - Backend API

Backend Express.js avec TypeScript, Prisma ORM et PostgreSQL.

## Quick Start

```bash
# Installation
npm install

# Configuration
cp .env.example .env
# Éditer .env avec vos valeurs

# Base de données
npm run db:generate
npm run db:push

# Développement
npm run dev
```

## Variables d'Environnement

| Variable | Description | Exemple |
|----------|-------------|---------|
| `DATABASE_URL` | URL PostgreSQL | `postgresql://user:pass@localhost:5432/lartpero` |
| `JWT_SECRET` | Secret pour signer les JWT | `votre-secret-32-caracteres-min` |
| `STRIPE_SECRET_KEY` | Clé secrète Stripe | `sk_test_...` |
| `STRIPE_WEBHOOK_SECRET` | Secret webhook Stripe | `whsec_...` |
| `FRONTEND_URL` | URL du frontend | `http://localhost:5173` |
| `ALLOWED_ORIGINS` | Origines CORS autorisées | `http://localhost:5173` |
| `PORT` | Port du serveur | `3001` |

## Structure des Fichiers

```
server/
├── src/
│   ├── index.ts           # Point d'entrée, configuration Express
│   ├── routes/
│   │   ├── auth.ts        # Authentification (register, login, profile)
│   │   ├── events.ts      # Événements publics + inscription
│   │   ├── products.ts    # Produits + checkout Stripe
│   │   ├── orders.ts      # Commandes événements + paiement
│   │   ├── members.ts     # Espace membre (tickets, registrations)
│   │   ├── admin.ts       # Dashboard + CRUD admin
│   │   ├── messages.ts    # Contact + témoignages + équipe
│   │   └── webhook.ts     # Webhooks Stripe
│   └── middleware/
│       └── auth.ts        # Middleware JWT (authenticate, requireAdmin)
├── prisma/
│   ├── schema.prisma      # Schéma de la base de données
│   └── seed.ts            # Données de test
├── package.json
└── tsconfig.json
```

## Routes API

### Auth (`/api/auth`)
```
POST /register   - Créer un compte
POST /login      - Se connecter
GET  /me         - Profil (auth required)
PUT  /profile    - Modifier profil (auth required)
```

### Events (`/api/events`)
```
GET  /           - Liste des événements publiés
GET  /:slug      - Détail d'un événement
POST /:id/register - S'inscrire (auth required)
```

### Products (`/api/products`)
```
GET  /           - Liste des produits actifs
GET  /:slug      - Détail d'un produit
POST /checkout   - Créer session Stripe (auth required)
POST /verify-payment - Vérifier paiement (auth required)
GET  /orders     - Mes commandes (auth required)
```

### Orders (`/api/orders`)
```
GET  /:orderId        - Détail commande (auth required)
POST /:orderId/checkout - Session Stripe (auth required)
POST /:orderId/verify   - Vérifier paiement (auth required)
```

### Members (`/api/members`)
```
GET  /membership   - Statut abonnement (auth required)
GET  /tickets      - Mes billets (auth required)
GET  /registrations - Mes inscriptions (auth required)
GET  /payments     - Historique paiements (auth required)
POST /redeem-gift  - Utiliser code cadeau (auth required)
```

### Admin (`/api/admin`)
```
GET    /dashboard    - Statistiques (admin required)
GET    /members      - Liste membres (admin required)
GET    /events       - Tous les événements (admin required)
POST   /events       - Créer événement (admin required)
PUT    /events/:id   - Modifier événement (admin required)
DELETE /events/:id   - Supprimer événement (admin required)
GET    /products     - Tous les produits (admin required)
POST   /products     - Créer produit (admin required)
PUT    /products/:id - Modifier produit (admin required)
DELETE /products/:id - Supprimer produit (admin required)
GET    /payments     - Historique paiements (admin required)
GET    /messages     - Messages contact (admin required)
```

### Messages (`/api/messages`)
```
POST /            - Envoyer un message
GET  /testimonials - Témoignages publiés
GET  /team         - Équipe visible
```

### Webhook (`/api/webhook`)
```
POST /stripe      - Webhook Stripe (signature required)
```

## Authentification

### JWT Token

Le token JWT est envoyé dans le header `Authorization`:
```
Authorization: Bearer <token>
```

### Middleware

```typescript
// Vérifie que l'utilisateur est connecté
authenticate(req, res, next)

// Vérifie que l'utilisateur est admin
requireAdmin(req, res, next)
```

### Payload JWT

```typescript
{
  userId: string;
  email: string;
  role: 'MEMBER' | 'ADMIN';
  iat: number;
  exp: number;
}
```

## Prisma

### Commandes

```bash
# Générer le client Prisma
npm run db:generate

# Synchroniser le schéma avec la DB
npm run db:push

# Insérer les données de test
npm run db:seed

# Ouvrir Prisma Studio
npx prisma studio
```

### Utilisation

```typescript
import { prisma } from '../index.js';

// Lire
const users = await prisma.user.findMany();

// Créer
const user = await prisma.user.create({
  data: { email, password, firstName }
});

// Mettre à jour
await prisma.user.update({
  where: { id },
  data: { firstName }
});

// Supprimer
await prisma.user.delete({ where: { id } });
```

## Stripe Integration

### Checkout Session

```typescript
const session = await stripe.checkout.sessions.create({
  payment_method_types: ['card'],
  line_items: [{
    price_data: {
      currency: 'eur',
      product_data: { name: 'Billet événement' },
      unit_amount: 2500, // 25.00€
    },
    quantity: 1,
  }],
  mode: 'payment',
  success_url: `${FRONTEND_URL}/paiement/${orderId}?success=true`,
  cancel_url: `${FRONTEND_URL}/paiement/${orderId}?canceled=true`,
  metadata: { orderId, userId },
});
```

### Webhook Handler

```typescript
// Important: raw body pour vérifier la signature
app.use('/api/webhook', express.raw({ type: 'application/json' }));

router.post('/stripe', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const event = stripe.webhooks.constructEvent(req.body, sig, WEBHOOK_SECRET);

  switch (event.type) {
    case 'checkout.session.completed':
      // Mettre à jour la commande
      break;
  }
});
```

## Docker

### Dockerfile

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
RUN npx prisma generate
CMD ["npm", "start"]
```

### Build & Run

```bash
docker build -t lartpero-backend .
docker run -p 3001:3001 --env-file .env lartpero-backend
```

## Health Check

```
GET /api/health
```

Réponse :
```json
{
  "status": "ok",
  "timestamp": "2026-02-11T14:12:52.596Z"
}
```

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Développement avec hot reload |
| `npm run build` | Compiler TypeScript |
| `npm run start` | Lancer en production |
| `npm run db:generate` | Générer client Prisma |
| `npm run db:push` | Synchroniser schéma |
| `npm run db:seed` | Données de test |
