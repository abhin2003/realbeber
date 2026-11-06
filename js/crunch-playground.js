/**
 * Realbeber & Co. - Interactive Fruit Playground: "Turn up the crunch."
 * Playful physics drag-and-fill mini-game inspired by Fresh Can's coconut interaction.
 * Users drag or tap freeze-dried fruit pieces into the Realbeber pouch to fill the crunch meter!
 */

export class CrunchPlayground {
  constructor(canvasEl) {
    this.canvas = canvasEl;
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.rafId = null;

    // Game State
    this.score = 0;
    this.targetScore = 10;
    this.isCompleted = false;
    this.particles = [];
    this.fruitPieces = [];
    this.draggedPiece = null;
    this.mouse = { x: 0, y: 0, isDown: false };

    // Pouch Target Area
    this.pouch = {
      x: 0,
      y: 0,
      width: 140,
      height: 180,
      scaleX: 1,
      scaleY: 1
    };

    // Pouch Image
    this.pouchImg = new Image();
    this.pouchImg.src = 'assets/products/mango_clean_pouch.png';

    // Audio Context for Procedural Crunchy Sound FX
    this.audioCtx = null;

    this.init();
  }

  init() {
    this.resize();
    this.spawnFruits();
    this.bindEvents();
    this.loop();
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.scale(dpr, dpr);
    this.width = rect.width;
    this.height = rect.height;

    // Center pouch at the bottom
    this.pouch.width = Math.min(160, this.width * 0.28);
    this.pouch.height = this.pouch.width * 1.35;
    this.pouch.x = (this.width - this.pouch.width) / 2;
    this.pouch.y = this.height - this.pouch.height - 24;
  }

  spawnFruits() {
    const fruitTypes = [
      { name: 'Mango', color: '#F59E0B', radius: 24, shape: 'cube' },
      { name: 'Banana', color: '#FDE047', radius: 22, shape: 'disc' },
      { name: 'Chikku', color: '#B45309', radius: 20, shape: 'oval' },
      { name: 'Jackfruit', color: '#EAB308', radius: 26, shape: 'shard' }
    ];

    this.fruitPieces = [];
    const count = 10;
    for (let i = 0; i < count; i++) {
      const type = fruitTypes[i % fruitTypes.length];
      const x = 50 + Math.random() * (this.width - 100);
      const y = 40 + Math.random() * (this.height * 0.45);
      this.fruitPieces.push({
        ...type,
        x,
        y,
        vx: (Math.random() - 0.5) * 1.5,
        vy: 0.5 + Math.random() * 0.8,
        angle: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.04,
        isGrabbed: false
      });
    }
  }

  playCrunchSound() {
    try {
      if (!this.audioCtx) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.audioCtx = new AudioContext();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      // Synthesize crispy snack crunch crackle with noise buffer & lowpass sweep
      const bufferSize = this.audioCtx.sampleRate * 0.08;
      const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
      }

      const whiteNoise = this.audioCtx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = this.audioCtx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2400, this.audioCtx.currentTime);
      filter.Q.setValueAtTime(3.0, this.audioCtx.currentTime);

