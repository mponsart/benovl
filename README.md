# BénoVL Intranet

Intranet associatif pour la gestion des bénévoles — planning, annonces, documents et suivi RH.

Construit avec **Nuxt 3**, **Prisma ORM**, **Tailwind CSS** et **JWT**.  
Compatible **SQLite / Turso** (LibSQL) et **MySQL** (production).

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
- [Déploiement sur Vercel (Turso)](#déploiement-sur-vercel-turso)
- [Déploiement sur O2switch](#déploiement-sur-o2switch)

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
- **Base de données** : SQLite local / Turso (LibSQL) ou MySQL (via Prisma)
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
DATABASE_URL="mysql://user:password@localhost:3306/benovl"
```

3. Initialisez avec le schéma MySQL :

```bash
npm run db:setup:mysql
npm run dev
```

---

## Variables d'environnement

| Variable | Description | Exemple |
|----------|-------------|---------|
| `DATABASE_URL` | URL de connexion SQLite ou chemin fichier | `file:./dev.db` |
| `TURSO_DATABASE_URL` | URL Turso (LibSQL) — Vercel uniquement | `libsql://<db>.turso.io` |
| `TURSO_AUTH_TOKEN` | Token d'authentification Turso | *(depuis le dashboard Turso)* |
| `JWT_SECRET` | Clé secrète access token | *(chaîne aléatoire longue)* |
| `JWT_REFRESH_SECRET` | Clé secrète refresh token | *(chaîne aléatoire longue)* |

> En production, générez des secrets forts :  
> `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

---

## Commandes base de données

| Commande | Description |
|----------|-------------|
| `npm run db:setup` | **First run SQLite** : migrate + seed |
| `npm run db:setup:mysql` | **First run MySQL** : migrate + seed |
| `npm run db:migrate` | Appliquer les migrations SQLite |
| `npm run db:migrate:mysql` | Appliquer les migrations MySQL (deploy) |
| `npm run db:seed` | Injecter les données de démonstration |
| `npm run db:reset` | Remettre à zéro la BDD SQLite et relancer le seed |
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
│   ├── schema.prisma        # Schéma SQLite / Turso (défaut)
│   ├── schema.mysql.prisma  # Schéma MySQL (O2switch / prod MySQL)
│   └── seed.ts              # Données de démonstration
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
│   ├── db/client.ts     # Singleton Prisma Client (auto-Turso si TURSO_DATABASE_URL)
│   ├── middleware/      # Middleware serveur
│   └── utils/           # Helpers auth, JWT, JSON
├── types/               # Types TypeScript partagés
├── ecosystem.config.cjs # Config PM2 pour O2switch
├── .env.example         # Template variables d'environnement
├── nuxt.config.ts
├── vercel.json          # Config Vercel
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
| POST | `/api/seed` | SEED_SECRET | Initialiser la BDD (déploiement) |
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
# Construire l'application (SQLite / Turso)
npm run build

# Construire l'application (MySQL / O2switch)
npm run build:mysql

# Démarrer en production
node .output/server/index.mjs
```

Ou avec PM2 :

```bash
pm2 start ecosystem.config.cjs
```

> En production, assurez-vous que `NODE_ENV=production` est défini et que vos secrets JWT  
> sont de vraies valeurs aléatoires longues (≥ 64 caractères).

---

## Déploiement sur Vercel (Turso)

BénoVL utilise **[Turso](https://turso.tech)** (LibSQL cloud) pour le déploiement Vercel.  
Turso est compatible avec l'offre gratuite de Vercel et de Turso.

### 1. Créer une base Turso

```bash
# Installer la CLI Turso
curl -sSfL https://get.tur.so/install.sh | bash

# Connexion
turso auth login

# Créer la base
turso db create benovl

# Récupérer l'URL et le token
turso db show benovl --url   # → libsql://<db-name>-<org>.turso.io
turso db tokens create benovl
```

### 2. Appliquer les migrations

En local, pointez temporairement sur Turso pour initialiser le schéma :

```bash
# Générer les migrations localement (SQLite)
DATABASE_URL="file:./dev.db" npm run db:migrate

# Pousser le schéma directement vers Turso
TURSO_DATABASE_URL="libsql://<db>.turso.io" \
TURSO_AUTH_TOKEN="<token>" \
npx prisma db push
```

### 3. Variables d'environnement Vercel

Dans le dashboard Vercel → Settings → Environment Variables :

| Variable | Valeur |
|----------|--------|
| `DATABASE_URL` | `file:./dev.db` *(utilisé uniquement pour prisma generate en build)* |
| `TURSO_DATABASE_URL` | `libsql://<db-name>-<org>.turso.io` |
| `TURSO_AUTH_TOKEN` | *(token Turso)* |
| `JWT_SECRET` | *(chaîne aléatoire ≥ 64 chars)* |
| `JWT_REFRESH_SECRET` | *(chaîne aléatoire ≥ 64 chars)* |

### 4. Déployer

```bash
# Pousser sur la branche principale — Vercel build automatiquement
git push origin main
```

Le script `build` dans `vercel.json` exécute `prisma generate && nuxt build`.  
Le client Prisma détecte automatiquement `TURSO_DATABASE_URL` et utilise l'adaptateur LibSQL.

### 5. Initialiser les données (seed en production)

Puisqu'il est impossible d'exécuter `npx tsx prisma/seed.ts` directement dans un environnement serverless, utilisez l'endpoint API dédié :

1. Dans Vercel → Settings → Environment Variables, ajoutez :

   | Variable | Valeur |
   |----------|--------|
   | `SEED_SECRET` | *(chaîne aléatoire longue et secrète)* |

2. Redéployez ou attendez que la variable soit prise en compte, puis appelez :

   ```bash
   curl -X POST https://<votre-app>.vercel.app/api/seed \
     -H "Authorization: Bearer <valeur-de-SEED_SECRET>"
   ```

   En cas de succès, la réponse liste les comptes créés.

3. **Important** : supprimez la variable `SEED_SECRET` dans Vercel après le premier seed pour désactiver l'endpoint.

> **Comptes créés par le seed** : voir le tableau « Comptes de test » ci-dessus.

---

## Déploiement sur O2switch (cPanel)

Guide recommandé pour installer BénoVL sur o2switch via cPanel + Node.js App.

### 1. Préparer la base MySQL dans cPanel

Dans **cPanel → MySQL Databases** :

1. Créez une base (exemple : `<cpanel_user>_benovl`).
2. Créez un utilisateur MySQL dédié.
3. Associez cet utilisateur à la base avec **ALL PRIVILEGES**.

### 2. Déployer le code sur l'hébergement

Utilisez Git (recommandé) ou FTP/SFTP pour placer le projet dans un dossier, par exemple :

```bash
/home/<cpanel_user>/benovl
```

### 3. Configurer l'application Node.js dans cPanel

Dans **cPanel → Setup Node.js App** :

1. Créez une application en mode **Production**.
2. Choisissez Node.js **20.x** (ou version supérieure disponible).
3. Paramétrez :
   - **Application root** : `/home/<cpanel_user>/benovl`
   - **Application startup file** : `passenger_startup.js`
4. Ajoutez les variables d'environnement :

```env
NODE_ENV=production
DATABASE_URL=mysql://<db_user>:<db_password>@localhost:3306/<cpanel_user>_benovl
JWT_SECRET=<secret-long-et-aleatoire>
JWT_REFRESH_SECRET=<secret-long-et-aleatoire>
```

> Génération rapide d'un secret fort :
> `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

### 4. Installer les dépendances et construire

Depuis le terminal cPanel (ou via SSH), placez-vous dans le dossier du projet :

```bash
cd /home/<cpanel_user>/benovl
npm install --include=dev
npm run db:push:mysql
npm run db:seed
npm run build:mysql
ls -l .output/server/index.mjs
```

Pourquoi `--include=dev` ?
- Le build utilise Prisma CLI, déclaré en dépendance de développement.

### 5. Démarrer l'application

Dans cPanel Node.js App :

1. Cliquez **Restart** (ou **Start Application** si premier démarrage).
2. Ouvrez l'URL de l'application configurée dans cPanel.

### 6. Vérifications après installation

1. Testez la page de connexion.
2. Vérifiez que les routes API répondent (exemple : `/api/auth/me` renvoie 401 sans session, ce qui est normal).
3. Vérifiez les logs dans cPanel Node.js App en cas d'erreur.

### Dépannage fréquent sur o2switch

- `npm ERR! signal SIGINT` : installation interrompue, relancer `npm install`.
- `pnpm: commande introuvable` : utiliser `npm` (pnpm non installé par défaut).
- Warnings `EBADENGINE` ou `deprecated` : généralement non bloquants pour le démarrage.
- Erreur Nuxt/DevTools pendant `nuxt prepare` : utiliser la version du projet où DevTools est conditionné à l'environnement de développement (déjà géré dans ce dépôt).

Si `npm install` échoue encore sur `nuxt prepare`, utilisez cette séquence de secours :

```bash
cd /home/<cpanel_user>/benovl
npm install --include=dev --ignore-scripts
npx prisma generate
npm run db:push:mysql
npm run db:seed
npm run build:mysql
```

Puis redémarrez l'application dans cPanel (bouton **Restart**).

### Option PM2 (si vous gérez le process en SSH)

Le fichier `ecosystem.config.cjs` est prêt pour un lancement PM2 :

```bash
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

