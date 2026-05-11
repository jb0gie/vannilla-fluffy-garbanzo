import * as THREE from 'three';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

let scene, font;
let deckAreas = [];
let holoFields = [];

const deckData = [
  {
    id: 'techshaman',
    title: 'TECHSHAMAN',
    description: 'A pioneer of a new era of human evolution. Believes that the current state of humanity is unsustainable, fragmented, and disconnected.',
    position: { x: 0, y: 0, z: 0 },
    color: 0x00ffff,
    size: { width: 15, height: 10 }
  },
  {
    id: 'yexzu',
    title: 'YE X ZU',
    description: 'A vision of a different world, a world of abundance, harmony, and connection. A world where every human being is free, empowered, and valued.',
    position: { x: 200, y: 0, z: 150 },
    color: 0xff0080,
    size: { width: 12, height: 7 }
  },
  {
    id: '247420',
    title: '247420',
    description: 'A decentralized platform that allows anyone to create, share, and watch content of any kind, without censorship, surveillance, or interference.',
    position: { x: -180, y: 0, z: 200 },
    color: 0x00ff9d,
    size: { width: 14, height: 9 }
  },
  {
    id: 'schwepe',
    title: 'SCHWEPE',
    description: 'A skinless frog. The essence of schwepe speaks to the mind that drives ultimate realisation that jokes are funny.',
    position: { x: 160, y: 0, z: -170 },
    color: 0xffd700,
    size: { width: 11, height: 8 }
  },
  {
    id: 'blades',
    title: 'BLADES OF GRASS',
    description: 'An innovative project that aims to reconnect humanity with nature through technology.',
    position: { x: -190, y: 0, z: -160 },
    color: 0x4d00ff,
    size: { width: 13, height: 8 }
  },
  {
    id: 'accolades',
    title: 'ACCOLADES',
    description: 'The McAfee Job, MonaJob, MoralisJob, MetaGame - groundbreaking cybersecurity and blockchain initiatives',
    position: { x: 250, y: 0, z: 220 },
    color: 0xff6b6b,
    size: { width: 16, height: 9 }
  }
];

export function initDecks(threeScene, loadedFont) {
  scene = threeScene;
  font = loadedFont;
  
  if (!font) {
    console.warn('⚠️ Font not loaded, skipping deck creation');
    return deckAreas;
  }
  
  deckData.forEach(deck => {
    createDeckArea(deck);
  });
  
  console.log(`✅ Created ${deckAreas.length} cyberpunk deck areas`);
  return deckAreas;
}

function createDeckArea(deck) {
  const group = new THREE.Group();

  createPlatform(group, deck);
  createDataColumns(group, deck);
  createHolographicBorder(group, deck);
  createScannerLines(group, deck);
  createTitleText(group, deck);
  createDeckParticles(deck.position, deck.color, deck.size);
  createHoloFields(deck.position, deck.color);

  group.userData = {
    id: deck.id,
    title: deck.title,
    description: deck.description,
    originalPosition: { ...deck.position },
    color: deck.color
  };

  deckAreas.push(group);
  scene.add(group);
}

function createPlatform(group, deck) {
  const platformGeometry = new THREE.BoxGeometry(deck.size.width, 0.5, deck.size.height);
  const platformMaterial = new THREE.MeshPhongMaterial({
    color: deck.color,
    emissive: deck.color,
    emissiveIntensity: 0.4,
    transparent: true,
    opacity: 0.8,
    shininess: 100
  });
  
  const platform = new THREE.Mesh(platformGeometry, platformMaterial);
  platform.position.set(deck.position.x, 0.25, deck.position.z);
  group.add(platform);
}

