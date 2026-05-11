import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';

let loadingManager;
let gltfLoader, textureLoader, fontLoader;

const assets = {
  textures: {},
  models: {},
  fonts: {},
  meshes: {}
};

const config = {
  modelPath: 'models/techshaman.glb',
  texturePaths: {
    space: 'images/space.jpg',
    moon: 'images/moon.jpg',
    jeff: 'images/jeff.png'
  }
};

export function initAssets(manager) {
  loadingManager = manager;
  gltfLoader = new GLTFLoader(loadingManager);
  textureLoader = new THREE.TextureLoader(loadingManager);
  fontLoader = new FontLoader(loadingManager);
  
  console.log('✅ Asset system initialized');
}

export async function loadAllAssets() {
  console.log('🎨 Loading all assets...');
  
  try {
    await Promise.all([
      loadTextures(),
      loadModel(),
      loadFonts()
    ]);
    
    createMeshes();
    console.log('✅ All assets loaded successfully');
    return assets;
  } catch (error) {
    console.error('❌ Asset loading failed:', error);
    throw error;
  }
}

function loadTextures() {
  return new Promise((resolve, reject) => {
    let loaded = 0;
    const total = Object.keys(config.texturePaths).length;
    
    Object.entries(config.texturePaths).forEach(([name, path]) => {
      textureLoader.load(
        path,
        (texture) => {
          assets.textures[name] = texture;
          loaded++;
          console.log(`✅ Texture loaded: ${name}`);
          if (loaded === total) resolve();
        },
        undefined,
        (error) => {
          console.warn(`⚠️ Failed to load texture: ${name}`, error);
          loaded++;
          if (loaded === total) resolve();
        }
      );
    });
  });
}

function loadModel() {
  return new Promise((resolve, reject) => {
    gltfLoader.load(
      config.modelPath,
      (gltf) => {
        assets.models.techshaman = gltf;
        console.log('✅ 3D model loaded');
        resolve();
      },
      (xhr) => {
        const progress = (xhr.loaded / xhr.total * 100).toFixed(0);
        console.log(`📊 Model loading: ${progress}%`);
      },
      (error) => {
        console.warn('⚠️ Failed to load 3D model:', error);
        resolve();
      }
    );
  });
}

function loadFonts() {
  return new Promise((resolve, reject) => {
    const fontUrl = 'fonts/helvetiker_regular.typeface.json';
    
    fontLoader.load(
      fontUrl,
      (font) => {
        assets.fonts.regular = font;
        assets.fonts.bold = font; // Same font for both
        console.log('Font loaded from local');
        resolve();
      },
      undefined,
      (error) => {
        console.warn('Failed to load font:', error);
        resolve();
      }
    );
  });
}

function createMeshes() {
  if (assets.textures.space) {
    assets.meshes.spaceBackground = assets.textures.space;
  }
  
  if (assets.textures.moon) {
    const moonGeometry = new THREE.SphereGeometry(10, 32, 32);
    const moonMaterial = new THREE.MeshPhongMaterial({
      map: assets.textures.moon,
      emissive: 0x222244,
      emissiveIntensity: 0.2
    });
    assets.meshes.moon = new THREE.Mesh(moonGeometry, moonMaterial);
    assets.meshes.moon.position.set(-10, 0, 30);
  }
  
  if (assets.textures.jeff) {
    const jeffGeometry = new THREE.BoxGeometry(10, 10, 10);
    const jeffMaterial = new THREE.MeshBasicMaterial({
      map: assets.textures.jeff,
      side: THREE.BackSide
    });
    assets.meshes.jeff = new THREE.Mesh(jeffGeometry, jeffMaterial);
    assets.meshes.jeff.position.set(0, 0, 0);
  }
  
  if (assets.models.techshaman) {
    const model = assets.models.techshaman.scene;
    
    const box = new THREE.Box3().setFromObject(model);
    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    
    const maxSize = Math.max(size.x, size.y, size.z);
    const scaleFactor = 10 / maxSize;
    
    model.scale.setScalar(scaleFactor);
    model.position.sub(center.multiplyScalar(scaleFactor));
    model.position.set(0, -5, 0);
    model.rotation.y = Math.PI;
    
    model.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    
    assets.meshes.techshaman = model;
    assets.animations = assets.models.techshaman.animations;
  }
}

export function getAssets() {
  return assets;
}

export function getLoaders() {
  return { gltfLoader, textureLoader, fontLoader };
}
