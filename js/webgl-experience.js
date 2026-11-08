/**
 * Realbeber - Master WebGL 3D Experience Engine
 * - Zero Cursor Tilt (rock-solid, locked canvas with no left/right wobble)
 * - Precision World Navigation (exact frame targeting for Portal, Mango, Jackfruit, Chikoo, Banana, Finale)
 * - 60/120 FPS Direct Frame Binding with Lenis Smooth Scroll
 * - Milestone Preloading & Background GPU Frame Decoding
 */

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { audioEngine } from './audio-engine.js';

gsap.registerPlugin(ScrollTrigger);

const TOTAL_FRAMES = 240;
const BASE_FRAME_URL = '/screen_sequence/frame_';

// Exact calibrated scroll ratios corresponding to the center of each 3D world
const WORLD_RATIOS = {
  portal: 0.000,     // Frame 0: The Portal Monolith
  mango: 0.314,      // Frame 75: The Mango World (curved architectural dunes & orbiting chips)
  jackfruit: 0.502,  // Frame 120: The Jackfruit World (acid yellow & green archways)
  chikoo: 0.648,     // Frame 155: The Chikoo World (warm clay arches & velvety chikoo)
  banana: 0.774,     // Frame 185: The Banana World (clean architectural curves & slices)
  finale: 1.000      // Frame 235: The Finale (4 standing Realbeber packs on podiums)
};

class WebGLExperience {
  constructor() {
    this.container = document.getElementById('webgl-canvas-container');
    if (!this.container) return;

    this.scrollProgress = 0;
    this.targetFrame = 0;
    this.lastRenderedIndex = -1;
    this.scrollVelocity = 0;

    // Frames storage & preloading
    this.frames = new Array(TOTAL_FRAMES);
    this.loadedFrames = new Set();

    this.initCanvas();
    this.initLenis();
    this.initDOMHotspots();
    this.preloadMilestoneFrames();
    this.setupEvents();
    this.setupScrollTriggers();
  }

  /* -------------------------------------------------------------
     1. High-DPI Canvas Setup (Locked, Zero Cursor Tilt)
  ------------------------------------------------------------- */
  initCanvas() {
    this.container.innerHTML = '';
    this.canvas = document.createElement('canvas');
    this.canvas.id = 'scene-scrubber-canvas';

    this.ctx = this.canvas.getContext('2d', {
      alpha: false,
      desynchronized: true
    });
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';

    // Completely lock canvas transform: ZERO tilt when moving cursor left/right
    this.canvas.style.position = 'fixed';
    this.canvas.style.top = '0';
    this.canvas.style.left = '0';
    this.canvas.style.width = '100vw';
    this.canvas.style.height = '100vh';
    this.canvas.style.objectFit = 'cover';
    this.canvas.style.transform = 'none';
    this.canvas.style.pointerEvents = 'none';

    this.container.style.transform = 'none';
    this.container.style.perspective = 'none';
    this.container.appendChild(this.canvas);

    this.onResize();
  }

  onResize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.canvas.width = Math.round(this.width * dpr);
    this.canvas.height = Math.round(this.height * dpr);

    if (this.ctx) {
      this.ctx.imageSmoothingEnabled = true;
      this.ctx.imageSmoothingQuality = 'high';
    }

