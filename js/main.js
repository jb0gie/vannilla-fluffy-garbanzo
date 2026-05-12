import { Raycaster, Vector2, Vector3, Color, AnimationMixer } from 'three';

import { initScene, onWindowResize, getScene, getCamera, getRenderer, getClock } from './core/scene.js';
import { initAssets, loadAllAssets, getAssets } from './systems/assets.js';
import { initGrid, animateGrid, getGridSystem } from './entities/grid.js';
import { initDecks, animateDecks, getDeckAreas, checkDeckProximity } from './entities/decks.js';
import { initCamera, getCameraController, getTargetPosition, updateCameraPosition } from './systems/camera.js';
import { initParticles, animateParticles, animateDeckParticles, createBurst, getLights } from './systems/particles.js';
import { initText, animateTextSections, getTextSections } from './entities/text.js';
import { initUI, debugLog, updateStats, incrementClickCount, showDeckInfo } from './systems/ui.js';
import { initAudio, playSound } from './audio.js';
import { initTutorial, getTutorialState, markDeckAsDiscovered } from './systems/tutorial.js';
import { initControlHints, showControlHint } from './systems/controlHints.js';
import { initPostProcessing, animatePostProcessing, getComposer, setBloomStrength } from './systems/postprocessing.js';
import { initGameState, getGameState } from './systems/gameState.js';
import { initCollectibles, animateCollectibles, collectCrystal, getAllCollectibles } from './systems/collectibles.js';

let scene, camera, renderer, clock;
let assets, gridSystem, deckAreas, textSections;
let cameraController, particleSystems;
let mixer, raycaster, pointer;
let animationId;
let composer = null;
let gameState = null;
let collectibles = [];

const config = {
  interactionDistance: 25,
  raycaster: { near: 0.1, far: 100 },
  deckFocusDistance: 20,
  focusTransitionDuration: 1500
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
  
   raycaster = new Raycaster();
   raycaster.near = config.raycaster.near;
   raycaster.far = config.raycaster.far;
   pointer = new Vector2();
  
  debugLog('✅ Core scene initialized');
}

async function initializeSystems() {
  debugLog('🔧 Initializing systems...');
  
  initUI();
  restoreUIVisibility(); // Restore UI visibility from localStorage
  initCamera(camera, renderer, handleCameraUpdate);
  cameraController = getCameraController();
   
  particleSystems = initParticles(scene);
   
  initControlHints();
  initTutorial();
  
  // Initialize game state tracking
  initGameState();
  gameState = getGameState();
  
  // Initialize collectibles
  collectibles = initCollectibles(scene);
  
  // Initialize post-processing bloom
  composer = initPostProcessing(scene, camera, renderer);
  
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
       mixer = new AnimationMixer(assets.meshes.techshaman);
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
      // Clear focus memory so new focus captures fresh state
      if (cameraController) {
        cameraController.originalTarget = null;
      }
      break;
    case 'toggle-ui':
      toggleUI();
      break;
    case 'move':
      if (assets.meshes.techshaman) {
        assets.meshes.techshaman.position.copy(data);
        assets.meshes.techshaman.position.y = -5;
      }
      break;
  }
}

// UI visibility state with persistence
let isInterfaceVisible = true;

function toggleUI() {
  isInterfaceVisible = !isInterfaceVisible;

  // Stats HUD
  const statsHud = document.getElementById('stats-hud');
  if (statsHud) statsHud.style.display = isInterfaceVisible ? 'block' : 'none';

  // Top panel
  const topPanel = document.getElementById('top-panel');
  if (topPanel) topPanel.style.display = isInterfaceVisible ? 'block' : 'none';

  // Control hints (also set opacity for visibility)
  const controlHints = document.getElementById('control-hints');
  if (controlHints) {
    controlHints.style.display = isInterfaceVisible ? 'block' : 'none';
    controlHints.style.opacity = isInterfaceVisible ? '1' : '0';
    controlHints.style.pointerEvents = isInterfaceVisible ? 'auto' : 'none';
  }

  // Cyberpunk info panels (text hover panels)
  const panelsContainer = document.getElementById('cyberpunk-panels');
  if (panelsContainer) panelsContainer.style.display = isInterfaceVisible ? 'block' : 'none';

  // Update button text
  const toggleBtn = document.getElementById('toggle-ui-btn');
  if (toggleBtn) {
    toggleBtn.textContent = isInterfaceVisible ? '[H]IDE' : '[H]SHOW';
  }

  // Save preference
  localStorage.setItem('techshaman-ui-visible', isInterfaceVisible);

  console.log(`🎛️ Interface ${isInterfaceVisible ? 'shown' : 'hidden'} (H to toggle)`);
}

