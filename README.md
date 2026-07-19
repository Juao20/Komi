# KOMI

Le moyen le plus simple de vendre en ligne — plateforme SaaS AI-first pour les commerçants africains.

## Structure du monorepo

```
komi/
  backend/   Django REST API (apps/accounts, stores, themes, products, orders, customers, analytics, notifications)
  frontend/  React + Vite + TypeScript (feature-based)
```

## Backend

```bash
cd backend
python -m venv venv
./venv/Scripts/activate        # Windows
pip install -r requirements.txt
cp .env.example .env           # renseigner DATABASE_URL, SECRET_KEY, etc.
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

L'API est servie sur `http://localhost:8000/api/v1/`. Documentation OpenAPI sur `/api/docs/`.

Un worker Celery (notifications, emails) peut être lancé avec :

```bash
celery -A config worker -l info
```

## Frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

L'application est servie sur `http://localhost:5173/`.

### Variables d'environnement clés

- `VITE_API_URL` — URL de l'API backend
- `VITE_CLOUDINARY_CLOUD_NAME` / `VITE_CLOUDINARY_UPLOAD_PRESET` — upload d'images (preset *unsigned* Cloudinary)

## Stack

- **Backend** : Django, DRF, PostgreSQL, Redis, Celery, JWT (SimpleJWT), Cloudinary
- **Frontend** : React, Vite, TypeScript, TailwindCSS v4, Radix UI, TanStack Query, React Hook Form + Zod, Framer Motion, Recharts

## Déploiement

- Backend → Railway (ou tout hôte compatible Django + Postgres + Redis)
- Frontend → Vercel
- Base de données → Neon PostgreSQL
- Images → Cloudinary
