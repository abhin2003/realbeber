/**
 * Realbeber - Master WebGL 3D Experience
 * Museum-grade multi-dimensional Three.js world choreography with GSAP ScrollTrigger & Lenis.
 */

import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import {
  createMangoGroup,
  createJackfruitGroup,
  createChikooGroup,
  createBananaGroup,
  createOrbitingDebris,
  createPortalMonolith,
  createPouchesGroup
} from './fruit-models.js';
import { audioEngine } from './audio-engine.js';

// World Background Textures
import texPortal from '../assets/worlds/world_01_portal.jpg';
import texPortalOpen from '../assets/worlds/world_01_portal_open.jpg';
import texMango from '../assets/worlds/world_02_mango.jpg';
import texJackfruit from '../assets/worlds/world_03_jackfruit.jpg';
import texChikoo from '../assets/worlds/world_04_chikoo.jpg';
import texBanana from '../assets/worlds/world_05_banana.jpg';
import texFinale from '../assets/worlds/world_06_finale.jpg';

// Pouch Textures
import mangoPouch from '../assets/products/mango_clean_pouch.png';
import chikkuPouch from '../assets/products/chikku_clean_pouch.png';
import jackfruitPouch from '../assets/products/jackfruit_clean_pouch.png';
import bananaPouch from '../assets/products/banana_clean_pouch.png';

gsap.registerPlugin(ScrollTrigger);

class WebGLExperience {
  constructor() {
    this.container = document.getElementById('webgl-canvas-container');
    if (!this.container) return;

    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.scrollProgress = 0;
    this.scrollVelocity = 0;

    // Mouse Tracking & Parallax
    this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    this.isDragging = false;
    this.dragStart = { x: 0, y: 0 };
    this.dragRotation = { x: 0, y: 0 };

    this.initLenis();
    this.initThree();
    this.loadTextures();
    this.buildScene();
    this.setupPostProcessing();
    this.setupEvents();
    this.setupScrollTriggers();

    this.clock = new THREE.Clock();
    this.animate();
  }

  initLenis() {
    this.lenis = new Lenis({
      duration: 1.25,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.95,
      touchMultiplier: 1.5
    });

    this.lenis.on('scroll', (e) => {
      ScrollTrigger.update();
      this.scrollVelocity = e.velocity || 0;
      audioEngine.modulateVelocity(this.scrollVelocity);
    });

    gsap.ticker.add((time) => {
      this.lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    // Initial hash scroll & link smooth scroll intercept
    if (window.location.hash) {
      setTimeout(() => {
        this.lenis.scrollTo(window.location.hash, { immediate: true });
        ScrollTrigger.refresh();
      }, 150);
    }

    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener('click', (e) => {
        const href = a.getAttribute('href');
        if (href && href.length > 1) {
          e.preventDefault();
          this.lenis.scrollTo(href, { duration: 1.4 });
          audioEngine.playClick();
        }
      });
    });
  }

