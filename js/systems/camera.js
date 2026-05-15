import * as THREE from 'three';

let scene, camera, renderer;
let cameraController = {
  target: new THREE.Vector3(0, 8, 0),
  actualTarget: new THREE.Vector3(0, 8, 0),
  distance: 45,
  actualDistance: 45,
  azimuth: Math.PI / 3,
  actualAzimuth: Math.PI / 3,
  elevation: Math.PI / 6,
  actualElevation: Math.PI / 6,
  minDistance: 15,
  maxDistance: 60,
  isPanning: false,
  isOrbiting: false,
  lastMousePos: { x: 0, y: 0 },
  movementSpeed: 0.7,
  keys: {},
  boundary: 120,
  orbitSensitivity: 0.005,
  minElevation: 0.1,
  maxElevation: Math.PI / 2 - 0.1,
  followSpeed: 0.06,
  lerpFactor: 0.1,
  isFocusActive: false,
  techshamanAzimuth: Math.PI / 3,
  shakeIntensity: 0,
  bobAmount: 0,
  bobSpeed: 0
};

function updateFollowAzimuth() {
  if (cameraController.isFocusActive || cameraController.isOrbiting) return;
  const targetAzimuth = cameraController.techshamanAzimuth + Math.PI;
  const diff = Math.atan2(Math.sin(targetAzimuth - cameraController.azimuth), Math.cos(targetAzimuth - cameraController.azimuth));
  cameraController.azimuth += diff * cameraController.followSpeed;
}

let onUpdateCallback = null;

export function initCamera(threeCamera, threeRenderer, onUpdate = null) {
  camera = threeCamera;
  renderer = threeRenderer;
  onUpdateCallback = onUpdate;
  
  setupEventListeners();
  updateCameraPosition();
  startMovementLoop();
  
  console.log('✅ Camera controller initialized');
  return cameraController;
}

function setupEventListeners() {
  if (!renderer || !renderer.domElement) {
    console.warn('⚠️ Renderer not available for camera controls');
    return;
  }

  const canvas = renderer.domElement;
  
  canvas.addEventListener('wheel', onWheel, { passive: false });
  canvas.addEventListener('mousedown', onMouseDown);
  canvas.addEventListener('mouseup', onMouseUp);
  canvas.addEventListener('mousemove', onMouseMove);
  canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  
  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keyup', onKeyUp);
}

function onWheel(event) {
  event.preventDefault();
  const delta = event.deltaY * 0.01;
  cameraController.distance = Math.max(
    cameraController.minDistance,
    Math.min(cameraController.maxDistance, cameraController.distance + delta)
  );
  updateCameraPosition();
}

function onMouseDown(event) {
  // Any manual camera control cancels focus mode
  cameraController.isFocusActive = false;

  // Left-click (button 0) without shift = orbit
  if (event.button === 0 && !event.shiftKey) {
    event.preventDefault();
    event.stopPropagation();
    cameraController.isOrbiting = true;
    cameraController.lastMousePos = { x: event.clientX, y: event.clientY };
    if (renderer && renderer.domElement) {
      renderer.domElement.style.cursor = 'move';
    }
    return;
  }
  
  // Right-click or shift+left-click = pan (existing behavior)
  if (event.button === 2 || (event.button === 0 && event.shiftKey)) {
    event.preventDefault();
    event.stopPropagation();
    cameraController.isPanning = true;
    cameraController.lastMousePos = { x: event.clientX, y: event.clientY };
    if (renderer && renderer.domElement) {
      renderer.domElement.style.cursor = 'grabbing';
    }
  }
}

function onMouseUp() {
  cameraController.isPanning = false;
  cameraController.isOrbiting = false;
  if (renderer && renderer.domElement) {
    renderer.domElement.style.cursor = 'default';
  }
}

