/**
 * Realbeber & Co. - Interactive 4-Fruit 3D Explorer
 * Allows visitors to interactively explore and rotate 3D product pouches
 * for the 4 confirmed varieties: Mango, Chikku, Jackfruit, Banana.
 */

import * as THREE from 'three';
import { PRODUCTS } from './products.js';

export class FruitExplorer3D {
  constructor(containerEl) {
    this.container = containerEl;
    if (!this.container) return;

    this.canvas = this.container.querySelector('canvas.explorer-3d-canvas');
    if (!this.canvas) return;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.rafId = null;

    // 3D Meshes
    this.pouchMesh = null;
    this.floatingPiecesGroup = null;
    this.floatingPieces = [];

    // State
    this.currentFruitIndex = 0;
    this.textures = {};
    this.isDragging = false;
    this.prevMousePos = { x: 0, y: 0 };
    this.rotationVelocity = { x: 0, y: 0.008 };
    this.clock = new THREE.Clock();

    this.fruitConfigs = [
      {
        id: 'mango-frost-chips',
        name: 'Mango Frost Chips',
        flavor: 'Mango',
        color: '#FFB638',
        tagline: 'A tropical favourite. A different kind of crunch.',
        pouchSrc: 'assets/products/mango_clean_pouch.png',
        desc: '100% pure Kerala Alphonso mangoes, sub-zero freeze-dried to ethereal golden honeycomb crisps.',
        origin: 'Palakkad & Malappuram, Kerala',
        price: '₹149',
        weight: '35g (from 350g fresh fruit)'
      },
      {
        id: 'chikku-frost-chips',
        name: 'Chikku Frost Chips',
        flavor: 'Chikku (Sapodilla)',
        color: '#A87954',
        tagline: 'Sweet by nature. Different by design.',
        pouchSrc: 'assets/products/chikku_clean_pouch.png',
        desc: 'Velvety sapodilla sublimated into crumbly malt fudge sweetness that dissolves into pure fruit puree.',
        origin: 'Kasaragod & Kannur, Kerala',
        price: '₹139',
        weight: '40g (from 400g fresh fruit)'
      },
      {
        id: 'jackfruit-frost-chips',
        name: 'Jackfruit Frost Chips',
        flavor: 'Jackfruit',
        color: '#E6A817',
        tagline: 'A tropical classic with a new twist.',
        pouchSrc: 'assets/products/jackfruit_clean_pouch.png',
        desc: 'Golden Varikka jackfruit pods freeze-dried into fragrant floral-honey shards with featherlight crunch.',
        origin: 'Idukki & Wayanad, Kerala',
        price: '₹149',
        weight: '35g (from 350g fresh fruit)'
      },
      {
        id: 'banana-frost-chips',
        name: 'Banana Frost Chips',
        flavor: 'Banana',
        color: '#E8CA55',
        tagline: 'A familiar favourite, reimagined.',
        pouchSrc: 'assets/products/banana_clean_pouch.png',
        desc: 'Sun-sweetened Kerala Nendran bananas sliced into airy medallions—100% oil-free, 0% added sugar.',
        origin: 'Thrissur & Kozhikode, Kerala',
        price: '₹129',
        weight: '40g (from 400g fresh fruit)'
      }
    ];

    this.init();
  }

  init() {
    this.scene = new THREE.Scene();

    const rect = this.canvas.getBoundingClientRect();
    const width = rect.width || 480;
    const height = rect.height || 540;

    this.camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 50);
    this.camera.position.set(0, 0, 5.2);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;

