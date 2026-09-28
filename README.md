# KOMI

**Le moyen le plus simple de vendre en ligne** : une plateforme e-commerce SaaS avec IA intégrée, pensée pour les commerçants africains.

🌍 **Site :** [komi-africa.site](https://www.komi-africa.site/)

KOMI permet à un commerçant de créer sa boutique en ligne en quelques minutes. Il y vend ses produits, gère ses commandes et ses clients, suit ses ventes et se fait aider par **Comy**, un assistant IA qui connaît les données de sa boutique.

---

## ⚠️ État des paiements en ligne

> **Aucun système de paiement n'est encore intégré en mode live (production).**
>
> L'intégration **FedaPay** (Mobile Money MTN / Moov, carte bancaire) est entièrement développée et testée en **mode sandbox**. Pour passer en mode live, il faut que le compte marchand KOMI soit **validé par le prestataire**. Cette validation exige une vérification d'identité et d'entreprise (KYC/KYB), des justificatifs légaux (registre de commerce, pièces d'identité, coordonnées bancaires), puis un examen et une activation du compte par FedaPay. Ces procédures sont en cours.
>
> En attendant :
> - aucun paiement réel n'est prélevé : les transactions en ligne passent par l'environnement de test FedaPay ;
> - le **paiement à la livraison** fonctionne normalement ;
> - le passage en live se fera **sans changement de code**, en modifiant seulement les variables d'environnement (`FEDAPAY_ENVIRONMENT=live` et les clés live).

---

## Fonctionnalités

| Domaine | Ce que fait KOMI |
|---|---|
| **Boutique en ligne** | Vitrine publique par commerçant : catalogue, fiches produit, panier, commande, confirmation. Personnalisation (thème, couleurs, logo, bannière). |
| **Produits** | Variantes, gestion du stock et seuil d'alerte, catégories, images (Cloudinary), duplication, archivage, signalement par les acheteurs. |
| **Commandes** | Cycle de vie complet (en attente → confirmée → préparation → expédiée → livrée / annulée), historique, commentaires internes, remise en stock à l'annulation. |
| **Coupons & clients** | Codes promo (pourcentage ou montant fixe, limite d'utilisation, date d'expiration), fiches clients créées automatiquement. |
| **Paiements** | FedaPay (Mobile Money, carte) en sandbox, avec webhooks signés HMAC et revérification du statut auprès du prestataire. Paiement à la livraison. |
| **Portefeuille marchand** | Crédit automatique à chaque paiement confirmé, historique des mouvements, demandes de retrait vers Mobile Money validées par l'équipe KOMI. |
| **Comy (IA)** | Briefing quotidien, score de santé de la boutique, analyse produit, chat marchand basé sur ses données réelles, widget de chat pour les acheteurs. |
| **Statistiques & notifications** | Chiffre d'affaires, commandes, meilleurs produits (graphiques), centre de notifications. |
| **E-mails transactionnels** | Bienvenue, vérification d'e-mail, réinitialisation du mot de passe, nouvelle commande, confirmation et suivi de commande. |
| **Back-office** | Espace d'administration de 13 pages : tableau de bord, analytique, utilisateurs, boutiques, commandes, paiements, abonnements, retraits, modération, journaux d'erreurs, suivi de l'IA, export CSV. |

## Stack technique

- **Backend :** Python 3.13, Django 5.2 LTS, Django REST Framework, PostgreSQL, Redis (optionnel), Celery, JWT (SimpleJWT), OpenAPI (drf-spectacular)
- **Frontend :** React 19, TypeScript, Vite, TailwindCSS v4, Radix UI, TanStack Query, React Hook Form + Zod, Zustand, Framer Motion, Recharts
- **Services :** FedaPay (paiements), Groq / Llama 3.1 (IA), Resend (e-mails), Cloudinary (images)
- **Hébergement :** Render (API), Vercel (frontend), Neon (PostgreSQL)

## Architecture

```
komi/
├── backend/                 API Django REST
│   ├── config/              settings (base / development / production / test), urls, celery
│   └── apps/
│       ├── accounts/        utilisateurs, JWT, vérification e-mail, mot de passe
│       ├── stores/          boutiques (multi-tenant : chaque marchand n'accède qu'à sa boutique)
│       ├── themes/          personnalisation des vitrines
│       ├── products/        catalogue, variantes, images, signalements
│       ├── orders/          commandes, coupons, statuts
│       ├── customers/       clients des boutiques
│       ├── payments/        fournisseurs de paiement (FedaPay), webhooks
│       ├── wallets/         portefeuille, mouvements, retraits
│       ├── analytics/       statistiques de vente
│       ├── notifications/   notifications marchand
│       ├── emails/          e-mails transactionnels (Resend / SMTP)
│       ├── ai/              assistant Comy (Groq)
│       ├── backoffice/      API d'administration
│       └── core/            briques partagées (modèles de base, permissions, throttling…)
├── frontend/                application React (organisée par fonctionnalité : src/features/*)
└── render.yaml              déploiement de l'API sur Render
```

