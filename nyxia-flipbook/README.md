# ✨ NyXia Flipbook

**Un flipbook ultra design pour Cloudflare Workers & Pages**

---

## 🌌 Caractéristiques

- **Design Galactique** : Interface sombre avec effets glassmorphism et néon violet
- **Animation de Pages Naturelle** : Effet de tournage de page fluide et réaliste
- **Son de Page** : Audio généré dynamiquement lors du tournage des pages
- **Loupe Intégrée** : Zoom sur le texte avec Alt+Clic ou Ctrl+Clic
- **TTS Français** : Synthèse vocale pour la lecture audio des pages
- **Protection Avancée** : 
  - Désactivation du clic droit
  - Protection contre la sélection de texte
  - Blocage des raccourcis clavier (copie, impression, etc.)
  - Watermark discret
- **Options de Partage** :
  - Facebook, Twitter, LinkedIn (activables/désactivables)
  - Code d'intégration iframe pour embed sur site web

---

## 🎨 Design System

### Couleurs
- **Fond** : Bleu nuit profond (#0A1628 à #0B1F3A)
- **Primaire** : Violet lumineux (#7B5CFF) avec dégradés bleu électrique (#4FA3FF)
- **Accent** : Or subtil (#F4C842) pour le côté premium

### Effets
- `nx-float` — Animation de levitation
- `nx-breathe` — Glow qui pulse
- `nx-glass` — Glassmorphism (transparence + flou)
- `nx-ambient` — Fond atmosphérique cosmique

### Typographie
- **Titres** : Cormorant Garamond (serif élégant)
- **Corps** : Outfit (sans-serif moderne)
- **Tech** : Space Grotesk (badges, labels)

---

## 📁 Structure du Projet

```
nyxia-flipbook/
├── public/
│   ├── index.html          # Page principale
│   ├── css/
│   │   └── flipbook.css    # Styles complets
│   └── js/
│       ├── flipbook.js     # Moteur du flipbook
│       └── starry-bg.js    # Canvas étoiles animées
├── wrangler.toml           # Configuration Cloudflare
└── README.md
```

---

## 🚀 Déploiement sur Cloudflare Pages

### Option 1: Cloudflare Pages (Recommandé)

1. Connectez-vous à votre dashboard Cloudflare
2. Allez dans **Pages** → **Create a project**
3. Connectez votre repository GitHub
4. Configurez les paramètres de build:
   - **Build command**: (laisser vide)
   - **Build output directory**: `public`
5. Déployez!

### Option 2: Wrangler CLI

```bash
# Installer Wrangler
npm install -g wrangler

# Se connecter à Cloudflare
wrangler login

# Déployer
cd nyxia-flipbook
wrangler pages deploy public --project-name=nyxia-flipbook
```

---

## ⚙️ Configuration

### Activer/Désactiver la Protection

Dans `js/flipbook.js`, modifiez:

```javascript
const CONFIG = {
  protectionEnabled: true,  // false pour désactiver
  // ...
}
```

### Options de Partage

Par défaut, seul l'embed est activé. Pour activer les réseaux sociaux:

```javascript
shareOptions: {
  facebook: true,   // Activer Facebook
  twitter: true,    // Activer Twitter
  linkedin: true,   // Activer LinkedIn
  embed: true       // Toujours activé
}
```

---

## 🎹 Raccourcis Clavier

- **← / →** : Navigation entre les pages
- **Espace** : Activer/désactiver la lecture TTS
- **Alt+Clic** : Activer la loupe

---

## 🔧 Personnalisation

### Modifier le Contenu des Pages

Dans `js/flipbook.js`, fonction `createPages()`:

```javascript
const pageContents = [
  {
    title: "Votre titre",
    text: "Votre contenu...",
    image: "/chemin/vers/image.jpg" // optionnel
  },
  // ... autres pages
]
```

### Changer les Couleurs

Dans `css/flipbook.css`, variables CSS:

```css
:root {
  --p: #7B5CFF;      /* Violet principal */
  --p2: #5A6CFF;     /* Secondaire */
  --gold: #F4C842;   /* Accent doré */
  /* ... */
}
```

---

## 📱 Responsive

Le flipbook s'adapte automatiquement aux mobiles et tablettes:
- Redimensionnement fluide
- Controls répositionnés pour mobile
- Taille de police ajustée

---

## 🎵 Son de Page

Le son est généré dynamiquement via Web Audio API:
- Oscillateur sine pour le ton de base
- Bruit blanc subtil pour l'effet papier
- Aucun fichier audio externe requis

---

## 🗣️ TTS (Text-to-Speech)

- Utilise l'API SpeechSynthesis native du navigateur
- Voix française automatique
- Contrôle de la vitesse et du pitch
- Indicateur visuel de lecture

---

## 📄 License

© 2024 NyXia — Intelligence + Mystère + Maîtrise

---

## 💡 Support

Pour toute question ou personnalisation avancée, contactez l'équipe NyXia.

**Développé avec ✨ pour une expérience de lecture immersive**
