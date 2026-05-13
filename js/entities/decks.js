import * as THREE from 'three';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { playSound } from '../audio.js';

let scene, font;
let deckAreas = [];

const deckData = [
  {
    id: 'techshaman',
    title: 'TECHSHAMAN',
    description: 'A pioneer of a new era of human evolution. Believes that the current state of humanity is unsustainable, fragmented, and disconnected.',
    position: { x: 0, y: 0, z: 0 }, // CENTER — your home base
    color: 0x00ffff,
    size: { width: 12, height: 8 } // Reduced from 20x14
  },
  {
    id: 'yexzu',
    title: 'YE X ZU',
    description: 'A vision of a different world, a world of abundance, harmony, and connection. A world where every human being is free, empowered, and valued.',
    position: { x: 30, y: 0, z: 30 }, // NE — first outward step
    color: 0xff0080,
    size: { width: 10, height: 7 } // Reduced from 15x10
  },
  {
    id: '247420',
    title: '247420',
    description: 'A decentralized platform that allows anyone to create, share, and watch content of any kind, without censorship, surveillance, or interference.',
    position: { x: -35, y: 0, z: 25 }, // NW — second step
    color: 0x00ff9d,
    size: { width: 10, height: 7 } // Reduced from 15x10
  },
  {
    id: 'schwepe',
    title: 'SCHWEPE',
    description: 'A skinless frog. The essence of schwepe speaks to the mind that drives ultimate realisation that jokes are funny.',
    position: { x: -30, y: 0, z: -35 }, // SW — third step
    color: 0xffd700,
    size: { width: 9, height: 6 } // Reduced from 14x9
  },
  {
    id: 'blades',
    title: 'BLADES OF GRASS',
    description: 'An innovative project that aims to reconnect humanity with nature through technology.',
    position: { x: 30, y: 0, z: -30 }, // SE — fourth step
    color: 0x4d00ff,
    size: { width: 9, height: 6 } // Reduced from 14x9
  },
  {
    id: 'accolades',
    title: 'ACCOLADES',
    description: 'The McAfee Job, MonaJob, MoralisJob, MetaGame - groundbreaking cybersecurity and blockchain initiatives',
    position: { x: 0, y: 0, z: -60 }, // FAR SOUTH — final destination of the spiral
    color: 0xff6b6b,
    size: { width: 12, height: 8 } // Reduced from 18x11
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
  group.position.set(deck.position.x, deck.position.y, deck.position.z);

  createMonolith(group, deck);
  createDeckTitle(group, deck);
  createDeckParticles(deck.position, deck.color, deck.size);

  group.userData = {
    id: deck.id,
    title: deck.title,
    description: deck.description,
    originalPosition: { ...deck.position },
    color: deck.color,
    isNear: false
  };

  deckAreas.push(group);
  scene.add(group);
}

function createMonolith(group, deck) {
  // Simple monolithic platform — clean cuboid
  const platformGeometry = new THREE.BoxGeometry(deck.size.width, 0.5, deck.size.height);
  const platformMaterial = new THREE.MeshPhongMaterial({
    color: 0x111111,
    emissive: deck.color,
    emissiveIntensity: 0.2,
    shininess: 80,
    transparent: true,
    opacity: 0.9
  });

  const platform = new THREE.Mesh(platformGeometry, platformMaterial);
  platform.position.set(0, 0.25, 0);
  platform.receiveShadow = true;
  platform.userData.isPlatform = true;
  group.add(platform);

  // Subtle neon edge outline
  const edgeGeometry = new THREE.BoxGeometry(deck.size.width + 0.2, 0.6, deck.size.height + 0.2);
  const edgeMaterial = new THREE.MeshBasicMaterial({
    color: deck.color,
    wireframe: true,
    transparent: true,
    opacity: 0.2
  });

  const edges = new THREE.Mesh(edgeGeometry, edgeMaterial);
  edges.position.set(0, 0.3, 0);
  group.add(edges);

  // Minimal ambient glow
  const glowLight = new THREE.PointLight(deck.color, 0.3, 20);
  glowLight.position.set(0, 5, 0);
  group.add(glowLight);
}

function createDeckTitle(group, deck) {
  if (!font) return;

  const titleGeometry = new TextGeometry(deck.title, {
    font: font,
    size: 1.0,
    height: 0.2,
    depth: 0.5,
    curveSegments: 8,
    bevelEnabled: true,
    bevelThickness: 0.03,
    bevelSize: 0.02,
    bevelSegments: 3
  });

  titleGeometry.computeBoundingBox();
  const titleWidth = titleGeometry.boundingBox.max.x - titleGeometry.boundingBox.min.x;
  titleGeometry.translate(-titleWidth / 2, 0, 0);

  const titleMaterial = new THREE.MeshPhongMaterial({
    color: deck.color,
    emissive: deck.color,
    emissiveIntensity: 0.3,
    shininess: 80
  });

  const titleMesh = new THREE.Mesh(titleGeometry, titleMaterial);
  titleMesh.position.set(0, 4, 0);
  titleMesh.userData.isTitle = true;
  group.add(titleMesh);
}

function createDeckParticles(position, color, size) {
  const particleCount = 4;
  const particleGeometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const sizes = new Float32Array(particleCount);

  const radius = (size.width / 2) + 1.0; // Reduced from 1.5

  for (let i = 0; i < particleCount; i++) {
    const angle = (i / particleCount) * Math.PI * 2;
    positions[i * 3] = position.x + Math.cos(angle) * radius;
    positions[i * 3 + 1] = 2.5;
    positions[i * 3 + 2] = position.z + Math.sin(angle) * radius;

    colors[i * 3] = color.r / 255;
    colors[i * 3 + 1] = color.g / 255;
    colors[i * 3 + 2] = color.b / 255;

    sizes[i] = 0.1;
  }

  particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  const particleMaterial = new THREE.PointsMaterial({
    vertexColors: true,
    size: 0.1,
    transparent: true,
    opacity: 0.4, // Reduced from 0.7
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true
  });

  const particles = new THREE.Points(particleGeometry, particleMaterial);
  particles.userData.isDeckParticle = true;
  particles.userData.originPosition = new THREE.Vector3(position.x, 2.5, position.z);
  particles.userData.orbitAngle = 0;
  scene.add(particles);
}

export function animateDecks(time) {
  deckAreas.forEach((deck, index) => {
    deck.children.forEach((child) => {
      if (child.userData.isTitle) {
        // Gentle vertical float only
        const floatOffset = Math.sin(time * 0.001 + index * 2) * 0.2;
        child.position.y = 4 + floatOffset;

        // Restore original deck color and glow pulse
        child.material.emissive.set(deck.userData.color);
        const glow = 0.25 + Math.sin(time * 0.002 + index) * 0.08;
        child.material.emissiveIntensity = glow;
      }
      // Restore platform emissive to prevent blackout from pointer move
      if (child.userData.isPlatform) {
        child.material.emissive.set(deck.userData.color);
        child.material.emissiveIntensity = 0.2;
      }
    });
  });
}

export function getDeckAreas() {
  return deckAreas;
}

// Called from main.js to check deck proximity
export function checkDeckProximity(cameraPosition) {
  deckAreas.forEach(deck => {
    const distance = cameraPosition.distanceTo(deck.position);
    const wasNear = deck.userData.isNear;
    deck.userData.isNear = distance < 25; // Reduced from 40
    
    // Play ambient sound when first getting near
    if (deck.userData.isNear && !wasNear) {
      if (typeof playSound === 'function') {
        playSound('hover');
      }
      // Speed up scanners briefly
      deck.children.forEach(child => {
        if (child.userData && child.userData.isScanner) {
          child.userData.scanSpeed = 0.002; // Faster scan
        }
      });
    } else if (!deck.userData.isNear && wasNear) {
      // Reset scanner speed
      deck.children.forEach(child => {
        if (child.userData && child.userData.isScanner) {
          child.userData.scanSpeed = 0.0005 + Math.random() * 0.0005;
        }
      });
    }
  });
}

function getRandomColor() {
  const colors = [
    0x00ffff, 0xff1493, 0xff00ff, 0x00ff00,
    0xffff00, 0xff9900, 0x9d00ff, 0x00ffff
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}