function createDataColumns(group, deck) {
  const columnCount = 8;
  const columnRadius = deck.size.width / 2 + 5;

  for (let i = 0; i < columnCount; i++) {
    const angle = (i / columnCount) * Math.PI * 2;
    const columnX = deck.position.x + Math.cos(angle) * columnRadius;
    const columnZ = deck.position.z + Math.sin(angle) * columnRadius;

    const columnGeometry = new THREE.CylinderGeometry(0.15, 0.15, 3, 6, 1, true);
    const columnMaterial = new THREE.MeshBasicMaterial({
      color: deck.color,
      wireframe: true,
      transparent: true,
      opacity: 0.4
    });
    
    const column = new THREE.Mesh(columnGeometry, columnMaterial);
    column.position.set(columnX, 1.5, columnZ);
    column.userData.isDataStream = true;
     column.userData.dataSpeed = 0.0005 + Math.random() * 0.0005;
    
    group.add(column);
  }
}

function createHolographicBorder(group, deck) {
  const borderGeometry = new THREE.BoxGeometry(deck.size.width + 2, 1, deck.size.height + 2);
  const borderMaterial = new THREE.MeshBasicMaterial({
    color: deck.color,
    wireframe: true,
    transparent: true,
    opacity: 0.6
  });
  
  const border = new THREE.Mesh(borderGeometry, borderMaterial);
  border.position.set(deck.position.x, 0.5, deck.position.z);
  border.userData.isHolographicBorder = true;
  group.add(border);
}

function createScannerLines(group, deck) {
  for (let i = 0; i < 3; i++) {
    const scannerGeometry = new THREE.RingGeometry(deck.size.width / 2 - 2, deck.size.width / 2 + 2, 32);
    const scannerMaterial = new THREE.MeshBasicMaterial({
      color: deck.color,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide
    });
    
    const scanner = new THREE.Mesh(scannerGeometry, scannerMaterial);
    scanner.position.set(deck.position.x, 1 + i * 0.5, deck.position.z);
    scanner.rotation.x = Math.PI / 2;
     scanner.userData.isScanner = true;
     scanner.userData.scanSpeed = 0.0005 + i * 0.0002;
     scanner.userData.scanDirection = i % 2 === 0 ? 1 : -1;
    
    group.add(scanner);
  }
}

function createTitleText(group, deck) {
  if (!font) return;

  const titleGeometry = new TextGeometry(deck.title, {
    font: font,
    size: 1.2,
    height: 0.05,
    curveSegments: 6,
    bevelEnabled: false
  });

  titleGeometry.computeBoundingBox();
  const titleWidth = titleGeometry.boundingBox.max.x - titleGeometry.boundingBox.min.x;
  titleGeometry.translate(-titleWidth / 2, 0, 0);

  const titleMaterial = new THREE.MeshPhongMaterial({
    color: deck.color,
    emissive: deck.color,
    emissiveIntensity: 0.5,
    specular: 0xffffff,
    shininess: 100
  });
  
  const titleMesh = new THREE.Mesh(titleGeometry, titleMaterial);
  titleMesh.position.set(deck.position.x, 3, deck.position.z);
  titleMesh.userData.isTitle = true;
  group.add(titleMesh);

  const outlineMaterial = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.3,
    side: THREE.BackSide
  });
  
  const outlineMesh = new THREE.Mesh(titleGeometry.clone(), outlineMaterial);
  outlineMesh.position.copy(titleMesh.position);
  outlineMesh.scale.setScalar(1.1);
  group.add(outlineMesh);
}

function createDeckParticles(position, color, size) {
  const particleCount = 12;
  const particleGeometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const sizes = new Float32Array(particleCount);
  const velocities = [];

  const neonColor = new THREE.Color(color);

  for (let i = 0; i < particleCount; i++) {
    const angle = (i / particleCount) * Math.PI * 6 + Math.random() * Math.PI;
    const radius = 5 + Math.random() * size.width / 2;

    positions[i * 3] = position.x + Math.cos(angle) * radius;
    positions[i * 3 + 1] = Math.random() * 8 + 2;
    positions[i * 3 + 2] = position.z + Math.sin(angle) * radius;

    const colorVariant = i % 3 === 0 ? neonColor : new THREE.Color(getRandomColor());
    colors[i * 3] = colorVariant.r;
    colors[i * 3 + 1] = colorVariant.g;
    colors[i * 3 + 2] = colorVariant.b;

    sizes[i] = Math.random() * 0.5 + 0.2;

     velocities.push({
       x: (Math.random() - 0.5) * 0.005,
       y: (Math.random() - 0.5) * 0.005,
       z: (Math.random() - 0.5) * 0.005
     });
  }

  particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  const particleMaterial = new THREE.PointsMaterial({
    vertexColors: true,
    size: 0.3,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true
  });

  const particles = new THREE.Points(particleGeometry, particleMaterial);
  particles.userData.isDeckParticle = true;
  particles.userData.originPosition = new THREE.Vector3(position.x, position.y, position.z);
  particles.userData.velocities = velocities;
  scene.add(particles);
}

