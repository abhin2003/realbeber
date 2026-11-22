/**
 * REALBEBER & CO. — AWWWARDS-GRADE SCROLLYTELLING ENGINE
 * Smooth Lenis Inertia Scroll, 3D Parallax Tilt, High-DPI Canvas Backing Store,
 * Whole-Pixel Contain Math, Web Audio Micro-Interactions, and Zero-Lag Scrubbing.
 */

import Lenis from 'lenis';
import { audioEngine } from './audio-engine.js';

export const FLAVORS = {
  mango: {
    id: 'mango',
    name: 'Mango',
    tagline: 'Sun-ripened Alphonso notes',
    accentStart: '#FFB000',
    accentEnd: '#FF6A00',
    glow: 'rgba(255, 120, 0, 0.18)',
    folder: 'sequences/mango',
    heroSub: 'Freeze-dried at peak ripeness. Crunchy, light, and bursting with tropical honey sweetness.'
  },
  chikku: {
    id: 'chikku',
    name: 'Chikku',
    tagline: 'Caramel malt fudge sweetness',
    accentStart: '#C68B59',
    accentEnd: '#8B5A2B',
    glow: 'rgba(198, 139, 89, 0.20)',
    folder: 'sequences/chikku',
    heroSub: 'Velvety Kerala sapodilla freeze-dried into honeycomb wafers with rich caramel notes.'
  },
  jackfruit: {
    id: 'jackfruit',
    name: 'Jackfruit',
    tagline: 'Sweet tropical golden petals',
    accentStart: '#F5C518',
    accentEnd: '#E3A008',
    glow: 'rgba(245, 197, 24, 0.18)',
    folder: 'sequences/jackfruit',
    heroSub: 'Pure Varikka jackfruit freeze-dried to crisp perfection with intense aromatic aroma.'
  },
  banana: {
    id: 'banana',
    name: 'Banana',
    tagline: 'Crisp natural crunch, pure Kerala',
    accentStart: '#FFE066',
    accentEnd: '#F7C948',
    glow: 'rgba(255, 224, 102, 0.16)',
    folder: 'sequences/banana',
    heroSub: 'Delicate sun-ripened Kerala banana slices, airy crunch with zero oil or sugar added.'
  }
};

const TOTAL_FRAMES = 120;
const INITIAL_PRELOAD_COUNT = 24;

class ScrollytellingEngine {
  constructor() {
    this.activeFlavor = 'mango';
    this.framesCache = {
      mango: new Array(TOTAL_FRAMES),
      chikku: new Array(TOTAL_FRAMES),
      jackfruit: new Array(TOTAL_FRAMES),
      banana: new Array(TOTAL_FRAMES)
    };

    this.currentFrame = 0;
    this.targetFrame = 0;
    this.lastDrawnFrame = -1;
    this.isTicking = false;

    // Mouse Parallax values
    this.mouseTargetX = 0;
    this.mouseTargetY = 0;
    this.mouseCurrentX = 0;
    this.mouseCurrentY = 0;

    // DOM Elements
    this.canvas = document.getElementById('scrollytelling-canvas');
    this.ctx = this.canvas ? this.canvas.getContext('2d', { alpha: true, desynchronized: true }) : null;
    this.stage = document.getElementById('canvas-stage');
    this.wrapper = document.getElementById('scrollytelling-section');
    this.navbar = document.getElementById('apple-navbar');
    this.preloader = document.getElementById('preloader');
    this.preloadBar = document.getElementById('preload-bar-fill');
    this.preloadText = document.getElementById('preload-status-text');
    this.soundToggle = document.getElementById('sound-toggle-btn');

    // Story Beats
    this.beatHero = document.getElementById('beat-hero');
    this.beatInside = document.getElementById('beat-inside');
    this.beatFruit = document.getElementById('beat-fruit');
    this.beatCrunch = document.getElementById('beat-crunch');
    this.beatCta = document.getElementById('beat-cta');

    // Shopping Bag State
    this.cart = [
      { id: 'mango', name: 'Mango Frost Chips', price: 149, qty: 1, img: 'assets/products/mango_clean_pouch.png' }
    ];

    this.initLenis();
    this.init();
  }

  initLenis() {
    try {
      this.lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 0.95
      });

