/**
 * NyXia - Flipbook Creator
 * Main Application Logic avec FlipEngine (drag souris temps réel)
 */

import { PDFDocument, rgb } from 'pdf-lib'
import * as pdfjsLib from 'pdfjs-dist'
import { FlipEngine } from './engine/FlipEngine.js'

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.375/pdf.worker.min.js'

// State
let currentPage = 1
let totalPages = 0
let pdfDoc = null
let flipSoundEnabled = true
let ttsEnabled = false
let passwordProtected = false
let socialShareEnabled = true
let currentPDFData = null
let flipbookId = null
let flipEngine = null

// DOM Elements
const uploadArea = document.getElementById('uploadArea')
const pdfInput = document.getElementById('pdfInput')
const uploadBtn = document.getElementById('uploadBtn')
const viewerSection = document.getElementById('viewerSection')
const previewInfo = document.getElementById('previewInfo')
const fileName = document.getElementById('fileName')
const flipbookContainer = document.getElementById('flipbook')
const pageIndicator = document.getElementById('pageIndicator')
const prevPageBtn = document.getElementById('prevPage')
const nextPageBtn = document.getElementById('nextPage')

// Modal elements
const shareModal = document.getElementById('shareModal')
const magnifierModal = document.getElementById('magnifierModal')
const settingsModal = document.getElementById('settingsModal')
const toast = document.getElementById('toast')
const toastMessage = document.getElementById('toastMessage')

// Sound effect for page flip (using Web Audio API)
function playFlipSound() {
  if (!flipSoundEnabled) return
  
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()
    
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)
    
    oscillator.frequency.setValueAtTime(200, audioContext.currentTime)
    oscillator.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.3)
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
    
    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.3)
  } catch (e) {
    console.log('Audio not supported')
  }
}

// Toast notification
function showToast(message) {
  toastMessage.textContent = message
  toast.style.display = 'block'
  setTimeout(() => {
    toast.style.display = 'none'
  }, 3000)
}

// Upload handling
uploadBtn.addEventListener('click', () => pdfInput.click())

uploadArea.addEventListener('dragover', (e) => {
  e.preventDefault()
  uploadArea.style.borderColor = 'var(--blue-electric)'
  uploadArea.style.boxShadow = 'var(--glow-blue)'
})

uploadArea.addEventListener('dragleave', (e) => {
  e.preventDefault()
  uploadArea.style.borderColor = 'var(--violet-luminous)'
  uploadArea.style.boxShadow = 'var(--glow-violet)'
})

uploadArea.addEventListener('drop', (e) => {
  e.preventDefault()
  uploadArea.style.borderColor = 'var(--violet-luminous)'
  uploadArea.style.boxShadow = 'var(--glow-violet)'
  
  const files = e.dataTransfer.files
  if (files.length > 0 && files[0].type === 'application/pdf') {
    handlePDFUpload(files[0])
  } else {
    showToast('Veuillez sélectionner un fichier PDF valide')
  }
})

pdfInput.addEventListener('change', (e) => {
  if (e.target.files.length > 0) {
    handlePDFUpload(e.target.files[0])
  }
})

async function handlePDFUpload(file) {
  fileName.textContent = file.name
  previewInfo.style.display = 'block'
  
  try {
    const arrayBuffer = await file.arrayBuffer()
    currentPDFData = arrayBuffer
    
    // Load PDF
    pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
    totalPages = pdfDoc.numPages
    currentPage = 1
    
    // Generate flipbook ID
    flipbookId = 'fb_' + Math.random().toString(36).substr(2, 9)
    
    // Render flipbook
    await renderFlipbook()
    
    viewerSection.style.display = 'block'
    previewInfo.style.display = 'none'
    
    showToast('Flipbook créé avec succès!')
    
    // Scroll to viewer
    viewerSection.scrollIntoView({ behavior: 'smooth' })
  } catch (error) {
    console.error('Error loading PDF:', error)
    showToast('Erreur lors du chargement du PDF')
    previewInfo.style.display = 'none'
  }
}

