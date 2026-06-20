import React from 'react';
import { GameStateProvider, useGameState } from './contexts/GameStateContext';
import LandingPage from './screens/LandingPage';
import RealmSelection from './screens/RealmSelection';
import MazeGame from './screens/MazeGame';
import NQueensGame from './screens/NQueensGame';
import KnapsackGame from './screens/KnapsackGame';
import MascotGuide from './components/MascotGuide';

const MainApp: React.FC = () => {
  const { currentScreen } = useGameState();

  return (
    <div style={{ position: 'relative', minHeight: '100vh', width: '100vw', overflow: 'hidden' }}>
      {currentScreen === 'landing' && <LandingPage />}
      {currentScreen === 'map' && <RealmSelection />}
      {currentScreen === 'maze' && <MazeGame />}
      {currentScreen === 'n-queens' && <NQueensGame />}
      {currentScreen === 'knapsack' && <KnapsackGame />}
      <MascotGuide />
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
