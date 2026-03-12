import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Phone, BookOpen, Eye, TrendingUp } from 'lucide-react';
import { usePersonaStore } from '../../store/personaStore';
import { useIntimacy } from '../../hooks/useIntimacy';
import { apiUpdateRelationshipPrefs } from '../../api/relationship';
import { IntimacyProgress } from '../persona/IntimacyProgress';
import { RelationshipPrefsPanel } from '../persona/RelationshipPrefs';
import { PersonaBible } from '../persona/PersonaBible';
import type { RelationshipPrefs } from '../../types/persona';
import { PageLayout } from '../layout/PageLayout';
import { submitRelationshipPrefsChange } from './profilePreferences';

export function ProfilePage() {
  const navigate = useNavigate();
  const { selectedCharacterId, getCharacter } = usePersonaStore();
  const character = selectedCharacterId ? getCharacter(selectedCharacterId) : null;
  const { relationship, currentLevel, refresh } = useIntimacy(selectedCharacterId);
  const [showPrefs, setShowPrefs] = useState(false);
  const [bioExpanded, setBioExpanded] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);

  if (!character) {
    return (
      <PageLayout className="bg-gradient-to-b from-[#0F0B1E] to-[#1E1B4B] flex items-center justify-center">
        <p className="text-gray-500 text-sm">No character selected</p>
      </PageLayout>
    );
  }

  const color = character.color;

  return (
    <PageLayout className="bg-gradient-to-b from-[#0F0B1E] to-[#1E1B4B]">
      {/* Header */}
      <div className="relative pt-3 pb-6 px-4">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            background: `radial-gradient(circle at 50% 0%, ${color}, transparent 60%)`,
          }}
        />
        <div className="relative flex flex-col items-center">
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center text-4xl mb-3"
            style={{ backgroundColor: `${color}20` }}
          >
            {character.flag}
          </div>
          <h1 className="text-xl font-medium text-white">{character.name}</h1>
          <p className="text-xs text-gray-400 mt-1">{character.tagline}</p>
        </div>
      </div>

      {/* Intimacy */}
      <div className="mx-4 glass-card rounded-xl">
        <IntimacyProgress
          score={relationship?.intimacyScore || 0}
          level={currentLevel?.level ?? 0}
          characterColor={color}
        />
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3 px-4 mt-4">
        <QuickAction
          icon={<Phone size={16} />}
          label="Call"
          color={color}
          onClick={() => navigate('/call')}
        />
        <QuickAction
          icon={<BookOpen size={16} />}
          label="Journal"
          color={color}
          onClick={() => navigate('/journal')}
        />
        <QuickAction
          icon={<Settings size={16} />}
          label="Preferences"
          color={color}
          onClick={() => setShowPrefs(!showPrefs)}
        />
      </div>

      {/* Module I: Deep profile & growth */}
      <div className="flex gap-3 px-4 mt-3">
        <QuickAction
          icon={<Eye size={16} />}
          label={`What ${character.name} Knows`}
          color={color}
          onClick={() => navigate('/deep-profile')}
        />
        <QuickAction
          icon={<TrendingUp size={16} />}
          label="Growth Report"
          color={color}
          onClick={() => navigate('/growth-report')}
        />
      </div>

      {/* Preferences panel */}
      {showPrefs && (
        <div className="mx-4 mt-4 glass-card rounded-xl">
          <RelationshipPrefsPanel
            prefs={
              relationship?.prefs || {
                contactFreq: 'normal',
                teachingMode: 'organic',
                emotionalDepth: 'medium',
              }
            }
            characterColor={color}
            onSave={async (prefs: RelationshipPrefs) => {
              setSavingPrefs(true);
              try {
                const saved = await submitRelationshipPrefsChange({
                  selectedCharacterId,
                  savingPrefs,
                  prefs,
                  updatePrefs: apiUpdateRelationshipPrefs,
                  refresh,
                });
                if (saved) {
                  setShowPrefs(false);
                } else {
                  console.error('Failed to save relationship preferences.');
                }
                return saved;
              } finally {
                setSavingPrefs(false);
              }
            }}
          />
        </div>
      )}

      {/* Character Bio */}
      <div className="mx-4 mt-4">
        <PersonaBible characterId={character.id} expanded={bioExpanded} onToggle={() => setBioExpanded(!bioExpanded)} />
      </div>
    </PageLayout>
  );
}

function QuickAction({
  icon,
  label,
  color,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  color: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl bg-white/5 hover:bg-white/10 transition"
    >
      <span style={{ color }}>{icon}</span>
      <span className="text-[10px] text-gray-400">{label}</span>
    </button>
  );
}