    this.setupLighting();
    this.loadTextures(() => {
      this.buildPouch();
      this.buildOrbitingCrisps();
      this.bindEvents();
      this.animate();
    });
  }

  setupLighting() {
    const amb = new THREE.AmbientLight(0xfff8ee, 1.6);
    this.scene.add(amb);

    const dir1 = new THREE.DirectionalLight(0xffffff, 2.2);
    dir1.position.set(3, 4, 4);
    this.scene.add(dir1);

    const dir2 = new THREE.DirectionalLight(0xffeedd, 1.4);
    dir2.position.set(-3, -2, 2);
    this.scene.add(dir2);

    const rim = new THREE.DirectionalLight(0xffffff, 2.5);
    rim.position.set(0, 3, -3);
    this.scene.add(rim);
  }

  loadTextures(callback) {
    const loader = new THREE.TextureLoader();
    let loaded = 0;
    const total = this.fruitConfigs.length;

    this.fruitConfigs.forEach((cfg) => {
      loader.load(cfg.pouchSrc, (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        this.textures[cfg.id] = tex;
        loaded++;
        if (loaded === total && callback) {
          callback();
        }
      });
    });
  }

  buildPouch() {
    // 3D Standing Pouch with Front Bulge Geometry
    const geom = new THREE.PlaneGeometry(2.1, 3.1, 24, 24);
    const pos = geom.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      let x = pos.getX(i);
      let y = pos.getY(i);
      let dist = 1.0 - Math.min(1.0, Math.sqrt((x / 1.05) ** 2 + (y / 1.55) ** 2));
      pos.setZ(i, Math.sin(dist * Math.PI * 0.5) * 0.28);
    }
    geom.computeVertexNormals();

    const currentCfg = this.fruitConfigs[this.currentFruitIndex];
    const mat = new THREE.MeshStandardMaterial({
      map: this.textures[currentCfg.id],
      transparent: true,
      roughness: 0.3,
      metalness: 0.08,
      side: THREE.DoubleSide
    });

    this.pouchMesh = new THREE.Mesh(geom, mat);
    this.pouchMesh.position.set(0, -0.05, 0);
    this.scene.add(this.pouchMesh);
  }

  buildOrbitingCrisps() {
    this.floatingPiecesGroup = new THREE.Group();
    this.floatingPieces = [];

    const crispMat = new THREE.MeshStandardMaterial({
      color: 0xF59E0B,
      roughness: 0.85,
      metalness: 0.0
    });

    const count = 12;
    for (let i = 0; i < count; i++) {
      const geom = new THREE.DodecahedronGeometry(0.18 + Math.random() * 0.08, 0);
      geom.scale(1.2, 0.6, 1.0);
      const mesh = new THREE.Mesh(geom, crispMat.clone());

      const angle = (i / count) * Math.PI * 2;
      const radius = 1.8 + (i % 3) * 0.35;
      mesh.position.set(
        Math.cos(angle) * radius,
        Math.sin(angle) * (radius * 0.65) + (Math.random() - 0.5) * 0.4,
        Math.sin(angle * 2) * 0.6
      );

      this.floatingPiecesGroup.add(mesh);
      this.floatingPieces.push({
        mesh,
        angle,
        radius,
        speed: 0.4 + Math.random() * 0.4,
        rotSpeed: {
          x: (Math.random() - 0.5) * 2,
          y: (Math.random() - 0.5) * 2,
          z: (Math.random() - 0.5) * 2
        }
      });
    }

    this.scene.add(this.floatingPiecesGroup);
  }

  switchFruit(index) {
    if (index === this.currentFruitIndex) return;
    this.currentFruitIndex = index;
    const cfg = this.fruitConfigs[index];

    // 1. Update 3D Texture
    if (this.pouchMesh && this.textures[cfg.id]) {
      this.pouchMesh.material.map = this.textures[cfg.id];
      this.pouchMesh.material.needsUpdate = true;
      // Pulse animation
      this.pouchMesh.scale.set(0.85, 0.85, 0.85);
    }

    // 2. Update Orbiting Crisps Colors
    const crispColors = [0xF59E0B, 0x936541, 0xEAB308, 0xFACC15];
    const targetColor = new THREE.Color(crispColors[index] || 0xF59E0B);
    this.floatingPieces.forEach((p) => {
      p.mesh.material.color.copy(targetColor);
    });

    // 3. Update DOM Info
    const titleEl = document.getElementById('explorerFruitTitle');
    const taglineEl = document.getElementById('explorerFruitTagline');
    const descEl = document.getElementById('explorerFruitDesc');
    const originEl = document.getElementById('explorerFruitOrigin');
    const priceEl = document.getElementById('explorerFruitPrice');
    const weightEl = document.getElementById('explorerFruitWeight');
    const ctaBtn = document.getElementById('explorerAddBtn');

    if (titleEl) titleEl.textContent = cfg.name;
    if (taglineEl) taglineEl.textContent = cfg.tagline;
    if (descEl) descEl.textContent = cfg.desc;
    if (originEl) originEl.textContent = cfg.origin;
    if (priceEl) priceEl.textContent = cfg.price;
    if (weightEl) weightEl.textContent = cfg.weight;

    if (ctaBtn) {
      ctaBtn.onclick = () => {
        if (window.cart) {
          window.cart.addItem(cfg.id, 1);
          window.cart.showToast(`Added ${cfg.name} to bag!`);
        }
      };
    }

    // Update active tab buttons
    const tabs = this.container.querySelectorAll('.fruit-tab-btn');
    tabs.forEach((tab, i) => {
      if (i === index) {
        tab.classList.add('active');
        tab.style.borderColor = cfg.color;
      } else {
        tab.classList.remove('active');
        tab.style.borderColor = 'transparent';
      }
    });

    // Ambient glow / background color accent update
    const glowEl = this.container.querySelector('.explorer-stage-glow');
    if (glowEl) {
      glowEl.style.backgroundColor = cfg.color;
    }
  }

  bindEvents() {
    // Interactive 3D Drag Rotation
    const canvas = this.canvas;

    const onPointerDown = (clientX, clientY) => {
      this.isDragging = true;
      this.prevMousePos = { x: clientX, y: clientY };
    };

    const onPointerMove = (clientX, clientY) => {
      if (!this.isDragging || !this.pouchMesh) return;
      const deltaX = clientX - this.prevMousePos.x;
      const deltaY = clientY - this.prevMousePos.y;

      this.rotationVelocity.y = deltaX * 0.008;
      this.rotationVelocity.x = deltaY * 0.008;

      this.prevMousePos = { x: clientX, y: clientY };
    };

    const onPointerUp = () => {
      this.isDragging = false;
    };

    canvas.addEventListener('mousedown', (e) => onPointerDown(e.clientX, e.clientY));
    window.addEventListener('mousemove', (e) => onPointerMove(e.clientX, e.clientY));
    window.addEventListener('mouseup', onPointerUp);

    canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length > 0) {
        onPointerDown(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });

    window.addEventListener('touchend', onPointerUp);

    // Fruit Switcher Tab Clicks
    const tabs = this.container.querySelectorAll('.fruit-tab-btn');
    tabs.forEach((tab, idx) => {
      tab.addEventListener('click', () => {
        this.switchFruit(idx);
      });
    });

    // Resize
    window.addEventListener('resize', () => {
      if (!this.canvas || !this.renderer || !this.camera) return;
      const rect = this.canvas.getBoundingClientRect();
      const w = rect.width || 480;
      const h = rect.height || 540;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    });

    // Initial button click handler setup
    const initialAddBtn = document.getElementById('explorerAddBtn');
    if (initialAddBtn) {
      initialAddBtn.onclick = () => {
        const cfg = this.fruitConfigs[this.currentFruitIndex];
        if (window.cart) {
          window.cart.addItem(cfg.id, 1);
          window.cart.showToast(`Added ${cfg.name} to bag!`);
        }
      };
    }
  }

  animate() {
    this.rafId = requestAnimationFrame(() => this.animate());

    const delta = this.clock.getDelta();
    const time = this.clock.getElapsedTime();

    if (this.pouchMesh) {
      // Smooth scale interpolation back to 1.0 after fruit switch
      this.pouchMesh.scale.x += (1.0 - this.pouchMesh.scale.x) * 0.1;
      this.pouchMesh.scale.y += (1.0 - this.pouchMesh.scale.y) * 0.1;
      this.pouchMesh.scale.z += (1.0 - this.pouchMesh.scale.z) * 0.1;

      // Apply drag momentum or continuous gentle turntable rotation
      if (!this.isDragging) {
        this.rotationVelocity.y += (0.006 - this.rotationVelocity.y) * 0.05;
        this.rotationVelocity.x += (0.0 - this.rotationVelocity.x) * 0.05;
      }

      this.pouchMesh.rotation.y += this.rotationVelocity.y;
      this.pouchMesh.rotation.x = Math.max(-0.4, Math.min(0.4, this.pouchMesh.rotation.x + this.rotationVelocity.x));

      // Subtle float hover
      this.pouchMesh.position.y = -0.05 + Math.sin(time * 1.6) * 0.06;
    }

    // Orbiting Crisps Animation
    if (this.floatingPiecesGroup && this.floatingPieces.length > 0) {
      this.floatingPieces.forEach((p) => {
        p.angle += p.speed * delta * 0.6;
        p.mesh.position.x = Math.cos(p.angle) * p.radius;
        p.mesh.position.y = Math.sin(p.angle) * (p.radius * 0.65) + Math.sin(time * 2 + p.angle) * 0.15;
        p.mesh.position.z = Math.sin(p.angle * 2) * 0.7;

        p.mesh.rotation.x += p.rotSpeed.x * delta;
        p.mesh.rotation.y += p.rotSpeed.y * delta;
        p.mesh.rotation.z += p.rotSpeed.z * delta;
      });
    }

    this.renderer.render(this.scene, this.camera);
  }

  destroy() {
    if (this.rafId) cancelAnimationFrame(this.rafId);
    if (this.renderer) this.renderer.dispose();
  }
}

export function initFruitExplorer() {
  const container = document.getElementById('fruitExplorerSection');
  if (container) {
    return new FruitExplorer3D(container);
  }
  return null;
}
