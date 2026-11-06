/**
 * Realbeber & Co. - Core Application Logic
 * Initializes product cards, search modal, quick view, FAQ accordion,
 * newsletter handling, mobile menu, and keyboard accessibility.
 */

import { PRODUCTS } from './products.js';
import { CartController } from './cart.js';

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Cart
  window.cart = new CartController();

  // Render Product Cards in Grid
  renderProductGrid();

  // Initialize UI Controllers
  initHeroCarousel();
  initMobileMenu();
  initSearch();
  initQuickView();
  initFAQ();
  initNewsletter();
  initScrollEffects();
});

/**
 * Render four confirmed products in the collection grid
 */
function renderProductGrid() {
  const grid = document.getElementById('productGrid');
  if (!grid) return;

  grid.innerHTML = PRODUCTS.map(prod => `
    <article class="product-card" style="--card-bg: ${prod.cardBg}; --accent-color: ${prod.accentColor};" data-id="${prod.id}">
      <div class="product-card-inner">
        <!-- Top row: Badge and Quick View Trigger -->
        <div class="product-card-top">
          <span class="product-badge" style="color: ${prod.tagColor};">${prod.tag}</span>
          <button class="quick-view-btn" onclick="openQuickView('${prod.id}')" title="Quick view ${prod.name}" aria-label="Quick view ${prod.name}">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </button>
        </div>

        <!-- Standing 3D Pouch Image -->
        <div class="product-card-image-wrap" onclick="openQuickView('${prod.id}')" role="button" tabindex="0" aria-label="View ${prod.name} details">
          <img src="${prod.pouchImage}" alt="${prod.name} 3D pouch" class="product-pouch-img" loading="lazy">
        </div>

        <!-- Product Details -->
        <div class="product-card-details">
          <h3 class="product-card-title">${prod.name}</h3>
          <p class="product-card-desc">${prod.subtitle}</p>

          <div class="product-card-bottom">
            <span class="product-card-price">₹${prod.price}</span>
            <button class="add-to-cart-btn" onclick="window.cart.addItem('${prod.id}', 1)" aria-label="Add ${prod.name} to cart">
              <span>Add</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M5 12h14"/><path d="M12 5v14"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </article>
  `).join('');
}

/**
 * Auto-Changing Hero Slideshow Carousel
 * Automatically cycles through the 4 confirmed fruit varieties every 8 seconds.
 * Features simple centered dot indicators and interactive swipe/scroll-to-change.
 */
function initHeroCarousel() {
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.hero-dot');
  const flavorBadge = document.getElementById('currentHeroFlavor');
  const wrapper = document.getElementById('heroVisualCol');

  if (!slides.length) return;

  let currentIndex = 0;
  let timer = null;
  const intervalMs = 8000; // Changes with time every 8 seconds

  function goToSlide(index) {
    slides[currentIndex]?.classList.remove('active');
    dots[currentIndex]?.classList.remove('active');

    currentIndex = (index + slides.length) % slides.length;

    const nextSlide = slides[currentIndex];
    nextSlide?.classList.add('active');
    dots[currentIndex]?.classList.add('active');

    if (flavorBadge && nextSlide) {
      const flavor = nextSlide.getAttribute('data-flavor');
      if (flavor) flavorBadge.textContent = flavor;
    }
  }

  function nextSlide() {
    goToSlide(currentIndex + 1);
  }

  function prevSlide() {
    goToSlide(currentIndex - 1);
  }

  function startTimer() {
    stopTimer();
    timer = setInterval(nextSlide, intervalMs);
  }

  function stopTimer() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  // Centered Dots Navigation
  dots.forEach((dot, idx) => {
    dot.addEventListener('click', (e) => {
      e.preventDefault();
      goToSlide(idx);
      startTimer();
    });
  });

  // Swipe / Scroll to Next and Previous
  let startX = 0;
  let isDragging = false;

  // Touch Swipe
  wrapper?.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    stopTimer();
  }, { passive: true });

  wrapper?.addEventListener('touchend', (e) => {
    const endX = e.changedTouches[0].clientX;
    const diff = startX - endX;
    if (diff > 40) {
      // Swiped left -> scroll to the right (next slide)
      nextSlide();
    } else if (diff < -40) {
      // Swiped right -> previous slide
      prevSlide();
    }
    startTimer();
  }, { passive: true });

  // Mouse Drag / Swipe
  wrapper?.addEventListener('mousedown', (e) => {
    isDragging = true;
    startX = e.clientX;
    stopTimer();
  });

  window.addEventListener('mouseup', (e) => {
    if (!isDragging) return;
    isDragging = false;
    const diff = startX - e.clientX;
    if (diff > 45) {
      nextSlide();
    } else if (diff < -45) {
      prevSlide();
    }
    startTimer();
  });

  // Horizontal Wheel / Trackpad Scroll
  let wheelTimeout = null;
  wrapper?.addEventListener('wheel', (e) => {
    if (Math.abs(e.deltaX) > 25) {
      e.preventDefault();
      if (!wheelTimeout) {
        if (e.deltaX > 25) {
          nextSlide();
        } else {
          prevSlide();
        }
        startTimer();
        wheelTimeout = setTimeout(() => {
          wheelTimeout = null;
        }, 500);
      }
    }
  }, { passive: false });

  // Pause timer on hover, resume on leave
  wrapper?.addEventListener('mouseenter', stopTimer);
  wrapper?.addEventListener('mouseleave', startTimer);

  // Start 8-second auto-timer
  startTimer();
}

