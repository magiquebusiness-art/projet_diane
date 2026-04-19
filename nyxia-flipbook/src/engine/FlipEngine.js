/**
 * FlipEngine.js - Moteur de flipbook avec drag souris temps réel
 * Effet de courbure canvas, page suit le curseur naturellement
 */

export class FlipEngine {
  constructor(container, options = {}) {
    this.container = typeof container === 'string' 
      ? document.querySelector(container) 
      : container;
    
    this.options = {
      pageWidth: 600,
      pageHeight: 800,
      duration: 600,
      easing: 'easeInOutQuad',
      enableSound: true,
      ...options
    };

    this.pages = [];
    this.currentPage = 0;
    this.isFlipping = false;
    this.dragState = null;
    this.canvas = null;
    this.ctx = null;
    this.animationFrame = null;
    
    this.init();
  }

  init() {
    this.container.innerHTML = '';
    this.container.style.position = 'relative';
    this.container.style.overflow = 'hidden';
    this.container.style.perspective = '2000px';
    this.container.style.transformStyle = 'preserve-3d';
    
    // Créer le canvas pour le rendu temps réel
    this.canvas = document.createElement('canvas');
    this.canvas.style.position = 'absolute';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.pointerEvents = 'auto';
    this.canvas.style.zIndex = '100';
    this.container.appendChild(this.canvas);
    
    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
    
    // Events souris/touch
    this.canvas.addEventListener('mousedown', (e) => this.onDragStart(e));
    this.canvas.addEventListener('mousemove', (e) => this.onDragMove(e));
    this.canvas.addEventListener('mouseup', (e) => this.onDragEnd(e));
    this.canvas.addEventListener('mouseleave', (e) => this.onDragEnd(e));
    
    // Touch events
    this.canvas.addEventListener('touchstart', (e) => this.onDragStart(e.touches[0]));
    this.canvas.addEventListener('touchmove', (e) => this.onDragMove(e.touches[0]));
    this.canvas.addEventListener('touchend', (e) => this.onDragEnd(e.changedTouches[0]));
    
    this.render();
  }

  resizeCanvas() {
    const rect = this.container.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height;
    this.ctx = this.canvas.getContext('2d');
  }

  loadPages(pageImages) {
    this.pages = pageImages.map((img, index) => ({
      index,
      image: img,
      flipped: false,
      angle: 0,
      curlPosition: 1,
      prevImageData: null,
      nextImageData: null
    }));
    this.currentPage = 0;
    this.render();
  }

  onDragStart(e) {
    if (this.isFlipping) return;
    
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Détecter si on clique sur le bord droit ou gauche
    const centerX = rect.width / 2;
    const isRightSide = x > centerX;
    
    // Vérifier qu'on peut tourner dans cette direction
    if ((isRightSide && this.currentPage >= this.pages.length - 1) ||
        (!isRightSide && this.currentPage <= 0)) {
      return;
    }
    
    this.dragState = {
      startX: x,
      startY: y,
      currentX: x,
      currentY: y,
      direction: isRightSide ? -1 : 1,
      startTime: Date.now(),
      isDragging: true
    };
    
    this.canvas.style.cursor = 'grabbing';
  }

  onDragMove(e) {
    if (!this.dragState || !this.dragState.isDragging) return;
    
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    this.dragState.currentX = x;
    this.dragState.currentY = y;
    
    // Calculer la progression du drag (0 à 1)
    const deltaX = x - this.dragState.startX;
    const maxDelta = this.options.pageWidth * 0.8;
    let progress = Math.abs(deltaX) / maxDelta;
    progress = Math.min(Math.max(progress, 0), 1);
    
    // Mettre à jour l'état de la page en cours de flip
    if (this.dragState.direction === -1 && this.currentPage < this.pages.length - 1) {
      this.pages[this.currentPage].curlPosition = 1 - progress;
      this.pages[this.currentPage + 1].curlPosition = progress;
    } else if (this.dragState.direction === 1 && this.currentPage > 0) {
      this.pages[this.currentPage - 1].curlPosition = 1 - progress;
      this.pages[this.currentPage].curlPosition = progress;
    }
    
    this.render();
  }

