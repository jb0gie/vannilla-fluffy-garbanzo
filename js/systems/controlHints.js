export function initControlHints() {
  createControlHintsOverlay();
  console.log('✅ Control hints initialized');
}

function createControlHintsOverlay() {
  const hintsContainer = document.createElement('div');
  hintsContainer.id = 'control-hints';
  hintsContainer.style.cssText = `
    position: fixed;
    bottom: 70px; /* above the button */
    right: 20px; /* align to right side */
    background: linear-gradient(135deg, rgba(0,0,0,0.9), rgba(0,255,255,0.1));
    border: 2px solid var(--neon-cyan);
    border-radius: 8px;
    padding: 15px;
    color: var(--neon-cyan);
    font-family: 'Courier New', monospace;
    font-size: 12px;
    z-index: 1000;
    backdrop-filter: blur(10px);
    box-shadow: 0 0 20px rgba(0,255,255,0.3);
    max-width: 300px;
    transition: all 0.3s ease;
    opacity: 0;
    pointer-events: none;
  `;

  hintsContainer.innerHTML = `
    <div style="color: var(--tron-orange); font-size: 14px; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 1px;">
      ◈ CONTROLS MATRIX ◈
    </div>
    
    <div style="display: grid; grid-template-columns: auto 1fr; gap: 8px; font-size: 11px;">
      <div style="color: var(--neon-pink); display: flex; align-items: center; gap: 5px;">
        <span style="background: rgba(0,255,255,0.2); padding: 2px 6px; border-radius: 3px; font-weight: bold;">WASD</span>
      </div>
      <div style="color: var(--neon-cyan);">Move Techshaman</div>
      
      <div style="color: var(--neon-pink); display: flex; align-items: center; gap: 5px;">
        <span style="background: rgba(0,255,255,0.2); padding: 2px 6px; border-radius: 3px; font-weight: bold;">Q/E</span>
      </div>
      <div style="color: var(--neon-cyan);">Up / Down</div>
      
      <div style="color: var(--neon-pink); display: flex; align-items: center; gap: 5px;">
        <span style="background: rgba(0,255,255,0.2); padding: 2px 6px; border-radius: 3px; font-weight: bold;">MOUSE</span>
      </div>
      <div style="color: var(--neon-cyan);">Look Around</div>
      
      <div style="color: var(--neon-pink); display: flex; align-items: center; gap: 5px;">
        <span style="background: rgba(0,255,255,0.2); padding: 2px 6px; border-radius: 3px; font-weight: bold;">SCROLL</span>
      </div>
      <div style="color: var(--neon-cyan);">Zoom In / Out</div>
      
      <div style="color: var(--neon-pink); display: flex; align-items: center; gap: 5px;">
        <span style="background: rgba(0,255,255,0.2); padding: 2px 6px; border-radius: 3px; font-weight: bold;">R-CLICK</span>
      </div>
      <div style="color: var(--neon-cyan);">Pan View</div>
      
      <div style="color: var(--neon-pink); display: flex; align-items: center; gap: 5px;">
        <span style="background: rgba(0,255,255,0.2); padding: 2px 6px; border-radius: 3px; font-weight: bold;">CLICK</span>
      </div>
      <div style="color: var(--neon-cyan);">Interact / Select</div>
      
      <div style="color: var(--neon-pink); display: flex; align-items: center; gap: 5px;">
        <span style="background: rgba(0,255,255,0.2); padding: 2px 6px; border-radius: 3px; font-weight: bold;">SPACE</span>
      </div>
      <div style="color: var(--neon-cyan);">Particle Burst</div>
      
      <div style="color: var(--neon-pink); display: flex; align-items: center; gap: 5px;">
        <span style="background: rgba(0,255,255,0.2); padding: 2px 6px; border-radius: 3px; font-weight: bold;">R</span>
      </div>
      <div style="color: var(--neon-cyan);">Reset Camera</div>
    </div>
    
    <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid var(--neon-purple); color: var(--tron-orange); font-size: 10px; text-align: center;">
      ◈ FLY OVER TEXT & DECKS TO INTERACT ◈
    </div>
  `;

  document.body.appendChild(hintsContainer);
  
   let isVisible = false; // hidden by default
   const toggleButton = createToggleButton();
   
   function createToggleButton() {
     const button = document.createElement('button');
     button.id = 'toggle-hints';
     button.innerHTML = '◈ CONTROLS';
     button.style.cssText = `
       position: fixed;
       bottom: 20px;
       right: 20px;
       background: linear-gradient(135deg, var(--neon-cyan), var(--neon-pink));
       border: none;
       color: black;
       padding: 12px 16px;
       border-radius: 25px;
       font-family: 'Courier New', monospace;
       font-size: 12px;
       font-weight: bold;
       cursor: pointer;
       z-index: 1001;
       box-shadow: 0 0 15px rgba(0,255,255,0.5);
       transition: all 0.3s ease;
     `;
    
    button.addEventListener('click', () => {
      isVisible = !isVisible;
      hintsContainer.style.opacity = isVisible ? '1' : '0';
      hintsContainer.style.pointerEvents = isVisible ? 'auto' : 'none';
      button.style.transform = isVisible ? 'rotate(0deg)' : 'rotate(180deg)';
    });
    
    document.body.appendChild(button);
    return button;
  }
}

export function showControlHint(action, duration = 2000) {
  const hintsContainer = document.getElementById('control-hints');
  if (!hintsContainer) return;
  
  const hintMap = {
    'move': 'Use WASD to move around the grid',
    'fly': 'Press Q/E to fly up and down',
    'camera': 'Move mouse to rotate camera view',
    'zoom': 'Scroll to zoom in and out',
    'pan': 'Right-click and drag to pan',
    'click': 'Click on glowing platforms',
    'space': 'Press SPACE for particle burst',
    'reset': 'Press R to reset camera'
  };
  
  const existingHint = hintsContainer.querySelector('.temp-hint');
  if (existingHint) {
    existingHint.remove();
  }
  
  const hint = document.createElement('div');
  hint.className = 'temp-hint';
  hint.textContent = hintMap[action] || action;
  hint.style.cssText = `
    position: absolute;
    top: -40px;
    left: 50%;
    transform: translateX(-50%);
    background: var(--neon-cyan);
    color: black;
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: bold;
    white-space: nowrap;
    pointer-events: none;
    animation: fadeInOut ${duration}ms ease-in-out;
  `;
  
  hintsContainer.appendChild(hint);
  
  setTimeout(() => {
    if (hint.parentNode) {
      hint.remove();
    }
  }, duration);
}