async function renderFlipbook() {
  flipbookContainer.innerHTML = ''
  
  // Initialiser le FlipEngine avec drag souris temps réel
  flipEngine = new FlipEngine(flipbookContainer, {
    pageWidth: 600,
    pageHeight: 800,
    duration: 600,
    enableSound: flipSoundEnabled
  })
  
  // Charger toutes les pages du PDF comme images
  const pageImages = []
  const pageWidth = flipbookContainer.clientWidth / 2
  const pageHeight = flipbookContainer.clientHeight
  
  for (let i = 1; i <= totalPages; i++) {
    const page = await pdfDoc.getPage(i)
    const viewport = page.getViewport({ scale: 1.5 })
    
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    canvas.height = pageHeight
    canvas.width = pageWidth
    
    const renderContext = {
      canvasContext: context,
      viewport: page.getViewport({
        scale: Math.min(pageWidth / viewport.width, pageHeight / viewport.height) * 1.5
      })
    }
    
    await page.render(renderContext).promise
    
    // Convertir le canvas en image pour FlipEngine
    const img = new Image()
    img.src = canvas.toDataURL('image/png')
    await new Promise(resolve => { img.onload = resolve })
    pageImages.push(img)
  }
  
  // Charger les pages dans le moteur de flip
  flipEngine.loadPages(pageImages)
  
  // Callback quand la page change
  flipEngine.onPageChanged = (newPage) => {
    currentPage = newPage + 1
    updatePageIndicator()
  }
  
  updatePageIndicator()
}

function turnPage(direction) {
  if (!flipEngine) return
  
  if (direction === 'next' && currentPage < totalPages) {
    flipEngine.flipToPage(currentPage, true)
  } else if (direction === 'prev' && currentPage > 1) {
    flipEngine.flipToPage(currentPage - 2, false)
  }
}

function updatePageIndicator() {
  pageIndicator.textContent = `${currentPage} / ${totalPages}`
  prevPageBtn.disabled = currentPage === 1
  nextPageBtn.disabled = currentPage === totalPages
}

prevPageBtn.addEventListener('click', () => turnPage('prev'))
nextPageBtn.addEventListener('click', () => turnPage('next'))

// Keyboard navigation
document.addEventListener('keydown', (e) => {
  if (viewerSection.style.display === 'none') return
  
  if (e.key === 'ArrowLeft') {
    turnPage('prev')
  } else if (e.key === 'ArrowRight') {
    turnPage('next')
  }
})

// Modal handlers
document.getElementById('shareBtn').addEventListener('click', () => {
  generateEmbedCode()
  shareModal.style.display = 'flex'
})

document.getElementById('closeShareModal').addEventListener('click', () => {
  shareModal.style.display = 'none'
})

document.getElementById('magnifierBtn').addEventListener('click', () => {
  openMagnifier()
  magnifierModal.style.display = 'flex'
})

document.getElementById('closeMagnifier').addEventListener('click', () => {
  magnifierModal.style.display = 'none'
})

document.getElementById('settingsBtn').addEventListener('click', () => {
  settingsModal.style.display = 'flex'
})

document.getElementById('closeSettingsModal').addEventListener('click', () => {
  settingsModal.style.display = 'none'
})

// Close modals on outside click
[shareModal, magnifierModal, settingsModal].forEach(modal => {
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none'
    }
  })
})

// Generate embed code
function generateEmbedCode() {
  const baseUrl = window.location.origin
  const embedUrl = `${baseUrl}/embed/${flipbookId}`
  const embedCode = `<iframe src="${embedUrl}" width="800" height="600" frameborder="0" allowfullscreen></iframe>`
  document.getElementById('embedCode').value = embedCode
}

// Copy embed code
document.getElementById('copyEmbedCode').addEventListener('click', () => {
  const embedCode = document.getElementById('embedCode')
  embedCode.select()
  document.execCommand('copy')
  showToast('Code copié!')
})

// Social share toggle
document.getElementById('socialShareToggle').addEventListener('change', (e) => {
  socialShareEnabled = e.target.checked
  document.getElementById('socialButtons').style.display = socialShareEnabled ? 'flex' : 'none'
})

// Password protection toggle
document.getElementById('passwordProtectToggle').addEventListener('change', (e) => {
  passwordProtected = e.target.checked
  document.getElementById('passwordInput').style.display = passwordProtected ? 'block' : 'none'
})

