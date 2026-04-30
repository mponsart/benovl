# BénoVL Intranet

Intranet associatif pour la gestion des bénévoles — planning, annonces, documents et suivi RH.

Construit avec **Nuxt 3**, **Prisma ORM**, **Tailwind CSS** et **JWT**.  
Compatible **SQLite** (zéro config) et **MySQL** (production).

---

## Sommaire

- [Fonctionnalités](#fonctionnalités)
- [Stack technique](#stack-technique)
- [Prérequis](#prérequis)
- [Installation rapide](#installation-rapide)
  - [Option A — SQLite (recommandé pour démarrer)](#option-a--sqlite-recommandé-pour-démarrer)
  - [Option B — MySQL](#option-b--mysql)
- [Variables d'environnement](#variables-denvironnement)
- [Commandes base de données](#commandes-base-de-données)
- [Comptes de test](#comptes-de-test)
- [Structure du projet](#structure-du-projet)
- [Routes API](#routes-api)
- [Production](#production)

---

## Fonctionnalités

| Module | Description |
|--------|-------------|
| 🔐 **Authentification** | Login/logout, JWT access + refresh token, rate-limiting |
| 👥 **RH Bénévoles** | Création, invitation par email, gestion des rôles et statuts |
| 🏷️ **Pôles** | Organisation des bénévoles par pôle |
| 📅 **Planning** | Créneaux avec inscriptions, capacités et auto-inscription |
| 📢 **Annonces** | Globales ou par pôle, épinglage |
| 📄 **Documents** | Upload et gestion d'attestations / conventions |
| 🔍 **Audit** | Journal de toutes les actions sensibles |
| 📊 **Dashboard** | Statistiques en temps réel |

---

## Stack technique

- **Frontend** : Nuxt 3, Vue 3, Tailwind CSS, VueUse
- **Backend** : Nuxt server routes (h3), Prisma ORM 5
- **Auth** : JWT (jose), bcryptjs
- **Base de données** : SQLite ou MySQL (via Prisma)
- **Validation** : Zod

---

## Prérequis

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x
- Pour MySQL uniquement : un serveur MySQL ≥ 8.x accessible

---

## Installation rapide

```bash
# 1. Cloner le dépôt
git clone https://github.com/mponsart/benovl.git
cd benovl

# 2. Installer les dépendances
npm install

# 3. Configurer l'environnement
cp .env.example .env
# → Éditez .env pour choisir votre provider (voir ci-dessous)

# 4. Initialiser la base de données + seed automatique
npm run db:setup
```

`db:setup` crée les tables **et** injecte les données de démonstration en une seule commande.

---

### Option A — SQLite (recommandé pour démarrer)

Aucun serveur à installer. Modifiez votre `.env` :

```env
DATABASE_PROVIDER="sqlite"
DATABASE_URL="file:./dev.db"
```

C'est tout. Lancez ensuite :

```bash
npm run db:setup
npm run dev
```

---

### Option B — MySQL

1. Créez la base de données :

```sql
CREATE DATABASE benovl CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. Renseignez votre `.env` :

```env
DATABASE_PROVIDER="mysql"
DATABASE_URL="mysql://user:password@localhost:3306/benovl"
```

3. Initialisez :

```bash
npm run db:setup
npm run dev
```

> **Note MySQL** : Les champs de type `String` sont mappés en `VARCHAR(191)` par défaut.  
> Pour les champs à contenu long (`content`, `description`, `notesInternes`), ajoutez `@db.Text`  
> dans `prisma/schema.prisma` puis relancez `prisma migrate dev`.

---

## Variables d'environnement

| Variable | Description | Exemple |
|----------|-------------|---------|
| `DATABASE_PROVIDER` | Provider Prisma (`sqlite` ou `mysql`) | `sqlite` |
| `DATABASE_URL` | URL de connexion à la base | `file:./dev.db` |
| `JWT_SECRET` | Clé secrète access token | *(chaîne aléatoire longue)* |
| `JWT_REFRESH_SECRET` | Clé secrète refresh token | *(chaîne aléatoire longue)* |

> En production, générez des secrets forts :  
> `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

---

## Commandes base de données

| Commande | Description |
|----------|-------------|
| `npm run db:setup` | **First run** : migrate + seed automatique |
| `npm run db:migrate` | Appliquer les migrations (le seed tourne automatiquement) |
| `npm run db:seed` | Injecter les données de démonstration uniquement |
| `npm run db:reset` | Remettre à zéro la BDD et relancer le seed |
| `npm run db:studio` | Ouvrir Prisma Studio (interface visuelle) |

Le seed s'exécute **automatiquement** après chaque `prisma migrate dev` et `prisma migrate reset`  
grâce à la clé `prisma.seed` dans `package.json`.

---

## Comptes de test

Créés automatiquement par le seed :

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Admin | `admin@asso.local` | `Admin123!` |
| Responsable | `resp.technique@asso.local` | `Responsable1!` |
| Responsable | `resp.admin@asso.local` | `Responsable2!` |
| Bénévole | `marie.leroy@asso.local` | `Benevole123!` |
| Bénévole | `paul.bernard@asso.local` | `Benevole123!` |
| Bénévole | `sophie.thomas@asso.local` | `Benevole123!` |
| Bénévole | `lucas.petit@asso.local` | `Benevole123!` |
| Bénévole | `emma.robert@asso.local` | `Benevole123!` |

---

## Structure du projet

```
benovl/
├── assets/css/          # Styles globaux Tailwind
├── components/          # Composants Vue réutilisables
│   ├── AppHeader.vue
│   ├── AppSidebar.vue
│   ├── AppModal.vue
│   ├── AppToast.vue
│   └── ...
├── composables/         # Composables Vue (auth, état global…)
├── layouts/             # Layouts Nuxt
├── middleware/          # Guards de navigation (auth, rôles)
├── pages/               # Pages de l'application
│   ├── login.vue
│   ├── dashboard.vue
│   ├── planning/
│   ├── rh/
│   ├── communication/
│   ├── documents/
│   └── audit/
├── prisma/
│   ├── schema.prisma    # Schéma de base de données
│   └── seed.ts          # Données de démonstration
├── server/
│   ├── api/             # Routes API (Nuxt server routes)
│   │   ├── auth/
│   │   ├── users/
│   │   ├── poles/
│   │   ├── planning/
│   │   ├── announcements/
│   │   ├── documents/
│   │   ├── dashboard/
│   │   └── audit/
│   ├── db/client.ts     # Singleton Prisma Client
│   ├── middleware/      # Middleware serveur
│   └── utils/           # Helpers auth, JWT
├── types/               # Types TypeScript partagés
├── .env.example         # Template variables d'environnement
├── nuxt.config.ts
└── package.json
```

---

## Routes API

| Méthode | Route | Rôle requis | Description |
|---------|-------|-------------|-------------|
| POST | `/api/auth/login` | — | Connexion |
| POST | `/api/auth/logout` | auth | Déconnexion |
| POST | `/api/auth/refresh` | — | Renouveler le token |
| GET | `/api/auth/me` | auth | Profil courant |
| GET | `/api/users` | admin/responsable | Liste des bénévoles |
| POST | `/api/users` | admin | Créer un bénévole |
| GET | `/api/users/[id]` | auth | Détail bénévole |
| PUT | `/api/users/[id]` | admin | Modifier un bénévole |
| DELETE | `/api/users/[id]` | admin | Supprimer un bénévole |
| POST | `/api/users/invite` | admin | Inviter par email |
| GET | `/api/poles` | auth | Liste des pôles |
| POST | `/api/poles` | admin | Créer un pôle |
| GET | `/api/planning/slots` | auth | Liste des créneaux |
| POST | `/api/planning/slots` | admin/responsable | Créer un créneau |
| POST | `/api/planning/slots/[id]/register` | auth | S'inscrire |
| GET | `/api/announcements` | auth | Liste des annonces |
| POST | `/api/announcements` | admin/responsable | Créer une annonce |
| GET | `/api/documents` | auth | Liste des documents |
| POST | `/api/documents/upload` | auth | Uploader un document |
| GET | `/api/dashboard` | auth | Statistiques |
| GET | `/api/audit` | admin | Journal d'audit |

---

## Production

```bash
# Construire l'application
npm run build

# Démarrer en production
node .output/server/index.mjs
```

Ou avec PM2 :

```bash
pm2 start .output/server/index.mjs --name benovl
```

> En production, assurez-vous que `NODE_ENV=production` est défini et que vos secrets JWT  
> sont de vraies valeurs aléatoires longues (≥ 64 caractères).

---

## Déploiement sur Vercel

> ⚠️ **SQLite est incompatible avec Vercel** (système de fichiers éphémère en lecture seule).  
> Utilisez impérativement **MySQL** (ou une base compatible) pour un déploiement Vercel.

1. Configurez les variables d'environnement dans le dashboard Vercel :

   | Variable | Valeur |
   |----------|--------|
   | `DATABASE_PROVIDER` | `mysql` |
   | `DATABASE_URL` | `mysql://user:password@host:3306/benovl` |
   | `JWT_SECRET` | *(chaîne aléatoire longue)* |
   | `JWT_REFRESH_SECRET` | *(chaîne aléatoire longue)* |

2. Appliquez les migrations sur votre base de données avant le premier déploiement :

   ```bash
   DATABASE_PROVIDER=mysql DATABASE_URL="mysql://..." npx prisma migrate deploy
   ```

3. Déployez — le script `build` génère automatiquement le client Prisma (`prisma generate`) puis compile l'application Nuxt.