    this.lastRenderedIndex = -1;
    this.renderFrame(this.targetFrame);
  }

  /* -------------------------------------------------------------
     2. Asynchronous Milestone Preloader
  ------------------------------------------------------------- */
  preloadMilestoneFrames() {
    const formatNumber = (num) => String(num).padStart(3, '0');

    const loadFrame = (index) => {
      if (this.frames[index]) return Promise.resolve(this.frames[index]);

      return new Promise((resolve) => {
        const img = new Image();
        img.src = `${BASE_FRAME_URL}${formatNumber(index)}.webp`;

        if (img.decode) {
          img.decode().then(() => {
            this.frames[index] = img;
            this.loadedFrames.add(index);
            if (this.lastRenderedIndex === -1 && index === 0) {
              this.renderFrame(0);
            }
            resolve(img);
          }).catch(() => {
            img.onload = () => {
              this.frames[index] = img;
              this.loadedFrames.add(index);
              resolve(img);
            };
          });
        } else {
          img.onload = () => {
            this.frames[index] = img;
            this.loadedFrames.add(index);
            resolve(img);
          };
        }
      });
    };

    // Phase 1: Frame 0 for instant initial render
    loadFrame(0).then(() => {
      // Phase 2: Key milestones for each world
      const milestones = [0, 20, 45, 75, 95, 120, 140, 155, 175, 185, 210, 235, 239];
      Promise.all(milestones.map(loadFrame)).then(() => {
        // Phase 3: Buffer all remaining frames progressively
        let nextIdx = 1;
        const loadBatch = () => {
          const batch = [];
          for (let k = 0; k < 12 && nextIdx < TOTAL_FRAMES; k++) {
            if (!this.loadedFrames.has(nextIdx)) {
              batch.push(loadFrame(nextIdx));
            }
            nextIdx++;
          }

          if (batch.length > 0) {
            Promise.all(batch).then(() => {
              if (nextIdx < TOTAL_FRAMES) {
                if (window.requestIdleCallback) {
                  window.requestIdleCallback(loadBatch, { timeout: 120 });
                } else {
                  setTimeout(loadBatch, 16);
                }
              }
            });
          }
        };

        loadBatch();
      });
    });
  }

  /* -------------------------------------------------------------
     3. Lenis Smooth Scroll with Direct Frame Scrubbing (Zero Lag)
  ------------------------------------------------------------- */
  initLenis() {
    this.lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5
    });

    this.lenis.on('scroll', (e) => {
      ScrollTrigger.update();
      this.scrollVelocity = e.velocity || 0;
      audioEngine.modulateVelocity(this.scrollVelocity);

      if (e.limit > 0) {
        this.scrollProgress = Math.min(1.0, Math.max(0.0, e.scroll / e.limit));
        this.targetFrame = Math.min(TOTAL_FRAMES - 1, Math.max(0, Math.round(this.scrollProgress * (TOTAL_FRAMES - 1))));
        this.renderFrame(this.targetFrame);
      }
    });

    gsap.ticker.add((time) => {
      this.lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
  }

  /* -------------------------------------------------------------
     4. Navigation to Specific World (Smooth Page Transitions)
  ------------------------------------------------------------- */
  navigateToWorld(worldName, duration = 1.3) {
    const ratio = WORLD_RATIOS[worldName] !== undefined ? WORLD_RATIOS[worldName] : 0;
    const limit = this.lenis.limit || (document.documentElement.scrollHeight - window.innerHeight);
    const targetScrollY = limit * ratio;

    audioEngine.playClick();
    this.lenis.scrollTo(targetScrollY, { duration });
  }

  getCurrentWorldIndex() {
    const p = this.scrollProgress;
    if (p < 0.20) return 0; // Portal
    if (p < 0.42) return 1; // Mango
    if (p < 0.58) return 2; // Jackfruit
    if (p < 0.72) return 3; // Chikoo
    if (p < 0.88) return 4; // Banana
    return 5; // Finale
  }

  navigateStep(direction) {
    const worlds = ['portal', 'mango', 'jackfruit', 'chikoo', 'banana', 'finale'];
    const currentIdx = this.getCurrentWorldIndex();
    const nextIdx = Math.min(worlds.length - 1, Math.max(0, currentIdx + direction));
    this.navigateToWorld(worlds[nextIdx], 1.2);
  }

  /* -------------------------------------------------------------
     5. ScrollTrigger Telemetry
  ------------------------------------------------------------- */
  setupScrollTriggers() {
    ScrollTrigger.create({
      trigger: '#scroll-container',
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        this.updateTelemetry(self.progress);
      }
    });
  }

  updateTelemetry(progress) {
    if (progress > 0.88) {
      document.body.classList.add('theme-dark');
    } else {
      document.body.classList.remove('theme-dark');
    }

    const pip = document.getElementById('telemetry-pip');
    if (pip) {
      pip.style.top = `${Math.min(100, Math.max(0, progress * 100))}%`;
    }

    const exploreBtn = document.getElementById('explore-collection-btn');
    if (exploreBtn) {
      if (progress > 0.88) {
        exploreBtn.style.opacity = '1';
        exploreBtn.style.pointerEvents = 'auto';
      } else {
        exploreBtn.style.opacity = '0';
        exploreBtn.style.pointerEvents = 'none';
      }
    }
  }

  /* -------------------------------------------------------------
     6. High-Clarity Canvas Frame Render (Dirty-Flag Optimized)
  ------------------------------------------------------------- */
  renderFrame(frameIndex) {
    if (frameIndex === this.lastRenderedIndex) return;

    let img = this.frames[frameIndex];

    if (!img || !img.complete) {
      let nearest = null;
      let minDiff = Infinity;
      for (const loadedIdx of this.loadedFrames) {
        const diff = Math.abs(loadedIdx - frameIndex);
        if (diff < minDiff) {
          minDiff = diff;
          nearest = this.frames[loadedIdx];
        }
      }
      img = nearest;
    }

    if (!img || !img.complete) return;

    const cw = this.canvas.width;
    const ch = this.canvas.height;
    const iw = img.naturalWidth || img.width;
    const ih = img.naturalHeight || img.height;
    if (!iw || !ih) return;

    const scale = Math.max(cw / iw, ch / ih);
    const dw = iw * scale;
    const dh = ih * scale;
    const dx = (cw - dw) * 0.5;
    const dy = (ch - dh) * 0.5;

    this.ctx.drawImage(img, dx, dy, dw, dh);
    this.lastRenderedIndex = frameIndex;
  }

  /* -------------------------------------------------------------
     7. Setup Events & Hotspots
  ------------------------------------------------------------- */
  setupEvents() {
    window.addEventListener('resize', () => {
      this.onResize();
      ScrollTrigger.refresh();
    });
  }

  initDOMHotspots() {
    // Navigation Links
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener('click', (e) => {
        e.preventDefault();
        const href = a.getAttribute('href');
        if (href === '#section-portal' || href === '#') {
          this.navigateToWorld('portal');
        } else if (href === '#section-mango') {
          this.navigateToWorld('mango');
        } else if (href === '#section-jackfruit') {
          this.navigateToWorld('jackfruit');
        } else if (href === '#section-chikoo') {
          this.navigateToWorld('chikoo');
        } else if (href === '#section-banana') {
          this.navigateToWorld('banana');
        } else if (href === '#section-finale') {
          this.navigateToWorld('finale');
        }
      });
    });

    // Brand Logo
    const brandLogo = document.querySelector('.hud-brand-logo');
    if (brandLogo) {
      brandLogo.addEventListener('click', (e) => {
        e.preventDefault();
        this.navigateToWorld('portal');
      });
    }

    // Scroll explore pill
    const explorePill = document.getElementById('scroll-explore-pill');
    if (explorePill) {
      explorePill.addEventListener('click', () => {
        this.navigateToWorld('mango');
      });
    }

    // Telemetry Arrows: Smooth step to next / previous world
    const arrowUp = document.querySelector('.telemetry-arrow:first-child');
    const arrowDown = document.querySelector('.telemetry-arrow:last-child');
    if (arrowUp) {
      arrowUp.style.cursor = 'pointer';
      arrowUp.addEventListener('click', () => {
        this.navigateStep(-1);
      });
    }
    if (arrowDown) {
      arrowDown.style.cursor = 'pointer';
      arrowDown.addEventListener('click', () => {
        this.navigateStep(1);
      });
    }
  }
}

// Instantiate master experience once DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  window.webglExperience = new WebGLExperience();
});

export { WebGLExperience };