// Restore UI visibility from localStorage
function restoreUIVisibility() {
  const saved = localStorage.getItem('techshaman-ui-visible');
  if (saved !== null) {
    isInterfaceVisible = saved === 'true';
    if (!isInterfaceVisible) {
      const statsHud = document.getElementById('stats-hud');
      const topPanel = document.getElementById('top-panel');
      const controlHints = document.getElementById('control-hints');
      const panelsContainer = document.getElementById('cyberpunk-panels');
      if (statsHud) statsHud.style.display = 'none';
      if (topPanel) topPanel.style.display = 'none';
      if (controlHints) {
        controlHints.style.display = 'none';
        controlHints.style.opacity = '0';
        controlHints.style.pointerEvents = 'none';
      }
      if (panelsContainer) panelsContainer.style.display = 'none';
    }
    // Update button text to match state
    const toggleBtn = document.getElementById('toggle-ui-btn');
    if (toggleBtn) {
      toggleBtn.textContent = isInterfaceVisible ? '[H]IDE' : '[H]SHOW';
    }
  }
}

// Expose globally for button click
window.toggleUI = toggleUI;

function setupEventListeners() {
  window.addEventListener('resize', onWindowResize, false);
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('click', onClick);
  
  // Additional resize handling for post-processing composer
  window.addEventListener('resize', onComposerResize, false);
  
  debugLog('✅ Event listeners setup complete');
}

