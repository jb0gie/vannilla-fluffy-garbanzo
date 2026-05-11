import * as THREE from 'three';

let scene;
let particleSystems = {
  neon: null,
  click: null,
  deck: []
};

let interactionLight, pulseLight;
let clickParticleVelocities = [];
const clickParticleCount = 50;

const neonColors = [0x00ffff, 0xff1493, 0xff00ff, 0x00ff00, 0xffff00, 0xff9900];

export function initParticles(threeScene) {
  scene = threeScene;
  
  createNeonParticles();
  createClickParticles();
  createLights();
  
  console.log('✅ Particle systems initialized');
  return particleSystems;
}

function createNeonParticles() {
  const particleCount = 400;
  const particleGeometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);
  const sizes = new Float32Array(particleCount);

  for (let i = 0; i < particleCount; i++) {
    const radius = 200 + Math.random() * 300;
    const angle = Math.random() * Math.PI * 2;
    const height = (Math.random() - 0.5) * 200;

    positions[i * 3] = Math.cos(angle) * radius;
    positions[i * 3 + 1] = height;
    positions[i * 3 + 2] = Math.sin(angle) * radius;

    const color = new THREE.Color(neonColors[Math.floor(Math.random() * neonColors.length)]);
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;

    sizes[i] = Math.random() * 2 + 1;
  }

  particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

  const particleMaterial = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 }
    },
    vertexShader: `
      attribute float size;
      attribute vec3 color;
      varying vec3 vColor;
      uniform float time;

      void main() {
        vColor = color;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * (300.0 / -mvPosition.z) * (1.0 + 0.3 * sin(time * 0.01 + position.x * 0.01));
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      varying vec3 vColor;

      void main() {
        float r = 0.0, dist = 0.0;
        for(int i = 0; i < 5; i++) {
          vec2 st = gl_PointCoord - vec2(0.5);
          r = length(st) * 2.0;
          dist = 1.0 - smoothstep(0.5, 1.0, r);
        }
        gl_FragColor = vec4(vColor, dist);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  particleSystems.neon = new THREE.Points(particleGeometry, particleMaterial);
  scene.add(particleSystems.neon);
}

function createClickParticles() {
  const clickParticleGeometry = new THREE.BufferGeometry();
  const clickParticlePositions = new Float32Array(clickParticleCount * 3);
  const clickParticleColors = new Float32Array(clickParticleCount * 3);
  const clickParticleSizes = new Float32Array(clickParticleCount);
  const clickParticleAlphas = new Float32Array(clickParticleCount);

  for (let i = 0; i < clickParticleCount; i++) {
    clickParticlePositions[i * 3] = 0;
    clickParticlePositions[i * 3 + 1] = 0;
    clickParticlePositions[i * 3 + 2] = 0;

    clickParticleVelocities.push(new THREE.Vector3(0, 0, 0));

    clickParticleColors[i * 3] = Math.random();
    clickParticleColors[i * 3 + 1] = Math.random();
    clickParticleColors[i * 3 + 2] = Math.random();

    clickParticleSizes[i] = Math.random() * 0.1 + 0.05;
    clickParticleAlphas[i] = 0;
  }

  clickParticleGeometry.setAttribute('position', new THREE.BufferAttribute(clickParticlePositions, 3));
  clickParticleGeometry.setAttribute('color', new THREE.BufferAttribute(clickParticleColors, 3));
  clickParticleGeometry.setAttribute('size', new THREE.BufferAttribute(clickParticleSizes, 1));
  clickParticleGeometry.setAttribute('alpha', new THREE.BufferAttribute(clickParticleAlphas, 1));

  const clickParticleMaterial = new THREE.PointsMaterial({
    size: 0.1,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true
  });

  particleSystems.click = new THREE.Points(clickParticleGeometry, clickParticleMaterial);
  particleSystems.click.visible = false;
  scene.add(particleSystems.click);
}

function createLights() {
  interactionLight = new THREE.PointLight(0xffffff, 0, 20);
  interactionLight.position.set(0, 0, 10);
  scene.add(interactionLight);

  pulseLight = new THREE.PointLight(0x00ffff, 0.5, 30);
  pulseLight.position.set(0, 0, 0);
  scene.add(pulseLight);
}

export function createBurst(position, color = null) {
  if (!particleSystems.click) return;

  const positions = particleSystems.click.geometry.attributes.position.array;
  const velocities = clickParticleVelocities;
  const alphas = particleSystems.click.geometry.attributes.alpha.array;

  if (interactionLight) {
    interactionLight.position.copy(position);
    interactionLight.intensity = 2;

    if (typeof TWEEN !== 'undefined') {
      new TWEEN.Tween(interactionLight)
        .to({ intensity: 0 }, 500)
        .easing(TWEEN.Easing.Cubic.Out)
        .start();
    }
  }

  for (let i = 0; i < clickParticleCount; i++) {
    positions[i * 3] = position.x;
    positions[i * 3 + 1] = position.y;
    positions[i * 3 + 2] = position.z;

    const speed = Math.random() * 0.3 + 0.1;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;

    velocities[i].set(
      speed * Math.sin(phi) * Math.cos(theta),
      speed * Math.sin(phi) * Math.sin(theta),
      speed * Math.cos(phi)
    );

    if (color) {
      const colors = particleSystems.click.geometry.attributes.color.array;
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    } else {
      const colors = particleSystems.click.geometry.attributes.color.array;
      colors[i * 3] = 0.0 + Math.random() * 0.3;
      colors[i * 3 + 1] = 0.8 + Math.random() * 0.2;
      colors[i * 3 + 2] = 1.0;
    }

    alphas[i] = 1;
  }

  particleSystems.click.geometry.attributes.position.needsUpdate = true;
  particleSystems.click.geometry.attributes.alpha.needsUpdate = true;
  if (color) {
    particleSystems.click.geometry.attributes.color.needsUpdate = true;
  }

  particleSystems.click.visible = true;
}

export function animateParticles(time) {
  if (particleSystems.neon && particleSystems.neon.material.uniforms) {
    particleSystems.neon.material.uniforms.time.value = time;
  }

  if (particleSystems.click && particleSystems.click.visible) {
    const positions = particleSystems.click.geometry.attributes.position.array;
    const velocities = clickParticleVelocities;
    const alphas = particleSystems.click.geometry.attributes.alpha.array;
    let hasVisibleParticles = false;

    for (let i = 0; i < clickParticleCount; i++) {
      positions[i * 3] += velocities[i].x;
      positions[i * 3 + 1] += velocities[i].y;
      positions[i * 3 + 2] += velocities[i].z;

      velocities[i].y -= 0.002;
      velocities[i].multiplyScalar(0.98);

      alphas[i] -= 0.02;

      if (alphas[i] > 0) {
        hasVisibleParticles = true;
      }
    }

    particleSystems.click.geometry.attributes.position.needsUpdate = true;
    particleSystems.click.geometry.attributes.alpha.needsUpdate = true;

    if (!hasVisibleParticles) {
      particleSystems.click.visible = false;
    }
  }
}

export function animateDeckParticles(time) {
  scene.traverse((child) => {
    if (child.userData.isDeckParticle) {
      const positions = child.geometry.attributes.position.array;
      const velocities = child.userData.velocities;

      if (velocities) {
        for (let i = 0; i < positions.length; i += 3) {
          const particleIndex = Math.floor(i / 3);
          const angle = time * 0.001 + particleIndex * 0.1;
          const radius = 5 + Math.sin(time * 0.002 + particleIndex) * 0.3;

          const centerX = child.userData.originPosition.x;
          const centerZ = child.userData.originPosition.z;

          positions[i] = centerX + Math.cos(angle) * radius + velocities[particleIndex].x * 1;
          positions[i + 1] = child.userData.originPosition.y + 4 + Math.sin(time * 0.002 + i) * 0.2;
          positions[i + 2] = centerZ + Math.sin(angle) * radius + velocities[particleIndex].z * 1;

          if (child.geometry.attributes.size) {
            const sizes = child.geometry.attributes.size.array;
            sizes[Math.floor(i / 3)] = 0.2 + Math.sin(time * 0.003 + particleIndex) * 0.1;
            child.geometry.attributes.size.needsUpdate = true;
          }
        }
      } else {
        for (let i = 0; i < positions.length; i += 3) {
          positions[i + 1] = child.userData.originPosition.y + 4 + Math.sin(time * 0.001 + i) * 0.5;
        }
      }
      
      child.geometry.attributes.position.needsUpdate = true;
    }
  });
}

export function getParticleSystems() {
  return particleSystems;
}

export function getLights() {
  return { interactionLight, pulseLight };
}
