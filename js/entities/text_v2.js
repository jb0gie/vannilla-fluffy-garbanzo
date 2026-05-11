import * as THREE from 'three';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import { playSound } from '../audio.js';

let scene, font;
let textSections = [];
let currentActiveText = null;

const textData = [
  {
    text: '✓ TEXT FIXED',
    position: { x: -60, y: 5, z: -60 },
    color: 0x00ffff,
    size: 1.0,
    content: 'Pioneer of digital consciousness evolution. Believes humanity needs cyberpunk enhancement.'
  },
  {
    text: 'NEURAL MATRIX',
    position: { x: 60, y: 5, z: -60 },
    color: 0xff00ff,
    size: 0.8,
    content: 'Status: ONLINE - Protocol: ACTIVE - Connection: ESTABLISHED - Dimension: CYBERPUNK'
  },
  {
    text: 'DATA STREAMS',
    position: { x: 0, y: 5, z: 80 },
    color: 0xff8800,
    size: 0.8,
    content: 'YE X ZU >> SYNCHRONIZED\n247420 >> DECENTRALIZED\nSCHWEPE >> CONSCIOUSNESS\nBLADES >> NATURE TECH\nACCOLADES >> BLOCKCHAIN'
  },
  {
    text: 'CONTROLS',
    position: { x: -80, y: 5, z: 40 },
    color: 0x00ff00,
    size: 0.7,
    content: 'WASD - Move Techshaman\nQ/E - Up/Down Movement\nMouse - Camera Control\nScroll - Zoom In/Out\nR-Click - Pan View'
  },
  {
    text: 'CYBERPUNK DECKS',
    position: { x: 80, y: 5, z: 40 },
    color: 0xffff00,
    size: 0.6,
    content: 'YE X ZU - Synchronized Systems\n247420 - Decentralized Network\nSCHWEPE - Consciousness Interface\nBLADES OF GRASS - Nature Tech\nACCOLADES - Blockchain Integration'
  }
];

export function initText(threeScene, loadedFont) {
  scene = threeScene;
  font = loadedFont;
  
  if (!font) {
    console.warn('⚠️ Font not loaded, creating fallback text sections');
    createFallbackTextSections();
    return textSections;
  }
  
  textData.forEach((data, index) => {
    createInteractiveText(data, index);
  });
  
  console.log(`✅ Created ${textSections.length} 3D text sections`);
  return textSections;
}

function createInteractiveText(textData, index) {
   const textGeometry = new TextGeometry(textData.text, {
     font: font,
     size: textData.size,
     height: 0.15,
     curveSegments: 8,
     bevelEnabled: false
   });

  textGeometry.computeBoundingBox();
  const textWidth = textGeometry.boundingBox.max.x - textGeometry.boundingBox.min.x;
  textGeometry.translate(-textWidth / 2, 0, 0);

  const textMaterial = new THREE.MeshPhongMaterial({
    color: textData.color,
    emissive: textData.color,
    emissiveIntensity: 0.5,
    shininess: 100,
    transparent: true,
    opacity: 0.9
  });

  const textMesh = new THREE.Mesh(textGeometry, textMaterial);
  textMesh.position.set(0, 0, 0);
  textMesh.castShadow = true;
  textMesh.receiveShadow = true;

  const textGroup = new THREE.Group();
  textGroup.position.set(textData.position.x, textData.position.y, textData.position.z);
  textGroup.add(textMesh);

  textGroup.userData = {
    isTextSection: true,
    title: textData.text,
    content: textData.content,
    color: textData.color,
    originalY: textData.position.y,
     hoverHeight: 0.5,
     isHovered: false,
     isActive: false,
     rotationSpeed: 0.001,
     floatOffset: Math.random() * Math.PI * 2,
     floatSpeed: 0.001 + Math.random() * 0.001
  };

  const pulseLight = new THREE.PointLight(textData.color, 0.5, 50);
  pulseLight.position.set(0, 10, 0);
  textGroup.add(pulseLight);

  scene.add(textGroup);
  textSections.push(textGroup);
}

