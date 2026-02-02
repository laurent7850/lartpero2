# L'Artpéro

Une plateforme élégante de mise en relation autour d'apéros dans le milieu de l'art.

## Vue d'ensemble

L'Artpéro est une application web complète permettant de gérer un club privé (Le Club des Gentlemen), des événements exclusifs, et un accompagnement personnalisé pour les membres. Le site présente l'agence, ses valeurs, et propose un système d'inscription avec gestion des abonnements via Stripe.

## Stack technique

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS (thème noir & blanc minimaliste)
- **UI Components**: shadcn/ui
- **Routing**: React Router v6
- **Forms**: react-hook-form + zod
- **Auth & Database**: Supabase (PostgreSQL + RLS)
- **Icons**: lucide-react
- **Dates**: date-fns

## Architecture du projet

```
src/
├── components/           # Composants réutilisables
│   ├── ui/              # Composants shadcn/ui
│   ├── Header.tsx       # En-tête avec navigation
│   ├── Footer.tsx       # Pied de page
│   ├── Layout.tsx       # Layout principal
│   ├── ProtectedRoute.tsx  # HOC pour routes protégées
│   └── CookieBanner.tsx # Bannière RGPD
├── contexts/            # Contextes React
│   └── AuthContext.tsx  # Gestion de l'authentification
├── lib/                 # Utilitaires
│   ├── supabase.ts     # Client Supabase + types
│   └── utils.ts        # Fonctions utilitaires
├── pages/              # Pages de l'application
│   ├── Home.tsx        # Page d'accueil
│   ├── [pages publiques...]
│   ├── members/        # Espace membres protégé
│   │   ├── MembresLayout.tsx
│   │   ├── Profil.tsx
│   │   ├── MesEvenements.tsx
│   │   └── Abonnement.tsx
│   └── admin/          # Panel admin (require rôle admin)
│       ├── AdminLayout.tsx
│       └── AdminEvenements.tsx
└── App.tsx             # Configuration des routes

```

## Structure de la base de données

### Tables principales

- **profiles**: Informations utilisateur étendues
- **memberships**: Abonnements et statuts Stripe
- **events**: Événements (publics ou membres uniquement)
- **event_registrations**: Inscriptions aux événements
- **payments**: Historique des paiements
- **testimonials**: Témoignages clients
- **team**: Membres de l'équipe
- **messages**: Messages du formulaire de contact

Toutes les tables ont RLS (Row Level Security) activé avec des policies strictes.

## Installation et configuration locale

### Prérequis

- Node.js 18+
- npm ou yarn
- Un compte Supabase (gratuit)
- Un compte Stripe (optionnel pour les paiements)

### 1. Cloner et installer

```bash
npm install
```

### 2. Configuration Supabase

Les variables d'environnement Supabase sont déjà configurées dans `.env`:

```
VITE_SUPABASE_URL=https://xsxtvdubvbbsvltslara.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

La base de données et le schéma sont déjà créés et configurés avec:
- Toutes les tables (profiles, memberships, events, etc.)
- Row Level Security (RLS) activé sur toutes les tables
- Policies de sécurité configurées
- Triggers pour auto-création des profils

### 3. Créer un compte admin

Pour accéder au panel admin, vous devez créer un compte et modifier manuellement le rôle dans la base:

1. Inscrivez-vous via `/devenir-membre`
2. Dans Supabase Dashboard, allez dans Table Editor > profiles
3. Trouvez votre profil et changez `role` de `member` à `admin`

### 4. Lancer le serveur de développement

```bash
npm run dev
```

L'application sera disponible sur `http://localhost:5173`

## Scripts disponibles

```bash
npm run dev          # Lancer le serveur de développement
npm run build        # Build de production
npm run preview      # Prévisualiser le build
npm run lint         # Linter le code
npm run typecheck    # Vérifier les types TypeScript
```

## Fonctionnalités principales

### Pour les visiteurs

- ✅ Navigation sur toutes les pages publiques (histoire, valeurs, philosophie, etc.)
- ✅ Consultation des événements publiés
- ✅ Formulaire de contact (stockage en DB)
- ✅ Inscription avec email/password
- ✅ Pages légales (mentions, CGU, confidentialité)
- ✅ Bannière de consentement cookies

### Pour les membres

- ✅ Authentification sécurisée (Supabase Auth)
- ✅ Espace personnel avec profil éditable
- ✅ Consultation de ses inscriptions aux événements
- ✅ Gestion de l'abonnement (interface prête pour Stripe)
- ✅ Accès aux événements "membres uniquement"

### Pour les administrateurs

- ✅ Panel admin avec gestion des événements
- ✅ Consultation de tous les événements
- ✅ Sections prévues pour: témoignages, membres, messages

## Intégration Stripe (À venir)

Le projet est préparé pour l'intégration Stripe:

