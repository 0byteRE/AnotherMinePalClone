import { useState } from 'react';
import { saveProfiles, sendMessage, fetchBotMemories, deleteMemory, Memory } from '../utils/api';
import { Profile } from '../types/apiTypes';
import { useUserSettings } from '../contexts/UserSettingsContext/UserSettingsContext';
import './Profiles.css';
import { useAgent } from '../contexts/AgentContext/AgentContext';
import { useErrorReport } from '../contexts/ErrorReportContext/ErrorReportContext';

function Profiles() {
  const { userSettings: { profiles }, updateField } = useUserSettings();
  const { selectedProfiles, toggleProfile } = useAgent();
  const { declareError } = useErrorReport();

  const [editingProfileIndex, setEditingProfileIndex] = useState<number | null>(null);
  const [editingProfile, setEditingProfile] = useState<Profile>();
  const [customMessage, setCustomMessage] = useState("");
  const [error, setError] = useState<string>();
  const [showMemories, setShowMemories] = useState(false);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [memoryError, setMemoryError] = useState<string>();

  const openModal = (profile = { name: '', personality: '' }, index: number | null = null) => {
    setEditingProfileIndex(index);
    setEditingProfile({ ...profile });
  };

  const closeModal = () => {
    setEditingProfile(undefined);
    setEditingProfileIndex(null);
    setError(undefined);
    setShowMemories(false);
    setMemories([]);
    setMemoryError(undefined);
  };

  const viewMemories = async () => {
    if (!editingProfile?.name) return;
    
    try {
      const botMemories = await fetchBotMemories(editingProfile.name);
      setMemories(botMemories);
      setShowMemories(true);
      setMemoryError(undefined);
    } catch (error) {
      declareError("Memories", error);
      setMemoryError("Failed to fetch memories. Please try again.");
    }
  };

  const handleDeleteMemory = async (memoryId: string) => {
    if (!editingProfile?.name) return;

    try {
      await deleteMemory(editingProfile.name, memoryId);
      setMemories(prevMemories => prevMemories.filter(m => m.id !== memoryId));
      setMemoryError(undefined);
    } catch (error) {
      declareError("Memories", error);
      setMemoryError("Failed to delete memory. Please try again.");
    }
  };

  const saveChanges = async () => {
    const sanitized = {
      name: editingProfile!.name.trim(),
      personality: editingProfile!.personality.trim(),
    }

    if (sanitized.name === '' || sanitized.personality === '') {
      setError('Name and personality must not be empty');
      return;
    }

    if (profiles.some((p, idx) => p.name === sanitized.name && idx !== editingProfileIndex)) {
      setError('A profile with this name already exists');
      return;
    }

    const updatedProfiles = [...profiles];
    if (editingProfileIndex !== null) {
      updatedProfiles[editingProfileIndex] = sanitized;
    } else {
      updatedProfiles.push(sanitized);
    }

    console.log(updatedProfiles);
    try {
      await saveProfiles(updatedProfiles);
      updateField("profiles", updatedProfiles);
      closeModal();
    } catch (error) {
      declareError("Profiles", error);
      setError("Failed to save profiles. Please try again.");
    }
  };

  const deleteProfile = async () => {
    if (editingProfileIndex === null) return;

    const updatedProfiles = profiles.filter((_, idx) => idx !== editingProfileIndex);
    console.log(updatedProfiles);

    try {
      await saveProfiles(updatedProfiles);
      updateField("profiles", updatedProfiles);
      closeModal();
    } catch (error) {
      declareError("Profiles", error);
      setError("Failed to delete profile. Please try again.");
    }
  };

  const handleCheckboxClick = (_: React.ChangeEvent<HTMLInputElement>, profile: Profile) => {
    toggleProfile(profile);
  };

  return (
    <div className="profiles">
      {profiles.map((profile, index) => (
        <div key={index} className="profile-box" onClick={() => openModal(profile, index)}>
          <input
            type="checkbox"
            checked={selectedProfiles.includes(profile)}
            onChange={(e) => handleCheckboxClick(e, profile)}
            onClick={(e) => e.stopPropagation()}
          />
          <span>{profile.name}</span>
        </div>
      ))}
      <div className="profile-box empty" onClick={() => openModal()}>
        <span>+</span>
      </div>

      {editingProfile && (
        <div className="modal">
          <div className={`modal-content ${showMemories ? 'showing-memories' : ''}`}>
            {!showMemories ? (
              <>
                <input
                  type="text"
                  value={editingProfile.name}
                  onChange={({ target: { value } }) => setEditingProfile((currentEditingProfile) => ({
                    ...currentEditingProfile!,
                    name: value,
                  }))}
                  placeholder="Name"
                />
                <textarea
                  value={editingProfile.personality}
                  onChange={({ target: { value } }) => setEditingProfile((currentEditingProfile) => ({
                    ...currentEditingProfile!,
                    personality: value,
                  }))}
                  placeholder="Personality"
                />
                <div className="send-group">
                  <input
                    type="text"
                    value={customMessage}
                    onChange={({ target: { value } }) => setCustomMessage(value)}
                    onSubmit={() => {
                      sendMessage(editingProfile.name, customMessage);
                    }}
                    placeholder="Send messages in the game's chat as the bot"
                  />
                  <button className="send-button" onClick={() => sendMessage(editingProfile.name, customMessage)}>Send</button>
                </div>
                <div className="button-group">
                  <button className="save-button" onClick={saveChanges}>Save</button>
                  <button className="view-memories-button" onClick={viewMemories}>View Memories</button>
                  <button className="cancel-button" onClick={closeModal}>Cancel</button>
                  {editingProfileIndex !== null && (
                    <button className="delete-button" onClick={deleteProfile}>Delete Pal</button>
                  )}
                </div>
                {error && <div className="error-message">{error}</div>}
              </>
            ) : (
              <div className="memories-modal">
                <h3>Memories for {editingProfile.name}</h3>
                <div className="memories-table">
                  {memories.length > 0 ? (
                    memories.map((memory) => (
                      <div key={memory.id} className="memory-row">
                        <div className="memory-text">{memory.text}</div>
                        <button 
                          className="delete-memory-button"
                          onClick={() => handleDeleteMemory(memory.id)}
                        >
                          ×
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="no-memories">No memories found</div>
                  )}
                </div>
                <div className="button-group">
                  <button className="back-button" onClick={() => setShowMemories(false)}>Back</button>
                </div>
                {memoryError && <div className="error-message">{memoryError}</div>}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Profiles;
