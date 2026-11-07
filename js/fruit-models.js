/**
 * Realbeber - High-Fidelity 3D Fruit Geometry & PBR Materials
 * Museum-grade procedural 3D models with organic silhouettes, micro-textures, and fruit pores.
 */

import * as THREE from 'three';

// Procedural organic canvas textures for micro-detail
function createMangoTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  // Multi-stop radial gradient for tropical sun blush
  const grad = ctx.createLinearGradient(0, 0, 1024, 1024);
  grad.addColorStop(0.0, '#E6392E'); // Ruby blush on shoulder
  grad.addColorStop(0.35, '#FF8A1C'); // Warm sunset tangerine
  grad.addColorStop(0.7, '#FFC226'); // Golden Alphonso center
  grad.addColorStop(0.95, '#8CB83E'); // Fresh avocado green apex
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 1024);

  // Micro fruit pores and organic stippling
  const imgData = ctx.getImageData(0, 0, 1024, 1024);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 18;
    data[i] = Math.min(255, Math.max(0, data[i] + noise));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
  }
  ctx.putImageData(imgData, 0, 0);

  // Subtle golden freckles
  ctx.fillStyle = 'rgba(255, 235, 180, 0.25)';
  for (let i = 0; i < 400; i++) {
    const x = Math.random() * 1024;
    const y = Math.random() * 1024;
    const r = Math.random() * 1.8 + 0.5;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.generateMipmaps = true;
  return texture;
}

function createFruitNormalMap() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'rgb(128, 128, 255)'; // Flat normal base
  ctx.fillRect(0, 0, 512, 512);

  const imgData = ctx.getImageData(0, 0, 512, 512);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const nx = (Math.random() - 0.5) * 45;
    const ny = (Math.random() - 0.5) * 45;
    data[i] = Math.min(255, Math.max(0, 128 + nx));
    data[i + 1] = Math.min(255, Math.max(0, 128 + ny));
    data[i + 2] = 255;
  }
  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

function createChikooTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d');

  // Velvety brown base with sandy warm clay undertones
  const grad = ctx.createLinearGradient(0, 0, 1024, 1024);
  grad.addColorStop(0.0, '#7A4F2D');
  grad.addColorStop(0.5, '#A07045');
  grad.addColorStop(1.0, '#6E4323');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 1024);

  // Fine suede/velvet grain
  const imgData = ctx.getImageData(0, 0, 1024, 1024);
  const data = imgData.data;
  for (let i = 0; i < data.length; i += 4) {
    const grain = (Math.random() - 0.5) * 35;
    data[i] = Math.min(255, Math.max(0, data[i] + grain));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + grain * 0.9));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + grain * 0.7));
  }
  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

function createFreezeDriedPorousTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#FFAA1D';
  ctx.fillRect(0, 0, 512, 512);

  // Create porous honeycomb aeration holes
  for (let i = 0; i < 600; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const r = Math.random() * 5 + 1.2;
    ctx.fillStyle = 'rgba(190, 100, 10, 0.45)';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();

    // Specular highlight on pore edge
    ctx.fillStyle = 'rgba(255, 230, 160, 0.3)';
    ctx.beginPath();
    ctx.arc(x - r * 0.3, y - r * 0.3, r * 0.45, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

// 1. Hyper-Realistic Mango Mesh with Leaf and Stem
export function createMangoGroup() {
  const group = new THREE.Group();

  // Organic Mango Geometry: sculpted sphere with belly, tapering stem, and beak
  const geo = new THREE.SphereGeometry(1.65, 64, 64);
  const pos = geo.attributes.position;
  const v = new THREE.Vector3();

  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const yNorm = (v.y + 1.65) / 3.3; // 0 at bottom, 1 at top

    // Taper top (near pedicel) and broaden lower-mid belly
    const taper = Math.sin(yNorm * Math.PI) * 0.32 + 0.78;
    v.x *= taper;
    v.z *= taper * 0.88; // Slight flattening along lateral plane

    // Curvature & beak towards the tip
    if (v.y < -0.4) {
      v.x += Math.sin((v.y + 0.4) * 1.5) * 0.28;
      v.z -= Math.sin((v.y + 0.4) * 1.2) * 0.15;
    }

    // Belly fullness on one side (asymmetric natural fruit growth)
    if (v.x > 0) {
      v.x += Math.sin(yNorm * Math.PI) * 0.22;
    }

    pos.setXYZ(i, v.x, v.y, v.z);
  }
  geo.computeVertexNormals();

  const mangoMat = new THREE.MeshPhysicalMaterial({
    map: createMangoTexture(),
    normalMap: createFruitNormalMap(),
    normalScale: new THREE.Vector2(0.35, 0.35),
    roughness: 0.38,
    metalness: 0.05,
    clearcoat: 0.35,
    clearcoatRoughness: 0.25,
    sheen: 0.4,
    sheenColor: new THREE.Color(0xffaa44),
    reflectivity: 0.5
  });

  const mangoMesh = new THREE.Mesh(geo, mangoMat);
  mangoMesh.castShadow = true;
  mangoMesh.receiveShadow = true;
  group.add(mangoMesh);

  // Pedicel Stem
  const stemCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 1.55, 0),
    new THREE.Vector3(0.08, 1.85, -0.05),
    new THREE.Vector3(0.18, 2.15, -0.15)
  ]);
  const stemGeo = new THREE.TubeGeometry(stemCurve, 16, 0.065, 8, false);
  const stemMat = new THREE.MeshStandardMaterial({
    color: 0x5a3d24,
    roughness: 0.85,
    metalness: 0.1
  });
  const stemMesh = new THREE.Mesh(stemGeo, stemMat);
  group.add(stemMesh);

  // Fresh Green Leaf
  const leafShape = new THREE.Shape();
  leafShape.moveTo(0, 0);
  leafShape.bezierCurveTo(0.4, 0.3, 0.6, 0.9, 0.3, 1.4);
  leafShape.bezierCurveTo(0.1, 1.7, 0, 2.0, 0, 2.2);
  leafShape.bezierCurveTo(0, 2.0, -0.1, 1.7, -0.3, 1.4);
  leafShape.bezierCurveTo(-0.6, 0.9, -0.4, 0.3, 0, 0);

  const leafGeo = new THREE.ShapeGeometry(leafShape, 12);
  // Curve leaf slightly in 3D
  const leafPos = leafGeo.attributes.position;
  for (let i = 0; i < leafPos.count; i++) {
    const y = leafPos.getY(i);
    const z = Math.sin((y / 2.2) * Math.PI) * 0.18;
    leafPos.setZ(i, z);
  }
  leafGeo.computeVertexNormals();

  const leafMat = new THREE.MeshStandardMaterial({
    color: 0x2e7d32,
    roughness: 0.4,
    metalness: 0.1,
    side: THREE.DoubleSide
  });
  const leafMesh = new THREE.Mesh(leafGeo, leafMat);
  leafMesh.position.set(0.12, 1.75, -0.08);
  leafMesh.rotation.set(0.4, 0.3, -0.85);
  leafMesh.scale.set(0.85, 0.85, 0.85);
  group.add(leafMesh);

  return group;
}

