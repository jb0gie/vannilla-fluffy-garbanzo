import { getGameState } from './gameState.js';

let stats = {
  fps: 60,
  frameCount: 0,
  lastTime: performance.now(),
  startTime: Date.now(),
  clickCount: 0
};

let uiElements = {};

export function initUI() {
  setupDebugConsole();
  setupStatsHUD();
  setupInfoPanels();
  
  console.log('✅ UI system initialized');
  return uiElements;
}

function setupDebugConsole() {
  const debugConsole = document.getElementById('debug-console');
  if (!debugConsole) return;
  
  uiElements.debugConsole = debugConsole;
}

function setupStatsHUD() {
  const statsHud = document.getElementById('stats-hud');
  if (!statsHud) return;
  
  uiElements.statsHud = statsHud;
  uiElements.fps = document.getElementById('fps');
  uiElements.cameraDistance = document.getElementById('camera-distance');
  uiElements.objectCount = document.getElementById('object-count');
  uiElements.interactionTime = document.getElementById('interaction-time');
  uiElements.clickCount = document.getElementById('click-count');
  uiElements.scoreCount = document.getElementById('score-count');
  uiElements.crystalCount = document.getElementById('crystal-count');
  uiElements.deckCount = document.getElementById('deck-count');
}

function setupInfoPanels() {
  uiElements.leftPanel = document.getElementById('left-panel');
  uiElements.rightPanel = document.getElementById('right-panel');
  uiElements.topPanel = document.getElementById('top-panel');
}

export function debugLog(message) {
  console.log(message);
  
  if (!uiElements.debugConsole) return;
  
  uiElements.debugConsole.style.display = 'block';
  uiElements.debugConsole.innerHTML += message + '<br>';
  uiElements.debugConsole.scrollTop = uiElements.debugConsole.scrollHeight;
}

export function updateStats(cameraController, scene) {
  stats.frameCount++;
  const now = Date.now();
  
  if (now - stats.lastTime >= 1000) {
    stats.fps = Math.round(stats.frameCount * 1000 / (now - stats.lastTime));
    stats.frameCount = 0;
    stats.lastTime = now;
    
    if (uiElements.fps) {
      uiElements.fps.textContent = stats.fps;
    }
  }
  
  if (uiElements.cameraDistance && cameraController) {
    uiElements.cameraDistance.textContent = cameraController.distance.toFixed(1);
  }
  
  if (uiElements.objectCount && scene) {
    let objectCount = 0;
    scene.traverse(() => objectCount++);
    uiElements.objectCount.textContent = objectCount;
  }
  
  if (uiElements.interactionTime) {
    const uptime = ((Date.now() - stats.startTime) / 1000).toFixed(0);
    uiElements.interactionTime.textContent = uptime;
  }
  
  if (uiElements.clickCount) {
    uiElements.clickCount.textContent = stats.clickCount;
  }
  
  // Update game state stats
  const gameState = getGameState();
  if (gameState) {
    const gameStats = gameState.getStats();
    if (uiElements.scoreCount) {
      uiElements.scoreCount.textContent = gameStats.score;
    }
    if (uiElements.crystalCount) {
      uiElements.crystalCount.textContent = `${gameStats.itemsCollected}/15`;
    }
    if (uiElements.deckCount) {
      uiElements.deckCount.textContent = `${gameStats.decksDiscovered}/6`;
    }
  }
}

export function incrementClickCount() {
  stats.clickCount++;
  
  // Also update game state
  const gameState = getGameState();
  if (gameState) {
    gameState.incrementClicks();
  }
}

