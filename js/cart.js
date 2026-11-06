/**
 * Realbeber & Co. - Shopping Cart Controller
 * Supports localStorage persistence, dynamic totals, free shipping progress,
 * quantity adjustments, slide-over drawer and visual feedback.
 */
import { PRODUCTS } from './products.js';

export class CartController {
  constructor() {
    this.storageKey = 'realbeber_cart_v1';
    this.freeShippingThreshold = 499;
    this.items = this.loadCart();
    this.initElements();
    this.bindEvents();
    this.render();
  }

  loadCart() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [
        // Pre-populate with 1 Mango Frost Chips as a realistic initial demo state
        { productId: 'mango-frost-chips', quantity: 1 }
      ];
    } catch (e) {
      console.warn('Failed to parse cart storage:', e);
      return [];
    }
  }

  saveCart() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.items));
    } catch (e) {
      console.warn('Failed to save cart to storage:', e);
    }
  }

  initElements() {
    this.cartDrawer = document.getElementById('cartDrawer');
    this.cartBackdrop = document.getElementById('cartBackdrop');
    this.cartCloseBtn = document.getElementById('cartCloseBtn');
    this.cartTriggerBtns = document.querySelectorAll('.cart-trigger-btn');
    this.cartItemsList = document.getElementById('cartItemsList');
    this.cartCountBadges = document.querySelectorAll('.cart-count-badge');
    this.cartSubtotalEl = document.getElementById('cartSubtotal');
    this.cartTotalEl = document.getElementById('cartTotal');
    this.shippingProgressEl = document.getElementById('shippingProgress');
    this.shippingMessageEl = document.getElementById('shippingMessage');
    this.cartEmptyState = document.getElementById('cartEmptyState');
    this.cartFooter = document.getElementById('cartFooter');
    this.checkoutBtn = document.getElementById('checkoutBtn');
  }

  bindEvents() {
    // Triggers
    this.cartTriggerBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.openDrawer();
      });
    });

    if (this.cartCloseBtn) {
      this.cartCloseBtn.addEventListener('click', () => this.closeDrawer());
    }

    if (this.cartBackdrop) {
      this.cartBackdrop.addEventListener('click', () => this.closeDrawer());
    }

    // Escape key
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeDrawer();
      }
    });

    // Checkout demo
    if (this.checkoutBtn) {
      this.checkoutBtn.addEventListener('click', () => {
        if (this.items.length === 0) return;
        this.showToast('Order Prototype', 'Checkout completed for demo! Order placed successfully.', 'success');
        this.items = [];
        this.saveCart();
        this.render();
        setTimeout(() => this.closeDrawer(), 1200);
      });
    }
  }

  openDrawer() {
    if (this.cartDrawer) this.cartDrawer.classList.add('active');
    if (this.cartBackdrop) this.cartBackdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  closeDrawer() {
    if (this.cartDrawer) this.cartDrawer.classList.remove('active');
    if (this.cartBackdrop) this.cartBackdrop.classList.remove('active');
    document.body.style.overflow = '';
  }

  addItem(productId, quantity = 1) {
    const existing = this.items.find(item => item.productId === productId);
    if (existing) {
      existing.quantity += quantity;
    } else {
      this.items.push({ productId, quantity });
    }
    this.saveCart();
    this.render();

    const product = PRODUCTS.find(p => p.id === productId);
    if (product) {
      this.showToast('Added to Crunch Bag', `${product.name} (x${quantity}) added.`, 'cart');
    }
  }

  updateQuantity(productId, delta) {
    const item = this.items.find(i => i.productId === productId);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
      this.removeItem(productId);
      return;
    }

    this.saveCart();
    this.render();
  }

  removeItem(productId) {
    const product = PRODUCTS.find(p => p.id === productId);
    this.items = this.items.filter(i => i.productId !== productId);
    this.saveCart();
    this.render();
    if (product) {
      this.showToast('Item Removed', `${product.name} removed from your bag.`, 'info');
    }
  }

  getTotalCount() {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  getSubtotal() {
    return this.items.reduce((sum, item) => {
      const prod = PRODUCTS.find(p => p.id === item.productId);
      return sum + (prod ? prod.price * item.quantity : 0);
    }, 0);
  }

  render() {
    const totalCount = this.getTotalCount();
    const subtotal = this.getSubtotal();

    // Badges
    this.cartCountBadges.forEach(badge => {
      badge.textContent = totalCount;
      if (totalCount > 0) {
        badge.classList.add('has-items');
      } else {
        badge.classList.remove('has-items');
      }
    });

    // Subtotal & Total
    if (this.cartSubtotalEl) this.cartSubtotalEl.textContent = `₹${subtotal}`;
    if (this.cartTotalEl) this.cartTotalEl.textContent = `₹${subtotal}`;

    // Free Shipping Progress
    if (this.shippingProgressEl && this.shippingMessageEl) {
      if (subtotal >= this.freeShippingThreshold) {
        this.shippingProgressEl.style.width = '100%';
        this.shippingMessageEl.innerHTML = '🎉 You unlocked <strong>FREE Shipping</strong> across Kerala & India!';
      } else {
        const remaining = this.freeShippingThreshold - subtotal;
        const percent = Math.min(100, Math.round((subtotal / this.freeShippingThreshold) * 100));
        this.shippingProgressEl.style.width = `${percent}%`;
        this.shippingMessageEl.innerHTML = `Add <strong>₹${remaining}</strong> more for <strong>FREE shipping</strong>!`;
      }
    }

    // List rendering
    if (!this.cartItemsList) return;

    if (this.items.length === 0) {
      this.cartItemsList.innerHTML = '';
      if (this.cartEmptyState) this.cartEmptyState.style.display = 'block';
      if (this.cartFooter) this.cartFooter.style.display = 'none';
      return;
    }

    if (this.cartEmptyState) this.cartEmptyState.style.display = 'none';
    if (this.cartFooter) this.cartFooter.style.display = 'block';

    this.cartItemsList.innerHTML = this.items.map(item => {
      const prod = PRODUCTS.find(p => p.id === item.productId);
      if (!prod) return '';
      const lineTotal = prod.price * item.quantity;

      return `
        <div class="cart-item" data-product-id="${prod.id}">
          <div class="cart-item-image" style="background-color: ${prod.cardBg}">
            <img src="${prod.pouchImage}" alt="${prod.name}" loading="lazy">
          </div>
          <div class="cart-item-info">
            <div class="cart-item-header">
              <h4 class="cart-item-title">${prod.name}</h4>
              <button class="cart-item-remove-btn" onclick="window.cart.removeItem('${prod.id}')" title="Remove item" aria-label="Remove item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            </div>
            <p class="cart-item-meta">${prod.weight}</p>
            <div class="cart-item-footer">
              <div class="quantity-control">
                <button class="qty-btn" onclick="window.cart.updateQuantity('${prod.id}', -1)" aria-label="Decrease quantity">−</button>
                <span class="qty-value">${item.quantity}</span>
                <button class="qty-btn" onclick="window.cart.updateQuantity('${prod.id}', 1)" aria-label="Increase quantity">+</button>
              </div>
              <div class="cart-item-price">₹${lineTotal}</div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  showToast(title, message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast-item toast-${type}`;
    toast.innerHTML = `
      <div class="toast-indicator"></div>
      <div class="toast-content">
        <h5 class="toast-title">${title}</h5>
        <p class="toast-message">${message}</p>
      </div>
      <button class="toast-close-btn" aria-label="Close notification">&times;</button>
    `;

    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('visible'));

    toast.querySelector('.toast-close-btn').addEventListener('click', () => {
      toast.classList.remove('visible');
      setTimeout(() => toast.remove(), 300);
    });

    setTimeout(() => {
      if (toast.parentElement) {
        toast.classList.remove('visible');
        setTimeout(() => toast.remove(), 300);
      }
    }, 3500);
  }
}

if (typeof window !== 'undefined') {
  window.CartController = CartController;
}

