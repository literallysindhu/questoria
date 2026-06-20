import React, { useEffect, useState } from 'react';
import { useGameState, type ActiveScreen } from '../contexts/GameStateContext';
import { playClick, playHover, playError } from '../utils/audio';
import { StarRating } from '../components/StarRating';
import { Lock, ArrowLeft, RotateCcw, Compass, FolderOpen } from 'lucide-react';
import { ProfileModal } from '../components/ProfileModal';
import mazeIcon from '../assets/maze asset.png';
import chessIcon from '../assets/chess asset.png';
import knapsackIcon from '../assets/knapsack asset.png';
import styles from './RealmSelection.module.css';

export const RealmSelection: React.FC = () => {
  const { progression, setScreen, showMascot, resetProgress } = useGameState();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  useEffect(() => {
    // Alister welcomes the student
    showMascot(
      "Welcome, adventurer! This is the Kingdom of Algorithms. Start with the Bubble Sort Challenge on the left. Once you clear it, the castle Chess Challenge will unlock!",
      'neutral'
    );
  }, []);

  const handleSelectLevel = (level: 'maze' | 'n-queens' | 'knapsack', unlocked: boolean) => {
    if (!unlocked) {
      playError();
      showMascot(
        "Patience, traveler! You must finish the previous quest to break the magic seal on this gate.",
        'neutral'
      );
      return;
    }
    
    playClick();
    setScreen(level as ActiveScreen);
  };

  const handleReset = () => {
    playClick();
    setIsResetConfirmOpen(true);
  };

  return (
    <div className={styles.container}>
      {/* Header bar */}
      <div className={styles.header}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            className="fantasy-button"
            onClick={() => { playClick(); setScreen('landing'); }}
            onMouseEnter={playHover}
            style={{ padding: '6px 16px', fontSize: '0.85rem' }}
          >
            <ArrowLeft size={16} /> Exit to Menu
          </button>
          
          <button 
            className="fantasy-button"
            onClick={() => { playClick(); setIsProfileOpen(true); }}
            onMouseEnter={playHover}
            style={{ padding: '6px 16px', fontSize: '0.85rem' }}
          >
            <FolderOpen size={16} /> Save Directory
          </button>
        </div>
        
        <button 
          className={styles.resetBtn}
          onClick={handleReset}
          onMouseEnter={playHover}
          title="Reset Wizard Progression"
        >
          <RotateCcw size={16} /> Reset Quest
        </button>
      </div>

      {/* Title */}
      <div className={styles.titleContainer}>
        <h2 className="fantasy-heading styles.title">Kingdom of Algorithms</h2>
        <p className={styles.subtitle}>Pick an Adventure to learn!</p>
      </div>

      {/* Overworld Map nodes */}
      <div className={styles.mapGrid}>
        {/* Maze Adventure */}
        <div 
          className={`${styles.node} ${styles.unlocked} animate-float`}
          onClick={() => handleSelectLevel('maze', true)}
          onMouseEnter={playHover}
        >
          <div className={styles.iconWrapper}>
            <img src={mazeIcon} alt="Bubble Sort Challenge" className={styles.icon} />
          </div>
          <h3 className={styles.nodeTitle}>Bubble Sort Challenge</h3>
          <div className={styles.starsWrapper}>
            <StarRating stars={progression.maze.stars} />
          </div>
        </div>

        {/* Chess Challenge */}
        <div 
          className={`${styles.node} ${progression.nQueens.unlocked ? styles.unlocked : styles.locked} animate-float`}
          onClick={() => handleSelectLevel('n-queens', progression.nQueens.unlocked)}
          onMouseEnter={playHover}
          style={{ animationDelay: '0.5s' }}
        >
          <div className={styles.iconWrapper}>
            <img src={chessIcon} alt="Chess Challenge" className={styles.icon} />
            {!progression.nQueens.unlocked && (
              <div className={styles.lockOverlay}>
                <Lock size={36} color="var(--color-gold)" />
              </div>
            )}
          </div>
          <h3 className={styles.nodeTitle}>Chess Challenge</h3>
          <div className={styles.starsWrapper}>
            <StarRating stars={progression.nQueens.stars} />
          </div>
        </div>

        {/* Knapsack Market */}
        <div 
          className={`${styles.node} ${progression.knapsack.unlocked ? styles.unlocked : styles.locked} animate-float`}
          onClick={() => handleSelectLevel('knapsack', progression.knapsack.unlocked)}
          onMouseEnter={playHover}
          style={{ animationDelay: '1s' }}
        >
          <div className={styles.iconWrapper}>
            <img src={knapsackIcon} alt="Knapsack Market" className={styles.icon} />
            {!progression.knapsack.unlocked && (
              <div className={styles.lockOverlay}>
                <Lock size={36} color="var(--color-gold)" />
              </div>
            )}
          </div>
          <h3 className={styles.nodeTitle}>Knapsack Market</h3>
          <div className={styles.starsWrapper}>
            <StarRating stars={progression.knapsack.stars} />
          </div>
        </div>

        {/* More to Come */}
        <div 
          className={`${styles.node} ${styles.comingSoon} animate-float`}
          onClick={() => {
            playClick();
            showMascot(
              "Our sorcerers are drawing maps for new realms! Stay tuned for dynamic programming, trees, and sorting adventures.",
              'happy'
            );
          }}
          onMouseEnter={playHover}
          style={{ animationDelay: '1.5s' }}
        >
          <div className={styles.iconWrapperComingSoon}>
            <Compass size={48} color="rgba(212, 175, 55, 0.4)" />
          </div>
          <h3 className={styles.nodeTitleComingSoon}>More to Come...</h3>
          <div className={styles.comingSoonSub}>Future Realms</div>
        </div>
      </div>

      {/* Save slots Profile Modal overlay */}
      <ProfileModal 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)} 
      />

      {/* Custom Reset Confirmation Dialogue */}
      {isResetConfirmOpen && (
        <div className={styles.customDialogOverlay}>
          <div className={`${styles.customDialogCard} parchment-panel animate-scale-in`}>
            <h4>⚠️ Reset Wizard Progress</h4>
            <p>Are you sure you want to reset your wizard progress, levels, and stars? This action cannot be undone.</p>
            <div className={styles.dialogActions}>
              <button className="fantasy-button" onClick={() => {
                playClick();
                resetProgress();
                setIsResetConfirmOpen(false);
              }} style={{ background: '#e74c3c', border: '1px solid #c0392b' }}>
                Yes, Reset
              </button>
              <button className="fantasy-button" onClick={() => {
                playClick();
                setIsResetConfirmOpen(false);
              }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default RealmSelection;
