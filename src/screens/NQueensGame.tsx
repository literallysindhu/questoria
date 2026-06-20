import React, { useState, useEffect, useCallback } from 'react';
import { useGameState } from '../contexts/GameStateContext';
import { playClick, playHover, playSuccess, playError, playTypewriter } from '../utils/audio';
import { ArrowLeft, RefreshCw, AlertCircle, Award } from 'lucide-react';
import queenTexture from '../assets/n queen queen.png';
import foxNeutral from '../assets/fox neutral.png';
import nQueenUi from '../assets/n queen ui.png';
import styles from './NQueensGame.module.css';

interface Obstacle {
  r: number;
  c: number;
}

export const NQueensGame: React.FC = () => {
  const { setScreen, completeLevel, showMascot, hideMascot } = useGameState();
  const [phase, setPhase] = useState<'intro' | 'play' | 'solved'>('intro');
  const [board, setBoard] = useState<boolean[][]>([
    [false, false, false, false],
    [false, false, false, false],
    [false, false, false, false],
    [false, false, false, false],
  ]);
  const [obstacle] = useState<Obstacle | null>(() => {
    const variantType = Math.random() > 0.5 ? 1 : 0;
    if (variantType === 1) {
      const r = Math.floor(Math.random() * 4);
      const c = Math.floor(Math.random() * 4);
      return { r, c };
    }
    return null;
  });

  const [isSolved, setIsSolved] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isStuck, setIsStuck] = useState(false);

  const [introText, setIntroText] = useState('');
  const [isIntroTyping, setIsIntroTyping] = useState(true);
  const introFullText = "Wizard, we must place 4 magical defender queens on this chessboard courtyard. But be careful: if two queens share the same row, column, or diagonal, their magical forces will clash! If you place a queen and find yourself blocked, you must remove a previous queen and try another placement—this trial-and-error search with undoing/backtracking steps is called Backtracking, a core computer science search method!";

  useEffect(() => {
    setTimeout(() => {
      setIntroText('');
      setIsIntroTyping(true);
    }, 0);

    let index = 0;
    const interval = setInterval(() => {
      if (index < introFullText.length) {
        const char = introFullText.charAt(index);
        setIntroText((prev) => prev + char);
        if (index % 3 === 0) {
          playTypewriter();
        }
        index++;
      } else {
        clearInterval(interval);
        setIsIntroTyping(false);
      }
    }, 15);
    return () => clearInterval(interval);
  }, [phase]);



  const handleBeginQuest = () => {
    playClick();
    if (isIntroTyping) {
      setIntroText(introFullText);
      setIsIntroTyping(false);
    } else {
      setPhase('play');
      if (obstacle) {
        showMascot(
          `An ancient sentry tower blocks cell [${obstacle.r + 1},${obstacle.c + 1}]. No queen can defend from there! Place 4 defender queens around it safely.`,
          'neutral'
        );
      } else {
        showMascot(
          "Place 4 magical queens on the courtyard board! Make sure they do not threaten one another's paths.",
          'neutral'
        );
      }
    }
  };

  const totalQueensPlaced = board.flat().filter(Boolean).length;

  // Check if a cell is under attack by other queens
  const checkThreat = useCallback((row: number, col: number): boolean => {
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (board[r][c] && (r !== row || c !== col)) {
          // Row or Col threat
          if (r === row || c === col) return true;
          // Diagonal threats
          if (Math.abs(r - row) === Math.abs(c - col)) return true;
        }
      }
    }
    return false;
  }, [board]);

  // Check if a cell is on the diagonal, row or col line of any placed queen (for active highlighting)
  const isLineOfSight = useCallback((row: number, col: number): boolean => {
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (board[r][c] && (r !== row || c !== col)) {
          if (r === row || c === col) return true;
          if (Math.abs(r - row) === Math.abs(c - col)) return true;
        }
      }
    }
    return false;
  }, [board]);

  // Detect stuck state that requires backtracking
  useEffect(() => {
    if (isSolved) return;
    
    const totalQueens = board.flat().filter(Boolean).length;
    let conflicts = false;
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (board[r][c] && checkThreat(r, c)) {
          conflicts = true;
        }
      }
    }
    
    let safeCount = 0;
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        const isOccupied = board[r][c];
        const isSentry = obstacle && obstacle.r === r && obstacle.c === c;
        if (!isOccupied && !isSentry && !checkThreat(r, c)) {
          safeCount++;
        }
      }
    }
    
    const stuckNow = totalQueens > 0 && totalQueens < 4 && !conflicts && safeCount === 0;
    
    if (stuckNow && !isStuck) {
      setTimeout(() => {
        setIsStuck(true);
        showMascot(
          "Oh no, wizard! All remaining squares on the courtyard board are threatened by your placed queens. You are stuck! You must backtrack—remove one of your queens to find another combination.",
          'neutral'
        );
      }, 0);
    } else if (!stuckNow && isStuck) {
      setTimeout(() => {
        setIsStuck(false);
        hideMascot();
      }, 0);
    }

  }, [board, obstacle, isSolved, isStuck, checkThreat, showMascot, hideMascot]);

  const handleCellClick = (row: number, col: number) => {
    if (isSolved) return;
    
    // Check obstacle
    if (obstacle && obstacle.r === row && obstacle.c === col) {
      playError();
      showMascot("You cannot place a queen on the sentry tower obstacle!", 'neutral');
      return;
    }

    playClick();
    setErrorMessage(null);
    setBoard((prev) => {
      const copy = prev.map((r) => [...r]);
      const isCurrentlyPlaced = copy[row][col];
      
      // Maximum 4 queens limit
      if (!isCurrentlyPlaced && totalQueensPlaced >= 4) {
        setErrorMessage("You have already placed 4 queens! Remove one first.");
        return prev;
      }
      
      copy[row][col] = !isCurrentlyPlaced;
      return copy;
    });
  };

  const checkSolution = () => {
    setAttempts((prev) => prev + 1);

    if (totalQueensPlaced < 4) {
      playError();
      setErrorMessage(`Place all 4 queens first! Currently placed: ${totalQueensPlaced}`);
      return;
    }

    // Validate if any queen is under threat
    let conflicts = false;
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (board[r][c] && checkThreat(r, c)) {
          conflicts = true;
        }
      }
    }

    if (conflicts) {
      playError();
      setErrorMessage("Magical conflict detected! Queens are threatening each other.");
      showMascot("Two or more queens are clashing! Adjust their positions. If you hit a wall, backtrack and reposition your previous queens.", 'neutral');
    } else {
      playSuccess();
      setIsSolved(true);
      
      // Calculate stars based on attempts (1 attempt = 5 stars, 2-3 = 4 stars, 4+ = 3 stars)
      const stars = attempts === 0 ? 5 : attempts <= 2 ? 4 : 3;
      completeLevel('nQueens', stars);
      
      showMascot(
        `Defenders victorious! You placed the queens safely. By trying different placements and removing conflicting ones when you hit a dead end, you used Backtracking! Computers use this exact method to search for valid combinations under rules.`,
        'happy',
        () => {
          setScreen('map');
        },
        "Proceed to Knapsack Market"
      );
    }
  };

  const resetBoard = () => {
    playClick();
    setBoard([
      [false, false, false, false],
      [false, false, false, false],
      [false, false, false, false],
      [false, false, false, false],
    ]);
    setIsSolved(false);
    setErrorMessage(null);
  };

  return (
    <div className={styles.container}>
      {phase === 'intro' && (
        <div className={styles.introOverlay}>
          <div className={`${styles.introCard} fantasy-panel`}>
            <h1 className={`${styles.introTitle} fantasy-heading`}>
              Chess Challenge
            </h1>
            <div className={styles.introPreviewFrame}>
              <img src={nQueenUi} alt="Chess Challenge Preview" className={styles.introPreviewImg} />
            </div>
            <div className={styles.introMascotSection}>
              <div className={styles.introAvatarFrame}>
                <img src={foxNeutral} alt="Alister the Fox" className={styles.introAvatar} />
              </div>
              <div className={styles.introDialogueBox}>
                <h3>Alister the Fox</h3>
                <p className={styles.introDialogueText}>
                  {introText}
                  {isIntroTyping && <span className="cursor">|</span>}
                </p>
              </div>
            </div>
            <button 
              className="fantasy-button animate-pulse-gold" 
              onClick={handleBeginQuest}
              onMouseEnter={playHover}
              style={{ marginTop: '10px' }}
            >
              {isIntroTyping ? "Skip Explanation" : "Begin Quest!"}
            </button>
          </div>
        </div>
      )}

      {/* Top Controls */}
      <div className={styles.header}>
        <button 
          className="fantasy-button"
          onClick={() => { playClick(); setScreen('map'); }}
          onMouseEnter={playHover}
          style={{ padding: '6px 16px', fontSize: '0.85rem' }}
        >
          <ArrowLeft size={16} /> Overworld Map
        </button>
        <h2 className="fantasy-heading">N-Queens Challenge</h2>
        <button 
          className="fantasy-button"
          onClick={resetBoard}
          onMouseEnter={playHover}
          style={{ padding: '6px 16px', fontSize: '0.85rem' }}
        >
          <RefreshCw size={16} /> Reset
        </button>
      </div>

      <p className={styles.description}>
        Place 4 queens so that no two queens attack each other (same row, column, or diagonal).
      </p>

      {/* Main Play Area */}
      <div className={styles.playArea}>
        {/* Left Spire (available queens slot display) */}
        <div className={`${styles.spirePanel} fantasy-panel`}>
          <h4 className={styles.spireTitle}>Available Queens</h4>
          <div className={styles.spireSlots}>
            {Array.from({ length: 4 }).map((_, idx) => {
              const available = idx >= totalQueensPlaced;
              return (
                <div key={idx} className={styles.spireSlot}>
                  {available ? (
                    <img src={queenTexture} className={`${styles.spireQueen} animate-float`} alt="Available Queen" />
                  ) : (
                    <div className={styles.spireEmpty}>Placed</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Board */}
        <div className={styles.boardWrapper}>
          <div 
            className={`${styles.boardGrid} ${isSolved ? styles.solvedGlow : ''}`}
          >
            {board.map((rowArr, rIdx) =>
              rowArr.map((cellFilled, cIdx) => {
                const isUnderThreat = cellFilled && checkThreat(rIdx, cIdx);
                const showAttackLine = !cellFilled && isLineOfSight(rIdx, cIdx);
                const isSentry = obstacle && obstacle.r === rIdx && obstacle.c === cIdx;
                const isDark = (rIdx + cIdx) % 2 === 1;

                return (
                  <div
                    key={`${rIdx}-${cIdx}`}
                    className={`${styles.cell} ${
                      isDark ? styles.cellDark : styles.cellLight
                    } ${
                      isUnderThreat ? styles.threatCell : ''
                    } ${showAttackLine ? styles.attackLineCell : ''} ${
                      isSentry ? styles.sentryCell : ''
                    }`}
                    onClick={() => handleCellClick(rIdx, cIdx)}
                  >
                    {cellFilled && (
                      <img 
                        src={queenTexture} 
                        alt="Queen" 
                        className={`${styles.queenPiece} ${isUnderThreat ? styles.shakingPiece : ''}`} 
                      />
                    )}
                    {isSentry && (
                      <div className={styles.sentryTower}>🏰</div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Error Notifications */}
      {errorMessage && (
        <div className={`${styles.errorAlert} animate-shake`}>
          <AlertCircle size={20} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Solve Verification Button */}
      {!isSolved && (
        <button 
          className="fantasy-button animate-pulse-gold"
          onClick={checkSolution}
          onMouseEnter={playHover}
          style={{ marginTop: '24px', padding: '12px 36px' }}
        >
          Check Solution
        </button>
      )}

      {isSolved && (
        <div className={styles.solvedSplash}>
          <Award size={36} color="var(--color-gold)" className="animate-float" />
          <h3>Castle Defended!</h3>
        </div>
      )}
    </div>
  );
};
export default NQueensGame;
