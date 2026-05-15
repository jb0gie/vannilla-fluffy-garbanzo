import * as THREE from 'three';
import { playSound } from '../audio.js';
import { getCameraController } from './camera.js';
import { getGameState } from './gameState.js';

let scene;
let collectibles = [];
let collectedCount = 0;

// Data crystal shapes and colors
const crystalColors = [0x00ffff, 0xff00ff, 0xffff00, 0x00ff00, 0xff1493, 0x9d00ff];
const crystalSizes = [0.3, 0.4, 0.5];

export function initCollectibles(threeScene) {
  scene = threeScene;
  createCollectibles();
  return collectibles;
}

function createCollectibles() {
  // Narrative spiral: crystals guide you from center → YE X ZU → 247420 → SCHWEPE → BLADES → ACCOLADES
  // Each cluster marks a waypoint on the journey
  const crystalPositions = [
    // === RING 1: Around home base (immediate visibility) ===
    { x: 12, z: 12, y: 3 },
    { x: -12, z: 12, y: 3.5 },
    { x: 12, z: -12, y: 4 },
    { x: -12, z: -12, y: 4.5 },
    
    // === PATH TO YE X ZU (NE) ===
    { x: 25, z: 25, y: 5 },
    { x: 40, z: 40, y: 6 },
    
    // === PATH TO 247420 (NW) ===
    { x: -30, z: 20, y: 5 },
    { x: -45, z: 30, y: 6 },
    
    // === PATH TO SCHWEPE (SW) ===
    { x: -25, z: -30, y: 5.5 },
    { x: -40, z: -45, y: 6.5 },
    
    // === PATH TO BLADES (SE) ===
    { x: 30, z: -25, y: 5.5 },
    { x: 45, z: -40, y: 6.5 },
    
    // === FINAL APPROACH TO ACCOLADES (far south) ===
    { x: 0, z: -40, y: 7 },
    { x: 0, z: -65, y: 8 },
    { x: 0, z: -85, y: 9 }
  ];

  crystalPositions.forEach((pos, index) => {
    createCrystalAtPosition(index, pos);
  });
  
  console.log(`✅ Created ${collectibles.length} data crystals along narrative spiral`);
}

function createCrystalAtPosition(index, pos) {
  const color = crystalColors[index % crystalColors.length];
  const size = crystalSizes[index % crystalSizes.length];

  const group = new THREE.Group();

  // Inner crystal — simplified material
  const crystalGeometry = new THREE.OctahedronGeometry(size, 0);
  const crystalMaterial = new THREE.MeshPhongMaterial({
    color: color,
    emissive: color,
    emissiveIntensity: 0.4, // Reduced from 0.6
    transparent: true,
    opacity: 0.9,
    shininess: 100
  });

  const crystal = new THREE.Mesh(crystalGeometry, crystalMaterial);
  group.add(crystal);

  // Outer wireframe shell — more subtle
  const shellGeometry = new THREE.DodecahedronGeometry(size * 1.5, 0);
  const shellMaterial = new THREE.MeshBasicMaterial({
    color: color,
    wireframe: true,
    transparent: true,
    opacity: 0.2 // Reduced from 0.4
  });

  const shell = new THREE.Mesh(shellGeometry, shellMaterial);
  group.add(shell);

  // Orbiting ring — fewer segments for cleaner look
  const ringGeometry = new THREE.TorusGeometry(size * 2, 0.02, 6, 16); // Reduced from (8, 32)
  const ringMaterial = new THREE.MeshBasicMaterial({
    color: color,
    transparent: true,
    opacity: 0.5
  });

  const ring = new THREE.Mesh(ringGeometry, ringMaterial);
  ring.rotation.x = Math.PI / 2;
  group.add(ring);

  // Glow light — dimmer
  const glowLight = new THREE.PointLight(color, 0.3, 10); // Reduced intensity and range
  glowLight.position.y = 2;
  group.add(glowLight);

  group.position.set(pos.x, pos.y, pos.z);

  group.userData = {
    isCollectible: true,
    id: `crystal-${index}`,
    color: color,
    originalY: pos.y,
    rotationSpeed: 0.002 + Math.random() * 0.002,
    floatOffset: Math.random() * Math.PI * 2,
    floatSpeed: 0.001 + Math.random() * 0.001,
    collected: false
  };

  scene.add(group);
  collectibles.push(group);
}

export function animateCollectibles(time, cameraPosition) {
  collectibles.forEach(crystal => {
    if (crystal.userData.collected) return;
    
    const data = crystal.userData;
    
    // Float up and down
    const floatY = Math.sin(time * data.floatSpeed + data.floatOffset) * 0.5;
    crystal.position.y = data.originalY + floatY;
    
    // Rotate crystal and shell
    crystal.rotation.y += data.rotationSpeed;
    crystal.rotation.x += data.rotationSpeed * 0.5;
    
    // Rotate ring opposite direction
    if (crystal.children[2]) {
      crystal.children[2].rotation.z -= data.rotationSpeed * 2;
    }
    
    // Proximity glow and Auto-collect effect
    if (cameraPosition) {
      const distance = cameraPosition.distanceTo(crystal.position);

      // Auto-collect if very close
      if (distance < 6) {
        collectCrystal(crystal);
        return;
      }

      const proximity = Math.max(0, 1 - distance / 30);

      if (crystal.children[0] && crystal.children[0].material) {
        const baseIntensity = 0.4;
        const pulse = 0.3 + Math.sin(time * 0.003 + data.floatOffset) * 0.2;
        crystal.children[0].material.emissiveIntensity = baseIntensity + pulse * 0.3 + proximity * 0.3; // Reduced boost
      }

      if (proximity > 0.8 && Math.random() < 0.001) {
        if (typeof playSound === 'function') {
          playSound('hover');
        }
      }
    } else {
      const pulse = 0.3 + Math.sin(time * 0.003 + data.floatOffset) * 0.2;
      if (crystal.children[0] && crystal.children[0].material) {
        crystal.children[0].material.emissiveIntensity = 0.4 + pulse * 0.3; // Reduced base
      }
    }
  });
}