function createHoloFields(position, color) {
  const fieldCount = 4;

  for (let i = 0; i < fieldCount; i++) {
    const angle = (i / fieldCount) * Math.PI * 2;
    const fieldX = position.x + Math.cos(angle) * 8;
    const fieldZ = position.z + Math.sin(angle) * 8;

    const fieldGeometry = new THREE.PlaneGeometry(6, 8);
    const fieldMaterial = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.3,
      side: THREE.DoubleSide,
      wireframe: true
    });
    
    const field = new THREE.Mesh(fieldGeometry, fieldMaterial);
    field.position.set(fieldX, 4, fieldZ);
    field.userData.isHoloField = true;
    field.userData.oscillationSpeed = 0.001 + Math.random() * 0.002;
    field.userData.phase = Math.random() * Math.PI * 2;
    field.userData.originalPosition = { x: fieldX, y: 4, z: fieldZ };
    
    scene.add(field);
    holoFields.push(field);
  }
}

export function animateDecks(time) {
  deckAreas.forEach((deck, index) => {
    deck.children.forEach((child, childIndex) => {
      if (child.userData.isDataStream) {
        child.rotation.y = time * child.userData.dataSpeed;
        const pulse = Math.sin(time * 0.003 + childIndex) * 0.3 + 0.7;
        child.material.opacity = pulse * 0.8;

        const offset = (time * child.userData.dataSpeed * 100) % 1;
        child.material.opacity = pulse * (1 - Math.abs(offset - 0.5) * 2);
      }

      if (child.userData.isHolographicBorder) {
        child.rotation.y = Math.sin(time * 0.0005 + index) * 0.05;
        child.scale.setScalar(1 + Math.sin(time * 0.002 + index) * 0.05);
        const glow = Math.sin(time * 0.003 + index) * 0.3 + 0.7;
        child.material.opacity = glow * 0.8;
      }

       if (child.userData.isScanner) {
         const scanPhase = time * child.userData.scanSpeed * 0.2;
         const scanPosition = Math.abs(Math.sin(scanPhase)) * 4;
         child.position.y = 1 + scanPosition;
         child.material.opacity = 0.4 + Math.sin(scanPhase) * 0.2;
       }

      if (child.userData.isTitle) {
        const titleFloat = Math.sin(time * 0.001 + index * 2) * 0.3;
        const titleGlow = Math.sin(time * 0.003 + index * 3) * 0.2 + 0.8;
        child.position.y = deck.userData.originalPosition.y + 3 + titleFloat;
        child.material.emissiveIntensity = titleGlow;
      }
    });
  });

  holoFields.forEach((field) => {
    if (field.userData.isHoloField) {
      const oscillate = Math.sin(time * field.userData.oscillationSpeed + field.userData.phase) * 0.5 + 0.5;
       field.position.y = field.userData.originalPosition.y + oscillate * 0.5;
      field.rotation.y = time * 0.0005 + field.userData.phase;
      field.material.opacity = 0.2 + oscillate * 0.3;

      if (Math.random() > 0.98) {
        field.material.opacity = 0.8;
        setTimeout(() => {
          if (field.material) field.material.opacity = 0.2 + oscillate * 0.3;
        }, 50);
      }
    }
  });
}

export function getDeckAreas() {
  return deckAreas;
}

function getRandomColor() {
  const colors = [
    0x00ffff, 0xff1493, 0xff00ff, 0x00ff00,
    0xffff00, 0xff9900, 0x9d00ff, 0x00ffff
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}
