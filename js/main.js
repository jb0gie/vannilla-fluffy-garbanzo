import * as THREE from 'three';

import { initScene, onWindowResize, getScene, getCamera, getRenderer, getClock } from './core/scene.js';
import { initAssets, loadAllAssets, getAssets } from './systems/assets.js';
import { initGrid, animateGrid, getGridSystem } from './entities/grid.js';
import { initDecks, animateDecks, getDeckAreas } from './entities/decks.js';
import { initCamera, getCameraController, getTargetPosition } from './systems/camera.js';
import { initParticles, animateParticles, animateDeckParticles, createBurst, getLights } from './systems/particles.js';
import { initText, animateTextSections, getTextSections } from './entities/text.js';
import { initUI, debugLog, updateStats, incrementClickCount, showDeckInfo } from './systems/ui.js';
import { initAudio, playSound } from './audio.js';
import { initTutorial, getTutorialState, markDeckAsDiscovered } from './systems/tutorial.js';
import { initControlHints, showControlHint } from './systems/controlHints.js';

let scene, camera, renderer, clock;
let assets, gridSystem, deckAreas, textSections;
let cameraController, particleSystems;
let mixer, raycaster, pointer;
let animationId;

const config = {
  interactionDistance: 25,
  raycaster: { near: 0.1, far: 100 }
};

console.log('🚀 MODULE STARTING - TechShaman Portal v2.0');

document.addEventListener('DOMContentLoaded', async () => {
  try {
    debugLog('🚀 DOM CONTENT LOADED - Starting initialization...');
    debugLog('🌐 Browser: ' + navigator.userAgent);
    debugLog('📊 Screen size: ' + window.innerWidth + 'x' + window.innerHeight);
    
    await initializeCore();
    await initializeSystems();
    await initializeEntities();
    
    setupEventListeners();
    startAnimationLoop();
    
    debugLog('✅ All systems initialized successfully');
  } catch (error) {
    debugLog('❌ Initialization failed: ' + error.message);
    console.error('Initialization error:', error);
  }
});

async function initializeCore() {
  debugLog('🎬 Initializing core scene...');
  
  const core = initScene();
  scene = core.scene;
  camera = core.camera;
  renderer = core.renderer;
  clock = core.clock;
  
  initAssets(core.loadingManager);
  
  raycaster = new THREE.Raycaster();
  raycaster.near = config.raycaster.near;
  raycaster.far = config.raycaster.far;
  pointer = new THREE.Vector2();
  
  debugLog('✅ Core scene initialized');
}

async function initializeSystems() {
  debugLog('🔧 Initializing systems...');
  
  initUI();
  initCamera(camera, renderer, handleCameraUpdate);
  cameraController = getCameraController();
  
  particleSystems = initParticles(scene);
  
  initControlHints();
  initTutorial();
  
  try {
    initAudio();
    debugLog('✅ Audio system initialized');
  } catch (error) {
    debugLog('⚠️ Audio initialization failed: ' + error.message);
  }
  
  debugLog('✅ Systems initialized');
}

async function initializeEntities() {
  debugLog('🎨 Loading assets...');
  
  assets = await loadAllAssets();
  
  if (assets.textures.space) {
    scene.background = assets.textures.space;
    debugLog('✅ Space background set');
  }
  
  if (assets.meshes.moon) {
    scene.add(assets.meshes.moon);
    debugLog('✅ Moon added to scene');
  }
  
  if (assets.meshes.jeff) {
    scene.add(assets.meshes.jeff);
    debugLog('✅ Jeff cube added to scene');
  }
  
  if (assets.meshes.techshaman) {
    scene.add(assets.meshes.techshaman);
    debugLog('✅ TechShaman model added to scene');
    
    if (assets.animations && assets.animations.length > 0) {
      mixer = new THREE.AnimationMixer(assets.meshes.techshaman);
      assets.animations.forEach((clip) => {
        mixer.clipAction(clip).play();
      });
      debugLog('✅ Model animations started');
    }
  }
  
  gridSystem = initGrid(scene);
  deckAreas = initDecks(scene, assets.fonts.regular);
  textSections = initText(scene, assets.fonts.regular);
  
  debugLog('✅ Entities initialized');
}

