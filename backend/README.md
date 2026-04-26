# NutriSnap — Backend

Node.js + Express + Prisma + PostgreSQL (AWS RDS)

## Setup

```bash
npm install
cp .env.example .env
# Vyplň .env hodnoty

npx prisma generate
npx prisma db push   # vytvorí tabuľky v AWS RDS

npm run dev          # spustí vývojový server na http://localhost:3000
```

## Endpointy

| Metóda | URL | Popis |
|--------|-----|-------|
| POST | /auth/register | Registrácia |
| POST | /auth/login | Prihlásenie |
| GET | /me | Profil používateľa |
| PATCH | /me | Aktualizácia profilu |
| POST | /meals/analyze | Analýza fotky jedla (Vision API) |
| POST | /meals | Uloženie jedla |
| GET | /meals | História jedál |
| DELETE | /meals/:id | Zmazanie jedla |
| GET | /health | Health check |

## Nasadenie na AWS Elastic Beanstalk

1. `npm run build`
2. Zbalíš `dist/`, `package.json`, `prisma/` do `.zip`
3. Nahráš cez AWS Console → Elastic Beanstalk
4. Nastavíš env premenné v EB Console (nie .env súbor!)