  onDragEnd(e) {
    if (!this.dragState || !this.dragState.isDragging) return;
    
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const deltaX = x - this.dragState.startX;
    const maxDelta = this.options.pageWidth * 0.3;
    
    // Déterminer si le flip doit se compléter
    const shouldFlip = Math.abs(deltaX) > maxDelta;
    
    if (shouldFlip) {
      if (this.dragState.direction === -1 && this.currentPage < this.pages.length - 1) {
        this.flipToPage(this.currentPage + 1, true);
      } else if (this.dragState.direction === 1 && this.currentPage > 0) {
        this.flipToPage(this.currentPage - 1, false);
      }
    } else {
      // Annuler le flip - retour à l'état initial
      this.cancelFlip();
    }
    
    this.dragState = null;
    this.canvas.style.cursor = 'grab';
  }

  cancelFlip() {
    const duration = 300;
    const startTime = Date.now();
    const startPositions = this.pages.map(p => p.curlPosition);
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = this.easeOutBack(progress);
      
      this.pages.forEach((page, i) => {
        page.curlPosition = startPositions[i] * (1 - eased);
      });
      
      this.render();
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }

  flipToPage(pageIndex, forward = true) {
    if (this.isFlipping || pageIndex < 0 || pageIndex >= this.pages.length) return;
    
    this.isFlipping = true;
    const duration = this.options.duration;
    const startTime = Date.now();
    
    const startPage = forward ? this.currentPage : pageIndex;
    const endPage = forward ? pageIndex : this.currentPage;
    
    // Initialiser les positions
    if (forward) {
      this.pages[startPage].curlPosition = 1;
      this.pages[endPage].curlPosition = 0;
    } else {
      this.pages[startPage].curlPosition = 0;
      this.pages[endPage].curlPosition = 1;
    }
    
    // Jouer le son si activé
    if (this.options.enableSound) {
      this.playFlipSound();
    }
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = this.easeInOutQuad(progress);
      
      if (forward) {
        this.pages[startPage].curlPosition = 1 - eased;
        this.pages[endPage].curlPosition = eased;
        
        if (progress === 1) {
          this.pages[startPage].flipped = true;
          this.currentPage = endPage;
        }
      } else {
        this.pages[startPage].curlPosition = eased;
        this.pages[endPage].curlPosition = 1 - eased;
        
        if (progress === 1) {
          this.pages[endPage].flipped = false;
          this.currentPage = endPage;
        }
      }
      
      this.render();
      
      if (progress < 1) {
        this.animationFrame = requestAnimationFrame(animate);
      } else {
        this.isFlipping = false;
        this.onPageChanged?.(this.currentPage);
      }
    };
    