/**
 * Mobile Navigation Drawer
 */
function initMobileMenu() {
  const menuToggle = document.getElementById('mobileMenuToggle');
  const menuDrawer = document.getElementById('mobileNavDrawer');
  const menuClose = document.getElementById('mobileNavClose');
  const backdrop = document.getElementById('mobileNavBackdrop');
  const navLinks = document.querySelectorAll('.mobile-nav-link');

  if (!menuToggle || !menuDrawer) return;

  const openMenu = () => {
    menuDrawer.classList.add('active');
    if (backdrop) backdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const closeMenu = () => {
    menuDrawer.classList.remove('active');
    if (backdrop) backdrop.classList.remove('active');
    document.body.style.overflow = '';
  };

  menuToggle.addEventListener('click', openMenu);
  if (menuClose) menuClose.addEventListener('click', closeMenu);
  if (backdrop) backdrop.addEventListener('click', closeMenu);

  navLinks.forEach(link => {
    link.addEventListener('click', closeMenu);
  });
}

/**
 * Live Search Modal
 */
function initSearch() {
  const searchTriggers = document.querySelectorAll('.search-trigger-btn');
  const searchModal = document.getElementById('searchModal');
  const searchBackdrop = document.getElementById('searchBackdrop');
  const searchClose = document.getElementById('searchCloseBtn');
  const searchInput = document.getElementById('searchInput');
  const searchResults = document.getElementById('searchResults');
  const searchClear = document.getElementById('searchClearBtn');

  if (!searchModal || !searchInput) return;

  const openSearch = () => {
    searchModal.classList.add('active');
    if (searchBackdrop) searchBackdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
    setTimeout(() => searchInput.focus(), 80);
    renderResults(searchInput.value.trim());
  };

  const closeSearch = () => {
    searchModal.classList.remove('active');
    if (searchBackdrop) searchBackdrop.classList.remove('active');
    document.body.style.overflow = '';
  };

  searchTriggers.forEach(btn => btn.addEventListener('click', openSearch));
  if (searchClose) searchClose.addEventListener('click', closeSearch);
  if (searchBackdrop) searchBackdrop.addEventListener('click', closeSearch);

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && searchModal.classList.contains('active')) {
      closeSearch();
    }
  });

  const renderResults = (query) => {
    const q = query.toLowerCase();
    const filtered = PRODUCTS.filter(p => 
      p.name.toLowerCase().includes(q) ||
      p.flavor.toLowerCase().includes(q) ||
      p.subtitle.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
    );

    if (filtered.length === 0) {
      searchResults.innerHTML = `
        <div class="search-empty">
          <p>No products found matching "<strong>${escapeHtml(query)}</strong>"</p>
          <span class="search-hint">Only our four confirmed 100% natural varieties: Mango, Chikku, Jackfruit & Banana.</span>
        </div>
      `;
      return;
    }

    searchResults.innerHTML = filtered.map(prod => `
      <div class="search-result-item" onclick="openQuickView('${prod.id}'); document.getElementById('searchCloseBtn').click();">
        <div class="search-result-thumb" style="background-color: ${prod.cardBg};">
          <img src="${prod.pouchImage}" alt="${prod.name}">
        </div>
        <div class="search-result-info">
          <h4 class="search-result-title">${prod.name}</h4>
          <p class="search-result-desc">${prod.subtitle}</p>
          <span class="search-result-badge">${prod.origin}</span>
        </div>
        <div class="search-result-action">
          <span class="search-result-price">₹${prod.price}</span>
          <button class="search-add-btn" onclick="event.stopPropagation(); window.cart.addItem('${prod.id}', 1); document.getElementById('searchCloseBtn').click();">
            Add +
          </button>
        </div>
      </div>
    `).join('');
  };

  searchInput.addEventListener('input', (e) => {
    renderResults(e.target.value.trim());
    if (searchClear) {
      searchClear.style.display = e.target.value ? 'flex' : 'none';
    }
  });

  if (searchClear) {
    searchClear.addEventListener('click', () => {
      searchInput.value = '';
      searchClear.style.display = 'none';
      renderResults('');
      searchInput.focus();
    });
  }
}

