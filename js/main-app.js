/**
 * Realbeber - Main App Controller
 * Handles HUD interactions, collection drawer, audio engine, and cart state.
 */

import { audioEngine } from './audio-engine.js';
import mangoPouch from '../assets/products/mango_clean_pouch.png';
import chikkuPouch from '../assets/products/chikku_clean_pouch.png';
import jackfruitPouch from '../assets/products/jackfruit_clean_pouch.png';
import bananaPouch from '../assets/products/banana_clean_pouch.png';

const PRODUCTS = [
  {
    id: 'mango-frost-chips',
    name: 'Mango Frost Chips',
    flavor: 'Alphonso Mango',
    desc: 'Sun-ripened Kerala Alphonso, freeze-dried at -40°C. 100% pure fruit, zero oil, ethereal melt-in-mouth crunch.',
    price: 149,
    img: mangoPouch
  },
  {
    id: 'chikku-frost-chips',
    name: 'Chikku Frost Chips',
    flavor: 'Sapodilla',
    desc: 'Velvety sapodilla freeze-dried into airy honeycomb slices with rich caramel malt fudge notes.',
    price: 139,
    img: chikkuPouch
  },
  {
    id: 'jackfruit-frost-chips',
    name: 'Jackfruit Frost Chips',
    flavor: 'Varikka Jackfruit',
    desc: 'Crisp golden Varikka jackfruit petals from Idukki with aromatic tropical sweetness.',
    price: 149,
    img: jackfruitPouch
  },
  {
    id: 'banana-frost-chips',
    name: 'Banana Frost Chips',
    flavor: 'Kerala Banana',
    desc: 'Delicate crisp slices of pure Kerala banana. 100% natural fruit crunch with zero added oil.',
    price: 129,
    img: bananaPouch
  }
];

class MainApp {
  constructor() {
    this.cart = [];
    this.initDOM();
    this.renderProducts();
    this.bindEvents();
  }

  initDOM() {
    this.audioBtn = document.getElementById('audio-toggle');
    this.cartBtn = document.getElementById('cart-btn');
    this.cartBadge = document.querySelector('.cart-badge');
    this.exploreBtn = document.getElementById('explore-collection-btn');
    this.drawerOverlay = document.getElementById('collection-drawer-overlay');
    this.drawerClose = document.getElementById('drawer-close-btn');
    this.productsContainer = document.getElementById('drawer-products-list');
    this.scrollExploreBtn = document.getElementById('scroll-explore-pill');
  }

  renderProducts() {
    if (!this.productsContainer) return;
    this.productsContainer.innerHTML = PRODUCTS.map((p) => `
      <div class="drawer-product-card">
        <img src="${p.img}" alt="${p.name}" class="drawer-product-img">
        <div class="drawer-product-info">
          <h3 class="drawer-product-name">${p.name}</h3>
          <p class="drawer-product-desc">${p.desc}</p>
          <div class="drawer-product-price">₹${p.price}</div>
          <button class="drawer-add-btn" data-id="${p.id}">ADD TO BAG +</button>
        </div>
      </div>
    `).join('');
  }

  bindEvents() {
    // Audio Toggle
    if (this.audioBtn) {
      this.audioBtn.addEventListener('click', () => {
        const isPlaying = audioEngine.toggle();
        this.audioBtn.classList.toggle('audio-active', isPlaying);
      });
    }

    // Collection Drawer Open / Close
    if (this.exploreBtn && this.drawerOverlay) {
      this.exploreBtn.addEventListener('click', () => {
        audioEngine.playClick();
        this.drawerOverlay.classList.add('active');
      });
    }

    if (this.drawerClose && this.drawerOverlay) {
      this.drawerClose.addEventListener('click', () => {
        audioEngine.playClick();
        this.drawerOverlay.classList.remove('active');
      });
    }

    if (this.drawerOverlay) {
      this.drawerOverlay.addEventListener('click', (e) => {
        if (e.target === this.drawerOverlay) {
          this.drawerOverlay.classList.remove('active');
        }
      });
    }

    // Add to Cart
    document.addEventListener('click', (e) => {
      if (e.target && e.target.classList.contains('drawer-add-btn')) {
        const prodId = e.target.dataset.id;
        const prod = PRODUCTS.find((p) => p.id === prodId);
        if (prod) {
          this.cart.push(prod);
          audioEngine.playClick();
          if (this.cartBadge) {
            this.cartBadge.textContent = this.cart.length;
            this.cartBadge.style.transform = 'scale(1.35)';
            setTimeout(() => {
              this.cartBadge.style.transform = 'scale(1.0)';
            }, 250);
          }
          e.target.textContent = 'ADDED ✓';
          e.target.style.backgroundColor = '#10B981';
          setTimeout(() => {
            e.target.textContent = 'ADD TO BAG +';
            e.target.style.backgroundColor = '';
          }, 1800);
        }
      }
    });

    // Scroll Explore Click
    if (this.scrollExploreBtn) {
      this.scrollExploreBtn.addEventListener('click', () => {
        audioEngine.playClick();
        if (window.webglExperience?.navigateToWorld) {
          window.webglExperience.navigateToWorld('mango');
        } else {
          window.webglExperience?.lenis?.scrollTo('#section-mango', { duration: 1.5 });
        }
      });
    }

    // Cart Button Click
    if (this.cartBtn && this.drawerOverlay) {
      this.cartBtn.addEventListener('click', () => {
        audioEngine.playClick();
        this.drawerOverlay.classList.add('active');
      });
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.mainApp = new MainApp();
});

