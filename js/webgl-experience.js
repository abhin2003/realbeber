/**
 * Realbeber - Master WebGL 3D Experience Engine
 * Exact 1:1 Reference Video Synchronization with 60 FPS Canvas Frame Scrubbing,
 * Dynamic 3D Perspective Tilt, Floating Fruit Particle Dust, Lenis Smooth Scroll,
 * and Interactive HUD / Hotspot Choreography.
 */

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { audioEngine } from './audio-engine.js';

gsap.registerPlugin(ScrollTrigger);

const TOTAL_FRAMES = 240;
const BASE_FRAME_URL = '/screen_sequence/frame_';

class WebGLExperience {
  constructor() {
    this.container = document.getElementById('webgl-canvas-container');
    if (!this.container) return;

    this.scrollProgress = 0;
    this.targetScrollProgress = 0;
    this.scrollVelocity = 0;
    this.currentFrameIndex = 0;
    this.targetFrameIndex = 0;

    // Mouse Tracking for 3D Perspective Tilt
    this.mouse = {
      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0
    };

    // Drag tracking for 360 inspection nudge
    this.isDragging = false;
    this.dragStartX = 0;
    this.dragProgressOffset = 0;

    // Frames storage & preloading
    this.frames = new Array(TOTAL_FRAMES);
    this.loadedCount = 0;
    this.nearestLoaded = null;

    this.initCanvas();
    this.initLenis();
    this.initDOMHotspots();
    this.initDustParticles();
    this.preloadFrames();
    this.setupEvents();
    this.setupScrollTriggers();

    // Start 60 FPS animation loop
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  /* -------------------------------------------------------------
     1. High-DPI Canvas Setup
  ------------------------------------------------------------- */
  initCanvas() {
    this.container.innerHTML = '';
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'scene-scrubber-canvas';
    this.ctx = this.canvas.getContext('2d', {
      alpha: false,
      desynchronized: true
    });

    // Particle overlay canvas for floating crystalline dust
    this.particleCanvas = document.createElement('canvas');
    this.particleCanvas.id = 'particle-overlay-canvas';
    this.particleCtx = this.particleCanvas.getContext('2d');
    this.particleCanvas.style.position = 'absolute';
    this.particleCanvas.style.top = '0';
    this.particleCanvas.style.left = '0';
    this.particleCanvas.style.width = '100%';
    this.particleCanvas.style.height = '100%';
    this.particleCanvas.style.pointerEvents = 'none';
    this.particleCanvas.style.zIndex = '2';

    this.container.style.perspective = '1200px';
    this.container.style.transformStyle = 'preserve-3d';
    this.canvas.style.transformOrigin = 'center center';
    this.canvas.style.willChange = 'transform';
    this.canvas.style.transition = 'transform 0.08s ease-out';

    this.container.appendChild(this.canvas);
    this.container.appendChild(this.particleCanvas);

    this.onResize();
  }

  onResize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.canvas.width = Math.round(this.width * dpr);
    this.canvas.height = Math.round(this.height * dpr);

    this.particleCanvas.width = Math.round(this.width * dpr);
    this.particleCanvas.height = Math.round(this.height * dpr);

    // Re-draw current frame after resize
    if (this.frames[this.currentFrameIndex] && this.frames[this.currentFrameIndex].complete) {
      this.drawFrame(this.frames[this.currentFrameIndex]);
    } else if (this.nearestLoaded) {
      this.drawFrame(this.nearestLoaded);
    }
  }

