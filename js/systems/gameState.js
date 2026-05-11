import * as THREE from 'three';
import { playSound } from '../audio.js';

class GameState {
  constructor() {
    this.stats = {
      decksDiscovered: 0,
      itemsCollected: 0,
      totalDistance: 0,
      playTime: 0,
      totalClicks: 0,
      score: 0
    };
    
    this.discoveredDeckIds = new Set();
    this.collectedItemIds = new Set();
    this.lastPosition = null;
    this.startTime = Date.now();
    
    this.loadState();
    console.log('✅ GameState initialized', this.stats);
  }
  
  update(currentPosition, deckAreas, textSections) {
    this.stats.playTime = Math.floor((Date.now() - this.startTime) / 1000);
    
    if (this.lastPosition) {
      const distance = currentPosition.distanceTo(this.lastPosition);
      this.stats.totalDistance = Math.round(distance * 100) / 100;
    }
    this.lastPosition = currentPosition.clone();
    
    deckAreas.forEach(deck => {
      const deckId = deck.userData.id;
      if (!this.discoveredDeckIds.has(deckId)) {
        const distance = currentPosition.distanceTo(deck.position);
        if (distance < 30) {
          this.discoverDeck(deckId);
        }
      }
    });
    
    if (this.stats.playTime % 2 === 0) {
      this.updateUI();
    }
  }
  
  discoverDeck(deckId) {
    this.discoveredDeckIds.add(deckId);
    this.stats.decksDiscovered++;
    this.stats.score += 100;
    console.log(`🎉 Deck discovered: ${deckId}! Score: ${this.stats.score}`);
    
    if (typeof playSound === 'function') {
      playSound('discover');
    }
    
    this.saveState();
  }
  
  collectItem(itemId, itemValue = 50) {
    if (this.collectedItemIds.has(itemId)) return;
    
    this.collectedItemIds.add(itemId);
    this.stats.itemsCollected++;
    this.stats.score += itemValue;
    console.log(`💎 Item collected: ${itemId}! Score: ${this.stats.score}`);
    
    if (typeof playSound === 'function') {
      playSound('collect');
    }
    
    this.saveState();
  }
  
  incrementClicks() {
    this.stats.totalClicks++;
    this.stats.score += 1;
    this.updateUI();
  }
  
  updateUI() {
    const fpsEl = document.getElementById('fps');
    const cameraDistEl = document.getElementById('camera-distance');
    const objectCountEl = document.getElementById('object-count');
    const uptimeEl = document.getElementById('interaction-time');
    const clickCountEl = document.getElementById('click-count');
    
    if (uptimeEl) uptimeEl.textContent = this.stats.playTime;
    if (clickCountEl) clickCountEl.textContent = this.stats.totalClicks;
  }
  
  getStats() {
    return { ...this.stats };
  }
  
  getDiscoveryCount() {
    return this.discoveredDeckIds.size;
  }
  
  saveState() {
    try {
      const saveData = {
        stats: this.stats,
        discoveredDeckIds: Array.from(this.discoveredDeckIds),
        collectedItemIds: Array.from(this.collectedItemIds)
      };
      localStorage.setItem('techshaman-game-state', JSON.stringify(saveData));
    } catch (e) {
      console.warn('Could not save game state:', e);
    }
  }
  
  loadState() {
    try {
      const saved = localStorage.getItem('techshaman-game-state');
      if (saved) {
        const data = JSON.parse(saved);
        this.stats = data.stats || this.stats;
        this.discoveredDeckIds = new Set(data.discoveredDeckIds || []);
        this.collectedItemIds = new Set(data.collectedItemIds || []);
        this.startTime = Date.now() - (this.stats.playTime * 1000);
        console.log('📂 Game state loaded:', this.stats);
      }
    } catch (e) {
      console.warn('Could not load game state:', e);
    }
  }
}

let gameStateInstance = null;

export function initGameState() {
  if (!gameStateInstance) {
    gameStateInstance = new GameState();
  }
  return gameStateInstance;
}

export function getGameState() {
  return gameStateInstance;
}