// Social sharing
document.querySelectorAll('.btn-social').forEach(btn => {
  btn.addEventListener('click', () => {
    const platform = btn.dataset.platform
    const url = encodeURIComponent(window.location.href)
    const title = encodeURIComponent('NyXia Flipbook')
    
    let shareUrl = ''
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`
        break
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`
        break
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`
        break
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400')
    }
  })
})

// Magnifier functionality
let currentZoom = 1

function openMagnifier() {
  const magnifierView = document.getElementById('magnifierView')
  
  if (flipEngine && flipEngine.pages[currentPage - 1]) {
    const pageImage = flipEngine.pages[currentPage - 1].image
    
    if (pageImage) {
      const clonedCanvas = document.createElement('canvas')
      clonedCanvas.width = pageImage.width
      clonedCanvas.height = pageImage.height
      const ctx = clonedCanvas.getContext('2d')
      ctx.drawImage(pageImage, 0, 0)
      
      clonedCanvas.style.transform = `scale(${currentZoom})`
      clonedCanvas.style.cursor = 'move'
      
      magnifierView.innerHTML = ''
      magnifierView.appendChild(clonedCanvas)
      
      // Pan functionality
      let isPanning = false
      let startX, startY, translateX = 0, translateY = 0
      
      clonedCanvas.addEventListener('mousedown', (e) => {
        isPanning = true
        startX = e.clientX - translateX
        startY = e.clientY - translateY
        clonedCanvas.style.cursor = 'grabbing'
      })
      
      document.addEventListener('mousemove', (e) => {
        if (!isPanning) return
        e.preventDefault()
        translateX = e.clientX - startX
        translateY = e.clientY - startY
        clonedCanvas.style.transform = `scale(${currentZoom}) translate(${translateX}px, ${translateY}px)`
      })
      
      document.addEventListener('mouseup', () => {
        isPanning = false
        clonedCanvas.style.cursor = 'move'
      })
    }
  }
}

document.getElementById('zoomIn').addEventListener('click', () => {
  currentZoom = Math.min(currentZoom + 0.25, 3)
  openMagnifier()
})

document.getElementById('zoomOut').addEventListener('click', () => {
  currentZoom = Math.max(currentZoom - 0.25, 1)
  openMagnifier()
})

// TTS (Text-to-Speech) French
let ttsUtterance = null
let ttsSpeaking = false

document.getElementById('ttsBtn').addEventListener('click', async () => {
  if (!('speechSynthesis' in window)) {
    showToast('TTS non supporté par votre navigateur')
    return
  }
  
  if (ttsSpeaking) {
    speechSynthesis.cancel()
    ttsSpeaking = false
    document.getElementById('ttsBtn').textContent = '🔊'
    return
  }
  
  try {
    // Utiliser le canvas de la page courante depuis flipEngine
    if (flipEngine && flipEngine.pages[currentPage - 1]) {
      const pageImage = flipEngine.pages[currentPage - 1].image
      
      // Créer un canvas temporaire pour l'OCR
      const tempCanvas = document.createElement('canvas')
      tempCanvas.width = pageImage.width
      tempCanvas.height = pageImage.height
      const ctx = tempCanvas.getContext('2d')
      ctx.drawImage(pageImage, 0, 0)
      
      // Extraire le texte via PDF.js directement
      const page = await pdfDoc.getPage(currentPage)
      const textContent = await page.getTextContent()
      const text = textContent.items.map(item => item.str).join(' ')
      
      if (text.trim()) {
        ttsUtterance = new SpeechSynthesisUtterance(text)
        ttsUtterance.lang = 'fr-FR'
        ttsUtterance.rate = 0.9
        ttsUtterance.pitch = 1
        
        ttsUtterance.onend = () => {
          ttsSpeaking = false
          document.getElementById('ttsBtn').textContent = '🔊'
        }
        
        speechSynthesis.speak(ttsUtterance)
        ttsSpeaking = true
        document.getElementById('ttsBtn').textContent = '⏹️'
        showToast('Lecture en cours...')
      } else {
        showToast('Aucun texte détecté sur cette page')
      }
    } else {
      showToast('Page non disponible')
    }
  } catch (error) {
    console.error('TTS Error:', error)
    showToast('Erreur lors de la lecture')
  }
})

// Settings
document.getElementById('soundToggle').addEventListener('change', (e) => {
  flipSoundEnabled = e.target.checked
  showToast(flipSoundEnabled ? 'Son activé' : 'Son désactivé')
})

document.getElementById('animationSpeed').addEventListener('change', (e) => {
  const speed = e.target.value
  const duration = speed === 'slow' ? '1s' : speed === 'fast' ? '0.3s' : '0.6s'
  document.documentElement.style.setProperty('--page-turn-duration', duration)
  showToast(`Vitesse: ${speed}`)
})

document.getElementById('displayQuality').addEventListener('change', (e) => {
  showToast(`Qualité: ${e.target.value}`)
  // Re-render with new quality if needed
})

// Initialize
console.log('NyXia Flipbook Creator initialized')