  /* -------------------------------------------------------------
     2. Progressive Frame Preloader (Zero Flash, Instant Paint)
  ------------------------------------------------------------- */
  preloadFrames() {
    const formatNumber = (num) => String(num).padStart(3, '0');

    // Milestones to load with top priority for immediate responsive scrolling
    const priorityMilestones = [
      0, 15, 30, 45, 60, 75, 90, 105, 120, 135, 150, 165, 180, 195, 210, 225, 239
    ];

    const loadSingleFrame = (i) => {
      if (this.frames[i]) return Promise.resolve(this.frames[i]);

      return new Promise((resolve) => {
        const img = new Image();
        const numStr = formatNumber(i);

        img.onload = () => {
          this.frames[i] = img;
          this.loadedCount++;
          if (!this.nearestLoaded || i === 0) {
            this.nearestLoaded = img;
            this.drawFrame(img);
          }
          resolve(img);
        };

        img.onerror = () => {
          // Fallback to jpg if webp fails
          img.src = `${BASE_FRAME_URL}${numStr}.jpg`;
        };

        // Primary source: optimized WebP
        img.src = `${BASE_FRAME_URL}${numStr}.webp`;
      });
    };

    // 1. Immediately load frame 0 for instant initial paint
    loadSingleFrame(0).then(() => {
      // 2. Load key milestones next
      Promise.all(priorityMilestones.map((idx) => loadSingleFrame(idx))).then(() => {
        // 3. Load remaining frames sequentially in chunks
        let currentLoadIdx = 0;
        const loadNextBatch = () => {
          const batchSize = 12;
          const batch = [];
          for (let j = 0; j < batchSize && currentLoadIdx < TOTAL_FRAMES; j++) {
            if (!this.frames[currentLoadIdx]) {
              batch.push(loadSingleFrame(currentLoadIdx));
            }
            currentLoadIdx++;
          }
          if (batch.length > 0) {
            Promise.all(batch).then(() => {
              if (currentLoadIdx < TOTAL_FRAMES) {
                if (window.requestIdleCallback) {
                  window.requestIdleCallback(loadNextBatch, { timeout: 150 });
                } else {
                  setTimeout(loadNextBatch, 16);
                }
              }
            });
          }
        };
        loadNextBatch();
      });
    });
  }

  /* -------------------------------------------------------------
     3. Smooth Lenis Inertia Scroll & GSAP Integration
  ------------------------------------------------------------- */
  initLenis() {
    this.lenis = new Lenis({
      duration: 1.25,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.95,
      touchMultiplier: 1.5
    });

    this.lenis.on('scroll', (e) => {
      ScrollTrigger.update();
      this.scrollVelocity = e.velocity || 0;
      audioEngine.modulateVelocity(this.scrollVelocity);
    });

    gsap.ticker.add((time) => {
      this.lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    // Initial hash scroll & link smooth scroll intercept
    if (window.location.hash) {
      setTimeout(() => {
        this.lenis.scrollTo(window.location.hash, { immediate: true });
        ScrollTrigger.refresh();
      }, 150);
    }

    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener('click', (e) => {
        const href = a.getAttribute('href');
        if (href && href.length > 1) {
          e.preventDefault();
          this.lenis.scrollTo(href, { duration: 1.4 });
          audioEngine.playClick();
        }
      });
    });
  }

  /* -------------------------------------------------------------
     4. ScrollTrigger Timeline Across Dimensional Worlds
  ------------------------------------------------------------- */
  setupScrollTriggers() {
    // Master ScrollTrigger tracking overall page progress (0.0 to 1.0)
    ScrollTrigger.create({
      trigger: '#scroll-container',
      start: 'top top',
      end: 'bottom bottom',
      scrub: true,
      onUpdate: (self) => {
        this.targetScrollProgress = self.progress;
        this.updateTelemetry(self.progress);
      }
    });

    // Navigation sections smooth anchors
    const sectionConfigs = [
      { id: '#section-portal', frame: 0, color: '#F3E9D7', name: 'PORTAL' },
      { id: '#section-mango', frame: 60, color: '#FF6A2A', name: 'MANGO' },
      { id: '#section-jackfruit', frame: 120, color: '#DDF05B', name: 'JACKFRUIT' },
      { id: '#section-chikoo', frame: 155, color: '#C7B8F0', name: 'CHIKOO' },
      { id: '#section-banana', frame: 185, color: '#F3E9D7', name: 'BANANA' },
      { id: '#section-finale', frame: 230, color: '#171719', name: 'FINALE' }
    ];

    sectionConfigs.forEach((cfg) => {
      ScrollTrigger.create({
        trigger: cfg.id,
        start: 'top 80%',
        end: 'bottom 20%',
        onEnter: () => this.highlightSection(cfg),
        onEnterBack: () => this.highlightSection(cfg)
      });
    });
  }

  updateTelemetry(progress) {
    this.scrollProgress = progress;

    // Telemetry progress pip indicator
    const pip = document.getElementById('telemetry-pip');
    if (pip) {
      pip.style.top = `${Math.min(100, Math.max(0, progress * 100))}%`;
    }

    // World indicator highlights
    const colorSwatches = document.getElementById('telemetry-colors');
    if (colorSwatches) {
      const pills = colorSwatches.querySelectorAll('.telemetry-color-pill');
      pills.forEach((pill, idx) => {
        const activeIdx = Math.floor(progress * 3);
        pill.classList.toggle('active', idx === activeIdx);
      });
    }

    // Show / hide Explore Collection button in Finale
    const exploreBtn = document.getElementById('explore-collection-btn');
    if (exploreBtn) {
      if (progress > 0.88) {
        exploreBtn.style.opacity = '1';
        exploreBtn.style.pointerEvents = 'auto';
        exploreBtn.style.transform = 'translate(-50%, 0)';
      } else {
        exploreBtn.style.opacity = '0';
        exploreBtn.style.pointerEvents = 'none';
        exploreBtn.style.transform = 'translate(-50%, 15px)';
      }
    }
  }