export function collectCrystal(crystal) {
  if (!crystal || crystal.userData.collected) return null;
  
  crystal.userData.collected = true;
  collectedCount++;
  
  const color = new THREE.Color(crystal.userData.color);
  const position = crystal.position.clone();
  
  // Visual disappearance effect
  if (typeof TWEEN !== 'undefined') {
    // Scale down with ease-in
    new TWEEN.Tween(crystal.scale)
      .to({ x: 0, y: 0, z: 0 }, 300)
      .easing(TWEEN.Easing.Back.In)
      .onComplete(() => {
        scene.remove(crystal);
      })
      .start();
    
    // Fade out all materials
    const fadeObj = { alpha: 1 };
    new TWEEN.Tween(fadeObj)
      .to({ alpha: 0 }, 200)
      .onUpdate(() => {
        crystal.traverse(child => {
          if (child.isMesh && child.material) {
            child.material.opacity = fadeObj.alpha;
          }
        });
      })
      .start();
  } else {
    scene.remove(crystal);
  }
  
  // Create collection explosion
  createCollectionExplosion(position, color);
  
  // Flash effect on UI
  showCollectionToast(crystal.userData.id);

  // Update game state
  const gs = getGameState();
  if (gs) gs.collectItem(crystal.userData.id, 100);

  console.log(`💎 Crystal collected! Total: ${collectedCount}`);
  
  return crystal.userData.id;
}

function showCollectionToast(id) {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    bottom: 100px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 255, 255, 0.2);
    border: 1px solid var(--neon-cyan);
    color: var(--neon-cyan);
    padding: 10px 20px;
    font-family: 'Courier New', monospace;
    font-size: 14px;
    z-index: 2000;
    pointer-events: none;
    text-shadow: 0 0 10px var(--neon-cyan);
    backdrop-filter: blur(5px);
    animation: toast-in-out 2s ease-out forwards;
  `;
  toast.textContent = `◈ CRYSTAL SYNCED: ${id.toUpperCase()} ◈`;

  if (!document.getElementById('toast-style')) {
    const style = document.createElement('style');
    style.id = 'toast-style';
    style.textContent = `
      @keyframes toast-in-out {
        0% { transform: translate(-50%, 20px); opacity: 0; }
        20% { transform: translate(-50%, 0); opacity: 1; }
        80% { transform: translate(-50%, 0); opacity: 1; }
        100% { transform: translate(-50%, -20px); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2000);
}

function createCollectionExplosion(position, color) {
  // Create burst of sparkle particles
  const particleCount = 40;
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const sizes = new Float32Array(particleCount);
  const velocities = [];

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = position.x;
    positions[i * 3 + 1] = position.y;
    positions[i * 3 + 2] = position.z;

    const speed = Math.random() * 0.4 + 0.1;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;

    velocities.push(new THREE.Vector3(
      speed * Math.sin(phi) * Math.cos(theta),
      speed * Math.sin(phi) * Math.sin(theta),
      speed * Math.cos(phi)
    ));

    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
    sizes[i] = Math.random() * 0.3 + 0.1;
  }
  
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
  
  const material = new THREE.PointsMaterial({
    vertexColors: true,
    size: 0.2,
    transparent: true,
    opacity: 1,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true
  });
  
  const particles = new THREE.Points(geometry, material);
  scene.add(particles);
  
  // Camera shake on collection
  const cc = getCameraController();
  if (cc) cc.shakeIntensity = 0.4;

  // Flash light
  const flash = new THREE.PointLight(color, 2, 20);
  flash.position.copy(position);
  scene.add(flash);

  if (typeof TWEEN !== 'undefined') {
    new TWEEN.Tween(flash)
      .to({ intensity: 0 }, 500)
      .onComplete(() => scene.remove(flash))
      .start();
  } else {
    setTimeout(() => scene.remove(flash), 500);
  }

  // Animate explosion
  let frame = 0;
  const maxFrames = 60;
  
  function animateExplosion() {
    frame++;
    const positions = particles.geometry.attributes.position.array;
    let hasVisible = false;
    
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] += velocities[i].x;
      positions[i * 3 + 1] += velocities[i].y;
      positions[i * 3 + 2] += velocities[i].z;
      velocities[i].y -= 0.002; // gravity
      velocities[i].multiplyScalar(0.96); // drag
      
      const alpha = 1 - (frame / maxFrames);
      if (alpha > 0) hasVisible = true;
    }
    
    particles.geometry.attributes.position.needsUpdate = true;
    material.opacity = 1 - (frame / maxFrames);
    
    if (hasVisible && frame < maxFrames) {
      requestAnimationFrame(animateExplosion);
    } else {
      scene.remove(particles);
      geometry.dispose();
      material.dispose();
    }
  }
  
  animateExplosion();
}

export function getAllCollectibles() {
  return collectibles.filter(c => !c.userData.collected);
}

export function getCollectedCount() {
  return collectedCount;
}

export function resetCollectibles() {
  // Remove all existing
  collectibles.forEach(c => scene.remove(c));
  collectibles = [];
  collectedCount = 0;
  createCollectibles();
}
