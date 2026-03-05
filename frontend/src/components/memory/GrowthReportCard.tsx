import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, BookOpen, Eye, Heart, Sparkles } from 'lucide-react';
import { useDeepProfile } from '../../hooks/useDeepProfile';
import type { GrowthReport } from '../../types/chat';

interface GrowthReportCardProps {
  characterId: string;
  characterName: string;
  characterColor: string;
  month?: string;
}

export function GrowthReportCard({
  characterId,
  characterName,
  characterColor,
  month,
}: GrowthReportCardProps) {
  const { growthReport, fetchGrowthReport } = useDeepProfile(characterId);

  useEffect(() => {
    fetchGrowthReport(month);
  }, [fetchGrowthReport, month]);

  if (!growthReport) {
    return (
      <div className="glass-card rounded-xl p-6 text-center">
        <Sparkles size={24} className="mx-auto mb-2 opacity-30" />
        <p className="text-xs text-gray-500">
          Growth report will appear after your first month together.
        </p>
      </div>
    );
  }

  const sections = [
    {
      icon: <BookOpen size={14} />,
      title: 'Our Time Together',
      content: growthReport.sections.together,
    },
    {
      icon: <TrendingUp size={14} />,
      title: 'What You Learned',
      content: growthReport.sections.learned,
    },
    {
      icon: <Eye size={14} />,
      title: `What ${characterName} Noticed`,
      content: growthReport.sections.noticed,
    },
    {
      icon: <Heart size={14} />,
      title: 'Personal Growth',
      content: growthReport.sections.personal,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-xl overflow-hidden"
    >
      {/* Header */}
      <div
        className="p-4 pb-3"
        style={{
          background: `linear-gradient(135deg, ${characterColor}15, transparent)`,
        }}
      >
        <div className="flex items-center gap-2">
          <TrendingUp size={16} style={{ color: characterColor }} />
          <h3 className="text-sm font-medium text-white/90">Monthly Growth Map</h3>
        </div>
        <p className="text-[10px] text-gray-500 mt-1">
          {growthReport.month} — written by {characterName}
        </p>
      </div>

      {/* Highlight line */}
      {growthReport.highlightLine && (
        <div
          className="mx-4 px-3 py-2 rounded-lg text-xs italic"
          style={{
            backgroundColor: `${characterColor}10`,
            color: characterColor,
          }}
        >
          "{growthReport.highlightLine}"
        </div>
      )}

      {/* Sections */}
      <div className="p-4 space-y-4">
        {sections.map((section, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <span style={{ color: characterColor }}>{section.icon}</span>
              <span className="text-xs font-medium text-white/70">
                {section.title}
              </span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed pl-5">
              {section.content}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