  highlightSection(cfg) {
    const swatches = document.querySelectorAll('.hud-swatch-chip');
    swatches.forEach((sw) => {
      if (sw.textContent.includes(cfg.color) || sw.textContent.toLowerCase().includes(cfg.name.toLowerCase())) {
        sw.style.borderColor = '#171719';
        sw.style.transform = 'scale(1.08)';
      } else {
        sw.style.borderColor = 'rgba(0, 0, 0, 0.15)';
        sw.style.transform = 'scale(1.0)';
      }
    });
  }

  /* -------------------------------------------------------------
     5. Floating Crystalline Dust Particles (Three-Dimensional)
  ------------------------------------------------------------- */
  initDustParticles() {
    this.particles = [];
    const count = 45;
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        z: Math.random() * 0.8 + 0.2,
        size: Math.random() * 2.8 + 0.8,
        speedX: (Math.random() - 0.5) * 0.35,
        speedY: (Math.random() - 0.5) * 0.35 - 0.15,
        opacity: Math.random() * 0.6 + 0.2,
        color: ['#FF6A2A', '#DDF05B', '#C7B8F0', '#FFFFFF'][Math.floor(Math.random() * 4)]
      });
    }
  }

  updateDustParticles() {
    if (!this.particleCtx) return;
    const ctx = this.particleCtx;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = this.particleCanvas.width;
    const h = this.particleCanvas.height;

    ctx.clearRect(0, 0, w, h);

    const mouseOffsetX = this.mouse.x * 25 * dpr;
    const mouseOffsetY = this.mouse.y * 25 * dpr;

    this.particles.forEach((p) => {
      p.x += p.speedX;
      p.y += p.speedY;

      if (p.x < 0) p.x = this.width;
      if (p.x > this.width) p.x = 0;
      if (p.y < 0) p.y = this.height;
      if (p.y > this.height) p.y = 0;

      const renderX = (p.x * dpr) + (mouseOffsetX * p.z);
      const renderY = (p.y * dpr) + (mouseOffsetY * p.z);

      ctx.save();
      ctx.globalAlpha = p.opacity;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(renderX, renderY, p.size * dpr * p.z, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  /* -------------------------------------------------------------
     6. Event Listeners & Interactive Handlers
  ------------------------------------------------------------- */
  setupEvents() {
    window.addEventListener('resize', () => {
      this.onResize();
      ScrollTrigger.refresh();
    });

    // Mouse Parallax Move
    window.addEventListener('mousemove', (e) => {
      this.mouse.targetX = (e.clientX / this.width) * 2 - 1;
      this.mouse.targetY = (e.clientY / this.height) * 2 - 1;
    });

    // Touch Parallax Support
    window.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        this.mouse.targetX = (e.touches[0].clientX / this.width) * 2 - 1;
        this.mouse.targetY = (e.touches[0].clientY / this.height) * 2 - 1;
      }
    }, { passive: true });

    // Drag Nudge (Horizontal Inspection Drag)
    const container = this.container;
    container.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse' && e.button === 0) {
        this.isDragging = true;
        this.dragStartX = e.clientX;
        this.container.style.cursor = 'grabbing';
      }
    });

    window.addEventListener('pointermove', (e) => {
      if (!this.isDragging) return;
      const deltaX = (e.clientX - this.dragStartX) / this.width;
      this.dragProgressOffset = -deltaX * 0.05;
    });

    window.addEventListener('pointerup', () => {
      if (this.isDragging) {
        this.isDragging = false;
        this.container.style.cursor = 'grab';
        this.dragProgressOffset = 0;
      }
    });

    // Reset mouse target on leave
    document.body.addEventListener('mouseleave', () => {
      this.mouse.targetX = 0;
      this.mouse.targetY = 0;
    });
  }

  /* -------------------------------------------------------------
     7. DOM Hotspots & Smooth Navigation
  ------------------------------------------------------------- */
  initDOMHotspots() {
    // Scroll explore pill
    const explorePill = document.getElementById('scroll-explore-pill');
    if (explorePill) {
      explorePill.addEventListener('click', () => {
        audioEngine.playClick();
        this.lenis.scrollTo('#section-mango', { duration: 1.5 });
      });
    }

    // Top Brand Logo
    const brandLogo = document.querySelector('.hud-brand-logo');
    if (brandLogo) {
      brandLogo.addEventListener('click', (e) => {
        e.preventDefault();
        audioEngine.playClick();
        this.lenis.scrollTo(0, { duration: 1.2 });
      });
    }

    // Telemetry Arrows
    const arrowUp = document.querySelector('.telemetry-arrow:first-child');
    const arrowDown = document.querySelector('.telemetry-arrow:last-child');
    if (arrowUp) {
      arrowUp.style.cursor = 'pointer';
      arrowUp.addEventListener('click', () => {
        audioEngine.playClick();
        this.lenis.scrollTo(Math.max(0, window.scrollY - window.innerHeight), { duration: 1.0 });
      });
    }
    if (arrowDown) {
      arrowDown.style.cursor = 'pointer';
      arrowDown.addEventListener('click', () => {
        audioEngine.playClick();
        this.lenis.scrollTo(window.scrollY + window.innerHeight, { duration: 1.0 });
      });
    }
  }

  /* -------------------------------------------------------------
     8. Canvas Draw Frame (Edge-to-Edge Cover Scaling)
  ------------------------------------------------------------- */
  drawFrame(img) {
    if (!img || !this.ctx) return;
    const cw = this.canvas.width;
    const ch = this.canvas.height;
    const iw = img.naturalWidth || img.width;
    const ih = img.naturalHeight || img.height;
    if (!iw || !ih) return;

    // Cover scaling: fills entire viewport seamlessly with 0 letterbox bars
    const scale = Math.max(cw / iw, ch / ih);
    const dw = iw * scale;
    const dh = ih * scale;
    const dx = (cw - dw) * 0.5;
    const dy = (ch - dh) * 0.5;

    this.ctx.drawImage(img, dx, dy, dw, dh);
  }

  /* -------------------------------------------------------------
     9. 60 FPS Render & Dynamic 3D Parallax Loop
  ------------------------------------------------------------- */
  animate() {
    requestAnimationFrame(this.animate);

    // 1. Mouse Lerping for Fluid 3D Perspective Tilt
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.08;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.08;

    const tiltX = -this.mouse.y * 2.8;
    const tiltY = this.mouse.x * 3.6;

    // Apply tactile 3D perspective tilt to master canvas
    this.canvas.style.transform = `perspective(1200px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg) scale3d(1.015, 1.015, 1.015)`;

    // 2. Frame Interpolation based on Scroll Progress + Drag Nudge
    const activeProgress = Math.min(1.0, Math.max(0.0, this.targetScrollProgress + this.dragProgressOffset));
    const targetFrame = Math.round(activeProgress * (TOTAL_FRAMES - 1));

    // Smooth sub-frame lerping
    this.currentFrameIndex += (targetFrame - this.currentFrameIndex) * 0.35;
    const displayIndex = Math.min(TOTAL_FRAMES - 1, Math.max(0, Math.round(this.currentFrameIndex)));

    // 3. Render Image Frame with Nearest-Loaded Fallback
    const targetImg = this.frames[displayIndex];
    if (targetImg && targetImg.complete) {
      this.nearestLoaded = targetImg;
      this.drawFrame(targetImg);
    } else if (this.nearestLoaded) {
      // Find closest already-loaded frame to avoid any blank flash
      let closest = this.nearestLoaded;
      for (let offset = 1; offset < 20; offset++) {
        if (displayIndex + offset < TOTAL_FRAMES && this.frames[displayIndex + offset]?.complete) {
          closest = this.frames[displayIndex + offset];
          break;
        }
        if (displayIndex - offset >= 0 && this.frames[displayIndex - offset]?.complete) {
          closest = this.frames[displayIndex - offset];
          break;
        }
      }
      this.drawFrame(closest);
    }

    // 4. Update Ambient 3D Dust Particles
    this.updateDustParticles();
  }
}

// Instantiate master experience once DOM is ready
let experienceInstance = null;
window.addEventListener('DOMContentLoaded', () => {
  experienceInstance = new WebGLExperience();
  window.webglExperience = experienceInstance;
});

export { WebGLExperience };
