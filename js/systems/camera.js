import * as THREE from 'three';

let camera, renderer;
let cameraController = {
  target: new THREE.Vector3(0, 8, 0), // Look up at TECHSHAMAN text above
  distance: 45,
  azimuth: Math.PI / 3,
  elevation: Math.PI / 6,
  minDistance: 15,
  maxDistance: 60,
  isPanning: false,
  lastMousePos: { x: 0, y: 0 },
  movementSpeed: 0.7,
  keys: {},
  boundary: 280
};

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
  if (renderer && renderer.domElement) {
    renderer.domElement.style.cursor = 'default';
  }
}

function onMouseMove(event) {
  if (!cameraController.isPanning) return;
  
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

function onKeyDown(event) {
  cameraController.keys[event.code] = true;

  switch (event.code) {
    case 'Space':
      event.preventDefault();
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
  }
}

function onKeyUp(event) {
  cameraController.keys[event.code] = false;
}

function updateMovement() {
  const moveVector = new THREE.Vector3();
  
  if (cameraController.keys['KeyW']) moveVector.z -= cameraController.movementSpeed;
  if (cameraController.keys['KeyS']) moveVector.z += cameraController.movementSpeed;
  if (cameraController.keys['KeyA']) moveVector.x -= cameraController.movementSpeed;
  if (cameraController.keys['KeyD']) moveVector.x += cameraController.movementSpeed;
  if (cameraController.keys['KeyQ']) moveVector.y += cameraController.movementSpeed;
  if (cameraController.keys['KeyE']) moveVector.y -= cameraController.movementSpeed;
  
  if (moveVector.lengthSq() > 0) {
    const forward = new THREE.Vector3();
    const right = new THREE.Vector3();
    
    camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();
    
    right.crossVectors(forward, new THREE.Vector3(0, 1, 0));
    
    const movement = new THREE.Vector3();
    movement.addScaledVector(forward, -moveVector.z);
    movement.addScaledVector(right, moveVector.x);
    movement.y = moveVector.y;
    
    const newTarget = cameraController.target.clone().add(movement);
    applyBoundaryConstraints(newTarget);
    cameraController.target.copy(newTarget);
    updateCameraPosition();
    
    if (onUpdateCallback) onUpdateCallback('move', newTarget);
  }
}

function applyBoundaryConstraints(target) {
  target.x = Math.max(-cameraController.boundary, Math.min(cameraController.boundary, target.x));
  target.z = Math.max(-cameraController.boundary, Math.min(cameraController.boundary, target.z));
  target.y = Math.max(-20, Math.min(20, target.y));
}

export function updateCameraPosition() {
  if (!camera) return;
  
  const x = cameraController.target.x + cameraController.distance * Math.cos(cameraController.elevation) * Math.cos(cameraController.azimuth);
  const y = cameraController.target.y + cameraController.distance * Math.sin(cameraController.elevation);
  const z = cameraController.target.z + cameraController.distance * Math.cos(cameraController.elevation) * Math.sin(cameraController.azimuth);
  
  camera.position.set(x, y, z);
  camera.lookAt(cameraController.target);
}

function resetCamera() {
  cameraController.target.set(0, 8, 0); // Look at TECHSHAMAN text above
  cameraController.distance = 45;
  cameraController.azimuth = Math.PI / 3;
  updateCameraPosition();
  if (onUpdateCallback) onUpdateCallback('reset');
}

function startMovementLoop() {
  function loop() {
    updateMovement();
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