function onMouseMove(event) {
  if (cameraController.isOrbiting) {
    event.preventDefault();
    const deltaX = event.clientX - cameraController.lastMousePos.x;
    const deltaY = event.clientY - cameraController.lastMousePos.y;
    
    // Horizontal drag rotates azimuth (around Y axis)
    cameraController.azimuth -= deltaX * cameraController.orbitSensitivity;
    
    // Vertical drag rotates elevation (up/down)
    cameraController.elevation += deltaY * cameraController.orbitSensitivity;
    cameraController.elevation = Math.max(
      cameraController.minElevation,
      Math.min(cameraController.maxElevation, cameraController.elevation)
    );
    
    cameraController.lastMousePos = { x: event.clientX, y: event.clientY };
    updateCameraPosition();
    return;
  }
  
  if (cameraController.isPanning) {
    event.preventDefault();
    const deltaX = event.clientX - cameraController.lastMousePos.x;
    const deltaY = event.clientY - cameraController.lastMousePos.y;
    
    const panSpeed = cameraController.distance * 0.001;
    const newTarget = new THREE.Vector3(
      cameraController.target.x - deltaX * panSpeed * Math.cos(cameraController.azimuth),
      cameraController.target.y + deltaY * panSpeed,
      cameraController.target.z - deltaX * panSpeed * Math.sin(cameraController.azimuth)
    );
    
    applyBoundaryConstraints(newTarget);
    cameraController.target.copy(newTarget);
    cameraController.lastMousePos = { x: event.clientX, y: event.clientY };
    updateCameraPosition();
  }
}

function onKeyDown(event) {
  cameraController.keys[event.code] = true;

  switch (event.code) {
    case 'Space':
      event.preventDefault();
      cameraController.shakeIntensity = 0.5;
      if (onUpdateCallback) onUpdateCallback('space');
      break;
    case 'KeyR':
      event.preventDefault();
      resetCamera();
      if (onUpdateCallback) onUpdateCallback('reset');
      break;
    case 'KeyH':
      event.preventDefault();
      if (onUpdateCallback) onUpdateCallback('toggle-ui');
      break;
    case 'KeyF':
      event.preventDefault();
      if (onUpdateCallback) onUpdateCallback('ping');
      break;
  }
}

function onKeyUp(event) {
  cameraController.keys[event.code] = false;
}

function updateMovement() {
  const moveVector = new THREE.Vector3();
  
  if (cameraController.keys['KeyW']) moveVector.z -= 1;
  if (cameraController.keys['KeyS']) moveVector.z += 1;
  if (cameraController.keys['KeyA']) moveVector.x -= 1;
  if (cameraController.keys['KeyD']) moveVector.x += 1;
  
  const verticalMove = (cameraController.keys['KeyQ'] ? 1 : 0) + (cameraController.keys['KeyE'] ? -1 : 0);

  if (moveVector.lengthSq() > 0 || verticalMove !== 0) {
    const forward = new THREE.Vector3();
    const right = new THREE.Vector3();
    
    camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();
    
    right.crossVectors(forward, new THREE.Vector3(0, 1, 0));
    
    const movement = new THREE.Vector3();
    if (moveVector.lengthSq() > 0) {
      moveVector.normalize();
      movement.addScaledVector(forward, -moveVector.z * cameraController.movementSpeed);
      movement.addScaledVector(right, moveVector.x * cameraController.movementSpeed);
    }
    movement.y = verticalMove * cameraController.movementSpeed;
    
    // Calculate facing direction based on movement vector relative to camera
    if (moveVector.lengthSq() > 0) {
      const moveAngle = Math.atan2(moveVector.x, moveVector.z);
      // Azimuth is camera position, camera look is Azimuth + PI
      // We want to face in the direction of movement relative to camera look
      cameraController.techshamanAzimuth = cameraController.azimuth + Math.PI - moveAngle;
    }
    
    const newTarget = cameraController.target.clone().add(movement);
    applyBoundaryConstraints(newTarget);
    cameraController.target.copy(newTarget);
    updateCameraPosition();
    
    if (onUpdateCallback) onUpdateCallback('move', newTarget);
  }
}

