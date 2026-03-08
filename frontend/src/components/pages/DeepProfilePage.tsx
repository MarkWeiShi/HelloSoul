import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Eye, Trash2, AlertTriangle, Shield, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDeepProfile } from '../../hooks/useDeepProfile';
import { usePersonaStore } from '../../store/personaStore';
import type { DeepProfileField } from '../../types/chat';
import { PageLayout } from '../layout/PageLayout';

export function DeepProfilePage() {
  const navigate = useNavigate();
  const { selectedCharacterId, getCharacter } = usePersonaStore();
  const character = selectedCharacterId ? getCharacter(selectedCharacterId) : null;
  const {
    profile,
    isLoading,
    fetchProfile,
    deleteField,
    clearAll,
  } = useDeepProfile(selectedCharacterId);

  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  if (!character) return null;

  const color = character.color;

  const sectionLabels: Record<string, { title: string; icon: string; desc: string }> = {
    aboutYourLife: {
      title: 'About Your Life',
      icon: '🏠',
      desc: `Things ${character.name} has learned about your daily life`,
    },
    thingsNoticed: {
      title: 'Things I\'ve Noticed',
      icon: '👀',
      desc: `Patterns and habits ${character.name} has picked up on`,
    },
    emotionalAnchors: {
      title: 'Emotional Anchors',
      icon: '💗',
      desc: 'Memories and topics that carry emotional weight',
    },
    growth: {
      title: 'Your Growth',
      icon: '🌱',
      desc: `Ways ${character.name} has seen you grow`,
    },
  };

  const sections = profile?.sections || {
    aboutYourLife: [],
    thingsNoticed: [],
    emotionalAnchors: [],
    growth: [],
  };

  return (
    <PageLayout className="bg-gradient-to-b from-[#0F0B1E] to-[#1E1B4B]">
      {/* Header */}
      <div className="relative px-4 pt-3 pb-6">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            background: `radial-gradient(circle at 50% 0%, ${color}, transparent 60%)`,
          }}
        />
        <div className="relative">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 mb-3 text-gray-400 hover:text-white transition"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <Eye size={20} style={{ color }} />
            <h1 className="text-lg font-medium text-white">
              What {character.name} Knows About You
            </h1>
          </div>
          <p className="text-xs text-gray-400">
            Everything {character.name} has learned comes from your conversations.
            You have full control — delete anything at any time.
          </p>
        </div>
      </div>

      {/* Privacy banner */}
      <div className="mx-4 mb-4 p-3 rounded-xl bg-white/5 flex items-start gap-2">
        <Shield size={16} className="text-green-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-gray-300">
          This data is stored privately and only used to make {character.name}'s conversations feel more personal.
          No data is shared with third parties.
        </p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          >
            <Sparkles size={20} style={{ color }} />
          </motion.div>
        </div>
      ) : (
        <div className="px-4 space-y-3">
          {Object.entries(sectionLabels).map(([key, { title, icon, desc }]) => {
            const sectionKey = key as keyof typeof sections;
            const fields = sections[sectionKey] as DeepProfileField[] | undefined;
            const isExpanded = expandedSection === key;
            const count = fields?.length || 0;

            return (
              <motion.div
                key={key}
                className="glass-card rounded-xl overflow-hidden"
                layout
              >
                <button
                  onClick={() => setExpandedSection(isExpanded ? null : key)}
                  className="w-full flex items-center justify-between p-4"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{icon}</span>
                    <div className="text-left">
                      <h3 className="text-sm font-medium text-white/90">{title}</h3>
                      <p className="text-[10px] text-gray-500">{desc}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">{count}</span>
                </button>

                <AnimatePresence>
                  {isExpanded && fields && fields.length > 0 && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-4 pb-4 space-y-2"
                    >
                      {fields.map((field) => (
                        <div
                          key={field.id}
                          className="flex items-start justify-between gap-2 p-2 rounded-lg bg-white/5"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-white/80">{field.value}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[10px] text-gray-500">
                                Confidence: {Math.round(field.confidence * 100)}%
                              </span>
                              {field.isVulnerable && (
                                <span className="text-[10px] text-amber-400">
                                  Sensitive
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => deleteField(field.id)}
                            className="flex-shrink-0 p-1 text-gray-600 hover:text-red-400 transition-colors"
                            title="Delete this memory"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </motion.div>
                  )}

                  {isExpanded && (!fields || fields.length === 0) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-4 pb-4"
                    >
                      <p className="text-xs text-gray-500 text-center py-2">
                        Nothing here yet — keep chatting!
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Clear all */}
      <div className="px-4 mt-8">
        {!showClearConfirm ? (
          <button
            onClick={() => setShowClearConfirm(true)}
            className="w-full py-3 rounded-xl text-xs text-red-400/60 hover:text-red-400 border border-red-400/10 hover:border-red-400/30 transition-colors"
          >
            Clear all data {character.name} knows about me
          </button>
        ) : (
          <div className="glass-card rounded-xl p-4 space-y-3">
            <div className="flex items-start gap-2">
              <AlertTriangle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-gray-300">
                This will permanently delete everything {character.name} has learned about you.
                Your conversations will continue, but {character.name} won't reference past personal details.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  clearAll();
                  setShowClearConfirm(false);
                }}
                className="flex-1 py-2 rounded-lg text-xs text-red-400 bg-red-400/10 hover:bg-red-400/20 transition"
              >
                Yes, clear everything
              </button>
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-2 rounded-lg text-xs text-gray-400 bg-white/5 hover:bg-white/10 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Total count */}
        {profile && (
          <p className="text-center text-[10px] text-gray-600 mt-3">
            {profile.totalFields} total data points
          </p>
        )}
      </div>
    </PageLayout>
  );
}
