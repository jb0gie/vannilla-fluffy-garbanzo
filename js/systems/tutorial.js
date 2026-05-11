let tutorialState = {
  currentStep: 0,
  isActive: true,
  completedSteps: new Set(),
  discoveredDecks: new Set()
};

const tutorialSteps = [
  {
    id: 'welcome',
    title: '◈ WELCOME TO THE CYBERPUNK PORTAL ◈',
    content: 'You are the TECHSHAMAN. Fly through this digital realm to discover interconnected systems and projects.',
    position: 'center',
    highlight: null,
    action: 'none'
  },
  {
    id: 'movement',
    title: '◈ MOVEMENT CONTROLS ◈',
    content: 'Use WASD keys to move around the grid. Press Q/E to move up and down. Try moving now!',
    position: 'bottom-left',
    highlight: null,
    action: 'move'
  },
  {
    id: 'camera',
    title: '◈ CAMERA CONTROLS ◈',
    content: 'Move your mouse to look around. Scroll to zoom in/out. Right-click and drag to pan the view.',
    position: 'bottom-right',
    highlight: null,
    action: 'camera'
  },
  {
    id: 'decks',
    title: '◈ CYBERPUNK DECKS ◈',
    content: 'Fly toward the glowing holographic platforms. These are DECKS - each represents a project or system.',
    position: 'top-center',
    highlight: 'decks',
    action: 'discover'
  },
  {
    id: 'text',
    title: '◈ DATA STREAMS ◈',
    content: 'Fly over the floating 3D text to read information about the cyberpunk universe.',
    position: 'top-center',
    highlight: 'text',
    action: 'read'
  },
  {
    id: 'click',
    title: '◈ INTERACTION ◈',
    content: 'Click on deck platforms to see detailed information panels. Try clicking on any glowing platform!',
    position: 'center',
    highlight: 'clickable',
    action: 'click'
  },
  {
    id: 'complete',
    title: '◈ TRANSMISSION COMPLETE ◈',
    content: 'You now understand the basics. Explore freely and discover all 6 cyberpunk decks!',
    position: 'center',
    highlight: null,
    action: 'complete'
  }
];

export function initTutorial() {
  createTutorialOverlay();
  showTutorialStep(0);
  
  console.log('✅ Tutorial system initialized');
  return tutorialState;
}

