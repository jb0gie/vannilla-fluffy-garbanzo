// Three.js Scene Setup
import * as THREE from 'three';

let scene, camera, renderer;
let sunLight, ambientLight;
let controls;
let loadingManager;

// Camera positioning variables
let techshamanPosition = new THREE.Vector3(0, 0, 0);
let cameraOffset = new THREE.Vector3(0, 10, 25); // Behind and above techshaman

// Initialize scene, camera, and renderer
export function initScene() {
  // Initialize loading manager first
  loadingManager = new THREE.LoadingManager();

  // Setup loading manager handlers
  loadingManager.onProgress = function(url, itemsLoaded, itemsTotal) {
    const progress = (itemsLoaded / itemsTotal * 100).toFixed(0);
    const loaderText = document.querySelector('.loader-text');
    if (loaderText) {
      loaderText.textContent = `loading techshaman... ${progress}%`;
    }
  };

  loadingManager.onLoad = function() {
    const loaderContainer = document.querySelector('#loader-container');
    if (loaderContainer) {
      loaderContainer.style.opacity = '0';
      setTimeout(() => {
        loaderContainer.style.display = 'none';
        const canvas = document.querySelector('#bg');
        if (canvas) canvas.style.display = 'block';
        const mainElement = document.querySelector('main');
        if (mainElement) mainElement.style.display = 'block';

        const statsHud = document.querySelector('#stats-hud');
        if (statsHud) statsHud.style.display = 'block';

        // Show HTML panels with cyberpunk text content
        const leftPanel = document.querySelector('#left-panel');
        if (leftPanel) {
          leftPanel.style.display = 'block';
          leftPanel.style.animation = 'glitch 2s infinite';
        }

        const rightPanel = document.querySelector('#right-panel');
        if (rightPanel) {
          rightPanel.style.display = 'block';
          rightPanel.style.animation = 'glitch 2.5s infinite';
        }

        const topPanel = document.querySelector('#top-panel');
        if (topPanel) {
          topPanel.style.display = 'block';
          topPanel.style.animation = 'glitch 3s infinite';
        }
      }, 500);
    }
  };

  // Add error handler for missing assets
  loadingManager.onError = function(url) {
    console.warn('Asset failed to load:', url);
  };

  // Fallback timeout to ensure page loads even with stuck assets
  setTimeout(() => {
    const loaderContainer = document.querySelector('#loader-container');
    if (loaderContainer && loaderContainer.style.display !== 'none') {
      console.log('Loading timeout - forcing page to show');
      loaderContainer.style.opacity = '0';
      setTimeout(() => {
        loaderContainer.style.display = 'none';
        const canvas = document.querySelector('#bg');
        if (canvas) canvas.style.display = 'block';
        const mainElement = document.querySelector('main');
        if (mainElement) mainElement.style.display = 'block';

        const statsHud = document.querySelector('#stats-hud');
        if (statsHud) statsHud.style.display = 'block';

        // Show HTML panels with cyberpunk text content
        const leftPanel = document.querySelector('#left-panel');
        if (leftPanel) {
          leftPanel.style.display = 'block';
          leftPanel.style.animation = 'glitch 2s infinite';
        }

        const rightPanel = document.querySelector('#right-panel');
        if (rightPanel) {
          rightPanel.style.display = 'block';
          rightPanel.style.animation = 'glitch 2.5s infinite';
        }

        const topPanel = document.querySelector('#top-panel');
        if (topPanel) {
          topPanel.style.display = 'block';
          topPanel.style.animation = 'glitch 3s infinite';
        }
      }, 500);
    }
  }, 5000); // 5 second fallback

  // Initialize scene and camera
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  // Initial camera position will be set by camera controller
  camera.position.set(0, 10, 30);

  // Initialize renderer
  renderer = new THREE.WebGLRenderer({
    canvas: document.querySelector('#bg'),
    antialias: true,
    powerPreference: "high-performance"
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  // OrbitControls completely removed - using unified camera controller only
  controls = null;

  // Set initial positions
  techshamanPosition.set(0, 0, 0);

  // Setup enhanced lighting
  setupLighting();
}

// OLD updateCameraPosition removed - unified camera controller handles everything

export function setupLighting() {
  // MAJOR BRIGHT SUN LIGHT - bright overhead light
  sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
  sunLight.position.set(50, 100, 50);
  sunLight.castShadow = true;
  sunLight.shadow.mapSize.width = 2048;
  sunLight.shadow.mapSize.height = 2048;
  scene.add(sunLight);

  // Strong ambient light for overall brightness
  ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambientLight);

  // Additional fill lights from all angles
  const pointLight = new THREE.PointLight(0xffffff, 1.2);
  const pointLight2 = new THREE.PointLight(0xffffff, 1.0);
  const pointLight3 = new THREE.PointLight(0xffffff, 1.0);

  pointLight.position.set(30, 30, -30);
  pointLight2.position.set(-30, 30, 30);
  pointLight3.position.set(0, -20, 50);

  scene.add(pointLight);
  scene.add(pointLight2);
  scene.add(pointLight3);
}

// Export scene elements for use in other modules
export { scene, camera, renderer, techshamanPosition, cameraOffset, loadingManager };