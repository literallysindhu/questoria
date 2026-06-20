import React, { useState, useEffect } from 'react';
import { useGameState } from '../contexts/GameStateContext';
import { playTypewriter, playClick, playHover } from '../utils/audio';
import { Volume2, VolumeX } from 'lucide-react';
import foxNeutral from '../assets/fox neutral.png';
import foxHappy from '../assets/fox happy.png';
import styles from './MascotGuide.module.css';

export const MascotGuide: React.FC = () => {
  const { mascot, hideMascot, isMuted, toggleMuteState } = useGameState();
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!mascot.visible) {
      setDisplayedText('');
      return;
    }

    setDisplayedText('');
    setIsTyping(true);
    let index = 0;
    const fullText = mascot.text;
    
    // Quick typing interval
    const interval = setInterval(() => {
      if (index < fullText.length) {
        const char = fullText.charAt(index);
        setDisplayedText((prev) => prev + char);
        // Play typewriter click
        if (index % 2 === 0) {
          playTypewriter();
        }
        index++;
      } else {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 25); // Speed of typing in ms

    return () => clearInterval(interval);
  }, [mascot.text, mascot.visible]);

  if (!mascot.visible) return null;

  const handleNext = () => {
    playClick();
    if (isTyping) {
      // Skip typing
      setDisplayedText(mascot.text);
      setIsTyping(false);
    } else {
      if (mascot.onNext) {
        mascot.onNext();
      } else {
        hideMascot();
      }
    }
  };

  return (
    <div className={`${styles.overlay} animate-fade-in`}>
      <div className={styles.container}>
        <div className={styles.mascotWrapper}>
          <div className={styles.avatarFrame}>
            <img 
              src={mascot.emotion === 'happy' ? foxHappy : foxNeutral} 
              alt="Fox Mascot Guide" 
              className={styles.avatar} 
            />
          </div>
        </div>
        
        <div className={styles.dialogueBox}>
          <button 
            className={styles.muteBtn} 
            onClick={() => { playClick(); toggleMuteState(); }}
            onMouseEnter={playHover}
            title={isMuted ? "Unmute sounds" : "Mute sounds"}
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          
          <h3 className={styles.mascotTitle}>Alister the Fox</h3>
          <p className={styles.dialogueText}>
            {displayedText}
            {isTyping && <span className={styles.cursor}>|</span>}
          </p>
          
          <div className={styles.controls}>
            <button 
              className="fantasy-button"
              onClick={handleNext}
              onMouseEnter={playHover}
              style={{ padding: '6px 18px', fontSize: '0.9rem' }}
            >
              {isTyping ? "Skip" : (mascot.nextLabel || "Continue")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default MascotGuide;
