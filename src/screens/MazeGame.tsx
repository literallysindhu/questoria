import React, { useState, useEffect, useCallback } from 'react';
import { useGameState } from '../contexts/GameStateContext';
import { playClick, playHover, playSuccess, playError, playTypewriter } from '../utils/audio';
import { ArrowLeft, RefreshCw, Award } from 'lucide-react';
import foxNeutral from '../assets/fox neutral.png';
import bubbleSortAsset from '../assets/bubble sort asset.png';
import styles from './MazeGame.module.css';

export const MazeGame: React.FC = () => {
  const { setScreen, completeLevel, showMascot } = useGameState();

  // Game Phase
  const [phase, setPhase] = useState<'intro' | 'sort' | 'solved'>('intro');

  // Bubble Sort Lock State
  const [sortArray, setSortArray] = useState<number[]>([]);
  const [compareIdx, setCompareIdx] = useState(0);
  const [swapsInPass, setSwapsInPass] = useState(0);
  const [totalSwaps, setTotalSwaps] = useState(0);
  const [passCount, setPassCount] = useState(1);
  const [isSorted, setIsSorted] = useState(false);
  const [activeComparing, setActiveComparing] = useState<number[]>([]);

  // Intro typewriter states
  const [introText, setIntroText] = useState('');
  const [isIntroTyping, setIsIntroTyping] = useState(true);
  const introFullText = "Greetings, wizard! The magical gate to the next realm is locked by a Bubble Rune Seal. To open it, we must sort the runes in ascending order (smallest to largest). The rules of the ancient seal state we can only swap adjacent runes. By comparing neighboring numbers and swapping them, we will perform a Bubble Sort algorithm!";

  useEffect(() => {
    if (phase !== 'intro') return;
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

  // Generate Bubble Sort Array
  const setupBubbleSort = useCallback(() => {
    // Generate 5 random unique numbers
    const set = new Set<number>();
    while (set.size < 5) {
      set.add(Math.floor(Math.random() * 45) + 5);
    }
    const arr = Array.from(set);
    setSortArray(arr);
    setCompareIdx(0);
    setSwapsInPass(0);
    setTotalSwaps(0);
    setPassCount(1);
    setIsSorted(false);
    setActiveComparing([0, 1]);
    setPhase('sort');
    showMascot(
      "The exit gate is locked by the Bubble Rune Seal. To open it, sort the runes in ascending order (small to large). Remember: we can only swap adjacent runes! Let's examine the first two runes.",
      'neutral'
    );
  }, [showMascot]);

  const handleBeginQuest = () => {
    playClick();
    if (isIntroTyping) {
      setIntroText(introFullText);
      setIsIntroTyping(false);
    } else {
      setupBubbleSort();
    }
  };

  // check if whole array is sorted
  const checkArraySorted = (arr: number[]): boolean => {
    for (let i = 0; i < arr.length - 1; i++) {
      if (arr[i] > arr[i + 1]) return false;
    }
    return true;
  };

  // Bubble Sort controls
  const handleCompare = () => {
    playClick();
    const a = sortArray[compareIdx];
    const b = sortArray[compareIdx + 1];

    if (a > b) {
      // Mistake! It is out of order, they should have swapped.
      playError();
      showMascot(
        `Oops! ${a} is larger than ${b}. Since we want ascending order (small to large), they must be swapped! Click 'Swap Runes' to interchange them.`,
        'neutral'
      );
      return;
    }

    // Correctly skipped swapping (already in order)
    moveToNext();
  };

  const handleSwap = () => {
    playClick();
    const a = sortArray[compareIdx];
    const b = sortArray[compareIdx + 1];

    if (a <= b) {
      // Mistake! It's already in order, no swap needed.
      playError();
      showMascot(
        `Hold on! ${a} is already smaller than or equal to ${b}. No swap is needed! Click 'Keep / Move Next' to move on.`,
        'neutral'
      );
      return;
    }

    // Valid swap
    const copy = [...sortArray];
    copy[compareIdx] = b;
    copy[compareIdx + 1] = a;
    setSortArray(copy);
    setSwapsInPass((s) => s + 1);
    setTotalSwaps((t) => t + 1);
    playTypewriter();

    moveToNext(copy);
  };

  const moveToNext = (updatedArray = sortArray) => {
    const nextIdx = compareIdx + 1;
    
    // Check if we reached the end of this pass
    if (nextIdx >= updatedArray.length - 1) {
      // End of pass. Check if sorted.
      if (checkArraySorted(updatedArray)) {
        handleSortSuccess();
      } else {
        // Start another pass
        setTimeout(() => {
          setCompareIdx(0);
          setSwapsInPass(0);
          setPassCount((p) => p + 1);
          setActiveComparing([0, 1]);
          showMascot(
            `Pass ${passCount} complete! The runes aren't fully sorted yet. Starting Pass ${passCount + 1} from the beginning.`,
            'neutral'
          );
        }, 500);
      }
    } else {
      setCompareIdx(nextIdx);
      setActiveComparing([nextIdx, nextIdx + 1]);
    }
  };

  const handleSortSuccess = () => {
    playSuccess();
    setIsSorted(true);
    setPhase('solved');
    
    // Calculate stars: fewer total passes/swaps = higher stars
    // Best case is fully sorted. 5 stars if sorted cleanly.
    const stars = totalSwaps <= 5 ? 5 : totalSwaps <= 10 ? 4 : 3;
    completeLevel('maze', stars);

    showMascot(
      `Wonderful! The lock clicked open. By comparing adjacent values and swapping them sequentially, you completed a Bubble Sort algorithm! The smaller numbers bubbled to the left and larger numbers bubbled to the right. Excellent job.`,
      'happy',
      () => {
        setScreen('map');
      },
      "Proceed to Chess challenge"
    );
  };

  return (
    <div className={styles.container}>
      {phase === 'intro' && (
        <div className={styles.introOverlay}>
          <div className={`${styles.introCard} fantasy-panel`}>
            <h1 className={`${styles.introTitle} fantasy-heading`}>
              Bubble Sort Challenge
            </h1>
            <div className={styles.introPreviewFrame}>
              <img src={bubbleSortAsset} alt="Bubble Sort Preview" className={styles.introPreviewImg} />
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

      {/* Header bar */}
      <div className={styles.header}>
        <button 
          className="fantasy-button"
          onClick={() => { playClick(); setScreen('map'); }}
          onMouseEnter={playHover}
          style={{ padding: '6px 16px', fontSize: '0.85rem' }}
        >
          <ArrowLeft size={16} /> Overworld Map
        </button>
        <h2 className="fantasy-heading styles.title">Bubble Sort Challenge</h2>
        <button 
          className="fantasy-button"
          onClick={() => {
            if (phase === 'sort') {
              playClick();
              setupBubbleSort();
            }
          }}
          onMouseEnter={playHover}
          style={{ padding: '6px 16px', fontSize: '0.85rem' }}
          disabled={phase === 'intro' || phase === 'solved'}
        >
          <RefreshCw size={16} /> Restart
        </button>
      </div>

      {/* Bubble Sort Lock Phase */}
      {(phase === 'sort' || phase === 'solved') && (
        <div className={styles.sortContent}>
          <div className={`${styles.sortCard} fantasy-panel animate-fade-in`}>
            <h3 className={styles.sortTitle}>🔒 Enchanted Rune Lock</h3>
            <p className={styles.sortDesc}>
              Sort these magical runes in ascending order (small to large). You can only swap adjacent runes.
            </p>

            <div className={styles.runesContainer}>
              {sortArray.map((value, idx) => {
                const isComparing = activeComparing.includes(idx);
                return (
                  <div 
                    key={idx} 
                    className={`${styles.runeSlab} ${
                      isComparing ? styles.runeComparing : ''
                    } ${isSorted ? styles.runeSuccess : ''}`}
                  >
                    <div className={styles.runeNumber}>{value}</div>
                    <div className={styles.runeDesign}>✧</div>
                  </div>
                );
              })}
            </div>

            {/* Pointer indicators */}
            {!isSorted && (
              <div className={styles.pointersContainer}>
                {Array.from({ length: 4 }).map((_, idx) => (
                  <div 
                    key={idx} 
                    className={`${styles.pointerArrow} ${
                      compareIdx === idx ? styles.pointerActive : ''
                    }`}
                  >
                    ▲
                  </div>
                ))}
              </div>
            )}

            <div className={styles.statsBar}>
              <span>Swaps in this pass: <b>{swapsInPass}</b></span>
              <span>Pass Number: <b>{passCount}</b></span>
              <span>Total Swaps: <b>{totalSwaps}</b></span>
            </div>

            {!isSorted && (
              <div className={styles.sortControls}>
                <button 
                  className="fantasy-button"
                  onClick={handleCompare}
                  onMouseEnter={playHover}
                >
                  Keep / Move Next
                </button>
                <button 
                  className="fantasy-button"
                  onClick={handleSwap}
                  onMouseEnter={playHover}
                  style={{ border: '2px solid var(--color-gold)', background: 'linear-gradient(135deg, #aa841c, #4a3404)' }}
                >
                  Swap Runes
                </button>
              </div>
            )}

            {isSorted && (
              <div className={styles.gateSolved}>
                <Award size={36} color="var(--color-gold)" className="animate-float" />
                <h4>Bubble Lock Shattered!</h4>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MazeGame;