function createFallbackTextSections() {
  const fallbackData = [
    { text: 'TECHSHAMAN', position: { x: -60, y: 5, z: -60 }, color: 0x00ffff },
    { text: 'NEURAL MATRIX', position: { x: 60, y: 5, z: -60 }, color: 0xff00ff },
    { text: 'DATA STREAMS', position: { x: 0, y: 5, z: 80 }, color: 0xff8800 },
    { text: 'CONTROLS', position: { x: -80, y: 5, z: 40 }, color: 0x00ff00 },
    { text: 'CYBERPUNK DECKS', position: { x: 80, y: 5, z: 40 }, color: 0xffff00 }
  ];

  fallbackData.forEach(data => {
    const geometry = new THREE.BoxGeometry(30, 10, 30);
    const material = new THREE.MeshPhongMaterial({
      color: data.color,
      emissive: data.color,
      emissiveIntensity: 0.3,
      transparent: true,
      opacity: 0.7
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(data.position.x, data.position.y, data.position.z);
    mesh.userData = {
      isTextSection: true,
      title: data.text,
      originalY: data.position.y,
      floatOffset: Math.random() * Math.PI * 2,
      floatSpeed: 0.001 + Math.random() * 0.001,
      hoverHeight: 3,
      isHovered: false,
      isActive: false,
      rotationSpeed: 0.001,
      color: data.color,
      content: ''
    };
    
    scene.add(mesh);
    textSections.push(mesh);
  });
}

export function animateTextSections(time, techshamanPosition) {
  if (!techshamanPosition) return;

  const interactionDistance = 25;

  textSections.forEach((textSection) => {
    if (!textSection.userData.isTextSection) return;

    const distance = techshamanPosition.distanceTo(textSection.position);
    const wasHovered = textSection.userData.isHovered;
    
    textSection.userData.isHovered = distance <= interactionDistance &&
                                   Math.abs(techshamanPosition.y - textSection.position.y) < 20;

    if (textSection.userData.isHovered && !wasHovered) {
      onTextSectionEnter(textSection);
    } else if (!textSection.userData.isHovered && wasHovered) {
      onTextSectionExit(textSection);
    }

     const floatY = Math.sin(time * textSection.userData.floatSpeed + textSection.userData.floatOffset) * 0.5;
     textSection.position.y = textSection.userData.originalY + floatY;

    if (textSection.userData.isHovered) {
      textSection.position.y += textSection.userData.hoverHeight;
      textSection.rotation.y += textSection.userData.rotationSpeed * 5;

      if (textSection.children[0] && textSection.children[0].material) {
        textSection.children[0].material.emissiveIntensity = 0.8;
      }
    } else {
      textSection.rotation.y += textSection.userData.rotationSpeed;

      if (textSection.children[0] && textSection.children[0].material) {
        textSection.children[0].material.emissiveIntensity = 0.5;
      }
    }
  });
}

function onTextSectionEnter(textSection) {
  console.log(`🎯 Flying over: ${textSection.userData.title}`);
  
  if (typeof playSound === 'function') {
    playSound('data');
  }
  
  showCyberpunkPanel(textSection.userData);
}

function onTextSectionExit(textSection) {
  console.log(`👋 Leaving: ${textSection.userData.title}`);
  hideCyberpunkPanel(textSection.userData);
}

function showCyberpunkPanel(textData) {
  let panelsContainer = document.getElementById('cyberpunk-panels');
  if (!panelsContainer) {
    panelsContainer = document.createElement('div');
    panelsContainer.id = 'cyberpunk-panels';
    panelsContainer.style.position = 'fixed';
    panelsContainer.style.top = '50%';
    panelsContainer.style.left = '50%';
    panelsContainer.style.transform = 'translate(-50%, -50%)';
    panelsContainer.style.zIndex = '1000';
    panelsContainer.style.pointerEvents = 'none';
    document.body.appendChild(panelsContainer);
  }

  const panel = document.createElement('div');
  panel.style.background = `linear-gradient(135deg, rgba(0,0,0,0.95), rgba(${(textData.color >> 16) & 255}, ${(textData.color >> 8) & 255}, ${textData.color & 255}, 0.1))`;
  panel.style.border = `2px solid #${textData.color.toString(16).padStart(6, '0')}`;
  panel.style.padding = '20px';
  panel.style.borderRadius = '5px';
  panel.style.color = '#ffffff';
  panel.style.fontFamily = "'Courier New', monospace";
  panel.style.boxShadow = `0 0 30px #${textData.color.toString(16).padStart(6, '0')}`;
  panel.style.maxWidth = '400px';
  panel.style.animation = 'glitch 0.3s infinite';
  panel.style.opacity = '0';
  panel.style.transition = 'opacity 0.5s ease-in-out';

  panel.innerHTML = `
    <h2 style="color: #${textData.color.toString(16).padStart(6, '0')}; font-size: 1.5rem; margin-bottom: 15px; text-shadow: 0 0 10px currentColor; text-transform: uppercase;">
      ◈ ${textData.title} ◈
    </h2>
    <div style="color: #00ffff; font-size: 0.9rem; line-height: 1.6; white-space: pre-line; background: rgba(0,255,255,0.05); padding: 10px; border-left: 3px solid #00ffff;">
      ${textData.content}
    </div>
    <div style="margin-top: 15px; color: #ff8800; font-size: 0.8rem; text-align: center; animation: pulse 1s infinite;">
      ◇ FLY AWAY TO CLOSE ◇
    </div>
  `;

  panelsContainer.innerHTML = '';
  panelsContainer.appendChild(panel);

  setTimeout(() => {
    panel.style.opacity = '1';
  }, 50);

  currentActiveText = textData;
}

function hideCyberpunkPanel(textData) {
  const panelsContainer = document.getElementById('cyberpunk-panels');
  if (panelsContainer) {
    const panel = panelsContainer.firstChild;
    if (panel) {
      panel.style.opacity = '0';
      setTimeout(() => {
        if (panelsContainer.contains(panel)) {
          panelsContainer.removeChild(panel);
        }
      }, 500);
    }
  }

  if (currentActiveText === textData) {
    currentActiveText = null;
  }
}

export function getTextSections() {
  return textSections;
}
