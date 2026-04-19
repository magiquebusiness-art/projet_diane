# NyXia - Flipbook Creator

Interface sombre galactique, violet lumineux, bleu électrique, touches dorées, effets glass + glow, typographie élégante et moderne, ambiance mystique-tech premium, fluide, intelligente, vivante.

## 🌌 Fonctionnalités

### Frontend (Cloudflare Pages)
- **Upload de PDF** avec glisser-déposer
- **Conversion immédiate** en flipbook feuilletable
- **Effet de page tournante** réaliste en CSS 3D
- **Son au flip** de page (Web Audio API)
- **Loupe d'agrandissement** avec zoom et pan
- **TTS Français** pour les malvoyants
- **Partage réseaux sociaux** (Facebook, Twitter, LinkedIn)
- **Code d'intégration iframe** copiable
- **Protection par mot de passe** optionnelle
- **Paramètres personnalisables** (son, vitesse, qualité)

### Backend (Cloudflare Workers)
- **API REST** pour gérer les publications
- **Sous-domaines** pour chaque publication
- **Embed iframe** fonctionnel
- **KV Store** pour le stockage (à configurer)

## 🎨 Design & Ambiance

### Palette
- Fond: Bleu nuit profond (#0A1628 à #0B1F3A)
- Dominante: Violet lumineux (#7B5CFF) → Bleu électrique (#4FA3FF)
- Accents: Or subtil (#F4C842)

### Effets
- Glassmorphism (transparence + flou)
- Glow violet diffus
- Dégradés lumineux
- Halo doré subtil
- Animations lentes (respiration, scintillement)
- Ciel étoilé avec étoiles filantes

### Typographie
- Titres: Cormorant (serif moderne)
- Texte: Outfit (sans-serif digital)

## 🚀 Installation

```bash
# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev

# Build pour production
npm run build

# Déployer sur Cloudflare
npm run deploy
```

## 📁 Structure

```
nyxia-flipbook/
├── index.html          # Page principale
├── package.json        # Dépendances
├── vite.config.js      # Configuration Vite
├── wrangler.toml       # Configuration Cloudflare
├── src/
│   ├── main.js         # Logique applicative
│   ├── styles/
│   │   └── main.css    # Styles avec effets
│   └── utils/
│       └── starry-bg.js # Ciel étoilé canvas
└── workers/
    └── index.js        # Backend Cloudflare Worker
```

## 🔧 Configuration Cloudflare

1. Créer un projet Cloudflare Pages
2. Lier le repository
3. Configurer les variables d'environnement
4. Ajouter un KV namespace "FLIPBOOKS"
5. Déployer avec `npm run deploy`

## 🎯 Utilisation

1. **Uploader un PDF**: Glissez-déposez ou cliquez pour sélectionner
2. **Visualiser**: Le flipbook s'affiche immédiatement
3. **Feuilleter**: Cliquez sur les pages ou utilisez les flèches
4. **Partager**: Ouvrez la modale de partage
5. **Intégrer**: Copiez le code iframe fourni

## ✨ Effets Visuels

Classes CSS disponibles:
- `nx-float`: Image qui flotte (levitation)
- `nx-breathe`: Halo qui pulse (breathing glow)
- `nx-glass`: Carte transparente (glassmorphism)
- `nx-fade-up`: Apparition de bas (fade up)
- `nx-toast-in`: Notification slide-up

## 🌟 Positionnement

NyXia n'est pas un outil. C'est:
- Une présence
- Une guide
- Une intelligence qui accompagne

Design: confiance + fluidité + puissance + facilité
