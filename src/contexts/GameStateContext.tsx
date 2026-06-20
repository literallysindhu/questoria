import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { getMuteStatus, toggleMute as toggleAudioMute } from '../utils/audio';

export type ActiveScreen = 'landing' | 'map' | 'maze' | 'n-queens' | 'knapsack';

export interface GameProgression {
  maze: { unlocked: boolean; stars: number };
  nQueens: { unlocked: boolean; stars: number };
  knapsack: { unlocked: boolean; stars: number };
}

interface MascotState {
  text: string;
  emotion: 'neutral' | 'happy';
  visible: boolean;
  onNext?: () => void;
  nextLabel?: string;
}

interface GameStateContextType {
  currentScreen: ActiveScreen;
  setScreen: (screen: ActiveScreen) => void;
  progression: GameProgression;
  completeLevel: (level: 'maze' | 'nQueens' | 'knapsack', stars: number) => void;
  resetProgress: () => void;
  loadProgression: (newProg: GameProgression) => void;
  mascot: MascotState;
  showMascot: (text: string, emotion: 'neutral' | 'happy', onNext?: () => void, nextLabel?: string) => void;
  hideMascot: () => void;
  isMuted: boolean;
  toggleMuteState: () => void;
}

const defaultProgression: GameProgression = {
  maze: { unlocked: true, stars: 0 },
  nQueens: { unlocked: false, stars: 0 },
  knapsack: { unlocked: false, stars: 0 },
};

const GameStateContext = createContext<GameStateContextType | undefined>(undefined);

export const GameStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentScreen, setCurrentScreen] = useState<ActiveScreen>('landing');
  const [isMuted, setIsMuted] = useState<boolean>(getMuteStatus());
  
  const [progression, setProgression] = useState<GameProgression>(() => {
    const saved = localStorage.getItem('gamified_cs_progression');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return defaultProgression;
      }
    }
    return defaultProgression;
  });

  const [mascot, setMascot] = useState<MascotState>({
    text: '',
    emotion: 'neutral',
    visible: false,
  });

  useEffect(() => {
    localStorage.setItem('gamified_cs_progression', JSON.stringify(progression));
  }, [progression]);

  const hideMascot = useCallback(() => {
    setMascot((prev) => ({ ...prev, visible: false }));
  }, []);

  const setScreen = useCallback((screen: ActiveScreen) => {
    setCurrentScreen(screen);
    hideMascot(); // Clean up mascot dialogue when switching screens
  }, [hideMascot]);

  const completeLevel = useCallback((level: 'maze' | 'nQueens' | 'knapsack', stars: number) => {
    setProgression((prev) => {
      const updated = { ...prev };
      if (level === 'maze') {
        updated.maze.stars = Math.max(updated.maze.stars, stars);
        updated.nQueens.unlocked = true;
      } else if (level === 'nQueens') {
        updated.nQueens.stars = Math.max(updated.nQueens.stars, stars);
        updated.knapsack.unlocked = true;
      } else if (level === 'knapsack') {
        updated.knapsack.stars = Math.max(updated.knapsack.stars, stars);
      }
      return updated;
    });
  }, []);

  const resetProgress = useCallback(() => {
    setProgression(defaultProgression);
    setCurrentScreen('landing');
  }, []);

  const loadProgression = useCallback((newProg: GameProgression) => {
    setProgression(newProg);
  }, []);

  const showMascot = useCallback((text: string, emotion: 'neutral' | 'happy', onNext?: () => void, nextLabel?: string) => {
    setMascot({
      text,
      emotion,
      visible: true,
      onNext,
      nextLabel,
    });
  }, []);

  const toggleMuteState = useCallback(() => {
    const status = toggleAudioMute();
    setIsMuted(status);
  }, []);

  const contextValue = useMemo(() => ({
    currentScreen,
    setScreen,
    progression,
    completeLevel,
    resetProgress,
    loadProgression,
    mascot,
    showMascot,
    hideMascot,
    isMuted,
    toggleMuteState,
  }), [
    currentScreen,
    setScreen,
    progression,
    completeLevel,
    resetProgress,
    loadProgression,
    mascot,
    showMascot,
    hideMascot,
    isMuted,
    toggleMuteState,
  ]);

  return (
    <GameStateContext.Provider value={contextValue}>
      {children}
    </GameStateContext.Provider>
  );
};

export const useGameState = () => {
  const context = useContext(GameStateContext);
  if (!context) {
    throw new Error('useGameState must be used within a GameStateProvider');
  }
  return context;
};
