import heroMusic from '../assets/hero music.mp3';
import bubbleSortMusic from '../assets/bubble sort music.mp3';
import nQueensMusic from '../assets/n queens music.mp3';
import knapsackMusic from '../assets/knapsack music.mp3';

// Procedural Synthesizer using Web Audio API for fantasy game sound effects
let audioCtx: AudioContext | null = null;
let isMuted = false;

const musicTracks = {
  hero: heroMusic,
  'bubble-sort': bubbleSortMusic,
  'n-queens': nQueensMusic,
  knapsack: knapsackMusic,
};

let currentAudio: HTMLAudioElement | null = null;
let currentTrackKey: keyof typeof musicTracks | null = null;

// Handle user interaction autoplay policies
const startOnInteraction = () => {
  if (currentAudio && !isMuted && currentAudio.paused) {
    currentAudio.play().catch(e => console.warn("Interactive play failed:", e));
  }
  window.removeEventListener('click', startOnInteraction);
  window.removeEventListener('keydown', startOnInteraction);
};

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export const toggleMute = (): boolean => {
  isMuted = !isMuted;
  if (currentAudio) {
    if (isMuted) {
      currentAudio.pause();
    } else {
      currentAudio.play().catch(e => {
        console.warn("Music play failed on unmute:", e);
        window.addEventListener('click', startOnInteraction);
        window.addEventListener('keydown', startOnInteraction);
      });
    }
  }
  return isMuted;
};

export const getMuteStatus = (): boolean => {
  return isMuted;
};

export const playMusic = (key: keyof typeof musicTracks) => {
  if (currentTrackKey === key) {
    // If the music is already set but was paused due to mute or autoplay restrictions, resume it
    if (currentAudio && !isMuted && currentAudio.paused) {
      currentAudio.play().catch(e => {
        console.warn("Music resume failed:", e);
        window.addEventListener('click', startOnInteraction);
        window.addEventListener('keydown', startOnInteraction);
      });
    }
    return;
  }

  // Stop current music first
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }

  currentTrackKey = key;
  const audioPath = musicTracks[key];
  if (audioPath) {
    const audio = new Audio(audioPath);
    audio.loop = true;
    audio.volume = 0.35; // standard ambient background level
    currentAudio = audio;

    if (!isMuted) {
      audio.play().catch(e => {
        console.warn("Music autoplay blocked:", e);
        window.addEventListener('click', startOnInteraction);
        window.addEventListener('keydown', startOnInteraction);
      });
    }
  }
};

export const stopMusic = () => {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }
  currentTrackKey = null;
  // Clean up any interaction listeners
  window.removeEventListener('click', startOnInteraction);
  window.removeEventListener('keydown', startOnInteraction);
};


export const playClick = () => {
  if (isMuted) return;
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  } catch (e) {
    console.warn("Audio click failed", e);
  }
};

export const playHover = () => {
  if (isMuted) return;
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(880, ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  } catch {
    // Ignore context blocked errors
  }
};

export const playTypewriter = () => {
  if (isMuted) return;
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800 + Math.random() * 200, ctx.currentTime);

    gain.gain.setValueAtTime(0.015, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.03);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.03);
  } catch {
    // ignore
  }

};

export const playSuccess = () => {
  if (isMuted) return;
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    // Play an arpeggio: C5 -> E5 -> G5 -> C6
    const notes = [523.25, 659.25, 783.99, 1046.50]; 
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.1);
      
      gain.gain.setValueAtTime(0, now + idx * 0.1);
      gain.gain.linearRampToValueAtTime(0.08, now + idx * 0.1 + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.1 + 0.5);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(now + idx * 0.1);
      osc.stop(now + idx * 0.1 + 0.5);
    });
  } catch (e) {
    console.warn("Audio success failed", e);
  }
};

export const playMagicUnlock = () => {
  if (isMuted) return;
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    // Play a rising mystical glissando
    const duration = 0.8;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(1320, now + duration);
    
    gain.gain.setValueAtTime(0.06, now);
    gain.gain.linearRampToValueAtTime(0.08, now + duration * 0.5);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(now + duration);
  } catch {
    // ignore
  }

};

export const playError = () => {
  if (isMuted) return;
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(130, now); // Low buzz
    osc.frequency.linearRampToValueAtTime(90, now + 0.25);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.25);

    // Apply lowpass filter to make it sound buzzier and less harsh
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(400, now);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(now + 0.25);
  } catch {
    // ignore
  }

};
