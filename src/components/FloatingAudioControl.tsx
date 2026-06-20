import React from 'react';
import { useGameState } from '../contexts/GameStateContext';
import { playClick, playHover } from '../utils/audio';
import { Volume2, VolumeX } from 'lucide-react';
import styles from './FloatingAudioControl.module.css';

export const FloatingAudioControl: React.FC = () => {
  const { isMuted, toggleMuteState } = useGameState();

  const handleToggle = () => {
    playClick();
    toggleMuteState();
  };

  return (
    <button
      className={styles.floatingBtn}
      onClick={handleToggle}
      onMouseEnter={playHover}
      title={isMuted ? "Unmute sounds and music" : "Mute sounds and music"}
      aria-label={isMuted ? "Unmute sound" : "Mute sound"}
    >
      {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
    </button>
  );
};

export default FloatingAudioControl;
