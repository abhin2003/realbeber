/**
 * REALBEBER & CO. — PERFORMANCE-FOCUSED SCROLLYTELLING ENGINE
 * High-DPI Retina Backing Store, Whole-Pixel Math, Zero-Jitter Lerp,
 * createImageBitmap Asynchronous Decoding, and Grounded Center Stage UX.
 */

export const FLAVORS = {
  mango: {
    id: 'mango',
    name: 'Mango',
    tagline: 'Sun-ripened Alphonso notes',
    accentStart: '#FFB000',
    accentEnd: '#FF6A00',
    glow: 'rgba(255, 120, 0, 0.16)',
    folder: 'sequences/mango',
    heroSub: 'Freeze-dried at peak ripeness. Crunchy, light, and bursting with tropical honey sweetness.'
  },
  chikku: {
    id: 'chikku',
    name: 'Chikku',
    tagline: 'Caramel malt fudge sweetness',
    accentStart: '#C68B59',
    accentEnd: '#8B5A2B',
    glow: 'rgba(198, 139, 89, 0.18)',
    folder: 'sequences/chikku',
    heroSub: 'Velvety Kerala sapodilla freeze-dried into honeycomb wafers with rich caramel notes.'
  },
  jackfruit: {
    id: 'jackfruit',
    name: 'Jackfruit',
    tagline: 'Sweet tropical golden petals',
    accentStart: '#F5C518',
    accentEnd: '#E3A008',
    glow: 'rgba(245, 197, 24, 0.16)',
    folder: 'sequences/jackfruit',
    heroSub: 'Pure Varikka jackfruit freeze-dried to crisp perfection with intense aromatic aroma.'
  },
  banana: {
    id: 'banana',
    name: 'Banana',
    tagline: 'Crisp natural crunch, pure Kerala',
    accentStart: '#FFE066',
    accentEnd: '#F7C948',
    glow: 'rgba(255, 224, 102, 0.14)',
    folder: 'sequences/banana',
    heroSub: 'Delicate sun-ripened Kerala banana slices, airy crunch with zero oil or sugar added.'
  }
};