/**
 * Quick View Product Modal
 */
let currentQuickViewProduct = null;
let quickViewQty = 1;

function initQuickView() {
  const modal = document.getElementById('quickViewModal');
  const backdrop = document.getElementById('quickViewBackdrop');
  const closeBtn = document.getElementById('quickViewCloseBtn');

  if (closeBtn) closeBtn.addEventListener('click', closeQuickView);
  if (backdrop) backdrop.addEventListener('click', closeQuickView);

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.classList.contains('active')) {
      closeQuickView();
    }
  });
}

function openQuickView(productId) {
  const prod = PRODUCTS.find(p => p.id === productId);
  if (!prod) return;

  currentQuickViewProduct = prod;
  quickViewQty = 1;

  const modal = document.getElementById('quickViewModal');
  const backdrop = document.getElementById('quickViewBackdrop');
  const content = document.getElementById('quickViewContent');

  if (!modal || !content) return;

  content.innerHTML = `
    <div class="quick-view-grid">
      <!-- Visual Column -->
      <div class="quick-view-visual" style="background-color: ${prod.cardBg};">
        <div class="quick-view-badge" style="color: ${prod.tagColor};">${prod.tag}</div>
        <img src="${prod.pouchImage}" alt="${prod.name}" class="quick-view-pouch-img">
        <div class="quick-view-origin-tag">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a8 8 0 0 0-8 8c0 5 8 12 8 12s8-7 8-12a8 8 0 0 0-8-8z"/><circle cx="12" cy="10" r="3"/></svg>
          <span>From God's Own Country: ${prod.origin}</span>
        </div>
      </div>

      <!-- Info Column -->
      <div class="quick-view-body">
        <div class="qv-header">
          <span class="qv-category">100% Freeze Dried Fruit</span>
          <h2 class="qv-title">${prod.name}</h2>
          <p class="qv-subtitle">${prod.subtitle}</p>
          <div class="qv-price-row">
            <span class="qv-price">₹${prod.price}</span>
            <span class="qv-weight">${prod.weight}</span>
          </div>
        </div>

        <p class="qv-description">${prod.description}</p>

        <!-- Product Badges -->
        <div class="qv-badges">
          ${prod.badges.map(b => `<span class="qv-badge-pill">${b}</span>`).join('')}
        </div>

        <!-- Clean Ingredients -->
        <div class="qv-ingredients-box">
          <div class="qv-ing-label">INGREDIENT LIST (1 ONLY):</div>
          <div class="qv-ing-value">${prod.ingredients}</div>
        </div>

        <!-- Nutrition Facts Grid -->
        <div class="qv-nutrition-grid">
          <div class="qv-nutr-item">
            <span class="qv-nutr-label">Fruit Ratio</span>
            <span class="qv-nutr-val">10:1 Fresh Fruit</span>
          </div>
          <div class="qv-nutr-item">
            <span class="qv-nutr-label">Calories</span>
            <span class="qv-nutr-val">${prod.nutrition.energy}</span>
          </div>
          <div class="qv-nutr-item">
            <span class="qv-nutr-label">Added Sugar</span>
            <span class="qv-nutr-val">0g (Zero)</span>
          </div>
          <div class="qv-nutr-item">
            <span class="qv-nutr-label">Cooking Oil</span>
            <span class="qv-nutr-val">0g (Oil-Free)</span>
          </div>
        </div>

        <!-- Add to cart bar -->
        <div class="qv-cta-bar">
          <div class="quantity-control qv-qty-ctrl">
            <button class="qty-btn" onclick="updateQuickViewQty(-1)" aria-label="Decrease quantity">−</button>
            <span class="qty-value" id="qvQtyDisplay">1</span>
            <button class="qty-btn" onclick="updateQuickViewQty(1)" aria-label="Increase quantity">+</button>
          </div>
          <button class="qv-add-btn" onclick="addQuickViewToCart()">
            Add to Bag • ₹<span id="qvTotalPrice">${prod.price}</span>
          </button>
        </div>
      </div>
    </div>
  `;

  modal.classList.add('active');
  if (backdrop) backdrop.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function updateQuickViewQty(delta) {
  if (!currentQuickViewProduct) return;
  quickViewQty = Math.max(1, quickViewQty + delta);
  const qtyEl = document.getElementById('qvQtyDisplay');
  const priceEl = document.getElementById('qvTotalPrice');
  if (qtyEl) qtyEl.textContent = quickViewQty;
  if (priceEl) priceEl.textContent = currentQuickViewProduct.price * quickViewQty;
}

function addQuickViewToCart() {
  if (!currentQuickViewProduct) return;
  window.cart.addItem(currentQuickViewProduct.id, quickViewQty);
  closeQuickView();
  window.cart.openDrawer();
}

function closeQuickView() {
  const modal = document.getElementById('quickViewModal');
  const backdrop = document.getElementById('quickViewBackdrop');
  if (modal) modal.classList.remove('active');
  if (backdrop) backdrop.classList.remove('active');
  document.body.style.overflow = '';
  currentQuickViewProduct = null;
}

/**
 * FAQ Accordion
 */
function initFAQ() {
  const items = document.querySelectorAll('.faq-item');
  items.forEach(item => {
    const trigger = item.querySelector('.faq-question-btn');
    if (!trigger) return;

    trigger.addEventListener('click', () => {
      const isOpen = item.classList.contains('active');
      items.forEach(i => i.classList.remove('active'));
      if (!isOpen) {
        item.classList.add('active');
      }
    });
  });
}

/**
 * Newsletter Form
 */
function initNewsletter() {
  const forms = document.querySelectorAll('.newsletter-form');
  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('input[type="email"]');
      if (!input || !input.value.trim()) return;

      const email = input.value.trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(email)) {
        window.cart.showToast('Invalid Email', 'Please provide a valid email address.', 'error');
        return;
      }

      // Success
      input.value = '';
      window.cart.showToast('Subscribed!', 'Welcome to Realbeber & Co.! Check your inbox for 15% off.', 'success');
    });
  });
}

/**
 * Header Scroll Effects & Smooth Navigation
 */
function initScrollEffects() {
  const header = document.querySelector('.site-header');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }
  }, { passive: true });

  // Smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || !targetId.startsWith('#')) return;
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

function escapeHtml(str) {
  return str.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
}

if (typeof window !== 'undefined') {
  window.openQuickView = openQuickView;
  window.closeQuickView = closeQuickView;
  window.updateQuickViewQty = updateQuickViewQty;
  window.addQuickViewToCart = addQuickViewToCart;
  window.escapeHtml = escapeHtml;
}