function createTutorialOverlay() {
  const overlay = document.createElement('div');
  overlay.id = 'tutorial-overlay';
  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.85);
    z-index: 9999;
    display: flex;
    justify-content: center;
    align-items: center;
    pointer-events: auto;
  `;
  
  const content = document.createElement('div');
  content.id = 'tutorial-content';
  content.style.cssText = `
    background: linear-gradient(135deg, rgba(0,0,0,0.95), rgba(0,255,255,0.1));
    border: 3px solid var(--neon-cyan);
    border-radius: 10px;
    padding: 40px;
    max-width: 600px;
    color: var(--neon-cyan);
    font-family: 'Courier New', monospace;
    text-align: center;
    box-shadow: 0 0 50px rgba(0,255,255,0.7);
    position: relative;
  `;
  
  overlay.appendChild(content);
  document.body.appendChild(overlay);
}

function showTutorialStep(stepIndex) {
  if (stepIndex >= tutorialSteps.length) {
    completeTutorial();
    return;
  }
  
  tutorialState.currentStep = stepIndex;
  const step = tutorialSteps[stepIndex];
  const overlay = document.getElementById('tutorial-overlay');
  const content = document.getElementById('tutorial-content');
  
  content.innerHTML = `
    <div style="color: var(--tron-orange); font-size: 12px; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 2px;">
      Step ${stepIndex + 1} of ${tutorialSteps.length}
    </div>
    
    <h2 style="color: var(--neon-cyan); font-size: 24px; margin-bottom: 20px; text-shadow: 0 0 15px currentColor; text-transform: uppercase;">
      ${step.title}
    </h2>
    
    <p style="color: #ffffff; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
      ${step.content}
    </p>
    
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <button id="tutorial-prev" style="
        background: transparent;
        border: 2px solid var(--neon-purple);
        color: var(--neon-purple);
        padding: 10px 20px;
        font-family: 'Courier New', monospace;
        cursor: pointer;
        text-transform: uppercase;
        ${stepIndex === 0 ? 'opacity: 0.5; pointer-events: none;' : ''}
      ">◄ Previous</button>
      
      <div style="color: var(--neon-pink); font-size: 14px;">
        ${step.action === 'complete' ? 'Tutorial Complete!' : 'Follow the instruction above'}
      </div>
      
      <button id="tutorial-next" style="
        background: transparent;
        border: 2px solid var(--neon-cyan);
        color: var(--neon-cyan);
        padding: 10px 20px;
        font-family: 'Courier New', monospace;
        cursor: pointer;
        text-transform: uppercase;
      ">${step.action === 'complete' ? 'Start Exploring ►' : 'Next ►'}</button>
    </div>
    
    <button id="tutorial-skip" style="
      position: absolute;
      top: 10px;
      right: 10px;
      background: transparent;
      border: 1px solid var(--neon-pink);
      color: var(--neon-pink);
      padding: 5px 10px;
      font-size: 12px;
      cursor: pointer;
      font-family: 'Courier New', monospace;
    ">Skip Tutorial</button>
  `;
  
  positionTutorialContent(step.position);
  
  document.getElementById('tutorial-prev')?.addEventListener('click', () => {
    showTutorialStep(stepIndex - 1);
  });
  
  document.getElementById('tutorial-next')?.addEventListener('click', () => {
    tutorialState.completedSteps.add(step.id);
    showTutorialStep(stepIndex + 1);
  });
  
  document.getElementById('tutorial-skip')?.addEventListener('click', () => {
    completeTutorial();
  });
  
  if (step.highlight === 'decks') {
    highlightDecks();
  } else if (step.highlight === 'text') {
    highlightTextSections();
  } else if (step.highlight === 'clickable') {
    highlightClickableElements();
  }
}

function positionTutorialContent(position) {
  const content = document.getElementById('tutorial-content');
  content.style.position = 'absolute';
  content.style.transform = 'none';
  
  switch (position) {
    case 'center':
      content.style.top = '50%';
      content.style.left = '50%';
      content.style.transform = 'translate(-50%, -50%)';
      break;
    case 'bottom-left':
      content.style.bottom = '20px';
      content.style.left = '20px';
      content.style.top = 'auto';
      break;
    case 'bottom-right':
      content.style.bottom = '20px';
      content.style.right = '20px';
      content.style.top = 'auto';
      content.style.left = 'auto';
      break;
    case 'top-center':
      content.style.top = '20px';
      content.style.left = '50%';
      content.style.transform = 'translateX(-50%)';
      break;
  }
}

function highlightDecks() {
  const decks = document.querySelectorAll('[data-entity="deck"]');
  decks.forEach(deck => {
    deck.style.boxShadow = '0 0 30px var(--neon-cyan)';
  });
}

function highlightTextSections() {
  const texts = document.querySelectorAll('[data-entity="text"]');
  texts.forEach(text => {
    text.style.animation = 'pulse 1s infinite';
  });
}

function highlightClickableElements() {
  const clickables = document.querySelectorAll('[data-clickable="true"]');
  clickables.forEach(element => {
    element.style.cursor = 'pointer';
    element.style.animation = 'glitch 0.5s infinite';
  });
}

function completeTutorial() {
  tutorialState.isActive = false;
  const overlay = document.getElementById('tutorial-overlay');
  if (overlay) {
    overlay.style.opacity = '0';
    setTimeout(() => {
      overlay.remove();
    }, 500);
  }
  
  console.log('✅ Tutorial completed');
}

export function markDeckAsDiscovered(deckId) {
  tutorialState.discoveredDecks.add(deckId);
  
  if (tutorialState.discoveredDecks.size === 1 && tutorialState.isActive) {
    showTutorialStep(3);
  }
}

export function getTutorialState() {
  return tutorialState;
}

export function isTutorialComplete() {
  return !tutorialState.isActive;
}