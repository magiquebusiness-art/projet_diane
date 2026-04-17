# Oranum Clone - Cloudflare Workers & Pages

Ce projet est une structure de base pour cloner un site similaire à Oranum en utilisant Cloudflare Workers et Pages.

## Structure du projet

```
oranum-clone/
├── frontend/          # Application React pour Cloudflare Pages
│   ├── src/
│   │   ├── App.jsx   # Composant principal avec UI inspirée d'Oranum
│   │   └── App.css   # Styles
│   ├── public/
│   └── package.json
│
└── worker/           # Cloudflare Worker pour l'API backend
    ├── src/
    │   └── index.js  # Code du Worker
    ├── wrangler.toml # Configuration Wrangler
    └── package.json
```

## Prérequis

- Node.js (v18 ou supérieur)
- Compte Cloudflare
- Wrangler CLI installé (`npm install -g wrangler`)

## Installation

### Frontend (Pages)

```bash
cd frontend
npm install
npm run dev
```

### Worker (API Backend)

```bash
cd worker
npm install
npm run dev
```

## Déploiement sur Cloudflare

### 1. Authentification

```bash
wrangler login
```

### 2. Déployer le Worker

```bash
cd worker
npm run deploy
```

### 3. Déployer le Frontend sur Pages

```bash
cd frontend
npm run build
npx wrangler pages deploy dist/
```

## Architecture recommandée

Pour un clone complet d'Oranum, vous aurez besoin de:

1. **Frontend (React + Cloudflare Pages)**
   - Interface utilisateur
   - Chat en temps réel
   - Système de réservation
   - Profils des voyants

2. **Backend (Cloudflare Workers)**
   - API REST/GraphQL
   - Authentification
   - Gestion des sessions
   - Paiements

3. **Base de données**
   - Cloudflare D1 (SQLite)
   - ou Cloudflare KV pour les sessions

4. **Temps réel**
   - WebSockets via Cloudflare Durable Objects
   - Pour le chat en direct

## Fonctionnalités à implémenter

- [ ] Système d'authentification
- [ ] Profils utilisateurs
- [ ] Chat en temps réel
- [ ] Système de paiement
- [ ] Gestion des rendez-vous
- [ ] Notifications
- [ ] Dashboard administrateur

## Ressources utiles

- [Documentation Cloudflare Workers](https://developers.cloudflare.com/workers/)
- [Documentation Cloudflare Pages](https://developers.cloudflare.com/pages/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)
- [Durable Objects](https://developers.cloudflare.com/durable-objects/)

## Licence

MIT