      const raf = (time) => {
        this.lenis.raf(time);
        requestAnimationFrame(raf);
      };
      requestAnimationFrame(raf);

      this.lenis.on('scroll', () => {
        this.handleScroll();
      });
    } catch (e) {
      console.warn('Lenis fallback to native scroll', e);
      window.addEventListener('scroll', () => this.handleScroll(), { passive: true });
    }
  }

  async init() {
    this.setupCanvas();
    this.bindEvents();
    this.renderCart();

    // Preload initial frames for instant responsiveness
    await this.preloadInitialBatch('mango');

    // Dismiss preloader
    if (this.preloader) {
      this.preloader.classList.add('loaded');
    }

    // Force first frame render
    this.drawFrame(0);

    // Preload remaining frames in background
    this.loadRemainingFrames('mango');

    // Background load secondary flavors
    setTimeout(() => {
      this.preloadSecondaryFlavors();
    }, 1200);

    // Start subtle parallax ticker loop
    this.startParallaxLoop();
  }

  setupCanvas() {
    if (!this.canvas || !this.ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cssWidth = window.innerWidth;
    const cssHeight = window.innerHeight;

    this.canvas.width = Math.round(cssWidth * dpr);
    this.canvas.height = Math.round(cssHeight * dpr);

    this.canvas.style.width = `${cssWidth}px`;
    this.canvas.style.height = `${cssHeight}px`;

    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(dpr, dpr);

    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';

    this.lastDrawnFrame = -1;
    this.drawFrame(Math.round(this.currentFrame));
  }

  async loadSingleFrame(folder, index) {
    const frameNum = String(index).padStart(3, '0');
    const src = `${folder}/frame_${frameNum}.webp`;

    try {
      if ('createImageBitmap' in window) {
        const response = await fetch(src);
        const blob = await response.blob();
        return await createImageBitmap(blob);
      } else {
        const img = new Image();
        img.src = src;
        await img.decode();
        return img;
      }
    } catch {
      return new Promise((resolve) => {
        const img = new Image();
        img.src = src;
        img.onload = () => resolve(img);
        img.onerror = () => resolve(null);
      });
    }
  }

  async preloadInitialBatch(flavorKey) {
    const folder = FLAVORS[flavorKey].folder;
    const promises = [];

    for (let i = 0; i < INITIAL_PRELOAD_COUNT; i++) {
      promises.push(
        this.loadSingleFrame(folder, i).then((drawable) => {
          this.framesCache[flavorKey][i] = drawable;
          if (this.preloadBar) {
            const p = (i + 1) / INITIAL_PRELOAD_COUNT;
            this.preloadBar.style.width = `${p * 100}%`;
          }
        })
      );
    }

    await Promise.all(promises);
    if (this.preloadText) this.preloadText.textContent = 'READY';
  }

  async loadRemainingFrames(flavorKey) {
    const folder = FLAVORS[flavorKey].folder;
    for (let i = INITIAL_PRELOAD_COUNT; i < TOTAL_FRAMES; i++) {
      if (!this.framesCache[flavorKey][i]) {
        const drawable = await this.loadSingleFrame(folder, i);
        this.framesCache[flavorKey][i] = drawable;
      }
    }
  }

  async preloadSecondaryFlavors() {
    const others = ['chikku', 'jackfruit', 'banana'];
    for (const key of others) {
      const folder = FLAVORS[key].folder;
      for (let i = 0; i < TOTAL_FRAMES; i += 2) {
        if (!this.framesCache[key][i]) {
          const drawable = await this.loadSingleFrame(folder, i);
          this.framesCache[key][i] = drawable;
        }
      }
    }
  }

  bindEvents() {
    const onResize = () => {
      this.setupCanvas();
    };

    window.addEventListener('resize', onResize, { passive: true });
    window.addEventListener('orientationchange', onResize, { passive: true });

    // Interactive 3D mouse parallax tracking
    window.addEventListener('mousemove', (e) => {
      const normX = (e.clientX / window.innerWidth) * 2 - 1;
      const normY = (e.clientY / window.innerHeight) * 2 - 1;
      this.mouseTargetX = normX * 1.8; // Max tilt degrees
      this.mouseTargetY = normY * -1.8;
    }, { passive: true });

    // Sound toggle
    if (this.soundToggle) {
      this.soundToggle.addEventListener('click', () => {
        const isPlaying = audioEngine.toggle();
        this.soundToggle.classList.toggle('sound-active', isPlaying);
      });
    }

    // Flavor switcher
    document.querySelectorAll('.flavor-tab').forEach((tab) => {
      tab.addEventListener('click', (e) => {
        audioEngine.playClick();
        const flavor = e.currentTarget.dataset.flavor;
        this.switchFlavor(flavor);
      });
    });

    // Bag Modal triggers
    const bagBtn = document.getElementById('bag-btn');
    const drawerOverlay = document.getElementById('bag-drawer-overlay');
    const drawerClose = document.getElementById('drawer-close');

    if (bagBtn && drawerOverlay) {
      bagBtn.addEventListener('click', () => {
        audioEngine.playClick();
        drawerOverlay.classList.add('open');
      });
    }
    if (drawerClose && drawerOverlay) {
      drawerClose.addEventListener('click', () => {
        audioEngine.playClick();
        drawerOverlay.classList.remove('open');
      });
    }
    if (drawerOverlay) {
      drawerOverlay.addEventListener('click', (e) => {
        if (e.target === drawerOverlay) drawerOverlay.classList.remove('open');
      });
    }

    // Product Add to Bag
    document.addEventListener('click', (e) => {
      if (e.target && e.target.classList.contains('card-add-btn')) {
        audioEngine.playClick();
        const id = e.target.dataset.id;
        this.addToCart(id);
      }
    });
  }

  startParallaxLoop() {
    const update = () => {
      this.mouseCurrentX += (this.mouseTargetX - this.mouseCurrentX) * 0.08;
      this.mouseCurrentY += (this.mouseTargetY - this.mouseCurrentY) * 0.08;

      if (this.stage) {
        this.stage.style.transform = `perspective(1000px) rotateY(${this.mouseCurrentX}deg) rotateX(${this.mouseCurrentY}deg)`;
      }

      requestAnimationFrame(update);
    };
    requestAnimationFrame(update);
  }

  handleScroll() {
    const scrollY = window.scrollY;

    // Navbar glassmorphism
    if (this.navbar) {
      if (scrollY > 50) {
        this.navbar.classList.add('scrolled');
      } else {
        this.navbar.classList.remove('scrolled');
      }
    }

    // Scrollytelling Section Progress (0.0 to 1.0)
    if (!this.wrapper) return;
    const rect = this.wrapper.getBoundingClientRect();
    const totalScroll = this.wrapper.offsetHeight - window.innerHeight;
    if (totalScroll <= 0) return;

    const currentScroll = Math.max(0, -rect.top);
    const progress = Math.min(Math.max(currentScroll / totalScroll, 0), 1);

    // Map progress to frame index (0..119)
    this.targetFrame = Math.min(Math.floor(progress * (TOTAL_FRAMES - 1)), TOTAL_FRAMES - 1);

    if (!this.isTicking) {
      this.isTicking = true;
      requestAnimationFrame(() => this.tick());
    }

    // Synchronize Story Beats (Pure floating editorial typography)
    this.updateStoryBeats(progress);
  }

  tick() {
    const diff = this.targetFrame - this.currentFrame;
    if (Math.abs(diff) < 0.05) {
      this.currentFrame = this.targetFrame;
    } else {
      this.currentFrame += diff * 0.22;
    }

    const frameToDraw = Math.round(this.currentFrame);
    if (frameToDraw !== this.lastDrawnFrame) {
      this.drawFrame(frameToDraw);
    }

    if (Math.abs(this.targetFrame - this.currentFrame) >= 0.05) {
      requestAnimationFrame(() => this.tick());
    } else {
      this.isTicking = false;
    }
  }

  /**
   * Whole-Pixel Integer Contain Math
   * Rock-Solid Centered Product Hero Stage
   */
  drawFrame(frameIndex) {
    if (!this.ctx || !this.canvas) return;

    const cssWidth = window.innerWidth;
    const cssHeight = window.innerHeight;

    let drawable = this.framesCache[this.activeFlavor][frameIndex];

    if (!drawable) {
      for (let offset = 1; offset < 10; offset++) {
        if (this.framesCache[this.activeFlavor][frameIndex - offset]) {
          drawable = this.framesCache[this.activeFlavor][frameIndex - offset];
          break;
        }
        if (this.framesCache[this.activeFlavor][frameIndex + offset]) {
          drawable = this.framesCache[this.activeFlavor][frameIndex + offset];
          break;
        }
      }
    }

    if (!drawable) return;

    const naturalWidth = drawable.width || 1280;
    const naturalHeight = drawable.height || 720;
    const imgRatio = naturalWidth / naturalHeight;
    const canvasRatio = cssWidth / cssHeight;

    let drawW, drawH;
    if (canvasRatio > imgRatio) {
      drawH = cssHeight;
      drawW = Math.round(cssHeight * imgRatio);
    } else {
      drawW = cssWidth;
      drawH = Math.round(cssWidth / imgRatio);
    }

    // Integer whole-pixel positions to prevent soft subpixel edges
    const drawX = Math.round((cssWidth - drawW) / 2);
    const drawY = Math.round((cssHeight - drawH) / 2);

    this.ctx.clearRect(0, 0, cssWidth, cssHeight);
    this.ctx.drawImage(drawable, drawX, drawY, drawW, drawH);

    this.lastDrawnFrame = frameIndex;
  }

  updateStoryBeats(p) {
    const setActive = (el, active) => {
      if (!el) return;
      if (active) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    };

    setActive(this.beatHero, p < 0.15);
    setActive(this.beatInside, p >= 0.15 && p < 0.40);
    setActive(this.beatFruit, p >= 0.40 && p < 0.65);
    setActive(this.beatCrunch, p >= 0.65 && p < 0.85);
    setActive(this.beatCta, p >= 0.85);
  }

  async switchFlavor(flavorKey) {
    if (!FLAVORS[flavorKey] || flavorKey === this.activeFlavor) return;

    this.activeFlavor = flavorKey;
    document.documentElement.dataset.activeFlavor = flavorKey;

    document.querySelectorAll('.flavor-tab').forEach((tab) => {
      tab.classList.toggle('active', tab.dataset.flavor === flavorKey);
    });

    const heroSubEl = document.getElementById('hero-flavor-subtitle');
    if (heroSubEl) {
      heroSubEl.textContent = FLAVORS[flavorKey].heroSub;
    }

    const frameIdx = Math.round(this.currentFrame);
    if (!this.framesCache[flavorKey][frameIdx]) {
      const folder = FLAVORS[flavorKey].folder;
      const drawable = await this.loadSingleFrame(folder, frameIdx);
      this.framesCache[flavorKey][frameIdx] = drawable;
    }

    this.lastDrawnFrame = -1;
    this.drawFrame(frameIdx);

    this.loadRemainingFrames(flavorKey);
  }

  addToCart(flavorId) {
    const existing = this.cart.find((item) => item.id === flavorId);
    if (existing) {
      existing.qty++;
    } else {
      const flavor = FLAVORS[flavorId];
      if (flavor) {
        this.cart.push({
          id: flavorId,
          name: `${flavor.name} Frost Chips`,
          price: 149,
          qty: 1,
          img: `assets/products/${flavorId}_clean_pouch.png`
        });
      }
    }
    this.renderCart();

    const overlay = document.getElementById('bag-drawer-overlay');
    if (overlay) overlay.classList.add('open');
  }

  renderCart() {
    const countEl = document.getElementById('bag-count');
    const listEl = document.getElementById('drawer-items-list');
    const totalEl = document.getElementById('drawer-total-price');

    const totalQty = this.cart.reduce((sum, item) => sum + item.qty, 0);
    const totalPrice = this.cart.reduce((sum, item) => sum + item.price * item.qty, 0);

    if (countEl) countEl.textContent = totalQty;
    if (totalEl) totalEl.textContent = `₹${totalPrice}`;

    if (listEl) {
      listEl.innerHTML = this.cart.map((item) => `
        <div class="drawer-item">
          <img src="${item.img}" alt="${item.name}" class="drawer-item-img">
          <div class="drawer-item-details">
            <div class="drawer-item-name">${item.name}</div>
            <div class="drawer-item-price">₹${item.price} × ${item.qty}</div>
          </div>
          <div style="font-weight: 700;">₹${item.price * item.qty}</div>
        </div>
      `).join('');
    }
  }
}

// Instantiate on DOM load
window.addEventListener('DOMContentLoaded', () => {
  window.scrollyEngine = new ScrollytellingEngine();
});