function handleCameraUpdate(action, data) {
  switch (action) {
    case 'space':
      playSound('toggle');
      createBurst(getTargetPosition());
      break;
    case 'reset':
      playSound('reset');
      break;
    case 'move':
      if (assets.meshes.techshaman) {
        assets.meshes.techshaman.position.copy(data);
        assets.meshes.techshaman.position.y = -5;
      }
      break;
  }
}

function setupEventListeners() {
  window.addEventListener('resize', onWindowResize, false);
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('click', onClick);
  
  debugLog('✅ Event listeners setup complete');
}

function onPointerMove(event) {
  try {
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);
    
    scene.traverse((child) => {
      if (child.isMesh && child.material && !child.material.isSpriteMaterial) {
        if (Array.isArray(child.material)) {
          child.material.forEach(mat => {
            if (mat.emissive) {
              mat.emissive = new THREE.Color(0x000000);
              mat.emissiveIntensity = 0;
            }
          });
        } else {
          if (child.material.emissive) {
            child.material.emissive = new THREE.Color(0x000000);
            child.material.emissiveIntensity = 0;
          }
        }
      }
    });
    
    if (intersects.length > 0) {
      const intersection = intersects[0];
      if (intersection.object.material && !intersection.object.material.isSpriteMaterial) {
        if (Array.isArray(intersection.object.material)) {
          intersection.object.material.forEach(mat => {
            if (mat.emissive) {
              mat.emissive = new THREE.Color(0xff00ff);
              mat.emissiveIntensity = 0.5;
            }
          });
        } else {
          if (intersection.object.material.emissive) {
            intersection.object.material.emissive = new THREE.Color(0xff00ff);
            intersection.object.material.emissiveIntensity = 0.5;
          }
        }
      }
    }
  } catch (error) {
    console.error('Pointer move error:', error);
  }
}

function onClick(event) {
  try {
    if (cameraController.isPanning) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    
    playSound('click');
    incrementClickCount();
    
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);
    
    const clickPoint = new THREE.Vector3();
    raycaster.ray.at(10, clickPoint);
    createBurst(clickPoint);
    
    if (intersects.length > 0) {
      const intersection = intersects[0];
      console.log('🎯 Object clicked:', intersection.object.name || intersection.object.type);
      
      let clickedDeck = null;
      for (const deck of deckAreas) {
        if (deck === intersection.object || deck.children.includes(intersection.object)) {
          clickedDeck = deck;
          break;
        }
      }
      
      if (clickedDeck) {
        console.log('🎴 Deck clicked:', clickedDeck.userData.title);
        showDeckInfo(clickedDeck.userData);
        playSound('data');
      }
      
      const lights = getLights();
      if (lights.interactionLight) {
        lights.interactionLight.position.copy(intersection.point);
        lights.interactionLight.intensity = 2;
        
        if (typeof TWEEN !== 'undefined') {
          new TWEEN.Tween(lights.interactionLight)
            .to({ intensity: 0 }, 500)
            .easing(TWEEN.Easing.Cubic.Out)
            .start();
        }
      }
    }
  } catch (error) {
    console.error('Click error:', error);
  }
}

function startAnimationLoop() {
  function animate() {
    animationId = requestAnimationFrame(animate);
    
    try {
      const delta = clock.getDelta();
      const time = clock.getElapsedTime() * 1000;
      
      if (mixer) {
        mixer.update(delta);
      }
      
      if (typeof TWEEN !== 'undefined') {
        TWEEN.update();
      }
      
      updateStats(cameraController, scene);
      
      animateParticles(time);
      animateGrid(time);
      animateDecks(time);
      animateDeckParticles(time);
      
      const techshamanPosition = getTargetPosition();
      animateTextSections(time, techshamanPosition);
      
      renderer.render(scene, camera);
    } catch (error) {
      console.error('Animation error:', error);
      cancelAnimationFrame(animationId);
    }
  }
  
  animate();
  debugLog('🎬 Animation loop started');
}
