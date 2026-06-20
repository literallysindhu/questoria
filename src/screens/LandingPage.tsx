import React, { useEffect, useState } from 'react';
import { useGameState } from '../contexts/GameStateContext';
import { playClick, playHover, playMagicUnlock, playMusic } from '../utils/audio';
import foxNeutral from '../assets/fox neutral.png';
import creatorPhoto from '../assets/sindhu.jpeg';
import { X, Cpu, BookOpen } from 'lucide-react';
import { ProfileModal } from '../components/ProfileModal';
import styles from './LandingPage.module.css';

// Import all remaining game assets for preloading
import bubbleSortIcon from '../assets/bubble sort asset.png';
import chessIcon from '../assets/chess asset.png';
import knapsackIcon from '../assets/knapsack asset.png';
import mapAreaFinal from '../assets/map area final.png';
import nQueenQueen from '../assets/n queen queen.png';
import nQueensBackdrop from '../assets/n queens backdrop.png';
import heroBackground from '../assets/hero background.png';
import foxHappy from '../assets/fox happy.png';
import bubbleSortBg from '../assets/bubble  sort bg.png';
import knapsackBg from '../assets/knapsack bg.png';
import nQueenUi from '../assets/n queen ui.png';

const ASSETS_TO_PRELOAD = [
  foxNeutral,
  creatorPhoto,
  bubbleSortIcon,
  chessIcon,
  knapsackIcon,
  mapAreaFinal,
  nQueenQueen,
  nQueensBackdrop,
  heroBackground,
  foxHappy,
  bubbleSortBg,
  knapsackBg,
  nQueenUi
];

