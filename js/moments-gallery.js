/**
 * Realbeber & Co. - Lifestyle Moments Horizontal Draggable Gallery
 * Inspired by Fresh Can's Moments carousel:
 * Desktop drag with inertia, mobile swipe, card tilt micro-interactions.
 */

export class MomentsGallery {
  constructor(containerEl) {
    this.container = containerEl;
    if (!this.container) return;

    this.track = this.container.querySelector('.moments-track');
    this.cards = this.container.querySelectorAll('.moment-card');
    this.prevBtn = this.container.querySelector('.moments-nav-btn.prev');
    this.nextBtn = this.container.querySelector('.moments-nav-btn.next');

    this.isDown = false;
    this.startX = 0;
    this.currentTranslate = 0;
    this.prevTranslate = 0;
    this.animationId = null;
    this.maxScroll = 0;

    this.init();
  }

  init() {
    this.calculateBounds();
    this.bindEvents();
  }

  calculateBounds() {
    if (!this.track || !this.container) return;
    const trackWidth = this.track.scrollWidth;
    const containerWidth = this.container.offsetWidth;
    this.maxScroll = Math.max(0, trackWidth - containerWidth + 60);
  }

  bindEvents() {
    // Mouse Drag
    this.track.addEventListener('mousedown', (e) => {
      this.isDown = true;
      this.startX = e.pageX - this.track.offsetLeft;
      this.prevTranslate = this.currentTranslate;
      this.track.classList.add('is-dragging');
      cancelAnimationFrame(this.animationId);
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.isDown) return;
      e.preventDefault();
      const x = e.pageX - this.track.offsetLeft;
      const walk = (x - this.startX) * 1.4;
      this.currentTranslate = Math.max(-this.maxScroll, Math.min(0, this.prevTranslate + walk));
      this.setTrackPosition();
    });

    window.addEventListener('mouseup', () => {
      if (!this.isDown) return;
      this.isDown = false;
      this.track.classList.remove('is-dragging');
    });

    // Touch Swipe
    this.track.addEventListener('touchstart', (e) => {
      this.isDown = true;
      this.startX = e.touches[0].pageX - this.track.offsetLeft;
      this.prevTranslate = this.currentTranslate;
      cancelAnimationFrame(this.animationId);
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (!this.isDown) return;
      const x = e.touches[0].pageX - this.track.offsetLeft;
      const walk = (x - this.startX) * 1.3;
      this.currentTranslate = Math.max(-this.maxScroll, Math.min(0, this.prevTranslate + walk));
      this.setTrackPosition();
    }, { passive: true });

    window.addEventListener('touchend', () => {
      this.isDown = false;
    });

    // Arrow Buttons
    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', () => {
        this.scrollByAmount(-380);
      });
    }
    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', () => {
        this.scrollByAmount(380);
      });
    }

    window.addEventListener('resize', () => {
      this.calculateBounds();
      this.currentTranslate = Math.max(-this.maxScroll, Math.min(0, this.currentTranslate));
      this.setTrackPosition();
    });
  }

  scrollByAmount(amount) {
    this.currentTranslate = Math.max(-this.maxScroll, Math.min(0, this.currentTranslate + amount));
    this.track.style.transition = 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1)';
    this.setTrackPosition();
    setTimeout(() => {
      if (this.track) this.track.style.transition = '';
    }, 450);
  }

  setTrackPosition() {
    if (this.track) {
      this.track.style.transform = `translateX(${this.currentTranslate}px)`;
    }
  }
}

export function initMomentsGallery() {
  const container = document.getElementById('momentsSection');
  if (container) {
    return new MomentsGallery(container);
  }
  return null;
}

