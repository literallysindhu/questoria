import React, { useEffect } from 'react';
import { GameStateProvider, useGameState } from './contexts/GameStateContext';
import LandingPage from './screens/LandingPage';
import RealmSelection from './screens/RealmSelection';
import MazeGame from './screens/MazeGame';
import NQueensGame from './screens/NQueensGame';
import KnapsackGame from './screens/KnapsackGame';
import MascotGuide from './components/MascotGuide';
import FloatingAudioControl from './components/FloatingAudioControl';
import { playMusic } from './utils/audio';

const MainApp: React.FC = () => {
  const { currentScreen } = useGameState();

  useEffect(() => {
    if (currentScreen === 'map') {
      playMusic('hero');
    } else if (currentScreen === 'maze') {
      playMusic('bubble-sort');
    } else if (currentScreen === 'n-queens') {
      playMusic('n-queens');
    } else if (currentScreen === 'knapsack') {
      playMusic('knapsack');
    }
  }, [currentScreen]);

  return (
    <div style={{ position: 'relative', minHeight: '100vh', width: '100vw', overflow: 'hidden' }}>
      {currentScreen === 'landing' && <LandingPage />}
      {currentScreen === 'map' && <RealmSelection />}
      {currentScreen === 'maze' && <MazeGame />}
      {currentScreen === 'n-queens' && <NQueensGame />}
      {currentScreen === 'knapsack' && <KnapsackGame />}
      <MascotGuide />
      <FloatingAudioControl />
    </div>
  );
};

export function App() {
  return (
    <GameStateProvider>
      <MainApp />
    </GameStateProvider>
  );
}

export default App;