1. **Variables d'environnement à ajouter**:
```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_MEMBERSHIP_ID=price_...
```

2. **Flux de paiement**:
   - Checkout Sessions pour les abonnements
   - Checkout Sessions pour les billets d'événements
   - Customer Portal pour la gestion d'abonnement

3. **Webhook handler**:
   - À implémenter via Supabase Edge Function
   - Écoute: `checkout.session.completed`, `customer.subscription.updated`, etc.
   - Mise à jour automatique de la table `memberships`

## Déploiement

### Option 1: Netlify (Recommandé)

```bash
# Build command
npm run build

# Publish directory
dist

# Environment variables
VITE_SUPABASE_URL=https://...
VITE_SUPABASE_ANON_KEY=eyJ...
```

### Option 2: Vercel

Même configuration que Netlify, compatible avec Vite par défaut.

## Sécurité

- ✅ RLS activé sur toutes les tables
- ✅ Policies restrictives (ownership + admin checks)
- ✅ Protection des routes sensibles (membres, admin)
- ✅ Validation des formulaires avec zod
- ✅ Pas de secrets côté client
- ✅ CORS configuré pour les edge functions

## Accessibilité

- Contrastes WCAG AA respectés (noir/blanc)
- Focus visible sur tous les éléments interactifs
- Labels ARIA sur les éléments clés
- Navigation au clavier fonctionnelle

## Design

### Palette de couleurs
- Noir: `#000000` (texte, arrière-plans)
- Blanc: `#FFFFFF` (arrière-plans, texte sur fond noir)
- Gris: variations de `rgba(0, 0, 0, opacity)` pour les textes secondaires

### Typographie
- Police: Inter (sans-serif élégante)
- Titres: font-light (300)
- Corps: font-normal (400)
- Accents: font-medium (500)

### Composants UI
Tous les composants shadcn/ui sont disponibles dans `src/components/ui/`.

## Routes de l'application

### Pages publiques
- `/` - Accueil
- `/notre-histoire` - Histoire de l'agence
- `/nos-valeurs` - Valeurs
- `/notre-philosophie` - Philosophie
- `/notre-promesse` - Promesse
- `/experience` - L'expérience proposée
- `/art-de-la-rencontre` - L'art de la rencontre
- `/club-des-gentlemen` - Présentation du Club
- `/certification-gentleman` - La certification
- `/coaching` - Coaching personnalisé
- `/temoignages` - Témoignages clients
- `/confidentialite` - Politique de confidentialité
- `/equipe` - L'équipe
- `/contact` - Formulaire de contact
- `/evenements` - Liste des événements
- `/evenements/:slug` - Détail d'un événement
- `/devenir-membre` - Inscription
- `/connexion` - Connexion
- `/mentions-legales` - Mentions légales
- `/conditions-generales` - CGU

### Routes protégées (membres)
- `/membres/profil` - Profil utilisateur
- `/membres/mes-evenements` - Inscriptions aux événements
- `/membres/abonnement` - Gestion abonnement

### Routes admin (require role=admin)
- `/admin/evenements` - Gestion des événements
- `/admin/temoignages` - Gestion des témoignages (à venir)
- `/admin/membres` - Gestion des membres (à venir)
- `/admin/messages` - Consultation des messages (à venir)

## Données de test

Pour tester l'application, vous pouvez ajouter des données via Supabase Dashboard:

### Exemple d'événement

```sql
INSERT INTO events (title, slug, description, location, date_start, capacity, is_members_only, price_cents, status, image_url)
VALUES (
  'Vernissage d''art contemporain',
  'vernissage-art-contemporain',
  'Une soirée exclusive dans une galerie parisienne',
  'Galerie Perrotin, Paris',
  '2025-12-15 19:00:00+00',
  50,
  false,
  2500,
  'published',
  'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg'
);
```

### Exemple de témoignage

```sql
INSERT INTO testimonials (author_name, content, is_featured, status)
VALUES (
  'Sophie M.',
  'Grâce à L''Artpéro, j''ai rencontré des personnes passionnées d''art et trouvé un compagnon qui partage mes valeurs. L''accompagnement est d''une rare qualité.',
  true,
  'published'
);
```

### Exemple de membre d'équipe

```sql
INSERT INTO team (name, role, bio_md, visible, order_index)
VALUES (
  'Élise Beaumont',
  'Fondatrice & Directrice',
  'Passionnée d''art et de psychologie, Élise a créé L''Artpéro pour redonner sens à la rencontre amoureuse.',
  true,
  1
);
```

## Support et contact

Pour toute question technique sur l'implémentation, consultez:
- Documentation Supabase: https://supabase.com/docs
- Documentation React Router: https://reactrouter.com
- Documentation shadcn/ui: https://ui.shadcn.com

## Licence

Propriété de L'Artpéro. Tous droits réservés.