const TOTAL_FRAMES = 120;
const INITIAL_PRELOAD_COUNT = 20;

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

    // DOM Elements
    this.canvas = document.getElementById('scrollytelling-canvas');
    this.ctx = this.canvas ? this.canvas.getContext('2d', { alpha: true, desynchronized: true }) : null;
    this.wrapper = document.getElementById('scrollytelling-section');
    this.navbar = document.getElementById('apple-navbar');
    this.preloader = document.getElementById('preloader');
    this.preloadBar = document.getElementById('preload-bar-fill');
    this.preloadText = document.getElementById('preload-status-text');

    // Story Beats
    this.beatHero = document.getElementById('beat-hero');
    this.beatInside = document.getElementById('beat-inside');
    this.beatFruit = document.getElementById('beat-fruit');
    this.beatCrunch = document.getElementById('beat-crunch');
    this.beatCta = document.getElementById('beat-cta');

    // Cart State
    this.cart = [
      { id: 'mango', name: 'Mango Frost Chips', price: 149, qty: 1, img: 'assets/products/mango_clean_pouch.png' }
    ];

    this.init();
  }

  async init() {
    this.setupCanvas();
    this.bindEvents();
    this.renderCart();

    // 1. Preload initial 20 frames immediately for instant interactive start
    await this.preloadInitialBatch('mango');

    // Dismiss preloader as soon as the first interactive frames are ready
    if (this.preloader) {
      this.preloader.classList.add('loaded');
    }

    // Force immediate first frame render
    this.drawFrame(0);

    // 2. Load remaining frames progressively in background
    this.loadRemainingFrames('mango');

    // 3. Background-preload secondary flavors
    setTimeout(() => {
      this.preloadSecondaryFlavors();
    }, 1500);
  }

  /**
   * STEP 2: Strict High-DPI Canvas Backing Store
   * Matches backing store exactly to CSS size * DPR (capped at 2 for performance)
   * Resets transform matrix and sets high-quality image smoothing
   */
  setupCanvas() {
    if (!this.canvas || !this.ctx) return;

    // Cap DPR at 2.0 to balance crystal clarity with memory/performance
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cssWidth = window.innerWidth;
    const cssHeight = window.innerHeight;

    // Set backing store dimensions
    this.canvas.width = Math.round(cssWidth * dpr);
    this.canvas.height = Math.round(cssHeight * dpr);

    // Keep CSS dimensions strictly matching viewport
    this.canvas.style.width = `${cssWidth}px`;
    this.canvas.style.height = `${cssHeight}px`;

    // Reset transform matrix and scale for DPR
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(dpr, dpr);

    // Enable high-quality texture smoothing
    this.ctx.imageSmoothingEnabled = true;
    this.ctx.imageSmoothingQuality = 'high';

    // Immediate redraw on resize to prevent blur
    this.lastDrawnFrame = -1;
    this.drawFrame(Math.round(this.currentFrame));
  }

  /**
   * STEP 4: Asynchronous Bitmap Decoding with createImageBitmap & decode()
   */
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
      // Fallback for standard Image loader
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
        // Progressive interleaved preload
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

    // Scroll mapping
    window.addEventListener('scroll', () => {
      this.handleScroll();
    }, { passive: true });

    // Flavor switcher
    document.querySelectorAll('.flavor-tab').forEach((tab) => {
      tab.addEventListener('click', (e) => {
        const flavor = e.currentTarget.dataset.flavor;
        this.switchFlavor(flavor);
      });
    });

    // Bag Modal triggers
    const bagBtn = document.getElementById('bag-btn');
    const drawerOverlay = document.getElementById('bag-drawer-overlay');
    const drawerClose = document.getElementById('drawer-close');

    if (bagBtn && drawerOverlay) {
      bagBtn.addEventListener('click', () => drawerOverlay.classList.add('open'));
    }
    if (drawerClose && drawerOverlay) {
      drawerClose.addEventListener('click', () => drawerOverlay.classList.remove('open'));
    }
    if (drawerOverlay) {
      drawerOverlay.addEventListener('click', (e) => {
        if (e.target === drawerOverlay) drawerOverlay.classList.remove('open');
      });
    }

    // Product Add to Bag
    document.addEventListener('click', (e) => {
      if (e.target && e.target.classList.contains('card-add-btn')) {
        const id = e.target.dataset.id;
        this.addToCart(id);
      }
    });
  }

  handleScroll() {
    const scrollY = window.scrollY;

    // 1. Apple Navbar glassmorphism
    if (this.navbar) {
      if (scrollY > 60) {
        this.navbar.classList.add('scrolled');
      } else {
        this.navbar.classList.remove('scrolled');
      }
    }

    // 2. Scrollytelling Section Progress (0.0 to 1.0)
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

    // 3. Update Story Beats (Clean floating panels without moving the canvas)
    this.updateStoryBeats(progress);
  }

  tick() {
    // Zero-jitter lerp smoothing
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
   * STEP 2: Whole-Pixel Integer Contain Math
   * Eliminates fractional subpixel blur across canvas edges
   */
  drawFrame(frameIndex) {
    if (!this.ctx || !this.canvas) return;

    const cssWidth = window.innerWidth;
    const cssHeight = window.innerHeight;

    let drawable = this.framesCache[this.activeFlavor][frameIndex];

    // If frame is still loading, fallback to closest loaded frame to avoid flicker
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

  /**
   * UX FIX: Rock-Solid Centered Product Stage
   * No horizontal ping-pong or zigzag drifting.
   * Product stays centered; story beats transition in around it.
   */
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

    // Update active tab UI
    document.querySelectorAll('.flavor-tab').forEach((tab) => {
      tab.classList.toggle('active', tab.dataset.flavor === flavorKey);
    });

    // Update hero subtitle flavor copy
    const heroSubEl = document.getElementById('hero-flavor-subtitle');
    if (heroSubEl) {
      heroSubEl.textContent = FLAVORS[flavorKey].heroSub;
    }

    // Ensure current frame is loaded for new flavor
    const frameIdx = Math.round(this.currentFrame);
    if (!this.framesCache[flavorKey][frameIdx]) {
      const folder = FLAVORS[flavorKey].folder;
      const drawable = await this.loadSingleFrame(folder, frameIdx);
      this.framesCache[flavorKey][frameIdx] = drawable;
    }

    this.lastDrawnFrame = -1;
    this.drawFrame(frameIdx);

    // Preload remaining frames for this newly selected flavor
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
