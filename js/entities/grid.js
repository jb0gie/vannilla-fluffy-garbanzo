import * as THREE from 'three';

let scene;
let gridSystem = {
  mainGrid: null,
  secondaryGrid: null,
  verticalGrids: [],
  boundaryWalls: [],
  lightCycleTrails: []
};

const config = {
  gridSize: 300,
  gridDivisions: 150,
  boundary: 120,
  wallHeight: 50,
  lightCycleCount: 5,
  colors: {
    main: 0x00ffff,
    secondary: 0xff9900,
    boundary: 0x00ffff
  }
};

export function initGrid(threeScene) {
  scene = threeScene;
  createMainGrid();
  createBoundaryWalls();
  createLightCycleTrails();
  
  console.log('✅ Grid system initialized');
  return gridSystem;
}

function createMainGrid() {
  const gridHelper = new THREE.GridHelper(
    config.gridSize,
    config.gridDivisions,
    config.colors.main,
    0x0088ff
  );
  
  gridHelper.material.transparent = true;
  gridHelper.material.opacity = 0.2;
  gridHelper.material.emissive = new THREE.Color(config.colors.main);
  gridHelper.material.emissiveIntensity = 0.1;
  gridHelper.material.color = new THREE.Color(config.colors.main);
  gridHelper.material.needsUpdate = true;
  
  scene.add(gridHelper);
  gridSystem.mainGrid = gridHelper;
}

function createSecondaryGrid() {
  // Removed - duplicate grid causing visual overlap
}

function createVerticalGrids() {
  const verticalGridGeometry = new THREE.PlaneGeometry(config.gridSize, 100);
  const verticalGridMaterial = new THREE.MeshBasicMaterial({
    color: config.colors.main,
    wireframe: true,
    transparent: true,
    opacity: 0.2
  });

  const positions = [
    { x: config.gridSize / 2, y: 50, z: 0, rotY: Math.PI / 2 },
    { x: -config.gridSize / 2, y: 50, z: 0, rotY: -Math.PI / 2 },
    { x: 0, y: 50, z: config.gridSize / 2, rotY: 0 },
    { x: 0, y: 50, z: -config.gridSize / 2, rotY: Math.PI }
  ];

  positions.forEach(pos => {
    const verticalGrid = new THREE.Mesh(verticalGridGeometry, verticalGridMaterial);
    verticalGrid.position.set(pos.x, pos.y, pos.z);
    verticalGrid.rotation.y = pos.rotY;
    scene.add(verticalGrid);
    gridSystem.verticalGrids.push(verticalGrid);
  });
}

function createBoundaryWalls() {
  const boundaryMaterial = new THREE.MeshBasicMaterial({
    color: config.colors.boundary,
    transparent: true,
    opacity: 0.02,
    side: THREE.DoubleSide,
    wireframe: true
  });

  const wallConfigs = [
    { x: config.boundary, y: 0, z: 0, rotY: 0 },
    { x: -config.boundary, y: 0, z: 0, rotY: 0 },
    { x: 0, y: 0, z: config.boundary, rotY: Math.PI / 2 },
    { x: 0, y: 0, z: -config.boundary, rotY: Math.PI / 2 }
  ];

  wallConfigs.forEach(wallConfig => {
    const wallGeometry = new THREE.PlaneGeometry(config.boundary * 2, config.wallHeight);
    const wall = new THREE.Mesh(wallGeometry, boundaryMaterial);
    wall.position.set(wallConfig.x, wallConfig.y + config.wallHeight / 2, wallConfig.z);
    wall.rotation.y = wallConfig.rotY;
    wall.userData.isBoundaryWall = true;
    scene.add(wall);
    gridSystem.boundaryWalls.push(wall);
  });
}

function createLightCycleTrails() {
  for (let i = 0; i < config.lightCycleCount; i++) {
    const trailGeometry = new THREE.BufferGeometry();
    const trailPositions = [];
    const trailColors = [];
    const segmentCount = 100;

    for (let j = 0; j < segmentCount; j++) {
      const t = j / segmentCount;
      const angle = t * Math.PI * 4 + i * Math.PI * 0.4;
      const radius = 300 + Math.sin(t * Math.PI * 2) * 50;

      trailPositions.push(
        Math.cos(angle) * radius,
        Math.sin(t * Math.PI * 3) * 8 + 10,
        Math.sin(angle) * radius
      );

      const color = new THREE.Color(getRandomTRONColor());
      trailColors.push(color.r, color.g, color.b);
    }

    trailGeometry.setAttribute('position', new THREE.Float32BufferAttribute(trailPositions, 3));
    trailGeometry.setAttribute('color', new THREE.Float32BufferAttribute(trailColors, 3));

    const trailMaterial = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      linewidth: 3
    });

    const trail = new THREE.Line(trailGeometry, trailMaterial);
    trail.userData.isLightCycle = true;
    trail.userData.speed = 0.001 + Math.random() * 0.002;
    trail.userData.phase = Math.random() * Math.PI * 2;

    scene.add(trail);
    gridSystem.lightCycleTrails.push(trail);
  }
}

export function animateGrid(time) {
  if (gridSystem.mainGrid && gridSystem.mainGrid.material) {
    const pulse = Math.sin(time * 0.001) * 0.3 + 0.7;
    gridSystem.mainGrid.material.emissiveIntensity = pulse * 0.3;
    gridSystem.mainGrid.material.opacity = pulse * 0.7;
  }

  gridSystem.lightCycleTrails.forEach((trail, index) => {
    if (trail.userData.isLightCycle) {
      const phaseShift = time * trail.userData.speed + trail.userData.phase;
      trail.rotation.y = phaseShift;
       trail.position.y = Math.sin(phaseShift * 2) * 0.5 + 5;

      if (trail.material) {
        trail.material.opacity = (Math.sin(phaseShift * 3) + 1) * 0.3 + 0.5;
      }
    }
  });
}

function getRandomTRONColor() {
  const colors = [0x00ffff, 0xff9900, 0xffffff, 0x00ff00];
  return colors[Math.floor(Math.random() * colors.length)];
}

export function getGridSystem() {
  return gridSystem;
}
