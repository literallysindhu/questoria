import React, { useState, useEffect, useCallback } from 'react';
import { useGameState } from '../contexts/GameStateContext';
import { playClick, playHover, playSuccess, playError, playTypewriter } from '../utils/audio';
import { ArrowLeft, RefreshCw, Briefcase, Award, Info, AlertTriangle } from 'lucide-react';
import foxNeutral from '../assets/fox neutral.png';
import styles from './KnapsackGame.module.css';

interface MarketItem {
  id: number;
  name: string;
  weight: number;
  value: number;
  emoji: string;
  description: string;
}

const FANTASY_ITEMS = [
  { name: 'Phoenix Quill', emoji: '🪶', description: 'Extremely light, burns with eternal fire.' },
  { name: 'Elixir of Life', emoji: '🧪', description: 'Restores vitality. Heavy glass flask.' },
  { name: 'Ancient Runestone', emoji: '🪨', description: 'Glows with ancient code structures.' },
  { name: 'Dragon Scale Shield', emoji: '🛡️', description: 'Heavy protection, highly valuable.' },
  { name: 'Stardust Potion', emoji: '🌌', description: 'Swirling celestial liquid in a vial.' },
  { name: 'Golden Goblet', emoji: '🏆', description: 'Solid gold cup from a forgotten realm.' },
  { name: 'Shadow Cloak', emoji: '🧥', description: 'Lightweight fabric that bends light.' },
  { name: 'Spell Crystal', emoji: '🔮', description: 'Amplifies magical compile times.' },
];