// 2. Hyper-Realistic Jackfruit Mesh with Prickles
export function createJackfruitGroup() {
  const group = new THREE.Group();

  const geo = new THREE.SphereGeometry(1.7, 64, 64);
  const pos = geo.attributes.position;
  const v = new THREE.Vector3();

  // Elongate and add characteristic high-frequency conical prickle displacement
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    v.y *= 1.35; // Elongate into oblong jackfruit shape
    v.x *= 0.92;
    v.z *= 0.92;

    // Prickle tubercles
    const prickle = Math.sin(v.x * 24) * Math.sin(v.y * 24) * Math.sin(v.z * 24) * 0.045;
    const macroLump = Math.sin(v.x * 4) * Math.cos(v.y * 4) * 0.08;
    v.addScaledVector(v.clone().normalize(), prickle + macroLump);

    pos.setXYZ(i, v.x, v.y, v.z);
  }
  geo.computeVertexNormals();

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#658C34';
  ctx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 4000; i++) {
    ctx.fillStyle = Math.random() > 0.5 ? '#7E9F45' : '#4E6D24';
    ctx.fillRect(Math.random() * 512, Math.random() * 512, 3, 3);
  }
  const jfTex = new THREE.CanvasTexture(canvas);
  jfTex.wrapS = THREE.RepeatWrapping;
  jfTex.wrapT = THREE.RepeatWrapping;
  jfTex.repeat.set(4, 4);

  const mat = new THREE.MeshStandardMaterial({
    map: jfTex,
    color: 0x82a543,
    roughness: 0.88,
    metalness: 0.05
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow = true;
  group.add(mesh);

  // Sturdy woody stem
  const stemGeo = new THREE.CylinderGeometry(0.14, 0.18, 0.9, 12);
  const stemMat = new THREE.MeshStandardMaterial({ color: 0x422f1d, roughness: 0.9 });
  const stem = new THREE.Mesh(stemGeo, stemMat);
  stem.position.set(0, 2.3, 0);
  group.add(stem);

  return group;
}

// 3. Velvety Chikoo (Sapodilla)
export function createChikooGroup() {
  const group = new THREE.Group();

  const geo = new THREE.SphereGeometry(1.5, 48, 48);
  const pos = geo.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    // Slightly ovate with subtle asymmetry
    v.y *= 1.15;
    const noise = (Math.random() - 0.5) * 0.025;
    v.addScaledVector(v.clone().normalize(), noise);
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  geo.computeVertexNormals();

  const mat = new THREE.MeshPhysicalMaterial({
    map: createChikooTexture(),
    roughness: 0.92,
    metalness: 0.02,
    sheen: 0.6,
    sheenColor: new THREE.Color(0xa07045)
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow = true;
  group.add(mesh);

  // Pedicel and Leaf
  const stemGeo = new THREE.CylinderGeometry(0.06, 0.08, 0.6, 8);
  const stemMat = new THREE.MeshStandardMaterial({ color: 0x3d2714, roughness: 0.85 });
  const stem = new THREE.Mesh(stemGeo, stemMat);
  stem.position.set(0, 1.8, 0);
  stem.rotation.z = -0.2;
  group.add(stem);

  const leafGeo = new THREE.PlaneGeometry(0.65, 1.2, 8, 8);
  const leafMat = new THREE.MeshStandardMaterial({
    color: 0x28632d,
    roughness: 0.45,
    side: THREE.DoubleSide
  });
  const leaf = new THREE.Mesh(leafGeo, leafMat);
  leaf.position.set(-0.25, 1.9, 0.1);
  leaf.rotation.set(0.3, -0.4, 0.8);
  group.add(leaf);

  return group;
}

// 4. Curved 3D Banana
export function createBananaGroup() {
  const group = new THREE.Group();

  // Create curved banana curve
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-1.8, 0.85, 0),
    new THREE.Vector3(-0.9, -0.35, 0),
    new THREE.Vector3(0.3, -0.65, 0),
    new THREE.Vector3(1.5, -0.15, 0),
    new THREE.Vector3(2.1, 0.75, 0)
  ]);

  const geo = new THREE.TubeGeometry(curve, 32, 0.42, 6, false); // 6-sided for characteristic banana facets!
  const pos = geo.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    // Taper at ends
    const distToCenter = Math.sqrt(v.x * v.x + v.y * v.y);
    if (distToCenter > 1.6) {
      const taper = Math.max(0.3, 2.2 - distToCenter);
      v.y *= taper;
      v.z *= taper;
    }
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  geo.computeVertexNormals();

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  const grad = ctx.createLinearGradient(0, 0, 512, 0);
  grad.addColorStop(0.0, '#3A5A1A'); // Green stem base
  grad.addColorStop(0.12, '#F5DE38'); // Ripe banana yellow
  grad.addColorStop(0.88, '#F7E245');
  grad.addColorStop(1.0, '#5E4320'); // Brown flower tip
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 128);

  const tex = new THREE.CanvasTexture(canvas);
  const mat = new THREE.MeshStandardMaterial({
    map: tex,
    roughness: 0.42,
    metalness: 0.05
  });

  const mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow = true;
  group.add(mesh);

  return group;
}

