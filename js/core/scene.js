import * as THREE from 'three';

let scene, camera, renderer, clock;
let loadingManager;
let sunLight, ambientLight;

const config = {
  camera: {
    fov: 75,
    near: 0.1,
    far: 1000,
    initialPosition: { x: 0, y: 10, z: 30 }
  },
  renderer: {
    antialias: true,
    pixelRatio: 2,
    powerPreference: 'high-performance'
  },
  lighting: {
    sun: { intensity: 1.5, position: { x: 50, y: 100, z: 50 } },
    ambient: { intensity: 0.8 },
    fill: [
      { position: { x: 30, y: 30, z: -30 }, intensity: 1.2 },
      { position: { x: -30, y: 30, z: 30 }, intensity: 1.0 },
      { position: { x: 0, y: -20, z: 50 }, intensity: 1.0 }
    ]
  }
};

export function initScene() {
  initLoadingManager();
  initThreeJS();
  initLighting();
  initClock();
  
  console.log('✅ Core scene initialized');
  return { scene, camera, renderer, clock, loadingManager };
}

function initLoadingManager() {
  loadingManager = new THREE.LoadingManager();
  
  loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
    const progress = (itemsLoaded / itemsTotal * 100).toFixed(0);
    const loaderText = document.querySelector('.loader-text');
    if (loaderText) {
      loaderText.textContent = `loading techshaman... ${progress}%`;
    }
  };

  loadingManager.onLoad = () => {
    const loaderContainer = document.querySelector('#loader-container');
    if (loaderContainer) {
      loaderContainer.style.opacity = '0';
      setTimeout(() => {
        loaderContainer.style.display = 'none';
        showUIElements();
      }, 500);
    }
  };

  loadingManager.onError = (url) => {
    console.warn('⚠️ Asset failed to load:', url);
  };

  setTimeout(() => {
    const loaderContainer = document.querySelector('#loader-container');
    if (loaderContainer && loaderContainer.style.display !== 'none') {
      console.log('⏱️ Loading timeout - forcing page to show');
      loaderContainer.style.opacity = '0';
      setTimeout(() => {
        loaderContainer.style.display = 'none';
        showUIElements();
      }, 500);
    }
  }, 5000);
}

function initThreeJS() {
  scene = new THREE.Scene();
  
  const canvas = document.querySelector('#bg');
  if (!canvas) {
    throw new Error('Canvas element #bg not found');
  }

  camera = new THREE.PerspectiveCamera(
    config.camera.fov,
    window.innerWidth / window.innerHeight,
    config.camera.near,
    config.camera.far
  );
  camera.position.set(
    0, // Start at origin X
    0, // Eye level at ground — looking up
    45 // Pull back enough to see the TECHSHAMAN text above
  );
  camera.lookAt(0, 10, 0); // Look up at center space where TECHSHAMAN floats

  renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: config.renderer.antialias,
    powerPreference: config.renderer.powerPreference
  });
  
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, config.renderer.pixelRatio));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
}

function initLighting() {
  sunLight = new THREE.DirectionalLight(0xffffff, config.lighting.sun.intensity);
  sunLight.position.set(
    config.lighting.sun.position.x,
    config.lighting.sun.position.y,
    config.lighting.sun.position.z
  );
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width = 2048;
  sunLight.shadow.mapSize.height = 2048;
  scene.add(sunLight);

  ambientLight = new THREE.AmbientLight(0xffffff, config.lighting.ambient.intensity);
  scene.add(ambientLight);

  config.lighting.fill.forEach((lightConfig, index) => {
    const light = new THREE.PointLight(0xffffff, lightConfig.intensity);
    light.position.set(
      lightConfig.position.x,
      lightConfig.position.y,
      lightConfig.position.z
    );
    scene.add(light);
  });
}

function initClock() {
  clock = new THREE.Clock();
}

function showUIElements() {
  const canvas = document.querySelector('#bg');
  if (canvas) canvas.style.display = 'block';

  // Check localStorage for UI visibility preference
  const uiVisible = localStorage.getItem('techshaman-ui-visible');
  if (uiVisible === 'false') {
    // User has hidden the interface; keep panels hidden
    return;
  }

  const elements = ['#stats-hud', '#left-panel', '#right-panel', '#top-panel'];
  elements.forEach(selector => {
    const element = document.querySelector(selector);
    if (element) {
      element.style.display = 'block';
    }
  });
}

export function onWindowResize() {
  if (!camera || !renderer) return;
  
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

export function getScene() { return scene; }
export function getCamera() { return camera; }
export function getRenderer() { return renderer; }
export function getClock() { return clock; }
export function getLoadingManager() { return loadingManager; }
export function getSunLight() { return sunLight; }
export function getAmbientLight() { return ambientLight; }
