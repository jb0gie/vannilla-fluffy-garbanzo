import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

let composer = null;
let bloomPass = null;
let scene, camera, renderer;

export function initPostProcessing(threeScene, threeCamera, threeRenderer) {
  scene = threeScene;
  camera = threeCamera;
  renderer = threeRenderer;

  // Create effect composer
  composer = new EffectComposer(renderer);

  // Add render pass
  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);

  // Add bloom pass — extremely subtle, barely perceptible
  bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.2, // strength — minimal glow
    1.8, // radius — very soft spread
    0.8  // threshold — only the brightest neon emissive materials
  );
  composer.addPass(bloomPass);

  console.log('✅ Post-processing bloom initialized');
  return composer;
}

export function animatePostProcessing(time) {
  if (bloomPass) {
    // Static — no pulse to keep it calm
    bloomPass.strength = 0.2;
  }
}

export function setBloomEnabled(enabled) {
  if (bloomPass) {
    bloomPass.enabled = enabled;
  }
}

export function getComposer() {
  return composer;
}

export function setBloomStrength(strength) {
  if (bloomPass) {
    bloomPass.strength = strength;
  }
}

export function setBloomRadius(radius) {
  if (bloomPass) {
    bloomPass.radius = radius;
  }
}

export function setBloomThreshold(threshold) {
  if (bloomPass) {
    bloomPass.threshold = threshold;
  }
}