export function showDeckInfo(deckData) {
  let infoPanel = document.getElementById('deck-info-panel');
  
  if (!infoPanel) {
    infoPanel = document.createElement('div');
    infoPanel.id = 'deck-info-panel';
    infoPanel.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      width: 350px;
      background: linear-gradient(135deg, rgba(0,0,0,0.95), rgba(0,255,255,0.1));
      border: 2px solid var(--neon-cyan);
      border-radius: 0px;
      padding: 25px;
      color: var(--neon-cyan);
      font-family: 'Courier New', monospace;
      font-weight: bold;
      z-index: 1000;
      backdrop-filter: blur(15px);
      box-shadow: 0 0 40px rgba(0,255,255,0.7), inset 0 0 20px rgba(0,255,255,0.2);
      transform: translateX(500px);
      transition: transform 0.3s ease-out, box-shadow 0.3s ease-out;
      text-shadow: 0 0 10px currentColor;
      clip-path: polygon(0 0, 100% 0, 100% 95%, 95% 100%, 0 100%);
    `;
    document.body.appendChild(infoPanel);
    uiElements.deckInfoPanel = infoPanel;
  }
  
  const deckColorHex = '#' + deckData.color.toString(16).padStart(6, '0');
  
  infoPanel.innerHTML = `
    <button style="position: absolute; top: 10px; right: 10px; background: transparent; border: 1px solid var(--neon-pink); color: var(--neon-pink); font-size: 20px; cursor: pointer; font-family: 'Courier New', monospace; width: 30px; height: 30px; padding: 0; text-shadow: 0 0 10px currentColor;" onclick="this.parentElement.style.transform='translateX(500px)'; this.parentElement.style.boxShadow='none'; setTimeout(() => this.parentElement.remove(), 300)">×</button>

    <div style="color: var(--tron-orange); margin-bottom: 20px; font-size: 16px; text-transform: uppercase; letter-spacing: 2px;">
      ◈ DECK ANALYSIS ◈
    </div>

    <div style="background: linear-gradient(90deg, transparent, ${deckColorHex}, transparent); height: 1px; margin: 15px 0;"></div>

    <h3 style="margin: 0 0 20px 0; color: ${deckColorHex}; font-size: 22px; text-shadow: 0 0 15px ${deckColorHex}, 0 0 25px var(--neon-pink); text-transform: uppercase; letter-spacing: 1px;">
      ${deckData.title}
    </h3>

    <div style="margin-bottom: 20px;">
      <div style="color: var(--neon-pink); font-size: 12px; margin-bottom: 5px;">[STATUS]:</div>
      <div style="color: #00ff00; font-size: 11px;">█▓▒░ SYSTEM ACTIVE ░▒▓█</div>
    </div>

    <div style="margin-bottom: 20px;">
      <div style="color: var(--neon-pink); font-size: 12px; margin-bottom: 10px;">[DATA STREAM]:</div>
      <p style="margin: 0; line-height: 1.6; font-size: 13px; color: var(--neon-cyan); white-space: pre-wrap; background: rgba(0,255,255,0.05); padding: 15px; border: 1px solid rgba(0,255,255,0.2); font-family: monospace;">${deckData.description}</p>
    </div>

    <div style="display: grid; grid-template-columns: auto 1fr; gap: 8px; font-size: 11px;">
      <span style="color: var(--neon-pink);">[ID]:</span>
      <span style="color: #ffff00;">${deckData.id.toUpperCase()}</span>

      <span style="color: var(--neon-pink);">[STATUS]:</span>
      <span style="color: #00ff00;">ONLINE</span>

      <span style="color: var(--neon-pink);">[PROTOCOL]:</span>
      <span style="color: var(--neon-green);">ACTIVE</span>
    </div>

    <div style="margin-top: 20px; padding-top: 15px; border-top: 1px dashed var(--neon-purple);">
      <div style="color: var(--tron-orange); font-size: 10px; text-align: center;">◈ END TRANSMISSION ◈</div>
    </div>
  `;

  setTimeout(() => {
    infoPanel.style.transform = 'translateX(0) skewX(-1deg)';
    infoPanel.style.boxShadow = '0 0 60px rgba(0,255,255,0.9), inset 0 0 30px rgba(0,255,255,0.3)';
  }, 100);
}

export function getStats() {
  return stats;
}

export function getUIElements() {
  return uiElements;
}
