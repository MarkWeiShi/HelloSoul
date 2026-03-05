import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { useMemory } from '../../hooks/useMemory';
import { TimelineEntry } from './TimelineEntry';
import { VocabStickers } from './VocabStickers';
import { GrowthReportCard } from './GrowthReportCard';
import { ReflectionQuestionCard } from './ReflectionQuestionCard';

interface JournalPageProps {
  characterId: string;
  characterColor: string;
  characterName: string;
}

export function JournalPage({
  characterId,
  characterColor,
  characterName,
}: JournalPageProps) {
  const { summary, timeline, fetchSummary, fetchTimeline, loading } = useMemory(characterId);
  const [tab, setTab] = useState<'timeline' | 'vocab' | 'stats'>('timeline');

  useEffect(() => {
    fetchSummary();
    fetchTimeline();
  }, [fetchSummary, fetchTimeline]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0F0B1E] to-[#1E1B4B] pb-24">
      {/* Header */}
      <div className="journal-paper mx-4 mt-4 p-5 rounded-xl">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen size={18} style={{ color: characterColor }} />
          <h2 className="text-lg font-serif text-white/90">
            Our Story — {characterName}
          </h2>
        </div>

        {summary && (
          <div className="space-y-2 text-sm text-gray-400">
            <p className="text-white/70">{summary}</p>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex px-4 mt-4 gap-2">
        {(['timeline', 'vocab', 'stats'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="px-4 py-2 rounded-full text-xs font-medium transition-all"
            style={
              tab === t
                ? { backgroundColor: characterColor, color: '#fff' }
                : { backgroundColor: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)' }
            }
          >
            {t === 'timeline' ? 'Timeline' : t === 'vocab' ? 'Vocab' : 'Stats'}
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {tab === 'timeline' && (
          <motion.div
            key="timeline"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="px-4 mt-4 space-y-3"
          >
            {loading ? (
              <div className="text-center text-gray-500 py-8 text-sm">Loading...</div>
            ) : timeline && timeline.length > 0 ? (
              timeline.map((entry) => (
                <TimelineEntry
                  key={entry.id}
                  entry={{
                    type: entry.entryType,
                    content: entry.content.excerpt || entry.title,
                    date: entry.createdAt,
                  }}
                  characterColor={characterColor}
                />
              ))
            ) : (
              <div className="text-center text-gray-500 py-8">
                <Sparkles size={24} className="mx-auto mb-2 opacity-40" />
                <p className="text-sm">No memories yet. Start chatting!</p>
              </div>
            )}
          </motion.div>
        )}

        {tab === 'vocab' && (
          <motion.div
            key="vocab"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="mt-4"
          >
            <VocabStickers
              characterId={characterId}
              characterColor={characterColor}
            />
          </motion.div>
        )}

        {tab === 'stats' && (
          <motion.div
            key="stats"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="px-4 mt-4 space-y-4"
          >
            {/* Daily reflection question */}
            <ReflectionQuestionCard
              characterId={characterId}
              characterName={characterName}
              characterColor={characterColor}
            />

            {/* Monthly growth report */}
            <GrowthReportCard
              characterId={characterId}
              characterName={characterName}
              characterColor={characterColor}
            />

            {/* Legacy summary */}
            {summary && (
              <div className="glass-card p-4 rounded-xl space-y-3">
                <h3 className="text-sm font-medium text-white/70">Summary</h3>
                <p className="text-xs text-gray-300">{summary}</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-xs text-gray-400">{label}</span>
      <span className="text-sm font-medium text-white/80">{value}</span>
    </div>
  );
}