export function triggerPing() {
  cameraController.shakeIntensity = 0.2;
}

function applyBoundaryConstraints(target) {
  target.x = Math.max(-cameraController.boundary, Math.min(cameraController.boundary, target.x));
  target.z = Math.max(-cameraController.boundary, Math.min(cameraController.boundary, target.z));
  target.y = Math.max(-20, Math.min(20, target.y));
}

export function updateCameraPosition() {
  if (!camera) return;

  const lerp = cameraController.lerpFactor;

  // Smoothly interpolate values
  cameraController.actualTarget.lerp(cameraController.target, lerp);
  cameraController.actualDistance += (cameraController.distance - cameraController.actualDistance) * lerp;

  // Azimuth wrapping
  let azDiff = cameraController.azimuth - cameraController.actualAzimuth;
  while (azDiff > Math.PI) azDiff -= Math.PI * 2;
  while (azDiff < -Math.PI) azDiff += Math.PI * 2;
  cameraController.actualAzimuth += azDiff * lerp;

  cameraController.actualElevation += (cameraController.elevation - cameraController.actualElevation) * lerp;

  updateFollowAzimuth();

  const x = cameraController.actualTarget.x + cameraController.actualDistance * Math.cos(cameraController.actualElevation) * Math.cos(cameraController.actualAzimuth);
  const y = cameraController.actualTarget.y + cameraController.actualDistance * Math.sin(cameraController.actualElevation);
  const z = cameraController.actualTarget.z + cameraController.actualDistance * Math.cos(cameraController.actualElevation) * Math.sin(cameraController.actualAzimuth);

  // Dynamic Camera Bobbing
  const time = performance.now() * 0.001;
  const isMoving = cameraController.keys['KeyW'] || cameraController.keys['KeyS'] || cameraController.keys['KeyA'] || cameraController.keys['KeyD'];

  const targetBobAmount = isMoving ? 0.15 : 0.05;
  const targetBobSpeed = isMoving ? 8.0 : 2.0;

  cameraController.bobAmount += (targetBobAmount - cameraController.bobAmount) * 0.1;
  cameraController.bobSpeed += (targetBobSpeed - cameraController.bobSpeed) * 0.1;

  const bobY = Math.sin(time * cameraController.bobSpeed) * cameraController.bobAmount;
  const bobX = Math.cos(time * cameraController.bobSpeed * 0.5) * cameraController.bobAmount * 0.5;

  // Camera Shake
  let shakeX = 0, shakeY = 0, shakeZ = 0;
  if (cameraController.shakeIntensity > 0.01) {
    shakeX = (Math.random() - 0.5) * cameraController.shakeIntensity;
    shakeY = (Math.random() - 0.5) * cameraController.shakeIntensity;
    shakeZ = (Math.random() - 0.5) * cameraController.shakeIntensity;
    cameraController.shakeIntensity *= 0.9; // Decay
  }

  camera.position.set(x + bobX + shakeX, y + bobY + shakeY, z + shakeZ);
  camera.lookAt(cameraController.actualTarget.x + shakeX, cameraController.actualTarget.y + shakeY, cameraController.actualTarget.z + shakeZ);
}

function resetCamera() {
  cameraController.target.set(0, 8, 0); // Look at TECHSHAMAN text above
  cameraController.distance = 45;
  cameraController.azimuth = Math.PI / 3;
  cameraController.isFocusActive = false;
  updateCameraPosition();
  if (onUpdateCallback) onUpdateCallback('reset');
}

function startMovementLoop() {
  function loop() {
    updateMovement();
    updateCameraPosition(); // Ensure camera updates every frame for smooth lerping
    requestAnimationFrame(loop);
  }
  loop();
}

export function getCameraController() {
  return cameraController;
}

export function getTargetPosition() {
  return cameraController.target.clone();
}

// Called by main.js to update TechShaman's facing direction
export function setTechshamanFacing(angle) {
  cameraController.techshamanAzimuth = angle;
}