// 5. Orbiting Freeze-Dried Fruit Crisps & Debris
export function createOrbitingDebris(count = 36) {
  const group = new THREE.Group();
  const crispMat = new THREE.MeshStandardMaterial({
    map: createFreezeDriedPorousTexture(),
    color: 0xffb733,
    roughness: 0.85,
    metalness: 0.02
  });

  const marbleMat = new THREE.MeshStandardMaterial({
    color: 0xe8e2d5,
    roughness: 0.25,
    metalness: 0.1
  });

  const lavenderSphereMat = new THREE.MeshStandardMaterial({
    color: 0xc7b8f0,
    roughness: 0.4,
    metalness: 0.05
  });

  const items = [];

  for (let i = 0; i < count; i++) {
    let mesh;
    const isSpecial = i % 10 === 0;
    const isLavender = i % 12 === 1;

    if (isSpecial) {
      // Marble celestial sphere (like in the reference video!)
      mesh = new THREE.Mesh(new THREE.SphereGeometry(0.32, 24, 24), marbleMat);
    } else if (isLavender) {
      // Soft lavender orbital sphere
      mesh = new THREE.Mesh(new THREE.SphereGeometry(0.24, 24, 24), lavenderSphereMat);
    } else if (i % 3 === 0) {
      // Porous freeze-dried cube
      mesh = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.35, 0.35), crispMat);
    } else if (i % 3 === 1) {
      // Honeycomb crisp medallion
      mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.12, 12), crispMat);
    } else {
      // Crunchy faceted chunk
      mesh = new THREE.Mesh(new THREE.DodecahedronGeometry(0.25, 0), crispMat);
    }

    // Set orbital parameters
    const trackRadius = 2.4 + (i % 4) * 0.75 + Math.random() * 0.3;
    const baseAngle = (i / count) * Math.PI * 2;
    const speed = (0.2 + (i % 3) * 0.12) * (Math.random() > 0.5 ? 1 : 1);
    const inclination = (Math.random() - 0.5) * 0.6;
    const yOffset = (Math.random() - 0.5) * 0.8;

    mesh.castShadow = true;
    group.add(mesh);

    items.push({
      mesh,
      radius: trackRadius,
      angle: baseAngle,
      speed,
      inclination,
      yOffset,
      rotX: Math.random() * 0.03,
      rotY: Math.random() * 0.03
    });
  }

  // Create concentric elliptical wireframe orbit rings
  const ringGroup = new THREE.Group();
  [2.4, 3.2, 4.0].forEach((r, idx) => {
    const curve = new THREE.EllipseCurve(0, 0, r, r * 0.75, 0, Math.PI * 2, false, 0);
    const points = curve.getPoints(64);
    const ringGeo = new THREE.BufferGeometry().setFromPoints(points);
    const ringMat = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.32 - idx * 0.06
    });
    const line = new THREE.LineLoop(ringGeo, ringMat);
    line.rotation.x = Math.PI / 2 + 0.25;
    line.rotation.y = -0.15;
    ringGroup.add(line);
  });
  group.add(ringGroup);

  return { group, items };
}

