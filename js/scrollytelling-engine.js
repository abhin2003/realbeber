/**
 * REALBEBER & CO. — SCROLLYTELLING ENGINE
 * Apple-Level 120-Frame Canvas Scrubbing, 4-Flavor Crossfade,
 * Frame Lerp Interpolation & Synchronized Story Beats
 */

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

class ScrollytellingEngine {
  constructor() {
    this.activeFlavor = 'mango';
    this.framesCache = {
      mango: [],
      chikku: [],
      jackfruit: [],
      banana: []
    };

    this.currentFrame = 0;
    this.targetFrame = 0;
    this.isRendering = false;
    this.crossfadeAlpha = 1.0;
    this.previousFlavor = null;

    // DOM Elements
    this.canvas = document.getElementById('scrollytelling-canvas');
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
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

    // Cart
    this.cart = [
      { id: 'mango', name: 'Mango Frost Chips', price: 149, qty: 1, img: 'assets/products/mango_clean_pouch.png' }
    ];

    this.init();
  }

  async init() {
    this.setupCanvas();
    this.bindEvents();
    this.renderCart();

    // Start preloading primary flavor (Mango)
    await this.preloadFlavorFrames('mango', (progress) => {
      if (this.preloadBar) this.preloadBar.style.width = `${progress * 100}%`;
      if (this.preloadText) this.preloadText.textContent = `Preloading 4K Visuals ${Math.round(progress * 100)}%`;
    });

    // Dismiss preloader
    if (this.preloader) {
      this.preloader.classList.add('loaded');
    }

    // Initial render
    this.render();

    // Preload remaining flavors in background
    this.preloadRemainingFlavors();
  }

  setupCanvas() {
    if (!this.canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = this.canvas.getBoundingClientRect();
    const w = rect.width || window.innerWidth;
    const h = rect.height || window.innerHeight;

    this.canvas.width = w * dpr;
    this.canvas.height = h * dpr;
    if (this.ctx) {
      this.ctx.scale(dpr, dpr);
    }
  }

  async preloadFlavorFrames(flavorKey, onProgress) {
    const list = [];
    const folder = FLAVORS[flavorKey].folder;
    let loaded = 0;

    return new Promise((resolve) => {
      for (let i = 0; i < TOTAL_FRAMES; i++) {
        const img = new Image();
        const frameNum = String(i).padStart(3, '0');
        img.src = `${folder}/frame_${frameNum}.webp`;

        img.onload = () => {
          loaded++;
          if (onProgress) onProgress(loaded / TOTAL_FRAMES);
          if (loaded === TOTAL_FRAMES) {
            this.framesCache[flavorKey] = list;
            resolve(list);
          }
        };

        img.onerror = () => {
          loaded++;
          if (loaded === TOTAL_FRAMES) {
            this.framesCache[flavorKey] = list;
            resolve(list);
          }
        };

        list[i] = img;
      }
    });
  }

  async preloadRemainingFlavors() {
    const others = ['chikku', 'jackfruit', 'banana'];
    for (const flavor of others) {
      await this.preloadFlavorFrames(flavor);
    }
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      this.setupCanvas();
      this.requestRender();
    });

    // Scroll mapping
    window.addEventListener('scroll', () => {
      this.handleScroll();
    }, { passive: true });

    // Flavor switcher clicks
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

    // Card Add Buttons
    document.addEventListener('click', (e) => {
      if (e.target && e.target.classList.contains('card-add-btn')) {
        const id = e.target.dataset.id;
        this.addToCart(id);
      }
    });
  }

  handleScroll() {
    const scrollY = window.scrollY;

    // 1. Apple Navbar glassmorphism threshold
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
    const currentScroll = Math.max(0, -rect.top);
    const progress = Math.min(Math.max(currentScroll / totalScroll, 0), 1);

    // Map progress to frame index (0..119)
    this.targetFrame = Math.min(Math.floor(progress * TOTAL_FRAMES), TOTAL_FRAMES - 1);
    this.requestRender();

    // 3. Update Story Beats based on exact prompt specifications
    // 0–15% Hero
    // 15–40% Inside the pack
    // 40–65% The fruit
    // 65–85% The crunch
    // 85–100% Reassembly + CTA
    this.updateStoryBeats(progress);
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

    // Dynamic responsive 3D camera drift & focal scale
    if (this.canvas) {
      if (window.innerWidth > 900) {
        if (p < 0.15) {
          this.canvas.style.transform = 'translate(-50%, -38%) scale(1.08)';
        } else if (p >= 0.15 && p < 0.40) {
          this.canvas.style.transform = 'translate(calc(-50% + 14vw), -48%) scale(1.18)';
        } else if (p >= 0.40 && p < 0.65) {
          this.canvas.style.transform = 'translate(calc(-50% - 14vw), -48%) scale(1.20)';
        } else if (p >= 0.65 && p < 0.85) {
          this.canvas.style.transform = 'translate(calc(-50% + 13vw), -48%) scale(1.22)';
        } else {
          this.canvas.style.transform = 'translate(-50%, -48%) scale(1.12)';
        }
      } else {
        this.canvas.style.transform = 'translate(-50%, -45%) scale(1.02)';
      }
    }
  }

  switchFlavor(flavorKey) {
    if (!FLAVORS[flavorKey] || flavorKey === this.activeFlavor) return;

    this.previousFlavor = this.activeFlavor;
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

    this.requestRender();
  }

  requestRender() {
    if (!this.isRendering) {
      this.isRendering = true;
      requestAnimationFrame(() => this.render());
    }
  }

  render() {
    if (!this.ctx || !this.canvas) {
      this.isRendering = false;
      return;
    }

    // Lerp frame smoothing
    const diff = this.targetFrame - this.currentFrame;
    if (Math.abs(diff) < 0.05) {
      this.currentFrame = this.targetFrame;
    } else {
      this.currentFrame += diff * 0.18;
    }

    const frameIdx = Math.round(this.currentFrame);
    const activeList = this.framesCache[this.activeFlavor];
    const img = activeList && activeList[frameIdx];

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = this.canvas.width / dpr;
    const height = this.canvas.height / dpr;

    this.ctx.clearRect(0, 0, width, height);

    if (img && img.complete && img.naturalWidth > 0) {
      // Calculate aspect ratio fit (contain)
      const imgRatio = img.naturalWidth / img.naturalHeight;
      const canvasRatio = width / height;

      let drawW, drawH;
      if (canvasRatio > imgRatio) {
        drawH = height;
        drawW = height * imgRatio;
      } else {
        drawW = width;
        drawH = width / imgRatio;
      }

      const drawX = (width - drawW) / 2;
      const drawY = (height - drawH) / 2;

      this.ctx.drawImage(img, drawX, drawY, drawW, drawH);
    }

    // Continue render loop if lerp is not finished
    if (Math.abs(this.targetFrame - this.currentFrame) >= 0.05) {
      requestAnimationFrame(() => this.render());
    } else {
      this.isRendering = false;
    }
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
