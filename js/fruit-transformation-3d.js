/**
 * Realbeber & Co. - Signature Experience: The Fruit Transformation (Three.js)
 * Scroll-driven 3D product storytelling:
 * Scene 1: Whole Organic 3D Mango ("It starts with something real.")
 * Scene 2: Sublimation & Freeze-Dried Crunch Separation ("A little change. A whole new crunch.")
 * Scene 3: 3D Product Pouch Reveal & Halo Orbit ("Meet your new favourite crunch.")
 */

import * as THREE from 'three';

export class FruitTransformationExperience {
  constructor(containerEl) {
    this.container = containerEl;
    if (!this.container) return;

    this.canvas = this.container.querySelector('canvas.transformation-canvas');
    if (!this.canvas) return;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.rafId = null;

    // 3D Objects
    this.mangoGroup = null;
    this.mangoMesh = null;
    this.crispsGroup = null;
    this.crispPieces = [];
    this.pouchMesh = null;

    // Interaction & Scroll State
    this.scrollProgress = 0;
    this.targetProgress = 0;
    this.mouseX = 0;
    this.mouseY = 0;
    this.targetMouseX = 0;
    this.targetMouseY = 0;
    this.clock = new THREE.Clock();

    this.init();
  }

  init() {
    // 1. Scene & Camera
    this.scene = new THREE.Scene();

    const rect = this.canvas.getBoundingClientRect();
    const width = rect.width || window.innerWidth;
    const height = rect.height || window.innerHeight;
    const aspect = width / height;

    this.camera = new THREE.PerspectiveCamera(38, aspect, 0.1, 100);
    this.updateCameraForViewport(aspect);

    // 2. Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;

    // 3. Lighting
    this.setupLighting();

    // 4. Build 3D Models
    this.buildMango();
    this.buildCrisps();
    this.buildPouch();

    // 5. Events
    this.bindEvents();

    // 6. Start Loop
    this.animate();
  }

  updateCameraForViewport(aspect) {
    if (!this.camera) return;
    if (aspect < 1.0) {
      // Mobile / Portrait: Center object and back up camera
      this.camera.position.set(0, 0.2, 9.2);
    } else {
      // Desktop / Landscape: Position 3D fruit elegantly to the right (x=1.3)
      // leaving left area completely clear for the editorial text cards!
      this.camera.position.set(1.3, 0, 7.0);
    }
    this.camera.lookAt(1.3 * (aspect < 1.0 ? 0 : 1), 0, 0);
  }

  setupLighting() {
    // Warm Ambient Light
    const ambientLight = new THREE.AmbientLight(0xfff5e6, 1.4);
    this.scene.add(ambientLight);

    // Key Sun Light
    const keyLight = new THREE.DirectionalLight(0xfffaed, 2.4);
    keyLight.position.set(4, 5, 5);
    this.scene.add(keyLight);

    // Soft Green/Cool Fill
    const fillLight = new THREE.DirectionalLight(0xe8f5e9, 1.2);
    fillLight.position.set(-4, -1, 3);
    this.scene.add(fillLight);

    // Golden Rim / Back Light (accentuates fruit silhouette and crisp edges)
    const rimLight = new THREE.DirectionalLight(0xffb703, 3.2);
    rimLight.position.set(0, 3, -4);
    this.scene.add(rimLight);
  }