function onComposerResize() {
  if (composer) {
    composer.setSize(window.innerWidth, window.innerHeight);
  }
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
              mat.emissive = new Color(0x000000);
              mat.emissiveIntensity = 0;
            }
          });
        } else {
          if (child.material.emissive) {
            child.material.emissive = new Color(0x000000);
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
              mat.emissive = new Color(0x00ffff);
              mat.emissiveIntensity = 0.5;
            }
          });
        } else {
          if (intersection.object.material.emissive) {
            intersection.object.material.emissive = new Color(0x00ffff);
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
    
    // Cancel any ongoing camera tweens to prevent stray movements
    if (typeof TWEEN !== 'undefined') {
      TWEEN.removeAll();
    }
    
    pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
    pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    raycaster.setFromCamera(pointer, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);
    
    const clickPoint = new Vector3();
    raycaster.ray.at(10, clickPoint);
    createBurst(clickPoint);
    
    if (intersects.length > 0) {
      const intersection = intersects[0];
      console.log('🎯 Object clicked:', intersection.object.name || intersection.object.type);
      
      // Check for collectible click
      let clickedCollectible = null;
      let parentObject = intersection.object;
      while (parentObject.parent && parentObject.parent !== scene) {
        if (parentObject.userData && parentObject.userData.isCollectible) {
          clickedCollectible = parentObject;
          break;
        }
        parentObject = parentObject.parent;
      }
      if (intersection.object.userData && intersection.object.userData.isCollectible) {
        clickedCollectible = intersection.object;
      }
      
      if (clickedCollectible) {
        const crystalId = collectCrystal(clickedCollectible);
        if (crystalId && gameState) {
          gameState.collectItem(crystalId, 100);
        }
        return;
      }
      
      // Check for text section click
      let clickedText = null;
      for (const textSection of textSections) {
        if (textSection === intersection.object || textSection.children.includes(intersection.object)) {
          clickedText = textSection;
          break;
        }
      }
      
      if (clickedText) {
        console.log('📝 Text clicked:', clickedText.userData.title, 'at position:', clickedText.position.x.toFixed(1), clickedText.position.y.toFixed(1), clickedText.position.z.toFixed(1));
        focusCameraOnText(clickedText);
        playSound('data');
        return;
      }
      
      let clickedDeck = null;
      for (const deck of deckAreas) {
        if (deck === intersection.object || deck.children.includes(intersection.object)) {
          clickedDeck = deck;
          break;
        }
      }
      
      if (clickedDeck) {
        console.log('🎴 Deck clicked:', clickedDeck.userData.title);
        
        // Handle single vs double click
        if (event.detail === 2) {
          teleportToDeck(clickedDeck);
          playSound('success');
        } else {
          focusCameraOnDeck(clickedDeck);
        }
        
        markDeckAsDiscovered(clickedDeck.userData.id);
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

function focusCameraOnDeck(deck) {
  const deckPos = deck.position;
  const focusDistance = config.deckFocusDistance;

  const targetPos = new Vector3(deckPos.x, deckPos.y + 2, deckPos.z);

  if (!cameraController.originalTarget) {
    cameraController.originalTarget = cameraController.target.clone();
    cameraController.originalDistance = cameraController.distance;
  }

  if (typeof TWEEN !== 'undefined') {
    TWEEN.removeAll();
  }

  // Compute azimuth from deck position for consistent framing
  const azimuth = Math.atan2(deckPos.z, deckPos.x) + Math.PI;
  const elevation = Math.PI / 6;

  if (typeof TWEEN !== 'undefined') {
    new TWEEN.Tween(cameraController.target)
      .to({ x: targetPos.x, y: targetPos.y, z: targetPos.z }, config.focusTransitionDuration)
      .easing(TWEEN.Easing.Cubic.InOut)
      .onUpdate(updateCameraPosition)
      .start();

    new TWEEN.Tween(cameraController)
      .to({ distance: focusDistance, azimuth: azimuth, elevation: elevation }, config.focusTransitionDuration)
      .easing(TWEEN.Easing.Cubic.InOut)
      .onUpdate(updateCameraPosition)
      .onComplete(() => {
        camera.lookAt(targetPos);
      })
      .start();

    triggerGlitchEffect();
  }
}

function focusCameraOnText(textSection) {
  const textPos = textSection.position;
  const focusDistance = config.deckFocusDistance * 0.75;

  const targetPos = new Vector3(textPos.x, textPos.y + 2, textPos.z);

  if (!cameraController.originalTarget) {
    cameraController.originalTarget = cameraController.target.clone();
    cameraController.originalDistance = cameraController.distance;
  }

  if (typeof TWEEN !== 'undefined') {
    TWEEN.removeAll();
  }

  // Compute azimuth so camera faces the text from outside (away from origin)
  // Direction from origin to text → camera approaches from that direction
  const dx = textPos.x;
  const dz = textPos.z;
  const azimuth = Math.atan2(dz, dx) + Math.PI;
  const elevation = Math.PI / 6;

  if (typeof TWEEN !== 'undefined') {
    new TWEEN.Tween(cameraController.target)
      .to({ x: targetPos.x, y: targetPos.y, z: targetPos.z }, config.focusTransitionDuration)
      .easing(TWEEN.Easing.Cubic.InOut)
      .onUpdate(updateCameraPosition)
      .start();

    new TWEEN.Tween(cameraController)
      .to({ distance: focusDistance, azimuth: azimuth, elevation: elevation }, config.focusTransitionDuration)
      .easing(TWEEN.Easing.Cubic.InOut)
      .onUpdate(updateCameraPosition)
      .onComplete(() => {
        camera.lookAt(targetPos);
      })
      .start();

    triggerGlitchEffect();
  }
}

function teleportToDeck(deck) {
  const deckPos = deck.position;
  
  // Clear tweens
  if (typeof TWEEN !== 'undefined') {
    TWEEN.removeAll();
  }
  
  // Instant teleport with flash effect
  if (typeof TWEEN !== 'undefined') {
    // Quick fade to white
    const flash = document.createElement('div');
    flash.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: white;
      z-index: 9999;
      pointer-events: none;
      opacity: 0;
    `;
    document.body.appendChild(flash);
    
    new TWEEN.Tween({ opacity: 0 })
      .to({ opacity: 1 }, 100)
      .onUpdate((obj) => {
        flash.style.opacity = obj.opacity;
      })
      .chain(
        new TWEEN.Tween({ opacity: 1 })
          .to({ opacity: 0 }, 300)
          .onUpdate((obj) => {
            flash.style.opacity = obj.opacity;
          })
          .onComplete(() => {
            flash.remove();
          })
      )
      .start();
  }
  
  // Teleport camera target
  cameraController.target.set(deckPos.x, deckPos.y + 2, deckPos.z);
  cameraController.distance = config.deckFocusDistance * 0.8;
  cameraController.azimuth = Math.PI / 4;
  updateCameraPosition();
  
  // Create massive particle burst at deck
  createBurst(deckPos, new Color(deck.userData.color));
  
  // Boost bloom dramatically
  if (typeof setBloomStrength === 'function') {
    setBloomStrength(3.0);
    setTimeout(() => setBloomStrength(1.5), 300);
  }
}

function triggerGlitchEffect() {
  // Temporarily distort camera or screen
  const canvas = renderer.domElement;
  const originalFilter = canvas.style.filter;
  
  if (typeof TWEEN !== 'undefined') {
    // Glitch animation using filter
    new TWEEN.Tween({ t: 0 })
      .to({ t: 1 }, 150)
      .easing(TWEEN.Easing.Linear.None)
      .onUpdate((obj) => {
        const glitchIntensity = Math.sin(obj.t * Math.PI * 6) * 5;
        canvas.style.filter = `hue-rotate(${glitchIntensity}deg) contrast(1.5) saturate(2)`;
      })
      .onComplete(() => {
        canvas.style.filter = originalFilter;
      })
      .start();
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
      checkDeckProximity(cameraController.target);
      animateDeckParticles(time);
      animateCollectibles(time, cameraController.target);
      animatePostProcessing(time);
      
      // Update game state
      if (gameState) {
        gameState.update(cameraController.target, deckAreas, textSections);
      }
      
      const techshamanPosition = getTargetPosition();
      animateTextSections(time, techshamanPosition);
      
      // Render with post-processing
      if (composer) {
        composer.render();
      } else {
        renderer.render(scene, camera);
      }
    } catch (error) {
      console.error('Animation error:', error);
      cancelAnimationFrame(animationId);
    }
  }
  
  animate();
  debugLog('🎬 Animation loop started');
}
