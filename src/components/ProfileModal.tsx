import React, { useState } from 'react';
import { useGameState } from '../contexts/GameStateContext';
import { playClick, playHover, playMagicUnlock } from '../utils/audio';
import { X, Award, Star, FolderOpen, Save, Trash2, Download, Upload } from 'lucide-react';
import styles from './ProfileModal.module.css';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { progression, loadProgression } = useGameState();

  // Save slots state
  const [saveSlots, setSaveSlots] = useState<{ [key: string]: { name: string; progression: any; date: string } | null }>(() => {
    const saved = localStorage.getItem('gamified_cs_save_slots');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return {
      slot1: null,
      slot2: null,
      slot3: null
    };
  });

  // Custom dialog states for iframe compatibility
  const [activeDialog, setActiveDialog] = useState<{
    type: 'save' | 'load' | 'delete';
    slotKey: string;
  } | null>(null);
  
  const [promptInput, setPromptInput] = useState('');

  if (!isOpen) return null;

  // Calculate Wizard Rank based on progression stars
  const calculateTotalStars = () => {
    return (progression?.maze?.stars || 0) + 
           (progression?.nQueens?.stars || 0) + 
           (progression?.knapsack?.stars || 0);
  };

  const getWizardRank = (totalStars: number) => {
    if (totalStars >= 12) return 'Grand Archmage 🔮';
    if (totalStars >= 8) return 'Senior Sorcerer ⚡';
    if (totalStars >= 4) return 'Apprentice Mage 📜';
    if (totalStars >= 1) return 'Initiate Conjurer ✧';
    return 'Novice Scribe 🪶';
  };

  const totalStars = calculateTotalStars();
  const wizardRank = getWizardRank(totalStars);

  const handleSaveToSlot = (slotKey: string) => {
    playClick();
    const existingName = saveSlots[slotKey]?.name || '';
    setPromptInput(existingName || `Wizard Slot ${slotKey.replace('slot', '')}`);
    setActiveDialog({ type: 'save', slotKey });
  };

  const handleLoadFromSlot = (slotKey: string) => {
    playClick();
    setActiveDialog({ type: 'load', slotKey });
  };

  const handleDeleteSlot = (slotKey: string) => {
    playClick();
    setActiveDialog({ type: 'delete', slotKey });
  };

  const confirmSave = () => {
    if (!activeDialog) return;
    const { slotKey } = activeDialog;
    const name = promptInput.trim() || `Slot ${slotKey.replace('slot', '')}`;
    
    const updated = {
      ...saveSlots,
      [slotKey]: {
        name,
        progression,
        date: new Date().toLocaleDateString()
      }
    };
    setSaveSlots(updated);
    localStorage.setItem('gamified_cs_save_slots', JSON.stringify(updated));
    playMagicUnlock();
    setActiveDialog(null);
  };

  const confirmLoad = () => {
    if (!activeDialog) return;
    const { slotKey } = activeDialog;
    const slotData = saveSlots[slotKey];
    if (slotData) {
      loadProgression(slotData.progression);
      playMagicUnlock();
    }
    setActiveDialog(null);
  };

  const confirmDelete = () => {
    if (!activeDialog) return;
    const { slotKey } = activeDialog;
    const updated = {
      ...saveSlots,
      [slotKey]: null
    };
    setSaveSlots(updated);
    localStorage.setItem('gamified_cs_save_slots', JSON.stringify(updated));
    setActiveDialog(null);
  };

  const handleExportSave = () => {
    playClick();
    const dataStr = JSON.stringify({
      type: "gamified_cs_save_file",
      version: 1,
      progression: progression
    }, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const sanitizedRank = wizardRank.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    const exportFileDefaultName = `wizard_progress_${sanitizedRank}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImportSave = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.type === "gamified_cs_save_file" && parsed.progression) {
          loadProgression(parsed.progression);
          alert("🔮 Progression loaded successfully from save file!");
          playMagicUnlock();
        } else {
          alert("❌ Invalid save file format.");
        }
      } catch (err) {
        alert("❌ Failed to parse JSON save file.");
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div 
        className={`${styles.modalCard} fantasy-panel animate-scale-in`}
        onClick={(e) => e.stopPropagation()}
      >
        <button className={styles.closeBtn} onClick={onClose} onMouseEnter={playHover}>
          <X size={18} />
        </button>
        <h3 className={styles.modalTitle}>
          <Award size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
          Wizard Profile
        </h3>
        
        <div className={styles.profileStats}>
          <div className={styles.profileRankBox}>
            <span className={styles.profileRankLabel}>Current Wizard Title</span>
            <div className={styles.profileRankValue}>{wizardRank}</div>
          </div>

          <div className={styles.profileGrid}>
            <div className={styles.statBox}>
              <div className={styles.statLabel}>Hedge Maze</div>
              <div className={styles.statValue}>
                {progression.maze.stars > 0 ? (
                  <>
                    <Star size={14} color="var(--color-gold)" fill="var(--color-gold)" /> 
                    {progression.maze.stars} Stars
                  </>
                ) : (
                  'Unlocked (0 ★)'
                )}
              </div>
            </div>

            <div className={styles.statBox}>
              <div className={styles.statLabel}>Chess Courtyard</div>
              <div className={styles.statValue}>
                {progression.nQueens.unlocked ? (
                  progression.nQueens.stars > 0 ? (
                    <>
                      <Star size={14} color="var(--color-gold)" fill="var(--color-gold)" />
                      {progression.nQueens.stars} Stars
                    </>
                  ) : (
                    'Unlocked (0 ★)'
                  )
                ) : (
                  '🔒 Sealed'
                )}
              </div>
            </div>

            <div className={styles.statBox}>
              <div className={styles.statLabel}>Knapsack Shelf</div>
              <div className={styles.statValue}>
                {progression.knapsack.unlocked ? (
                  progression.knapsack.stars > 0 ? (
                    <>
                      <Star size={14} color="var(--color-gold)" fill="var(--color-gold)" />
                      {progression.knapsack.stars} Stars
                    </>
                  ) : (
                    'Unlocked (0 ★)'
                  )
                ) : (
                  '🔒 Sealed'
                )}
              </div>
            </div>

            <div className={styles.statBox}>
              <div className={styles.statLabel}>Total Emblems</div>
              <div className={styles.statValue} style={{ color: 'var(--color-gold-light)', fontWeight: 'bold' }}>
                ✨ {totalStars} Stars
              </div>
            </div>
          </div>

          {/* Local Saves Directory */}
          <div className={styles.savesSection}>
            <h4 className={styles.savesTitle}>
              <FolderOpen size={18} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
              Local Saves Directory
            </h4>
            <div className={styles.slotsContainer}>
              {Object.keys(saveSlots).map((slotKey) => {
                const slot = saveSlots[slotKey];
                const slotNum = slotKey.replace('slot', '');
                return (
                  <div key={slotKey} className={styles.slotRow}>
                    <div className={styles.slotInfo}>
                      <span className={styles.slotName}>
                        {slot ? slot.name : `Empty Profile Slot ${slotNum}`}
                      </span>
                      {slot && (
                        <span className={styles.slotMeta}>
                          Saved: {slot.date} ({Object.values(slot.progression).reduce((acc: number, curr: any) => acc + (curr.stars || 0), 0)} ★)
                        </span>
                      )}
                    </div>
                    <div className={styles.slotActions}>
                      <button 
                        className={styles.slotBtn} 
                        onClick={() => handleSaveToSlot(slotKey)}
                        onMouseEnter={playHover}
                      >
                        <Save size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} /> Save
                      </button>
                      {slot && (
                        <>
                          <button 
                            className={styles.slotBtn} 
                            onClick={() => handleLoadFromSlot(slotKey)}
                            onMouseEnter={playHover}
                          >
                            Load
                          </button>
                          <button 
                            className={`${styles.slotBtn} ${styles.slotBtnDanger}`} 
                            onClick={() => handleDeleteSlot(slotKey)}
                            onMouseEnter={playHover}
                          >
                            <Trash2 size={12} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className={styles.backupContainer}>
              <button className={styles.backupBtn} onClick={handleExportSave} onMouseEnter={playHover}>
                <Download size={14} style={{ marginRight: '6px' }} />
                Export Save File
              </button>
              
              <label className={styles.backupBtn} style={{ cursor: 'pointer' }}>
                <Upload size={14} style={{ marginRight: '6px' }} />
                Import Save File
                <input 
                  type="file" 
                  accept=".json" 
                  onChange={handleImportSave} 
                  style={{ display: 'none' }} 
                />
              </label>
            </div>
          </div>
        </div>
        
        {/* Custom dialog system for iframe compatibility */}
        {activeDialog && (
          <div className={styles.customDialogOverlay}>
            <div className={`${styles.customDialogCard} parchment-panel animate-scale-in`}>
              {activeDialog.type === 'save' && (
                <>
                  <h4>🔮 Save Game Profile</h4>
                  <p>Enter Save Profile Name:</p>
                  <input 
                    type="text" 
                    value={promptInput} 
                    onChange={(e) => setPromptInput(e.target.value)}
                    className={styles.dialogInput}
                    maxLength={24}
                    autoFocus
                  />
                  <div className={styles.dialogActions}>
                    <button className="fantasy-button" onClick={() => { playClick(); confirmSave(); }}>Confirm</button>
                    <button className="fantasy-button" onClick={() => { playClick(); setActiveDialog(null); }} style={{ opacity: 0.8 }}>Cancel</button>
                  </div>
                </>
              )}
              {activeDialog.type === 'load' && (
                <>
                  <h4>⚠️ Load Game Profile</h4>
                  <p>Load save profile "{saveSlots[activeDialog.slotKey]?.name}"? Your current unsaved progress will be overwritten.</p>
                  <div className={styles.dialogActions}>
                    <button className="fantasy-button" onClick={() => { playClick(); confirmLoad(); }}>Load Save</button>
                    <button className="fantasy-button" onClick={() => { playClick(); setActiveDialog(null); }} style={{ opacity: 0.8 }}>Cancel</button>
                  </div>
                </>
              )}
              {activeDialog.type === 'delete' && (
                <>
                  <h4>🗑️ Delete Save Profile</h4>
                  <p>Are you sure you want to delete the save profile "{saveSlots[activeDialog.slotKey]?.name}"?</p>
                  <div className={styles.dialogActions}>
                    <button className="fantasy-button" onClick={() => { playClick(); confirmDelete(); }} style={{ background: '#e74c3c', border: '1px solid #c0392b' }}>Delete</button>
                    <button className="fantasy-button" onClick={() => { playClick(); setActiveDialog(null); }} style={{ opacity: 0.8 }}>Cancel</button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