  createProceduralMangoTexture() {
    const size = 1024;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Gradient representing natural sun-ripened Alphonso mango:
    // Stem green -> golden amber -> sunset red blush
    const grad = ctx.createLinearGradient(0, 0, size, size);
    grad.addColorStop(0.0, '#75A834'); // fresh stem green
    grad.addColorStop(0.2, '#EAB308'); // vibrant mango yellow
    grad.addColorStop(0.55, '#F59E0B'); // rich amber
    grad.addColorStop(0.85, '#E11D48'); // crimson blush
    grad.addColorStop(1.0, '#BE123C'); // deep blush tip

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    // Micro-lenticels / pores texture (natural mango freckles)
    const imgData = ctx.getImageData(0, 0, size, size);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      if (Math.random() > 0.985) {
        const freckle = Math.random() * 40 - 20;
        data[i] = Math.min(255, Math.max(0, data[i] + freckle));
        data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + freckle));
        data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + freckle));
      }
    }
    ctx.putImageData(imgData, 0, 0);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }

  buildMango() {
    this.mangoGroup = new THREE.Group();

    // Custom deformed organic mango geometry
    const geom = new THREE.SphereGeometry(1.45, 64, 64);
    const pos = geom.attributes.position;

    // Organic Mango deformation: tapered top, asymmetric belly curve, flattened sides
    for (let i = 0; i < pos.count; i++) {
      let x = pos.getX(i);
      let y = pos.getY(i);
      let z = pos.getZ(i);

      // Flatten laterally (mangoes are kidney/oval shaped, not spheres)
      z *= 0.72;

      // Asymmetric tropical belly curvature
      const yNorm = y / 1.45;
      x += Math.sin((yNorm + 0.3) * Math.PI) * 0.28;

      // Taper at the stem (top) and pointed beak at the bottom
      if (y > 0) {
        x *= 1.0 - yNorm * 0.22;
        z *= 1.0 - yNorm * 0.2;
      } else {
        // Subtle beak curve at the base
        x += Math.pow(-yNorm, 2) * 0.16;
      }

      pos.setXYZ(i, x, y, z);
    }
    geom.computeVertexNormals();

    const mangoMat = new THREE.MeshStandardMaterial({
      map: this.createProceduralMangoTexture(),
      roughness: 0.34,
      metalness: 0.04,
      bumpScale: 0.015
    });

    this.mangoMesh = new THREE.Mesh(geom, mangoMat);
    this.mangoMesh.rotation.z = 0.15;
    this.mangoGroup.add(this.mangoMesh);

    // Stem and miniature green leaf
    const stemGeom = new THREE.CylinderGeometry(0.04, 0.06, 0.35, 12);
    const stemMat = new THREE.MeshStandardMaterial({ color: 0x4a3b22, roughness: 0.9 });
    const stem = new THREE.Mesh(stemGeom, stemMat);
    stem.position.set(0.08, 1.5, 0);
    stem.rotation.z = -0.2;
    this.mangoGroup.add(stem);

    const leafGeom = new THREE.ConeGeometry(0.2, 0.65, 5);
    leafGeom.scale(1, 1, 0.15);
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x2d6a4f, roughness: 0.4 });
    const leaf = new THREE.Mesh(leafGeom, leafMat);
    leaf.position.set(0.2, 1.48, 0.05);
    leaf.rotation.set(0.3, 0.4, -0.9);
    this.mangoGroup.add(leaf);

    this.scene.add(this.mangoGroup);
  }

  buildCrisps() {
    this.crispsGroup = new THREE.Group();
    this.crispPieces = [];

    // Porous crunchy freeze-dried fruit material
    const crispMat = new THREE.MeshStandardMaterial({
      color: 0xF59E0B,
      roughness: 0.88,
      metalness: 0.0,
      bumpScale: 0.04
    });

    // Generate 22 freeze-dried crisps with organic variations
    const count = 22;
    for (let i = 0; i < count; i++) {
      let geom;
      if (i % 2 === 0) {
        // Medallion slice with crunchy wavy edge
        geom = new THREE.CylinderGeometry(0.32 + Math.random() * 0.15, 0.3 + Math.random() * 0.15, 0.08, 14);
        geom.scale(1, 1, 0.75 + Math.random() * 0.3);
      } else {
        // Chunky freeze-dried cube / cluster piece
        geom = new THREE.DodecahedronGeometry(0.25 + Math.random() * 0.12, 1);
        geom.scale(1 + Math.random() * 0.3, 0.7 + Math.random() * 0.4, 1 + Math.random() * 0.2);
      }

      const mesh = new THREE.Mesh(geom, crispMat.clone());

      // Assign target orbit trajectory positions
      const angle = (i / count) * Math.PI * 2;
      const radius = 2.4 + (i % 3) * 0.55;
      const targetX = Math.cos(angle) * radius;
      const targetY = Math.sin(angle) * (radius * 0.75) + (Math.random() - 0.5) * 0.8;
      const targetZ = Math.sin(angle * 2) * 1.2 + (Math.random() - 0.5) * 0.5;

      mesh.position.set(0, 0, 0); // starts inside whole mango
      mesh.scale.set(0.001, 0.001, 0.001);
      mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);

      this.crispsGroup.add(mesh);

      this.crispPieces.push({
        mesh,
        targetPos: new THREE.Vector3(targetX, targetY, targetZ),
        rotSpeed: new THREE.Vector3(
          (Math.random() - 0.5) * 1.8,
          (Math.random() - 0.5) * 2.2,
          (Math.random() - 0.5) * 1.5
        ),
        delay: (i / count) * 0.3,
        initialScale: 0.8 + Math.random() * 0.4
      });
    }

    this.scene.add(this.crispsGroup);
  }

  buildPouch() {
    // 3D Standing Pouch with Mango Frost Chips Packaging Texture
    const loader = new THREE.TextureLoader();
    loader.load('assets/products/mango_clean_pouch.png', (pouchTex) => {
      pouchTex.colorSpace = THREE.SRGBColorSpace;

      // Realistic 3D pouch geometry with subtle front bulge and crimp
      const geom = new THREE.PlaneGeometry(2.3, 3.4, 32, 32);
      const pos = geom.attributes.position;

      // Subtle outward puff in the center like a nitrogen-filled sealed pack
      for (let i = 0; i < pos.count; i++) {
        let x = pos.getX(i);
        let y = pos.getY(i);
        let distFromCenter = 1.0 - Math.min(1.0, Math.sqrt((x / 1.15) ** 2 + (y / 1.7) ** 2));
        pos.setZ(i, Math.sin(distFromCenter * Math.PI * 0.5) * 0.32);
      }
      geom.computeVertexNormals();

      const mat = new THREE.MeshStandardMaterial({
        map: pouchTex,
        transparent: true,
        roughness: 0.28,
        metalness: 0.08,
        side: THREE.DoubleSide
      });

      this.pouchMesh = new THREE.Mesh(geom, mat);
      this.pouchMesh.position.set(0, -0.15, 0);
      this.pouchMesh.scale.set(0.001, 0.001, 0.001); // hidden initially
      this.scene.add(this.pouchMesh);
    });
  }

  bindEvents() {
    // Mouse Move Tilt
    window.addEventListener('mousemove', (e) => {
      this.targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      this.targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    }, { passive: true });

    // Touch Move Tilt
    window.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        this.targetMouseX = (e.touches[0].clientX / window.innerWidth - 0.5) * 2;
        this.targetMouseY = (e.touches[0].clientY / window.innerHeight - 0.5) * 2;
      }
    }, { passive: true });

    // Window Resize
    window.addEventListener('resize', () => {
      if (!this.canvas || !this.renderer || !this.camera) return;
      const rect = this.canvas.getBoundingClientRect();
      const width = rect.width || window.innerWidth;
      const height = rect.height || window.innerHeight;
      const aspect = width / height;
      this.camera.aspect = aspect;
      this.updateCameraForViewport(aspect);
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height);
    });

    // Scroll Progress Tracking
    this.updateScroll();
    window.addEventListener('scroll', () => {
      this.updateScroll();
    }, { passive: true });
  }

  updateScroll() {
    if (!this.container) return;
    const rect = this.container.getBoundingClientRect();
    const totalDist = rect.height - window.innerHeight;
    if (totalDist <= 0) return;

    // Normalize progress 0.0 to 1.0 across the 3 storytelling scenes
    const currentDist = -rect.top;
    const prog = Math.min(1, Math.max(0, currentDist / totalDist));
    this.targetProgress = prog;

    // Update active scene cards in HTML for text syncing
    this.updateSceneCards(prog);
  }

  updateSceneCards(prog) {
    const cards = this.container.querySelectorAll('.transformation-card');
    let activeIndex = 0;
    if (prog > 0.62) {
      activeIndex = 2; // Scene 3: Product Reveal
    } else if (prog > 0.30) {
      activeIndex = 1; // Scene 2: Transformation Crunch
    } else {
      activeIndex = 0; // Scene 1: Whole Fruit
    }

    cards.forEach((card, idx) => {
      if (idx === activeIndex) {
        card.classList.add('is-active');
      } else {
        card.classList.remove('is-active');
      }
    });

    // Update progress bar indicator
    const bar = this.container.querySelector('.transformation-progress-fill');
    if (bar) {
      bar.style.width = `${Math.round(prog * 100)}%`;
    }
  }

  animate() {
    this.rafId = requestAnimationFrame(() => this.animate());

    const delta = this.clock.getDelta();
    const time = this.clock.getElapsedTime();

    // Smooth Lerp for Scroll and Mouse
    this.scrollProgress += (this.targetProgress - this.scrollProgress) * 0.09;
    this.mouseX += (this.targetMouseX - this.mouseX) * 0.06;
    this.mouseY += (this.targetMouseY - this.mouseY) * 0.06;

    const prog = this.scrollProgress;

    // --- PHASE 1: Whole Mango (Progress 0.0 -> 0.35) ---
    if (this.mangoGroup) {
      if (prog < 0.45) {
        const p1 = Math.max(0, (prog - 0.0) / 0.35);
        this.mangoGroup.visible = true;
        // Fade & Scale out as it transitions
        const scale = Math.max(0.001, (1.0 - Math.pow(Math.max(0, (prog - 0.22) / 0.18), 2)));
        this.mangoGroup.scale.setScalar(scale);

        // Rotation & Mouse Gyro Tilt
        this.mangoGroup.rotation.y = time * 0.5 + this.mouseX * 0.45;
        this.mangoGroup.rotation.x = Math.sin(time * 0.4) * 0.15 - this.mouseY * 0.35;
        this.mangoGroup.rotation.z = 0.1 + Math.cos(time * 0.3) * 0.1;
        this.mangoGroup.position.y = Math.sin(time * 1.2) * 0.08;
      } else {
        this.mangoGroup.visible = false;
      }
    }

    // --- PHASE 2: Freeze-Dried Crisps Separation (Progress 0.25 -> 0.75) ---
    if (this.crispsGroup && this.crispPieces.length > 0) {
      // Visibility window
      const crispsVisible = prog > 0.15;
      this.crispsGroup.visible = crispsVisible;

      if (crispsVisible) {
        // How much have the pieces dispersed (0.0 to 1.0)
        const burstProg = Math.min(1.0, Math.max(0, (prog - 0.2) / 0.4));
        const orbitProg = Math.min(1.0, Math.max(0, (prog - 0.6) / 0.35));

        this.crispPieces.forEach((item, idx) => {
          // Staggered explosion outward
          const pieceProg = Math.min(1.0, Math.max(0, (burstProg - item.delay * 0.5) / (1 - item.delay * 0.5)));

          // Interpolate position from origin (inside mango) to orbit cloud
          const target = item.targetPos.clone();

          // When entering Phase 3, pull crisps into an elegant halo around pouch
          if (orbitProg > 0) {
            const haloAngle = (idx / this.crispPieces.length) * Math.PI * 2 + time * 0.4;
            const haloRadius = 2.1 + (idx % 2) * 0.4;
            target.x = Math.cos(haloAngle) * haloRadius;
            target.y = Math.sin(haloAngle) * 1.5 + Math.sin(time * 2 + idx) * 0.2;
            target.z = Math.sin(haloAngle) * 0.8;
          }

          item.mesh.position.lerpVectors(new THREE.Vector3(0, 0, 0), target, pieceProg);

          // Tumbling 3D rotation
          item.mesh.rotation.x += item.rotSpeed.x * delta;
          item.mesh.rotation.y += item.rotSpeed.y * delta;
          item.mesh.rotation.z += item.rotSpeed.z * delta;

          // Scale
          const curScale = item.initialScale * Math.min(1, pieceProg * 1.5);
          item.mesh.scale.setScalar(curScale);
        });

        // Gentle overall group rotation
        this.crispsGroup.rotation.y = time * 0.18 + this.mouseX * 0.2;
      }
    }

    // --- PHASE 3: 3D Product Pouch Reveal (Progress 0.55 -> 1.0) ---
    if (this.pouchMesh) {
      if (prog > 0.5) {
        this.pouchMesh.visible = true;
        const revealProg = Math.min(1.0, (prog - 0.55) / 0.35);

        // Smooth cubic pop in
        const pouchScale = Math.sin(revealProg * Math.PI * 0.5) * 1.0;
        this.pouchMesh.scale.set(pouchScale, pouchScale, pouchScale);

        // Floating hover + interactive mouse tilt
        this.pouchMesh.position.y = -0.15 + Math.sin(time * 1.5) * 0.08 - this.mouseY * 0.15;
        this.pouchMesh.position.x = this.mouseX * 0.25;
        this.pouchMesh.rotation.y = this.mouseX * 0.35 + Math.sin(time * 0.8) * 0.06;
        this.pouchMesh.rotation.x = -this.mouseY * 0.25;
        this.pouchMesh.rotation.z = Math.sin(time * 0.7) * 0.03 - this.mouseX * 0.05;
      } else {
        this.pouchMesh.visible = false;
        this.pouchMesh.scale.set(0.001, 0.001, 0.001);
      }
    }

    // Camera subtle breathing & mouse interaction
    const isMobile = this.camera.aspect < 1.0;
    const baseCamX = isMobile ? 0 : 1.3;
    this.camera.position.x = baseCamX + this.mouseX * 0.18;
    this.camera.position.y = (isMobile ? 0.2 : 0) - this.mouseY * 0.18;
    this.camera.lookAt(baseCamX, 0, 0);

    this.renderer.render(this.scene, this.camera);
  }

  destroy() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
    if (this.renderer) {
      this.renderer.dispose();
    }
  }
}

export function initFruitTransformation() {
  const container = document.getElementById('fruitTransformationSection');
  if (container) {
    return new FruitTransformationExperience(container);
  }
  return null;
}