  initThree() {
    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      powerPreference: 'high-performance',
      antialias: true,
      alpha: true,
      stencil: false,
      depth: true
    });
    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.12;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.container.appendChild(this.renderer.domElement);

    // Scene & Camera
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xf3e9d7); // Default Pale Sand

    this.camera = new THREE.PerspectiveCamera(40, this.width / this.height, 0.1, 100);
    this.camera.position.set(0, 0.2, 9.8);

    // High-Contrast Studio Lighting
    this.ambientLight = new THREE.AmbientLight(0xfbf8f2, 1.25);
    this.scene.add(this.ambientLight);

    this.keyLight = new THREE.DirectionalLight(0xfff6ea, 2.6);
    this.keyLight.position.set(4, 7, 6);
    this.keyLight.castShadow = true;
    this.keyLight.shadow.mapSize.width = 2048;
    this.keyLight.shadow.mapSize.height = 2048;
    this.keyLight.shadow.camera.near = 0.5;
    this.keyLight.shadow.camera.far = 25;
    this.keyLight.shadow.bias = -0.0005;
    this.scene.add(this.keyLight);

    // Electric Tangerine Rim Light (#FF6A2A)
    this.rimLight1 = new THREE.DirectionalLight(0xff6a2a, 3.2);
    this.rimLight1.position.set(-5, 3.5, -4);
    this.scene.add(this.rimLight1);

    // Soft Lavender Fill Light (#C7B8F0)
    this.rimLight2 = new THREE.DirectionalLight(0xc7b8f0, 1.8);
    this.rimLight2.position.set(5, -3, -3);
    this.scene.add(this.rimLight2);

    // Acid Yellow Accent Light (#DDF05B)
    this.accentLight = new THREE.PointLight(0xddf05b, 0, 15);
    this.accentLight.position.set(0, 2, 2);
    this.scene.add(this.accentLight);
  }

  loadTextures() {
    const loader = new THREE.TextureLoader();
    this.textures = {
      portal: loader.load(texPortal),
      portalOpen: loader.load(texPortalOpen),
      mango: loader.load(texMango),
      jackfruit: loader.load(texJackfruit),
      chikoo: loader.load(texChikoo),
      banana: loader.load(texBanana),
      finale: loader.load(texFinale),
      pouchMango: loader.load(mangoPouch),
      pouchChikku: loader.load(chikkuPouch),
      pouchJackfruit: loader.load(jackfruitPouch),
      pouchBanana: loader.load(bananaPouch)
    };

    Object.values(this.textures).forEach((tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
    });
  }

  buildScene() {
    // 1. Dynamic Environment Backdrop Plane with Multi-Texture Cross-Fade Shader
    const planeGeo = new THREE.PlaneGeometry(18, 10.2);
    this.backdropMat = new THREE.ShaderMaterial({
      uniforms: {
        t0: { value: this.textures.portal },
        t1: { value: this.textures.portalOpen },
        t2: { value: this.textures.mango },
        t3: { value: this.textures.jackfruit },
        t4: { value: this.textures.chikoo },
        t5: { value: this.textures.banana },
        t6: { value: this.textures.finale },
        progress: { value: 0.0 },
        vignetteStrength: { value: 0.15 }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D t0, t1, t2, t3, t4, t5, t6;
        uniform float progress;
        uniform float vignetteStrength;
        varying vec2 vUv;

        vec4 getBlendedScene(float p, vec2 uv) {
          if (p < 0.16) {
            float f = smoothstep(0.02, 0.12, p);
            return mix(texture2D(t0, uv), texture2D(t1, uv), f);
          } else if (p < 0.33) {
            float f = smoothstep(0.14, 0.20, p);
            return mix(texture2D(t1, uv), texture2D(t2, uv), f);
          } else if (p < 0.50) {
            float f = smoothstep(0.30, 0.36, p);
            return mix(texture2D(t2, uv), texture2D(t3, uv), f);
          } else if (p < 0.67) {
            float f = smoothstep(0.47, 0.53, p);
            return mix(texture2D(t3, uv), texture2D(t4, uv), f);
          } else if (p < 0.83) {
            float f = smoothstep(0.64, 0.70, p);
            return mix(texture2D(t4, uv), texture2D(t5, uv), f);
          } else {
            float f = smoothstep(0.80, 0.86, p);
            return mix(texture2D(t5, uv), texture2D(t6, uv), f);
          }
        }

        void main() {
          vec4 col = getBlendedScene(progress, vUv);
          vec2 center = vUv - vec2(0.5);
          float dist = length(center);
          col.rgb *= (1.0 - dist * vignetteStrength);
          gl_FragColor = col;
        }
      `,
      depthWrite: false,
      depthTest: true
    });

    this.backdropPlane = new THREE.Mesh(planeGeo, this.backdropMat);
    this.backdropPlane.position.set(0, 0, -2.8);
    this.scene.add(this.backdropPlane);

    // 2. Sculptural Monolith Gateway (Portal Scene)
    this.portalMonolith = createPortalMonolith();
    this.portalMonolith.group.position.set(0, 0.25, 0);
    this.portalMonolith.group.scale.setScalar(0.82);
    this.scene.add(this.portalMonolith.group);

    // 3. Hero Fruits
    this.fruitMango = createMangoGroup();
    this.fruitMango.position.set(0, 0.35, 0.5);
    this.fruitMango.rotation.set(0.1, -0.35, 0.12);
    this.fruitMango.scale.setScalar(0.58);
    this.scene.add(this.fruitMango);

    this.fruitJackfruit = createJackfruitGroup();
    this.fruitJackfruit.position.set(0, 0.1, 0.5);
    this.fruitJackfruit.scale.setScalar(0.85);
    this.fruitJackfruit.visible = false;
    this.scene.add(this.fruitJackfruit);

    this.fruitChikoo = createChikooGroup();
    this.fruitChikoo.position.set(0, 0.15, 0.5);
    this.fruitChikoo.scale.setScalar(0.85);
    this.fruitChikoo.visible = false;
    this.scene.add(this.fruitChikoo);

    this.fruitBanana = createBananaGroup();
    this.fruitBanana.position.set(0, 0.15, 0.5);
    this.fruitBanana.scale.setScalar(0.85);
    this.fruitBanana.visible = false;
    this.scene.add(this.fruitBanana);

    // 4. Standing Pouches (Finale Collection)
    this.pouches = createPouchesGroup({
      mango: this.textures.pouchMango,
      chikku: this.textures.pouchChikku,
      jackfruit: this.textures.pouchJackfruit,
      banana: this.textures.pouchBanana
    });
    this.pouches.group.position.set(0, -0.2, 0.8);
    this.pouches.group.scale.setScalar(0.9);
    this.pouches.group.visible = false;
    this.scene.add(this.pouches.group);

    // 5. Orbiting Debris (Crisps, Chips, Celestial Spheres)
    this.debris = createOrbitingDebris(36);
    this.debris.group.position.set(0, 0.2, 0.3);
    this.debris.group.scale.setScalar(0);
    this.scene.add(this.debris.group);
  }

  setupPostProcessing() {
    // Custom chromatic aberration and analog film grain pass via orthographic scene
    this.postScene = new THREE.Scene();
    this.postCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    this.renderTarget = new THREE.WebGLRenderTarget(this.width, this.height, {
      format: THREE.RGBAFormat,
      type: THREE.HalfFloatType,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter
    });

    this.postMat = new THREE.ShaderMaterial({
      uniforms: {
        tDiffuse: { value: null },
        uTime: { value: 0 },
        uAberration: { value: 0.0022 },
        uGrainStrength: { value: 0.035 }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform sampler2D tDiffuse;
        uniform float uTime;
        uniform float uAberration;
        uniform float uGrainStrength;
        varying vec2 vUv;

        // High frequency procedural grain
        float random(vec2 p) {
          vec2 k1 = vec2(23.14069263277926, 2.665144142690225);
          return fract(cos(dot(p, k1)) * 12345.6789);
        }

        void main() {
          vec2 uv = vUv;
          vec2 dir = uv - vec2(0.5);
          float dist = length(dir);

          // Radial chromatic aberration
          float r = texture2D(tDiffuse, uv + dir * uAberration * dist).r;
          float g = texture2D(tDiffuse, uv).g;
          float b = texture2D(tDiffuse, uv - dir * uAberration * dist).b;
          vec3 col = vec3(r, g, b);

          // Subtle analog film grain
          float grain = (random(uv + sin(uTime * 1.5)) - 0.5) * uGrainStrength;
          col += grain;

          gl_FragColor = vec4(col, 1.0);
        }
      `
    });

    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.postMat);
    this.postScene.add(quad);
  }

  setupEvents() {
    window.addEventListener('resize', () => this.onResize());

    // Mouse Tracking Parallax
    window.addEventListener('mousemove', (e) => {
      this.mouse.targetX = (e.clientX / this.width - 0.5) * 2;
      this.mouse.targetY = -(e.clientY / this.height - 0.5) * 2;

      if (this.isDragging) {
        const deltaX = e.clientX - this.dragStart.x;
        const deltaY = e.clientY - this.dragStart.y;
        this.dragRotation.y += deltaX * 0.008;
        this.dragRotation.x += deltaY * 0.008;
        this.dragStart = { x: e.clientX, y: e.clientY };
      }
    });

    // Click & Drag 360° Fruit Inspection (Mouse only to allow touch-scroll on mobile)
    this.container.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse') {
        this.isDragging = true;
        this.dragStart = { x: e.clientX, y: e.clientY };
        this.container.style.cursor = 'grabbing';
        audioEngine.playClick();
      }
    });

    window.addEventListener('pointerup', () => {
      if (this.isDragging) {
        this.isDragging = false;
        this.container.style.cursor = 'grab';
      }
    });
  }

  setupScrollTriggers() {
    // Master scroll progress linked to full body scroll height
    ScrollTrigger.create({
      trigger: '#scroll-container',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1.0,
      onUpdate: (self) => {
        this.scrollProgress = self.progress;
        this.updateDimensionalWorld(self.progress);
      }
    });

    // Pinned section triggers for DOM typography and telemetry HUD
    const sections = [
      { id: '#section-portal', pStart: 0.0, pEnd: 0.16, name: 'PORTAL', color: '#FF6A2A', hexList: ['PALE SAND7', 'Soft Lavender', '#243D9B'] },
      { id: '#section-mango', pStart: 0.16, pEnd: 0.33, name: 'MANGO WORLD', color: '#FF6A2A', hexList: ['#FF6A2A', '#DDF05B', '#243D9B'] },
      { id: '#section-jackfruit', pStart: 0.33, pEnd: 0.50, name: 'JACKFRUIT WORLD', color: '#DDF05B', hexList: ['#171719', '#DDF05B', '#C7B8F0'] },
      { id: '#section-chikoo', pStart: 0.50, pEnd: 0.67, name: 'CHIKOO WORLD', color: '#A07045', hexList: ['#A07045', '#C7B8F0', '#FF6A2A'] },
      { id: '#section-banana', pStart: 0.67, pEnd: 0.83, name: 'BANANA WORLD', color: '#F7E245', hexList: ['PALE SAND', '#C7B8F0', '#243D9B'] },
      { id: '#section-finale', pStart: 0.83, pEnd: 1.00, name: 'COLLECTION FINALE', color: '#FF6A2A', hexList: ['#171719', '#FF6A2A', '#F3E9D7'] }
    ];

    sections.forEach((sec, idx) => {
      const el = document.querySelector(sec.id);
      const panel = el ? el.querySelector('.sticky-viewport-panel') : null;

      // Initial state: only section 1 visible
      if (panel) {
        if (idx !== 0) {
          gsap.set(panel, { opacity: 0, visibility: 'hidden' });
        } else {
          gsap.set(panel, { opacity: 1, visibility: 'visible' });
        }

        ScrollTrigger.create({
          trigger: sec.id,
          start: 'top 85%',
          end: 'bottom 15%',
          onEnter: () => {
            gsap.to(panel, { opacity: 1, visibility: 'visible', duration: 0.35, overwrite: 'auto' });
            this.updateTelemetryHUD(sec);
          },
          onLeave: () => {
            gsap.to(panel, { opacity: 0, visibility: 'hidden', duration: 0.35, overwrite: 'auto' });
          },
          onEnterBack: () => {
            gsap.to(panel, { opacity: 1, visibility: 'visible', duration: 0.35, overwrite: 'auto' });
            this.updateTelemetryHUD(sec);
          },
          onLeaveBack: () => {
            if (idx !== 0) {
              gsap.to(panel, { opacity: 0, visibility: 'hidden', duration: 0.35, overwrite: 'auto' });
            }
          }
        });
      }
    });
  }

  updateDimensionalWorld(p) {
    if (this.backdropMat) {
      this.backdropMat.uniforms.progress.value = p;
    }

    // 1. Stage: Portal Opening (0.0 -> 0.16)
    if (p < 0.16) {
      this.portalMonolith.group.visible = true;
      this.fruitMango.visible = true;
      this.pouches.group.visible = false;

      // Hinge open portal rings
      const openRatio = Math.min(1, p / 0.12);
      this.portalMonolith.outerRing.rotation.y = openRatio * 0.65;
      this.portalMonolith.outerRing.rotation.z = openRatio * 0.35;
      this.portalMonolith.innerRing.rotation.y = -openRatio * 0.75;
      this.portalMonolith.innerRing.rotation.z = -openRatio * 0.28;

      // Fruit scale & position
      this.fruitMango.scale.setScalar(0.58 + openRatio * 0.25);
      this.fruitMango.position.set(0, 0.35, 0.5 + openRatio * 0.3);

      // Expand orbiting debris outwards on scroll
      this.debris.group.scale.setScalar(openRatio * 0.95);
      this.debris.group.visible = openRatio > 0.05;

      this.scene.background = new THREE.Color(0xf3e9d7);
      this.accentLight.intensity = 0;
    }
    // 2. Stage: The Mango World (0.16 -> 0.33)
    else if (p < 0.33) {
      this.portalMonolith.group.visible = false;
      this.fruitMango.visible = true;
      this.pouches.group.visible = false;
      this.debris.group.visible = true;
      this.debris.group.scale.setScalar(1.0);

      this.fruitMango.scale.setScalar(0.95);
      this.fruitMango.position.set(0, 0.2, 0.8);

      this.scene.background = new THREE.Color(0xf3e9d7);
      this.accentLight.intensity = 0.5;
      this.accentLight.color.setHex(0xff6a2a);
    }
    // 3. Stage: The Jackfruit World (0.33 -> 0.50)
    else if (p < 0.50) {
      this.portalMonolith.group.visible = false;
      this.fruitMango.visible = false;
      this.pouches.group.visible = false;
      this.debris.group.visible = true;
      this.debris.group.scale.setScalar(1.05);

      this.accentLight.intensity = 2.2;
      this.accentLight.color.setHex(0xddf05b);
    }
    // 4. Stage: The Chikoo World (0.50 -> 0.67)
    else if (p < 0.67) {
      this.portalMonolith.group.visible = false;
      this.fruitMango.visible = false;
      this.pouches.group.visible = false;
      this.debris.group.visible = true;
      this.debris.group.scale.setScalar(1.0);

      this.accentLight.intensity = 1.0;
      this.accentLight.color.setHex(0xffaa44);
    }
    // 5. Stage: The Banana World (0.67 -> 0.83)
    else if (p < 0.83) {
      this.portalMonolith.group.visible = false;
      this.fruitMango.visible = false;
      this.pouches.group.visible = false;
      this.debris.group.visible = true;
      this.debris.group.scale.setScalar(0.95);

      this.accentLight.intensity = 1.2;
      this.accentLight.color.setHex(0xf7e245);
    }
    // 6. Stage: The Finale (0.83 -> 1.00)
    else {
      this.portalMonolith.group.visible = false;
      this.fruitMango.visible = false;
      this.pouches.group.visible = true;
      this.debris.group.visible = true;
      this.debris.group.scale.setScalar(1.1);

      this.scene.background = new THREE.Color(0x171719);
      this.accentLight.intensity = 1.5;
      this.accentLight.color.setHex(0xff6a2a);
    }
  }

  updateTelemetryHUD(sec) {
    const indicatorPip = document.getElementById('telemetry-pip');
    const colorTags = document.getElementById('telemetry-colors');

    if (indicatorPip) {
      const pct = Math.round(sec.pStart * 100);
      indicatorPip.style.transform = `translateY(${sec.pStart * 120}px)`;
    }

    if (colorTags && sec.hexList) {
      colorTags.innerHTML = sec.hexList
        .map((hex) => `<span class="telemetry-color-pill">${hex}</span>`)
        .join('');
    }
  }

  onResize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.camera.aspect = this.width / this.height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(this.width, this.height);
    this.renderTarget.setSize(this.width, this.height);
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const delta = this.clock.getDelta();
    const elapsedTime = this.clock.getElapsedTime();

    // Lerp mouse coordinates
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.05;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.05;

    // Camera Parallax
    this.camera.position.x = this.mouse.x * 0.45;
    this.camera.position.y = this.mouse.y * 0.35;
    this.camera.lookAt(0, 0, 0);

    // Active fruit idle floating & user drag rotation
    const activeFruit = this.fruitMango.visible
      ? this.fruitMango
      : this.fruitJackfruit.visible
      ? this.fruitJackfruit
      : this.fruitChikoo.visible
      ? this.fruitChikoo
      : this.fruitBanana.visible
      ? this.fruitBanana
      : null;

    if (activeFruit) {
      if (!this.isDragging) {
        activeFruit.rotation.y += 0.006 + Math.abs(this.scrollVelocity) * 0.015;
        activeFruit.rotation.x = Math.sin(elapsedTime * 1.2) * 0.08 + this.dragRotation.x;
      } else {
        activeFruit.rotation.y = this.dragRotation.y;
        activeFruit.rotation.x = this.dragRotation.x;
      }
      activeFruit.position.y = Math.sin(elapsedTime * 1.5) * 0.08;
    }

    // Orbiting Debris Physics
    if (this.debris && this.debris.items) {
      const speedMultiplier = 1.0 + Math.abs(this.scrollVelocity) * 2.5;
      this.debris.items.forEach((item) => {
        item.angle += item.speed * delta * speedMultiplier;
        const x = Math.cos(item.angle) * item.radius;
        const z = Math.sin(item.angle) * (item.radius * 0.75);
        const y = Math.sin(item.angle * 2.0) * item.inclination + item.yOffset;
        item.mesh.position.set(x, y, z);
        item.mesh.rotation.x += item.rotX;
        item.mesh.rotation.y += item.rotY;
      });
    }

    // Pouches idle subtle anti-gravity drift
    if (this.pouches && this.pouches.pouches) {
      this.pouches.pouches.forEach((p, idx) => {
        p.subGroup.position.y = Math.sin(elapsedTime * 1.5 + idx * 0.8) * 0.06;
      });
    }

    // Update Post-Processing Time
    if (this.postMat) {
      this.postMat.uniforms.uTime.value = elapsedTime;
      this.postMat.uniforms.uAberration.value = 0.0022 + Math.abs(this.scrollVelocity) * 0.003;
    }

    // Render Scene to Target, then Post-Processing Quad to Screen
    this.renderer.setRenderTarget(this.renderTarget);
    this.renderer.render(this.scene, this.camera);

    this.renderer.setRenderTarget(null);
    this.postMat.uniforms.tDiffuse.value = this.renderTarget.texture;
    this.renderer.render(this.postScene, this.postCamera);
  }
}

// Instantiate Experience when DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  window.webglExperience = new WebGLExperience();
});