      const gain = this.audioCtx.createGain();
      gain.gain.setValueAtTime(0.35, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.08);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.audioCtx.destination);

      whiteNoise.start();
    } catch (e) {
      // Audio not permitted or supported
    }
  }

  createCrunchBurst(x, y, color, playSound = false) {
    if (playSound) {
      this.playCrunchSound();
    }

    // Spawn 18 vibrant crunch particles
    for (let i = 0; i < 18; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 5;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        size: 3 + Math.random() * 5,
        color: Math.random() > 0.5 ? color : '#FFB638',
        alpha: 1.0,
        decay: 0.025 + Math.random() * 0.03,
        rot: Math.random() * Math.PI,
        vRot: (Math.random() - 0.5) * 0.2
      });
    }

    // Squash & Stretch pouch
    this.pouch.scaleX = 1.15;
    this.pouch.scaleY = 0.88;
  }

  bindEvents() {
    const getPos = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: clientX - rect.left,
        y: clientY - rect.top
      };
    };

    const onDown = (e) => {
      const pos = getPos(e);
      this.mouse.x = pos.x;
      this.mouse.y = pos.y;
      this.mouse.isDown = true;

      // Find clicked fruit
      for (let i = this.fruitPieces.length - 1; i >= 0; i--) {
        const p = this.fruitPieces[i];
        const dist = Math.hypot(p.x - pos.x, p.y - pos.y);
        if (dist < p.radius + 12) {
          this.draggedPiece = p;
          p.isGrabbed = true;
          break;
        }
      }
    };

    const onMove = (e) => {
      const pos = getPos(e);
      this.mouse.x = pos.x;
      this.mouse.y = pos.y;

      if (this.draggedPiece) {
        this.draggedPiece.x = pos.x;
        this.draggedPiece.y = pos.y;
        this.draggedPiece.vx = 0;
        this.draggedPiece.vy = 0;
      }
    };

    const onUp = () => {
      if (this.draggedPiece) {
        this.draggedPiece.isGrabbed = false;
        // Check if dropped into pouch (User Action!)
        this.checkPouchDrop(this.draggedPiece, true);
        this.draggedPiece = null;
      }
      this.mouse.isDown = false;
    };

    this.canvas.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);

    this.canvas.addEventListener('touchstart', onDown, { passive: true });
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('touchend', onUp);

    window.addEventListener('resize', () => this.resize());

    // Reset button
    const resetBtn = document.getElementById('playgroundResetBtn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.reset());
    }
  }

  checkPouchDrop(piece, isUserDrop = false) {
    const p = this.pouch;
    const inX = piece.x >= p.x && piece.x <= p.x + p.width;
    const inY = piece.y >= p.y && piece.y <= p.y + p.height + 20;

    if (inX && inY) {
      // Score point!
      this.score++;
      this.createCrunchBurst(piece.x, p.y + 20, piece.color, isUserDrop);

      // Remove piece from array
      this.fruitPieces = this.fruitPieces.filter((f) => f !== piece);

      // Update UI meter
      this.updateScoreUI();

      // Check win
      if (this.score >= this.targetScore && !this.isCompleted) {
        this.triggerWin();
      } else {
        // Spawn a new fruit at the top so it never runs dry
        setTimeout(() => {
          if (!this.isCompleted) {
            const fruitTypes = [
              { name: 'Mango', color: '#F59E0B', radius: 24, shape: 'cube' },
              { name: 'Banana', color: '#FDE047', radius: 22, shape: 'disc' },
              { name: 'Chikku', color: '#B45309', radius: 20, shape: 'oval' },
              { name: 'Jackfruit', color: '#EAB308', radius: 26, shape: 'shard' }
            ];
            const type = fruitTypes[Math.floor(Math.random() * fruitTypes.length)];
            this.fruitPieces.push({
              ...type,
              x: 50 + Math.random() * (this.width - 100),
              y: -20,
              vx: (Math.random() - 0.5) * 1.5,
              vy: 1.2 + Math.random() * 0.8,
              angle: Math.random() * Math.PI * 2,
              vRot: (Math.random() - 0.5) * 0.04,
              isGrabbed: false
            });
          }
        }, 300);
      }
    }
  }

  updateScoreUI() {
    const counterEl = document.getElementById('crunchMeterCount');
    const barEl = document.getElementById('crunchMeterBar');
    if (counterEl) counterEl.textContent = `${this.score}/${this.targetScore}`;
    if (barEl) barEl.style.width = `${Math.min(100, (this.score / this.targetScore) * 100)}%`;
  }

  triggerWin() {
    this.isCompleted = true;
    const rewardEl = document.getElementById('playgroundRewardModal');
    if (rewardEl) {
      rewardEl.classList.add('is-visible');
    }

    // Massive Golden Confetti Shower
    for (let i = 0; i < 80; i++) {
      const angle = (Math.random() * Math.PI) + Math.PI;
      const speed = 4 + Math.random() * 8;
      this.particles.push({
        x: this.pouch.x + this.pouch.width / 2,
        y: this.pouch.y + 20,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3,
        size: 4 + Math.random() * 6,
        color: ['#FFB638', '#F16D54', '#527A51', '#FFFFFF', '#A93F65'][Math.floor(Math.random() * 5)],
        alpha: 1.0,
        decay: 0.012 + Math.random() * 0.015,
        rot: Math.random() * Math.PI,
        vRot: (Math.random() - 0.5) * 0.3
      });
    }
  }

  reset() {
    this.score = 0;
    this.isCompleted = false;
    this.updateScoreUI();
    this.spawnFruits();
    const rewardEl = document.getElementById('playgroundRewardModal');
    if (rewardEl) rewardEl.classList.remove('is-visible');
  }

  loop() {
    this.rafId = requestAnimationFrame(() => this.loop());
    this.ctx.clearRect(0, 0, this.width, this.height);

    // 1. Draw Target Snack Pouch
    this.pouch.scaleX += (1.0 - this.pouch.scaleX) * 0.12;
    this.pouch.scaleY += (1.0 - this.pouch.scaleY) * 0.12;

    const pw = this.pouch.width * this.pouch.scaleX;
    const ph = this.pouch.height * this.pouch.scaleY;
    const px = this.pouch.x + (this.pouch.width - pw) / 2;
    const py = this.pouch.y + (this.pouch.height - ph);

    // Glowing pouch base halo
    const grad = this.ctx.createRadialGradient(px + pw / 2, py + ph / 2, 20, px + pw / 2, py + ph / 2, pw * 0.9);
    grad.addColorStop(0, 'rgba(255, 182, 56, 0.35)');
    grad.addColorStop(1, 'rgba(255, 182, 56, 0)');
    this.ctx.fillStyle = grad;
    this.ctx.beginPath();
    this.ctx.arc(px + pw / 2, py + ph / 2, pw * 0.85, 0, Math.PI * 2);
    this.ctx.fill();

    // Pouch image
    if (this.pouchImg.complete) {
      this.ctx.drawImage(this.pouchImg, px, py, pw, ph);
    } else {
      this.ctx.fillStyle = '#FFB638';
      this.ctx.roundRect(px, py, pw, ph, 16);
      this.ctx.fill();
    }

    // 2. Update and Draw Fruit Pieces
    this.fruitPieces.forEach((p) => {
      if (!p.isGrabbed) {
        p.x += p.vx;
        p.y += p.vy;
        p.angle += p.vRot;

        // Bounce walls
        if (p.x - p.radius < 10) {
          p.x = 10 + p.radius;
          p.vx *= -0.8;
        } else if (p.x + p.radius > this.width - 10) {
          p.x = this.width - 10 - p.radius;
          p.vx *= -0.8;
        }

        // Check if falls into pouch automatically
        this.checkPouchDrop(p);

        // Respawn if reaches bottom without touching pouch
        if (p.y > this.height + 30) {
          p.y = -20;
          p.x = 50 + Math.random() * (this.width - 100);
        }
      }

      // Draw fruit crisp
      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate(p.angle);

      this.ctx.fillStyle = p.color;
      this.ctx.shadowColor = 'rgba(0,0,0,0.18)';
      this.ctx.shadowBlur = p.isGrabbed ? 14 : 6;
      this.ctx.shadowOffsetY = p.isGrabbed ? 8 : 3;

      if (p.shape === 'cube') {
        // Freeze-dried mango cube with crystalline facets
        this.ctx.fillRect(-p.radius, -p.radius, p.radius * 2, p.radius * 2);
        this.ctx.fillStyle = 'rgba(255,255,255,0.3)';
        this.ctx.fillRect(-p.radius, -p.radius, p.radius * 2, p.radius * 0.5);
      } else if (p.shape === 'disc') {
        // Banana medallion
        this.ctx.beginPath();
        this.ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.fillStyle = '#EAB308';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, p.radius * 0.45, 0, Math.PI * 2);
        this.ctx.fill();
      } else if (p.shape === 'shard') {
        // Jackfruit crisp shard
        this.ctx.beginPath();
        this.ctx.moveTo(0, -p.radius * 1.2);
        this.ctx.lineTo(p.radius * 0.9, p.radius * 0.8);
        this.ctx.lineTo(-p.radius * 0.9, p.radius * 0.8);
        this.ctx.closePath();
        this.ctx.fill();
      } else {
        // Chikku caramel oval
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, p.radius * 1.2, p.radius * 0.8, 0, 0, Math.PI * 2);
        this.ctx.fill();
      }

      this.ctx.restore();
    });

    // 3. Update and Draw Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const pt = this.particles[i];
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.vy += 0.15; // gravity
      pt.rot += pt.vRot;
      pt.alpha -= pt.decay;

      if (pt.alpha <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.translate(pt.x, pt.y);
      this.ctx.rotate(pt.rot);
      this.ctx.globalAlpha = Math.max(0, pt.alpha);
      this.ctx.fillStyle = pt.color;
      this.ctx.fillRect(-pt.size / 2, -pt.size / 2, pt.size, pt.size);
      this.ctx.restore();
    }
  }

  destroy() {
    if (this.rafId) cancelAnimationFrame(this.rafId);
  }
}

export function initCrunchPlayground() {
  const canvas = document.getElementById('crunchPlaygroundCanvas');
  if (canvas) {
    return new CrunchPlayground(canvas);
  }
  return null;
}