// 6. Sculptural Monolith Gateway Portal (Scene 1)
export function createPortalMonolith() {
  const group = new THREE.Group();

  // Fluted brushed metal concentric rings
  const ringGeoOuter = new THREE.TorusGeometry(2.65, 0.28, 32, 64);
  const ringGeoInner = new THREE.TorusGeometry(2.15, 0.22, 32, 64);

  const metalMat = new THREE.MeshStandardMaterial({
    color: 0xcccccc,
    metalness: 0.35,
    roughness: 0.38,
    emissive: 0x1a1208
  });

  const outerRing = new THREE.Mesh(ringGeoOuter, metalMat);
  const innerRing = new THREE.Mesh(ringGeoInner, metalMat);
  outerRing.castShadow = true;
  innerRing.castShadow = true;

  // Stepped Lavender Dais (Pedestal)
  const daisMat = new THREE.MeshStandardMaterial({
    color: 0xc7b8f0,
    roughness: 0.72,
    metalness: 0.04
  });
  const daisStep1 = new THREE.Mesh(new THREE.CylinderGeometry(1.65, 1.75, 0.22, 48), daisMat);
  daisStep1.position.y = -2.1;
  const daisStep2 = new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.5, 0.22, 48), daisMat);
  daisStep2.position.y = -1.88;
  const daisStep3 = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.25, 0.22, 48), daisMat);
  daisStep3.position.y = -1.66;

  // Deep Cobalt Diamond Architectural Backing
  const diamondMat = new THREE.MeshStandardMaterial({
    color: 0x243d9b,
    roughness: 0.55,
    metalness: 0.08
  });
  const diamondMesh = new THREE.Mesh(new THREE.BoxGeometry(2.8, 2.8, 0.15), diamondMat);
  diamondMesh.rotation.z = Math.PI / 4;
  diamondMesh.position.set(0, 0, -0.6);

  // Soft Lavender Accent Sphere
  const sphereMat = new THREE.MeshStandardMaterial({
    color: 0xc7b8f0,
    roughness: 0.5,
    metalness: 0.05
  });
  const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.38, 32, 32), sphereMat);
  sphere.position.set(1.25, 0.95, -0.3);

  group.add(outerRing);
  group.add(innerRing);
  group.add(daisStep1);
  group.add(daisStep2);
  group.add(daisStep3);
  group.add(diamondMesh);
  group.add(sphere);

  return {
    group,
    outerRing,
    innerRing,
    diamondMesh
  };
}

// 7. Standing 3D Pouches (Finale Collection)
export function createPouchesGroup(pouchTextures) {
  const group = new THREE.Group();
  const pouchWidth = 1.35;
  const pouchHeight = 1.95;

  const flavors = [
    { name: 'Mango', color: 0x203565, x: -2.85, y: -0.1, z: 0, tex: pouchTextures.mango },
    { name: 'Jackfruit', color: 0x3d6645, x: -0.95, y: 0.15, z: 0.3, tex: pouchTextures.jackfruit },
    { name: 'Chikoo', color: 0x825032, x: 0.95, y: 0.15, z: 0.3, tex: pouchTextures.chikku },
    { name: 'Banana', color: 0xe6cd4e, x: 2.85, y: -0.1, z: 0, tex: pouchTextures.banana }
  ];

  // Dark circular podium material
  const podiumMat = new THREE.MeshStandardMaterial({
    color: 0x22262d,
    roughness: 0.6,
    metalness: 0.2
  });

  const pouches = [];

  flavors.forEach((f) => {
    const pouchSubGroup = new THREE.Group();
    pouchSubGroup.position.set(f.x, f.y, f.z);

    // Standing pouch geometry with curved front face and bottom gusset
    const geo = new THREE.PlaneGeometry(pouchWidth, pouchHeight, 16, 16);
    // Curve pouch outwards for realistic packaging bulge
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const bulge = Math.cos((x / (pouchWidth / 2)) * (Math.PI / 2)) * Math.sin(((y + pouchHeight / 2) / pouchHeight) * Math.PI) * 0.18;
      pos.setZ(i, bulge);
    }
    geo.computeVertexNormals();

    const mat = new THREE.MeshStandardMaterial({
      map: f.tex,
      roughness: 0.35,
      metalness: 0.25,
      side: THREE.DoubleSide
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.castShadow = true;
    pouchSubGroup.add(mesh);

    // Stepped circular dark podium
    const podiumHeight = f.y > 0 ? 0.6 : 0.35;
    const podiumGeo = new THREE.CylinderGeometry(0.85, 0.92, podiumHeight, 32);
    const podium = new THREE.Mesh(podiumGeo, podiumMat);
    podium.position.y = -pouchHeight / 2 - podiumHeight / 2;
    podium.receiveShadow = true;
    pouchSubGroup.add(podium);

    group.add(pouchSubGroup);
    pouches.push({ subGroup: pouchSubGroup, mesh, flavor: f.name });
  });

  return { group, pouches };
}
