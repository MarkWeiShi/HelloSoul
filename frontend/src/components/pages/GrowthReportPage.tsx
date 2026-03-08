import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { usePersonaStore } from '../../store/personaStore';
import { GrowthReportCard } from '../memory/GrowthReportCard';
import { PageLayout } from '../layout/PageLayout';

export function GrowthReportPage() {
  const navigate = useNavigate();
  const { selectedCharacterId, getCharacter } = usePersonaStore();
  const character = selectedCharacterId ? getCharacter(selectedCharacterId) : null;

  // Month navigation
  const now = new Date();
  const [monthOffset, setMonthOffset] = useState(0);
  const targetDate = new Date(now.getFullYear(), now.getMonth() - monthOffset, 1);
  const month = targetDate.toISOString().slice(0, 7);
  const monthLabel = targetDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  if (!character) return null;
  const color = character.color;

  return (
    <PageLayout withNav={false} className="bg-gradient-to-b from-[#0F0B1E] to-[#1E1B4B]">
      {/* Header */}
      <div className="px-4 pt-3 pb-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 -ml-2 mb-3 text-gray-400 hover:text-white transition"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-medium text-white">Growth Report</h1>
        <p className="text-xs text-gray-500">Written by {character.name} in their own voice</p>
      </div>

      {/* Month navigation */}
      <div className="flex items-center justify-between px-4 mb-4">
        <button
          onClick={() => setMonthOffset((o) => o + 1)}
          className="p-2 text-gray-400 hover:text-white transition"
        >
          <ChevronLeft size={18} />
        </button>
        <span className="text-sm text-gray-300">{monthLabel}</span>
        <button
          onClick={() => setMonthOffset((o) => Math.max(0, o - 1))}
          disabled={monthOffset === 0}
          className="p-2 text-gray-400 hover:text-white transition disabled:opacity-30"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Report */}
      <div className="px-4">
        <GrowthReportCard
          characterId={selectedCharacterId!}
          characterName={character.name}
          characterColor={color}
          month={month}
        />
      </div>
    </PageLayout>
  );
}