export const LandingPage: React.FC = () => {
  const { setScreen } = useGameState();

  // Loading Screen States
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [disperse, setDisperse] = useState(false);

  // Navbar Modal States
  const [activeModal, setActiveModal] = useState<'about' | 'stack' | 'profile' | null>(null);

  // Preload Assets and Track Loading Progress
  useEffect(() => {
    let loadedCount = 0;
    const totalAssets = ASSETS_TO_PRELOAD.length;

    if (totalAssets === 0) {
      setTimeout(() => {
        setProgress(100);
        setDisperse(true);
        setTimeout(() => setIsLoading(false), 1600);
      }, 0);
      return;
    }

    const onAssetLoaded = () => {
      loadedCount++;
      const currentProgress = Math.round((loadedCount / totalAssets) * 100);
      setProgress(currentProgress);

      if (loadedCount === totalAssets) {
        setTimeout(() => setDisperse(true), 400); // Wait briefly at 100%
        setTimeout(() => setIsLoading(false), 1600); // Unmount after disperse transition
      }
    };

    ASSETS_TO_PRELOAD.forEach((src) => {
      const img = new Image();
      img.onload = onAssetLoaded;
      img.onerror = onAssetLoaded; // Ensure loading screen proceeds even if an asset fails to load
      img.src = src;
    });
  }, []);

  // Play hero music when loading progress is at 85% or above
  useEffect(() => {
    if (progress >= 85) {
      playMusic('hero');
    }
  }, [progress]);

  const handleStart = () => {
    playClick();
    playMagicUnlock();
    setScreen('map');
  };

  const openModal = (modal: 'about' | 'stack' | 'profile') => {
    playClick();
    setActiveModal(modal);
  };

  const closeModal = () => {
    playClick();
    setActiveModal(null);
  };

  // Rank calculations moved to ProfileModal

  return (
    <div className={styles.container}>
      {/* 1. Loading Overlay & Dispersing Clouds */}
      {isLoading && (
        <div className={`${styles.loaderOverlay} ${disperse ? styles.fadeProgress : ''}`}>
          {/* Progress bar and text */}
          <div className={styles.progressBox}>
            <div className={styles.loaderSpinner}></div>
            <h2 className={styles.loaderTitle}>Entering Kingdom...</h2>
            <div className={styles.progressBarBg}>
              <div className={styles.progressBarFill} style={{ width: `${progress}%` }}></div>
            </div>
            <span className={styles.progressPercent}>{progress}%</span>
          </div>

          {/* Cloud Panels */}
          <div className={`${styles.cloudLeft} ${disperse ? styles.disperseLeft : ''}`}></div>
          <div className={`${styles.cloudRight} ${disperse ? styles.disperseRight : ''}`}></div>
        </div>
      )}

      {/* Top Navbar */}
      <div className={styles.navbar}>
        <button 
          className="pill-link" 
          onMouseEnter={playHover} 
          onClick={() => openModal('about')}
        >
          About
        </button>
        <button 
          className="pill-link" 
          onMouseEnter={playHover} 
          onClick={() => openModal('stack')}
        >
          Stack
        </button>
        <button 
          className="pill-link" 
          onMouseEnter={playHover} 
          onClick={() => openModal('profile')}
        >
          Profile
        </button>
      </div>

      {/* Hero Content */}
      <div className={styles.content}>
        <div className={styles.brandContainer}>
          <div className={`${styles.sparkle} ${styles.sparkle1}`}>✦</div>
          <div className={`${styles.sparkle} ${styles.sparkle2}`}>✦</div>
          <h1 className={styles.brandName}>Questoria</h1>
          <div className={`${styles.sparkle} ${styles.sparkle3}`}>✦</div>
          <div className={`${styles.sparkle} ${styles.sparkle4}`}>✦</div>
        </div>
        <h2 className={`${styles.mainTitle} fantasy-heading`}>
          Data Structures and Algorithms
        </h2>
        <p className={styles.subtitle}>in a gamified way.</p>

        {/* Mascot Card */}
        <div className={`${styles.introCard} fantasy-panel animate-fade-in`}>
          <div className={styles.mascotFrame}>
            <img src={foxNeutral} alt="Alister the Fox Guide" className={styles.mascotImg} />
          </div>
          <div className={styles.introText}>
            <p>
              Ready to dive into an adventure? Solve puzzles, unlock magical realms, and
              discover the secrets of computer science one quest at a time.
            </p>
          </div>
        </div>

        {/* Start Button */}
        <button 
          className="fantasy-button animate-pulse-gold" 
          onClick={handleStart}
          onMouseEnter={playHover}
          style={{ fontSize: '1.4rem', padding: '12px 42px' }}
        >
          Start!
        </button>
      </div>

      {/* Sparkles */}
      <div className={styles.sparkles}></div>

      {/* Modal Overlays (About, Stack) */}
      {activeModal && activeModal !== 'profile' && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          {activeModal === 'about' && (
            <div 
              className={`${styles.modalCard} parchment-panel animate-scale-in`}
              onClick={(e) => e.stopPropagation()}
            >
              <button className={styles.closeBtn} onClick={closeModal} onMouseEnter={playHover}>
                <X size={18} />
              </button>
              <h3 className={styles.modalTitle}>
                <BookOpen size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} /> 
                About The Creator
              </h3>
              <div className={styles.aboutContent}>
                <div className={styles.aboutAvatarFrame}>
                  <img src={creatorPhoto} alt="Sindhusree" className={styles.aboutAvatar} />
                </div>
                <div className={styles.aboutText}>
                  <p>
                    Hi! I'm <strong>Sindhusree</strong>, a Computer Science student who fell in love with technology 
                    after discovering HTML in school and realizing that a few lines of code could bring ideas to life.
                  </p>
                  <p>
                    I've always believed that Computer Science is more than just coding and exams. It's about curiosity, 
                    creativity, problem-solving, and building things that make people smile. That's what inspired me to create this project.
                  </p>
                  <p>
                    My goal is simple: to make learning Computer Science feel like an adventure rather than a subject. Through 
                    stories, puzzles, and games, I hope to help students discover the same excitement and wonder that first 
                    drew me into the world of technology.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeModal === 'stack' && (
            <div 
              className={`${styles.modalCard} fantasy-panel animate-scale-in`}
              onClick={(e) => e.stopPropagation()}
            >
              <button className={styles.closeBtn} onClick={closeModal} onMouseEnter={playHover}>
                <X size={18} />
              </button>
              <h3 className={styles.modalTitle} style={{ color: 'var(--color-gold)' }}>
                <Cpu size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                Alchemist's Stack
              </h3>
              <p style={{ marginBottom: '16px', fontSize: '0.95rem', opacity: 0.85 }}>
                The magical runes and spells powering this interactive educational application:
              </p>
              <div className={styles.stackGrid}>
                <div className={styles.stackItem}>
                  <strong>⚛️ Core Spell:</strong> React 19 (Component States & Hooks)
                </div>
                <div className={styles.stackItem}>
                  <strong>📘 Runes Binder:</strong> TypeScript (Type-safe compilation)
                </div>
                <div className={styles.stackItem}>
                  <strong>⚡ Furnace:</strong> Vite 8.0 (Fast Dev Server & Bundle)
                </div>
                <div className={styles.stackItem}>
                  <strong>🎨 Tapestry:</strong> Vanilla CSS Modules (Thematic overrides)
                </div>
                <div className={styles.stackItem}>
                  <strong>🛡️ Emblems:</strong> Lucide React (Clean game vectors)
                </div>
                <div className={styles.stackItem}>
                  <strong>🎵 Echoes:</strong> Web Audio API (Typewriter click sound loops)
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Shared Reusable Profile & Saves Modal */}
      <ProfileModal 
        isOpen={activeModal === 'profile'} 
        onClose={closeModal} 
      />
    </div>
  );
};
export default LandingPage;
