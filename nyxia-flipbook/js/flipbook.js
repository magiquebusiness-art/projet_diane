/**
 * NYXIA FLIPBOOK — Moteur de Flipbook
 * ──────────────────────────────────────────────────────────
 * Version: 1.0
 * Projet: NyXia Flipbook
 * 
 * Fonctionnalités:
 * - Animation de pages avec effet naturel
 * - Son de page qui tourne
 * - Loupe pour grossir le texte
 * - TTS Français pour la lecture
 * - Protection contre le partage
 * - Options d'embed et partage réseaux sociaux
 */

(function() {
  'use strict'

  // ══════════════════════════════════════
  // CONFIGURATION
  // ══════════════════════════════════════
  const CONFIG = {
    totalPages: 6,
    currentPage: 0,
    isFlipping: false,
    protectionEnabled: true,
    shareOptions: {
      facebook: false,
      twitter: false,
      linkedin: false,
      embed: true
    },
    tts: {
      enabled: true,
      lang: 'fr-FR',
      voice: null,
      speaking: false,
      paused: false
    }
  }

  // ══════════════════════════════════════
  // ÉLÉMENTS DOM
  // ══════════════════════════════════════
  let flipbook = null
  let pages = []
  let magnifier = null
  let ttsIndicator = null
  let shareModal = null
  let protectionOverlay = null

  // ══════════════════════════════════════
  // SONS
  // ══════════════════════════════════════
  const pageFlipSound = new Audio('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=') // Placeholder
  
  // Génération d'un son de page synthétique
  function createPageFlipSound() {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.value = 200
      oscillator.type = 'sine'
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.3)
      
      // Bruit blanc subtil pour l'effet papier
      const noiseBuffer = audioContext.createBuffer(1, audioContext.sampleRate * 0.3, audioContext.sampleRate)
      const output = noiseBuffer.getChannelData(0)
      for (let i = 0; i < noiseBuffer.length; i++) {
        output[i] = Math.random() * 0.05
      }
      
      const noiseSource = audioContext.createBufferSource()
      noiseSource.buffer = noiseBuffer
      const noiseGain = audioContext.createGain()
      noiseGain.gain.setValueAtTime(0.2, audioContext.currentTime)
      noiseGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
      
      noiseSource.connect(noiseGain)
      noiseGain.connect(audioContext.destination)
      noiseSource.start(audioContext.currentTime)
      
    } catch (e) {
      console.log('Audio non supporté')
    }
  }

  // ══════════════════════════════════════
  // INITIALISATION
  // ══════════════════════════════════════
  function init() {
    flipbook = document.querySelector('.flipbook')
    magnifier = document.querySelector('.magnifier-overlay')
    ttsIndicator = document.querySelector('.tts-indicator')
    shareModal = document.querySelector('.share-modal')
    protectionOverlay = document.querySelector('.protection-overlay')
    
    if (!flipbook) return
    
    createPages()
    setupEventListeners()
    initTTS()
    updateNavigation()
    
    console.log('NyXia Flipbook initialized ✨')
  }

  // ══════════════════════════════════════
  // CRÉATION DES PAGES
  // ══════════════════════════════════════
  function createPages() {
    const pageContents = [
      {
        title: "Bienvenue dans NyXia",
        text: "Découvrez une expérience de lecture immersive et élégante. NyXia Flipbook combine design futuriste et fonctionnalités avancées pour une navigation fluide à travers vos contenus.\n\nCe flipbook intègre une loupe pour zoomer sur le texte, une synthèse vocale française pour la lecture audio, et des options de protection avancées.",
        image: null
      },
      {
        title: "Design Galactique",
        text: "Inspired by the cosmos, our design language speaks of mystery and intelligence. Deep blues meet electric purples, creating an atmosphere that's both calming and energizing.\n\nLe glassmorphism et les effets de néon violet créent une interface vivante, presque consciente, qui guide naturellement votre regard.",
        image: null
      },
      {
        title: "Fonctionnalités Avancées",
        text: "• Loupe intégrée pour zoomer sur le texte\n• Synthèse vocale française (TTS)\n• Animations fluides et naturelles\n• Protection contre le partage non autorisé\n• Options d'embed personnalisables\n• Compatible mobile et desktop",
        image: null
      },
      {
        title: "Protection & Partage",
        text: "NyXia Flipbook offre une protection robuste contre le copiage et le partage non autorisé. Vous pouvez activer ou désactiver les options de partage réseaux sociaux selon vos besoins.\n\nL'option d'embed permet d'intégrer facilement votre flipbook sur n'importe quel site web.",
        image: null
      },
      {
        title: "Synthèse Vocale",
        text: "La fonction TTS (Text-to-Speech) lit votre contenu en français avec une voix naturelle. Cliquez sur le bouton de lecture pour activer la narration audio de chaque page.\n\nIdéal pour l'accessibilité et pour une expérience de consommation de contenu alternative.",
        image: null
      },
      {
        title: "Merci de votre visite",
        text: "NyXia Flipbook est développé avec passion pour offrir une expérience de lecture unique. Profitez de cette fusion entre technologie avancée et design élégant.\n\n© 2024 NyXia — Intelligence + Mystère + Maîtrise",
        image: null
      }
    ]

    pageContents.forEach((content, index) => {
      const page = document.createElement('div')
      page.className = 'flipbook-page'
      page.style.zIndex = CONFIG.totalPages - index
      
      const pageNumber = index + 1
      const totalPages = CONFIG.totalPages
      
      page.innerHTML = `
        <div class="flipbook-page-front">
          <div class="page-content">
            <h2 class="page-title">${content.title}</h2>
            ${content.image ? `<img src="${content.image}" alt="" class="page-image">` : ''}
            <p class="page-text">${content.text.replace(/\n\n/g, '<br><br>')}</p>
            <span class="page-number">${pageNumber} / ${totalPages}</span>
          </div>
        </div>
        <div class="flipbook-page-back">
          <div class="page-content">
            <h2 class="page-title">${content.title} (verso)</h2>
            <p class="page-text">Contenu additionnel pour cette page...</p>
            <span class="page-number">${pageNumber} / ${totalPages}</span>
          </div>
        </div>
      `
      
      flipbook.appendChild(page)
      pages.push(page)
    })
  }

  // ══════════════════════════════════════
  // NAVIGATION
  // ══════════════════════════════════════
  function goToPage(pageIndex) {
    if (CONFIG.isFlipping || pageIndex < 0 || pageIndex >= CONFIG.totalPages) return
    
    CONFIG.isFlipping = true
    const direction = pageIndex > CONFIG.currentPage ? 'next' : 'prev'
    
    // Arrêter TTS si en cours
    stopTTS()
    
    // Jouer le son
    createPageFlipSound()
    
    if (direction === 'next') {
      pages[CONFIG.currentPage].classList.add('flipped')
    } else {
      pages[pageIndex].classList.remove('flipped')
    }
    
    setTimeout(() => {
      CONFIG.currentPage = pageIndex
      CONFIG.isFlipping = false
      updateNavigation()
      
      // Lire la page si TTS activé
      if (CONFIG.tts.enabled && !CONFIG.tts.paused) {
        readCurrentPage()
      }
    }, 600)
  }

  function updateNavigation() {
    const prevBtn = document.querySelector('.nav-prev')
    const nextBtn = document.querySelector('.nav-next')
    const indicator = document.querySelector('.page-indicator')
    
    if (prevBtn) prevBtn.disabled = CONFIG.currentPage === 0
    if (nextBtn) nextBtn.disabled = CONFIG.currentPage === CONFIG.totalPages - 1
    if (indicator) indicator.textContent = `${CONFIG.currentPage + 1} / ${CONFIG.totalPages}`
  }

  // ══════════════════════════════════════
  // LOUPE / ZOOM
  // ══════════════════════════════════════
  function setupMagnifier() {
    const pageContent = document.querySelector('.flipbook-page-front .page-content')
    if (!pageContent || !magnifier) return
    
    let isActive = false
    
    pageContent.addEventListener('mouseenter', (e) => {
      if (e.altKey || e.ctrlKey) {
        isActive = true
        magnifier.style.display = 'block'
        updateMagnifier(e)
      }
    })
    
    pageContent.addEventListener('mousemove', (e) => {
      if (isActive) {
        updateMagnifier(e)
      }
    })
    
    pageContent.addEventListener('mouseleave', () => {
      isActive = false
      magnifier.style.display = 'none'
    })
    
    function updateMagnifier(e) {
      const rect = pageContent.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      
      magnifier.style.left = (e.clientX + 15) + 'px'
      magnifier.style.top = (e.clientY + 15) + 'px'
      
      const percentX = (x / rect.width) * 100
      const percentY = (y / rect.height) * 100
      
      magnifier.style.backgroundPosition = `${percentX}% ${percentY}%`
    }
  }

  // ══════════════════════════════════════
  // TTS (TEXT-TO-SPEECH)
  // ══════════════════════════════════════
  function initTTS() {
    if (!('speechSynthesis' in window)) {
      console.log('TTS non supporté')
      if (ttsIndicator) ttsIndicator.style.display = 'none'
      return
    }
    
    // Charger les voix
    const loadVoices = () => {
      const voices = speechSynthesis.getVoices()
      CONFIG.tts.voice = voices.find(v => v.lang.includes('fr')) || voices[0]
    }
    
    loadVoices()
    speechSynthesis.onvoiceschanged = loadVoices
  }

  function readCurrentPage() {
    if (!CONFIG.tts.enabled) return
    
    const currentPageEl = pages[CONFIG.currentPage]
    if (!currentPageEl) return
    
    const title = currentPageEl.querySelector('.page-title')?.textContent || ''
    const text = currentPageEl.querySelector('.page-text')?.textContent || ''
    const content = title + '. ' + text
    
    stopTTS()
    
    const utterance = new SpeechSynthesisUtterance(content)
    utterance.lang = CONFIG.tts.lang
    utterance.voice = CONFIG.tts.voice
    utterance.rate = 0.9
    utterance.pitch = 1
    
    utterance.onstart = () => {
      CONFIG.tts.speaking = true
      if (ttsIndicator) {
        ttsIndicator.classList.remove('paused')
        ttsIndicator.querySelector('.tts-status').textContent = 'Lecture...'
      }
    }
    
    utterance.onend = () => {
      CONFIG.tts.speaking = false
      if (ttsIndicator) {
        ttsIndicator.classList.add('paused')
        ttsIndicator.querySelector('.tts-status').textContent = 'En pause'
      }
    }
    
    speechSynthesis.speak(utterance)
  }

  function stopTTS() {
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel()
    }
    CONFIG.tts.speaking = false
  }

  function toggleTTS() {
    if (CONFIG.tts.speaking) {
      if (CONFIG.tts.paused) {
        speechSynthesis.resume()
        CONFIG.tts.paused = false
        if (ttsIndicator) {
          ttsIndicator.classList.remove('paused')
          ttsIndicator.querySelector('.tts-status').textContent = 'Lecture...'
        }
      } else {
        speechSynthesis.pause()
        CONFIG.tts.paused = true
        if (ttsIndicator) {
          ttsIndicator.classList.add('paused')
          ttsIndicator.querySelector('.tts-status').textContent = 'Pause'
        }
      }
    } else {
      readCurrentPage()
    }
  }

  // ══════════════════════════════════════
  // PROTECTION
  // ══════════════════════════════════════
  function enableProtection() {
    if (!CONFIG.protectionEnabled) return
    
    // Désactiver clic droit
    document.addEventListener('contextmenu', (e) => {
      e.preventDefault()
      showProtectionMessage('Clic droit désactivé')
    })
    
    // Désactiver sélection
    document.addEventListener('selectstart', (e) => {
      e.preventDefault()
      showProtectionMessage('Sélection désactivée')
    })
    
    // Désactiver raccourcis clavier
    document.addEventListener('keydown', (e) => {
      if (
        (e.ctrlKey && e.key === 'c') ||
        (e.ctrlKey && e.key === 'p') ||
        (e.ctrlKey && e.key === 's') ||
        (e.ctrlKey && e.key === 'u')
      ) {
        e.preventDefault()
        showProtectionMessage('Copie protégée')
      }
    })
    
    // Watermark
    addWatermark()
  }

  function showProtectionMessage(message) {
    if (!protectionOverlay) return
    
    protectionOverlay.querySelector('.protection-message').textContent = message
    protectionOverlay.classList.add('active')
    
    setTimeout(() => {
      protectionOverlay.classList.remove('active')
    }, 1500)
  }

  function addWatermark() {
    const watermark = document.createElement('div')
    watermark.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-45deg);
      font-family: 'Cormorant Garamond', serif;
      font-size: 48px;
      color: rgba(123,92,255,0.05);
      pointer-events: none;
      z-index: 1;
      white-space: nowrap;
    `
    watermark.textContent = 'NyXia Flipbook — Protégé'
    document.body.appendChild(watermark)
  }

  // ══════════════════════════════════════
  // PARTAGE & EMBED
  // ══════════════════════════════════════
  function toggleShareOption(option) {
    CONFIG.shareOptions[option] = !CONFIG.shareOptions[option]
    updateShareUI()
  }

  function updateShareUI() {
    Object.keys(CONFIG.shareOptions).forEach(key => {
      const toggle = document.querySelector(`[data-share="${key}"]`)
      if (toggle) {
        toggle.classList.toggle('enabled', CONFIG.shareOptions[key])
      }
    })
  }

  function getEmbedCode() {
    const currentUrl = window.location.href
    return `<iframe src="${currentUrl}" width="900" height="600" style="border:none;" allowfullscreen></iframe>`
  }

  function shareToSocial(platform) {
    if (!CONFIG.shareOptions[platform]) return
    
    const url = encodeURIComponent(window.location.href)
    const title = encodeURIComponent('NyXia Flipbook')
    
    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      twitter: `https://twitter.com/intent/tweet?url=${url}&text=${title}`,
      linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${url}&title=${title}`
    }
    
    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400')
    }
  }

  // ══════════════════════════════════════
  // EVENT LISTENERS
  // ══════════════════════════════════════
  function setupEventListeners() {
    // Navigation boutons
    document.querySelector('.nav-prev')?.addEventListener('click', () => {
      goToPage(CONFIG.currentPage - 1)
    })
    
    document.querySelector('.nav-next')?.addEventListener('click', () => {
      goToPage(CONFIG.currentPage + 1)
    })
    
    // Cliquer sur les pages
    flipbook?.addEventListener('click', (e) => {
      const rect = flipbook.getBoundingClientRect()
      const clickX = e.clientX - rect.left
      
      if (clickX < rect.width / 2 && CONFIG.currentPage > 0) {
        goToPage(CONFIG.currentPage - 1)
      } else if (clickX > rect.width / 2 && CONFIG.currentPage < CONFIG.totalPages - 1) {
        goToPage(CONFIG.currentPage + 1)
      }
    })
    
    // Toolbar
    document.querySelector('.tool-magnifier')?.addEventListener('click', function() {
      this.classList.toggle('active')
      // Activer/désactiver la loupe
    })
    
    document.querySelector('.tool-tts')?.addEventListener('click', function() {
      this.classList.toggle('active')
      CONFIG.tts.enabled = !CONFIG.tts.enabled
      toggleTTS()
    })
    
    document.querySelector('.tool-share')?.addEventListener('click', () => {
      if (shareModal) {
        shareModal.classList.toggle('active')
        document.querySelector('.embed-code').value = getEmbedCode()
      }
    })
    
    // Fermer modal
    document.querySelector('.close-modal')?.addEventListener('click', () => {
      if (shareModal) shareModal.classList.remove('active')
    })
    
    // Options de partage
    document.querySelectorAll('[data-share]').forEach(btn => {
      btn.addEventListener('click', function() {
        const option = this.getAttribute('data-share')
        if (option === 'embed') {
          navigator.clipboard.writeText(getEmbedCode())
        } else {
          toggleShareOption(option)
        }
      })
    })
    
    // Partager réseaux sociaux
    document.querySelectorAll('[data-share-social]').forEach(btn => {
      btn.addEventListener('click', function() {
        const platform = this.getAttribute('data-share-social')
        shareToSocial(platform)
      })
    })
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') goToPage(CONFIG.currentPage - 1)
      if (e.key === 'ArrowRight') goToPage(CONFIG.currentPage + 1)
      if (e.key === ' ') {
        e.preventDefault()
        toggleTTS()
      }
    })
    
    // Setup magnifier
    setupMagnifier()
    
    // Protection
    enableProtection()
  }

  // ══════════════════════════════════════
  // DÉMARRAGE
  // ══════════════════════════════════════
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }

})()