export const KnapsackGame: React.FC = () => {
  const { setScreen, completeLevel, showMascot } = useGameState();
  const [phase, setPhase] = useState<'intro' | 'ratios' | 'play' | 'solved'>('intro');

  const [capacity, setCapacity] = useState(15);
  const [items, setItems] = useState<MarketItem[]>([]);
  const [packedFractions, setPackedFractions] = useState<{ [key: number]: number }>({});
  const [isSolved, setIsSolved] = useState(false);
  const [optimalValue, setOptimalValue] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);


  // Ratio entry states
  const [userRatios, setUserRatios] = useState<{ [key: number]: string }>({});
  const [verifiedRatios, setVerifiedRatios] = useState<{ [key: number]: boolean }>({});
  const [calcDisplay, setCalcDisplay] = useState<string>('');

  // Derived state calculated during render
  let packedWeight = 0;
  let packedValue = 0;
  items.forEach((item) => {
    const frac = packedFractions[item.id] || 0;
    packedWeight += item.weight * frac;
    packedValue += item.value * frac;
  });
  packedWeight = Number(packedWeight.toFixed(2));
  packedValue = Number(packedValue.toFixed(2));

  const [introText, setIntroText] = useState('');
  const [isIntroTyping, setIsIntroTyping] = useState(true);
  const introFullText = "Greetings, adventurer! Master Elidor is preparing for an expedition. His backpack is enchanted but can only support a maximum weight constraint. The market shelves hold various items, each with a weight and gold value. However, these are bulk commodities (powders, liquids, or dusts)—you can pack fractional portions of them! We must choose the optimal fractions of items to pack, maximizing the total value without exceeding capacity! This is the famous Fractional Knapsack Problem, solved optimally using a Greedy Algorithm by prioritizing items with the highest value-to-weight ratio.";


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

  // 1. Solve Fractional Knapsack greedily to find optimal value
  const solveFractionalKnapsack = (itemsList: MarketItem[], cap: number): number => {
    const sorted = [...itemsList].sort((a, b) => (b.value / b.weight) - (a.value / a.weight));
    let currentWeight = 0;
    let totalValue = 0;
    for (const item of sorted) {
      if (currentWeight + item.weight <= cap) {
        currentWeight += item.weight;
        totalValue += item.value;
      } else {
        const remaining = cap - currentWeight;
        totalValue += item.value * (remaining / item.weight);
        break;
      }
    }
    return Number(totalValue.toFixed(2));
  };

  // 2. Generate Random Run
  const generateMarket = useCallback(() => {
    // Random Capacity 12 to 18
    const cap = Math.floor(Math.random() * 7) + 12;
    setCapacity(cap);

    // Shuffle and pick 6 items
    const shuffled = [...FANTASY_ITEMS].sort(() => Math.random() - 0.5);
    const chosen = shuffled.slice(0, 6).map((item, idx) => {
      // Randomize weight and value
      const weight = Math.floor(Math.random() * 7) + 2; // 2 to 8 kg
      const value = Math.floor(Math.random() * 35) + 10; // 10 to 45 gold
      return {
        id: idx,
        name: item.name,
        emoji: item.emoji,
        description: item.description,
        weight,
        value,
      };
    });

    setItems(chosen);
    
    // Initialize fractions to 0
    const initialFractions: { [key: number]: number } = {};
    chosen.forEach((item) => {
      initialFractions[item.id] = 0;
    });
    setPackedFractions(initialFractions);
    setIsSolved(false);
    setErrorMessage(null);

    // Reset ratio states
    setUserRatios({});
    setVerifiedRatios({});
    setCalcDisplay('');

    // Precalculate optimal
    const opt = solveFractionalKnapsack(chosen, cap);
    setOptimalValue(opt);
  }, []);

  useEffect(() => {
    setTimeout(() => {
      generateMarket();
    }, 0);
  }, [generateMarket]);


  const handleBeginQuest = () => {
    playClick();
    if (isIntroTyping) {
      setIntroText(introFullText);
      setIsIntroTyping(false);
    } else {
      setPhase('ratios');
      showMascot(
        `Wait! Before we pack Elidor's backpack, we must determine the value-to-weight ratio of each item on the shelves. This will help us use a Greedy strategy! Calculate the ratio (Value / Weight) for each item, round to 2 decimal places, and check them. You can use the Alchemist's Calculator on the right to assist you.`,
        'neutral'
      );
    }
  };

  const handleFractionChange = (id: number, fraction: number) => {
    if (isSolved) return;
    setPackedFractions((prev) => {
      const updated = {
        ...prev,
        [id]: Number(fraction.toFixed(2)),
      };
      
      // Calculate weight to conditionally clear overload error
      let weight = 0;
      items.forEach((item) => {
        const frac = item.id === id ? fraction : (prev[item.id] || 0);
        weight += item.weight * frac;
      });
      if (weight <= capacity) {
        setErrorMessage(null);
      }
      
      return updated;
    });
  };


  // Check individual ratio entry
  const checkItemRatio = (itemId: number) => {
    const item = items.find((it) => it.id === itemId);
    if (!item) return;

    const userInput = userRatios[itemId];
    if (!userInput || userInput.trim() === '') {
      playError();
      setErrorMessage(`Please enter a ratio for ${item.name} first.`);
      return;
    }

    const userVal = parseFloat(userInput);
    const correctRatio = Number((item.value / item.weight).toFixed(2));

    // Allow ±0.01 tolerance for minor rounding styles
    if (!isNaN(userVal) && Math.abs(userVal - correctRatio) <= 0.01) {
      playSuccess();
      setVerifiedRatios((prev) => ({ ...prev, [itemId]: true }));
      setErrorMessage(null);
    } else {
      playError();
      setVerifiedRatios((prev) => ({ ...prev, [itemId]: false }));
      setErrorMessage(`Incorrect ratio for ${item.name}! Check your math: Value (${item.value}) / Weight (${item.weight}).`);
    }
  };

  // Key event handler for built-in calculator
  const handleCalcKey = (key: string) => {
    playClick();
    if (key === 'C') {
      setCalcDisplay('');
    } else if (key === '=') {
      try {
        const sanitized = calcDisplay.replace(/[^0-9+\-*/.]/g, '');
        if (!sanitized) return;
        const result = new Function(`return ${sanitized}`)();
        if (typeof result === 'number' && !isNaN(result)) {
          setCalcDisplay(result % 1 === 0 ? result.toString() : Number(result.toFixed(4)).toString());
        } else {
          setCalcDisplay('Error');
        }
      } catch {
        setCalcDisplay('Error');
      }
    } else {
      const lastChar = calcDisplay.slice(-1);
      const isOperator = ['+', '-', '*', '/'].includes(key);
      const lastIsOperator = ['+', '-', '*', '/'].includes(lastChar);
      if (isOperator && (calcDisplay === '' || lastIsOperator)) {
        return;
      }
      setCalcDisplay((prev) => prev + key);
    }
  };

  const allRatiosVerified = items.length > 0 && items.every((item) => verifiedRatios[item.id] === true);

  const handleStartPacking = () => {
    playClick();
    setPhase('play');
    showMascot(
      `Excellent calculations! Now that you know the ratios, pack fractional portions of items using the sliders to maximize the total value! Remember: Greedy algorithm picks the items with the highest ratios first.`,
      'neutral'
    );
  };

  const checkSolution = () => {
    if (packedWeight > capacity) {
      playError();
      setErrorMessage("The bag is too heavy! Remove some weight before embarking.");
      return;
    }

    const totalFractionsSum = Object.values(packedFractions).reduce((acc, val) => acc + val, 0);
    if (totalFractionsSum === 0) {
      playError();
      setErrorMessage("Your backpack is empty! Pack at least a fraction of one item.");
      return;
    }

    playSuccess();
    setIsSolved(true);

    // Calculate rating based on efficiency (Player packed gold value vs Optimal gold value)
    const difference = Math.abs(packedValue - optimalValue);
    let stars = 3;
    if (difference <= 0.1) {
      stars = 5; // Perfect optimal packing!
    } else if (difference <= 5.0) {
      stars = 4;
    }

    completeLevel('knapsack', stars);

    const message = difference <= 0.1
      ? `Phenomenal! You packed the absolute optimal set of fractional items worth ${packedValue} gold coins. You solved the Fractional Knapsack Problem perfectly! The Greedy strategy works flawlessly here because you can divide items, always prioritizing the highest value-to-weight ratios.`
      : `Expedition ready! You packed items worth ${packedValue} gold coins (optimal was ${optimalValue}). Sorting items by ratio and taking a fraction of the last item is called the Greedy approach, which is the mathematically optimal algorithm for Fractional Knapsack.`;

    showMascot(
      message,
      difference <= 0.1 ? 'happy' : 'neutral',
      () => {
        setScreen('map');
      },
      "Return to Map"
    );
  };

  const isOverloaded = packedWeight > capacity;
  const fillPercentage = Math.min((packedWeight / capacity) * 100, 100);

  return (
    <div className={styles.container}>
      {phase === 'intro' && (
        <div className={styles.introOverlay}>
          <div className={`${styles.introCard} fantasy-panel`}>
            <h1 className={`${styles.introTitle} fantasy-heading`}>
              Knapsack Market
            </h1>
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

      {/* Top bar controls */}
      <div className={styles.header}>
        <button 
          className="fantasy-button"
          onClick={() => { playClick(); setScreen('map'); }}
          onMouseEnter={playHover}
          style={{ padding: '6px 16px', fontSize: '0.85rem' }}
        >
          <ArrowLeft size={16} /> Overworld Map
        </button>
        <h2 className="fantasy-heading">Knapsack Market</h2>
        <button 
          className="fantasy-button"
          onClick={() => { playClick(); generateMarket(); }}
          onMouseEnter={playHover}
          style={{ padding: '6px 16px', fontSize: '0.85rem' }}
          disabled={isSolved}
        >
          <RefreshCw size={16} /> Restock Shelves
        </button>
      </div>

      <p className={styles.description}>
        Select fractional portions from the shelves to maximize the gold value packed in your backpack. Do not exceed the maximum weight capacity!
      </p>

      {/* Main Grid split: Shelves vs Backpack */}
      <div className={styles.marketSplit}>
        {/* Left: Market Shelves */}
        <div className={`${styles.shelfPanel} fantasy-panel`}>
          <h3 className={styles.panelTitle}>🛒 Market Shelves</h3>
          <div className={styles.shelfGrid}>
            {items.map((item) => {
              const fraction = packedFractions[item.id] || 0;
              const isPacked = fraction > 0;
              return (
                <div 
                  key={item.id}
                  className={`${styles.shelfItem} ${isPacked ? styles.itemSelected : ''}`}
                >
                  <div className={styles.itemEmoji}>{item.emoji}</div>
                  <div className={styles.itemDetails}>
                    <h4 className={styles.itemName}>{item.name}</h4>
                    <p className={styles.itemDesc}>{item.description}</p>
                    <div className={styles.itemStats}>
                      <span className={styles.itemWeightTag}>⚖️ Total: {item.weight} kg</span>
                      <span className={styles.itemValueTag}>🪙 Total: {item.value} Gold</span>
                      {phase !== 'ratios' && (
                        <span className={styles.ratioTag}>📊 Ratio: {(item.value / item.weight).toFixed(2)} Gold/kg</span>
                      )}
                    </div>
                  </div>

                  {phase === 'ratios' ? (
                    <div className={styles.ratioSection}>
                      <div className={styles.ratioInputRow}>
                        <input 
                          type="number" 
                          step="0.01" 
                          min="0"
                          placeholder="Ratio" 
                          value={userRatios[item.id] || ''}
                          onChange={(e) => {
                            const val = e.target.value;
                            setUserRatios((prev) => ({ ...prev, [item.id]: val }));
                            if (verifiedRatios[item.id] !== undefined) {
                              setVerifiedRatios((prev) => {
                                const copy = { ...prev };
                                delete copy[item.id];
                                return copy;
                              });
                            }
                          }}
                          className={styles.ratioInput}
                          disabled={verifiedRatios[item.id] === true}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              checkItemRatio(item.id);
                            }
                          }}
                        />
                        {verifiedRatios[item.id] !== true && (
                          <button 
                            className={styles.checkRatioBtn}
                            onClick={() => checkItemRatio(item.id)}
                            onMouseEnter={playHover}
                          >
                            Check
                          </button>
                        )}
                      </div>
                      {verifiedRatios[item.id] === true && (
                        <div className={styles.ratioVerifiedBadge}>
                          ✦ {(item.value / item.weight).toFixed(2)} (Correct)
                        </div>
                      )}
                      {verifiedRatios[item.id] === false && (
                        <div className={styles.ratioFailedBadge}>
                          ❌ Incorrect
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className={styles.sliderSection}>
                      <div className={styles.sliderLabel}>
                        <span>Pack: <b>{Math.round(fraction * 100)}%</b></span>
                        <span>({(item.weight * fraction).toFixed(1)} kg)</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="1" 
                        step="0.05" 
                        value={fraction} 
                        onChange={(e) => handleFractionChange(item.id, parseFloat(e.target.value))}
                        className={styles.slider}
                        disabled={isSolved}
                      />
                      <div className={styles.quickButtons}>
                        <button 
                          className={styles.quickBtn}
                          onClick={() => handleFractionChange(item.id, 0)}
                          disabled={isSolved || fraction === 0}
                        >
                          Empty
                        </button>
                        <button 
                          className={styles.quickBtn}
                          onClick={() => handleFractionChange(item.id, 1)}
                          disabled={isSolved || fraction === 1}
                        >
                          Max
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Backpack details OR Alchemist's Calculator */}
        {phase === 'ratios' ? (
          <div className={`${styles.calculatorPanel} fantasy-panel`}>
            <div className={styles.bagTitleWrapper}>
              <Info size={24} color="var(--color-gold)" />
              <h3 className={styles.panelTitle}>🧙‍♂️ Alchemist's Calculator</h3>
            </div>
            
            <p className={styles.calcInstructions}>
              Before packing, we must calculate the value density (ratio) of all items. 
              Formula: <code>Ratio = Value / Weight</code>.
              Round to 2 decimal places (e.g. <code>3.43</code>).
            </p>

            <div className={styles.calcDevice}>
              <div className={`${styles.calcScreen} ${!calcDisplay ? styles.calcScreenEmpty : ''}`}>
                {calcDisplay || '0.00'}
              </div>
              <div className={styles.calcGrid}>
                <button className={`${styles.calcBtn} ${styles.calcBtnClear}`} onClick={() => handleCalcKey('C')}>Clear</button>
                <button className={`${styles.calcBtn} ${styles.calcBtnOperator}`} onClick={() => handleCalcKey('/')}>/</button>
                <button className={`${styles.calcBtn} ${styles.calcBtnOperator}`} onClick={() => handleCalcKey('*')}>*</button>

                <button className={styles.calcBtn} onClick={() => handleCalcKey('7')}>7</button>
                <button className={styles.calcBtn} onClick={() => handleCalcKey('8')}>8</button>
                <button className={styles.calcBtn} onClick={() => handleCalcKey('9')}>9</button>
                <button className={`${styles.calcBtn} ${styles.calcBtnOperator}`} onClick={() => handleCalcKey('-')}>-</button>

                <button className={styles.calcBtn} onClick={() => handleCalcKey('4')}>4</button>
                <button className={styles.calcBtn} onClick={() => handleCalcKey('5')}>5</button>
                <button className={styles.calcBtn} onClick={() => handleCalcKey('6')}>6</button>
                <button className={`${styles.calcBtn} ${styles.calcBtnOperator}`} onClick={() => handleCalcKey('+')}>+</button>

                <button className={styles.calcBtn} onClick={() => handleCalcKey('1')}>1</button>
                <button className={styles.calcBtn} onClick={() => handleCalcKey('2')}>2</button>
                <button className={styles.calcBtn} onClick={() => handleCalcKey('3')}>3</button>
                <button className={`${styles.calcBtn} ${styles.calcBtnEquals}`} onClick={() => handleCalcKey('=')}>=</button>

                <button className={styles.calcBtn} onClick={() => handleCalcKey('0')}>0</button>
                <button className={styles.calcBtn} onClick={() => handleCalcKey('.')}>.</button>
              </div>
            </div>

            {errorMessage && (
              <div className={`${styles.alertBox} animate-shake`}>
                <AlertTriangle size={20} />
                <span>{errorMessage}</span>
              </div>
            )}

            <button
              className="fantasy-button animate-pulse-gold startPackingBtn"
              onClick={handleStartPacking}
              disabled={!allRatiosVerified}
              onMouseEnter={playHover}
            >
              {allRatiosVerified ? "Start Packing!" : "Verify All Ratios First"}
            </button>
          </div>
        ) : (
          <div className={`${styles.bagPanel} fantasy-panel`}>
            <div className={styles.bagTitleWrapper}>
              <Briefcase size={24} color="var(--color-gold)" />
              <h3 className={styles.panelTitle}>🎒 Elidor's Backpack</h3>
            </div>

            <div className={styles.progressBarWrapper}>
              <div className={styles.progressLabels}>
                <span>Packed Weight</span>
                <span className={isOverloaded ? styles.overloadText : ''}>
                  <b>{packedWeight}</b> / {capacity} kg
                </span>
              </div>
              <div className={styles.progressContainer}>
                <div 
                  className={`${styles.progressBar} ${
                    isOverloaded ? styles.progressOverloaded : ''
                  }`}
                  style={{ width: `${fillPercentage}%` }}
                ></div>
              </div>
            </div>

            {/* Sacks packed list */}
            <div className={styles.packedList}>
              {Object.keys(packedFractions).filter((key) => packedFractions[Number(key)] > 0).length === 0 ? (
                <div className={styles.emptyBagMessage}>
                  <Info size={16} /> Use the sliders on the shelf items to pack fractional amounts into the backpack.
                </div>
              ) : (
                <div className={styles.packedGrid}>
                  {items.filter((it) => (packedFractions[it.id] || 0) > 0).map((item) => {
                    const frac = packedFractions[item.id];
                    return (
                      <div 
                        key={item.id}
                        className={styles.packedBubble}
                        onClick={() => handleFractionChange(item.id, 0)}
                        title="Click to unpack"
                      >
                        <span className={styles.bubbleEmoji}>{item.emoji}</span>
                        <span className={styles.bubbleText}>{item.name} ({Math.round(frac * 100)}%)</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className={styles.goldMeter}>
              <span>Gold packed in bag:</span>
              <div className={styles.goldValue}>🪙 {packedValue} <span className={styles.goldCoinsLabel}>Coins</span></div>
            </div>

            {errorMessage && (
              <div className={`${styles.alertBox} animate-shake`}>
                <AlertTriangle size={20} />
                <span>{errorMessage}</span>
              </div>
            )}

            {!isSolved && (
              <button 
                className="fantasy-button"
                onClick={checkSolution}
                onMouseEnter={playHover}
                style={{ width: '100%', marginTop: '16px' }}
                disabled={isOverloaded}
              >
                Complete Packing
              </button>
            )}

            {isSolved && (
              <div className={styles.solvedSplash}>
                <Award size={32} color="var(--color-gold)" className="animate-float" />
                <h3>Backpack Optimized!</h3>
                <p>Optimal possible gold value: <b>{optimalValue} Gold</b></p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default KnapsackGame;
