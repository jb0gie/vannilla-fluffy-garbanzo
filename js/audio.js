// Audio System
let audioContext;

// Initialize audio context on first user interaction
export function initAudio() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
}

// Play enhanced cyberpunk sound effects
export function playSound(type = 'click') {
  if (!audioContext) return;

  // Create cyberpunk waveform synthesis
  const oscillator = audioContext.createOscillator();
  const oscillator2 = audioContext.createOscillator(); // For harmonics
  const gainNode = audioContext.createGain();
  const filter = audioContext.createBiquadFilter();

  // Setup filter for that classic cyberpunk sound
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(3000, audioContext.currentTime);
  filter.Q.setValueAtTime(10, audioContext.currentTime);

  oscillator.connect(filter);
  oscillator2.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(audioContext.destination);

  // Set oscillator types for classic 80s synth sounds
  oscillator.type = 'sawtooth';
  oscillator2.type = 'square';

  switch(type) {
    case 'click':
      // TRON-style electronic click
      oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(150, audioContext.currentTime + 0.2);
      oscillator2.frequency.setValueAtTime(2000, audioContext.currentTime);
      oscillator2.frequency.exponentialRampToValueAtTime(300, audioContext.currentTime + 0.15);
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

      // Filter sweep for that futuristic sound
      filter.frequency.exponentialRampToValueAtTime(8000, audioContext.currentTime + 0.05);
      filter.frequency.exponentialRampToValueAtTime(1000, audioContext.currentTime + 0.15);
      break;

    case 'hover':
      // Soft cyberpunk ambiance
      oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.1);
      oscillator2.frequency.setValueAtTime(1200, audioContext.currentTime);
      oscillator2.frequency.exponentialRampToValueAtTime(1600, audioContext.currentTime + 0.08);
      gainNode.gain.setValueAtTime(0.15, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

      // Gentle filter movement
      filter.frequency.setValueAtTime(2000, audioContext.currentTime);
      filter.frequency.exponentialRampToValueAtTime(3500, audioContext.currentTime + 0.05);
      break;

    case 'reset':
      // System reboot sound sequence
      oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
      oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.2);
      oscillator2.frequency.setValueAtTime(400, audioContext.currentTime);
      oscillator2.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.1);
      oscillator2.frequency.exponentialRampToValueAtTime(1600, audioContext.currentTime + 0.2);
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      break;

    case 'toggle':
      // Matrix-style activation sound
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(2400, audioContext.currentTime + 0.2);
      oscillator2.frequency.setValueAtTime(1600, audioContext.currentTime);
      oscillator2.frequency.exponentialRampToValueAtTime(4800, audioContext.currentTime + 0.15);
      gainNode.gain.setValueAtTime(0.25, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.25);

      // Aggressive filter resonance
      filter.Q.setValueAtTime(20, audioContext.currentTime);
      filter.frequency.exponentialRampToValueAtTime(8000, audioContext.currentTime + 0.1);
      break;

    case 'data':
      // Data stream processing sound
      oscillator.type = 'triangle';
      oscillator2.type = 'sine';
      oscillator.frequency.setValueAtTime(1200, audioContext.currentTime);
      oscillator2.frequency.setValueAtTime(2400, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);
      break;

    case 'glitch':
      // Digital glitch effect
      oscillator.type = 'sawtooth';
      oscillator2.type = 'square';
      const now = audioContext.currentTime;
      oscillator.frequency.setValueAtTime(Math.random() * 2000 + 500, now);
      oscillator.frequency.setValueAtTime(Math.random() * 2000 + 500, now + 0.01);
      oscillator.frequency.setValueAtTime(Math.random() * 2000 + 500, now + 0.02);
      gainNode.gain.setValueAtTime(0.2, now);
      gainNode.gain.setValueAtTime(0, now + 0.03);
      gainNode.gain.setValueAtTime(0.1, now + 0.04);
      gainNode.gain.setValueAtTime(0, now + 0.05);
      break;
  }

  oscillator.start(audioContext.currentTime);
  oscillator2.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.5);
  oscillator2.stop(audioContext.currentTime + 0.5);
}