Chaque app Django sépare la logique métier en couches : `services.py` (écritures et règles), `selectors.py` (lectures) et `views.py` (HTTP uniquement). Les fournisseurs externes (paiement, e-mail, IA) passent par un **registre** : on change de fournisseur par variable d'environnement, sans toucher au code métier.

## Sécurité et fiabilité

- **Montants calculés côté serveur uniquement** (prix, remises, livraison, total). Le client ne peut jamais influencer ce qui est facturé.
- **Webhooks de paiement signés** (HMAC-SHA256, comparaison en temps constant). Le statut est ensuite revérifié auprès du prestataire, avec contrôle du montant.
- **Opérations financières atomiques** : verrous en base (`select_for_update`) sur les paiements, le portefeuille, les coupons et les stocks. Les webhooks rejoués sont idempotents : pas de double crédit.
- **Limitation de débit (throttling)** sur les routes sensibles : connexion, inscription, mot de passe, checkout, paiement, chat IA, signalements.
- **URL de retour de paiement** limitée aux domaines KOMI (pas de redirection ouverte).
- **Réinitialisation du mot de passe** : toutes les sessions existantes sont révoquées.
- **E-mails envoyés après validation de la transaction** en base : aucun e-mail pour une commande annulée par erreur.
- **En production** : HTTPS forcé, HSTS, cookies sécurisés.

## Installation locale

### Backend

```bash
cd backend
python -m venv venv
./venv/Scripts/activate          # Windows (Linux/macOS : source venv/bin/activate)
pip install -r requirements.txt
cp .env.example .env             # SQLite par défaut ; renseigner les clés des services au besoin
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

- API : `http://localhost:8000/api/v1/`
- Documentation OpenAPI (Swagger) : `http://localhost:8000/api/docs/`

Redis est **optionnel** : si `REDIS_URL` est vide, un cache en mémoire est utilisé. En développement, les tâches Celery s'exécutent de façon synchrone. Un worker peut être lancé avec `celery -A config worker -l info`.

### Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

L'application tourne sur `http://localhost:5173/`.

| Variable | Rôle |
|---|---|
| `VITE_API_URL` | URL de l'API backend |
| `VITE_STORE_DOMAIN_SUFFIX` | Suffixe de domaine des boutiques |
| `VITE_CLOUDINARY_CLOUD_NAME` / `VITE_CLOUDINARY_UPLOAD_PRESET` | Upload d'images (preset Cloudinary *unsigned*) |

## Tests

```bash
cd backend
DJANGO_SETTINGS_MODULE=config.settings.test python manage.py test apps
```

Les tests utilisent SQLite en mémoire et n'appellent aucun service externe. Ils couvrent les flux critiques :
- checkout public (total non manipulable, stock, coupons, limitation de débit) ;
- chaîne paiement → webhook → commande → portefeuille (signature, idempotence, montant incohérent, URL de retour) ;
- retraits (solde insuffisant, validation, refus) ;
- authentification (révocation des sessions, anti-brute-force).

Frontend : `npm run build` (vérification TypeScript + build) et `npm run lint`.

## Déploiement

| Composant | Hébergeur | Notes |
|---|---|---|
| API Django | Render (`render.yaml`) | `build.sh` installe les dépendances, lance `collectstatic` et `migrate` |
| Frontend | Vercel (`frontend/vercel.json`) | Réécriture SPA vers `index.html` |
| Base de données | Neon PostgreSQL | via `DATABASE_URL` |
| Images | Cloudinary | |

Variables importantes côté API : `SECRET_KEY`, `DATABASE_URL`, `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`, `CSRF_TRUSTED_ORIGINS`, `FRONTEND_URL`, `BACKEND_URL`, les clés FedaPay / Resend / Groq / Cloudinary et, en option, `REDIS_URL` et `NUM_PROXIES`. Les limites de débit se règlent par variables `THROTTLE_*` (voir `config/settings/base.py`).

**Tâche planifiée recommandée** : libérer le stock des commandes en ligne jamais payées.

```bash
python manage.py release_unpaid_orders --hours 24
```

## Feuille de route

- [ ] Passage des paiements FedaPay en mode **live** (validation du compte marchand en cours)
- [ ] Autres prestataires de paiement (Paystack, CinetPay…)
- [ ] Frais de livraison configurables par boutique
- [ ] Domaine d'envoi d'e-mails vérifié (`komi-africa.site`)
- [ ] Worker Celery et Redis dédiés en production

## Auteur

Projet conçu et développé par **Juao20** : [github.com/Juao20](https://github.com/Juao20)