    requestAnimationFrame(animate);
  }

  render() {
    if (!this.ctx || this.pages.length === 0) return;
    
    const rect = this.canvas.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const pageWidth = Math.min(this.options.pageWidth, rect.width / 2 - 20);
    const pageHeight = Math.min(this.options.pageHeight, rect.height - 40);
    
    this.ctx.clearRect(0, 0, rect.width, rect.height);
    
    // Rendu des pages
    this.pages.forEach((page, index) => {
      if (!page.image) return;
      
      const isLeft = index < this.currentPage || (index === this.currentPage && page.flipped);
      const isRight = index >= this.currentPage && !page.flipped;
      const isFlipping = page.curlPosition > 0 && page.curlPosition < 1;
      
      if (isFlipping) {
        this.renderCurlingPage(page, centerX, centerY, pageWidth, pageHeight);
      } else if (isLeft) {
        this.renderFlatPage(page, centerX - pageWidth - 5, centerY, pageWidth, pageHeight, -1);
      } else if (isRight) {
        this.renderFlatPage(page, centerX + 5, centerY, pageWidth, pageHeight, 1);
      }
    });
  }

  renderFlatPage(page, x, y, width, height, side) {
    this.ctx.save();
    this.ctx.translate(x + width / 2, y);
    this.ctx.scale(side, 1);
    
    // Ombre portée
    this.ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    this.ctx.shadowBlur = 20;
    this.ctx.shadowOffsetX = side * 5;
    
    // Dessiner la page
    this.ctx.drawImage(page.image, -width / 2, -height / 2, width, height);
    
    // Effet de pli au centre
    const gradient = this.ctx.createLinearGradient(-width / 2, 0, width / 2, 0);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    gradient.addColorStop(0.5, 'rgba(0, 0, 0, 0.1)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(-width / 2, -height / 2, width, height);
    
    this.ctx.restore();
  }

  renderCurlingPage(page, centerX, centerY, pageWidth, pageHeight) {
    const progress = page.curlPosition;
    const flipDirection = page.index > this.currentPage ? -1 : 1;
    
    // Calculer la position de la courbure
    const curlX = centerX + (flipDirection * pageWidth * progress);
    
    this.ctx.save();
    
    // Partie visible de la page actuelle (côté qui se soulève)
    const visibleWidth = pageWidth * (1 - progress);
    
    if (visibleWidth > 0) {
      this.ctx.save();
      this.ctx.translate(centerX + (flipDirection * pageWidth / 2), centerY);
      this.ctx.scale(flipDirection, 1);
      
      // Clipper la partie visible
      this.ctx.beginPath();
      this.ctx.rect(-pageWidth / 2, -pageHeight / 2, visibleWidth, pageHeight);
      this.ctx.clip();
      
      this.ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      this.ctx.shadowBlur = 15;
      this.ctx.shadowOffsetX = flipDirection * 10;
      
      this.ctx.drawImage(page.image, -pageWidth / 2, -pageHeight / 2, pageWidth, pageHeight);
      this.ctx.restore();
    }
    
    // Zone de courbure (effet 3D)
    const curlWidth = pageWidth * 0.15;
    if (curlWidth > 0) {
      this.ctx.save();
      this.ctx.translate(curlX, centerY);
      
      // Créer le gradient de courbure
      const curlGradient = this.ctx.createLinearGradient(-curlWidth / 2, 0, curlWidth / 2, 0);
      curlGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
      curlGradient.addColorStop(0.3, 'rgba(200, 200, 200, 0.4)');
      curlGradient.addColorStop(0.5, 'rgba(150, 150, 150, 0.2)');
      curlGradient.addColorStop(0.7, 'rgba(200, 200, 200, 0.4)');
      curlGradient.addColorStop(1, 'rgba(255, 255, 255, 0.8)');
      
      this.ctx.fillStyle = curlGradient;
      this.ctx.beginPath();
      this.ctx.ellipse(0, 0, curlWidth / 2, pageHeight / 2, 0, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Ombre de la courbure
      this.ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      this.ctx.shadowBlur = 30;
      this.ctx.shadowOffsetX = flipDirection * 20;
      this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
      
      this.ctx.restore();
    }
    
    // Partie de la page suivante (qui apparaît)
    const nextPageIndex = page.index + flipDirection;
    if (nextPageIndex >= 0 && nextPageIndex < this.pages.length && this.pages[nextPageIndex].image) {
      const revealWidth = pageWidth * progress;
      
      if (revealWidth > 0) {
        this.ctx.save();
        this.ctx.translate(centerX - (flipDirection * pageWidth / 2), centerY);
        this.ctx.scale(-flipDirection, 1);
        
        this.ctx.beginPath();
        this.ctx.rect(-pageWidth / 2, -pageHeight / 2, revealWidth, pageHeight);
        this.ctx.clip();
        
        this.ctx.drawImage(
          this.pages[nextPageIndex].image,
          -pageWidth / 2,
          -pageHeight / 2,
          pageWidth,
          pageHeight
        );
        
        this.ctx.restore();
      }
    }
  }

  playFlipSound() {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(150, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(80, audioContext.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.15);
    } catch (e) {
      console.log('Audio non supporté');
    }
  }

  easeInOutQuad(t) {
    return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
  }

  easeOutBack(t) {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  }

  destroy() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    this.canvas?.remove();
    this.pages = [];
  }
}
