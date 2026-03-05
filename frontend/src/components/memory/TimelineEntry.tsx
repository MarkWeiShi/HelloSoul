import { motion } from 'framer-motion';
import {
  Heart,
  Star,
  BookOpen,
  MessageCircleHeart,
  Camera,
  Sparkles,
} from 'lucide-react';

type EntryType = 'first_meeting' | 'milestone' | 'language_win' | 'emotional' | 'lifestyle';

interface TimelineEntryProps {
  entry: {
    type: string;
    content: string;
    date: string;
    metadata?: Record<string, any>;
  };
  characterColor: string;
}

const TYPE_CONFIG: Record<
  EntryType,
  { icon: React.ReactNode; label: string; bgOpacity: string }
> = {
  first_meeting: { icon: <Star size={14} />, label: 'First Meeting', bgOpacity: '0.15' },
  milestone: { icon: <Sparkles size={14} />, label: 'Milestone', bgOpacity: '0.12' },
  language_win: { icon: <BookOpen size={14} />, label: 'Language Win', bgOpacity: '0.10' },
  emotional: { icon: <Heart size={14} />, label: 'Emotional Moment', bgOpacity: '0.12' },
  lifestyle: { icon: <Camera size={14} />, label: 'Lifestyle', bgOpacity: '0.08' },
};

export function TimelineEntry({ entry, characterColor }: TimelineEntryProps) {
  const type = (entry.type as EntryType) || 'milestone';
  const config = TYPE_CONFIG[type] || TYPE_CONFIG.milestone;
  const date = new Date(entry.date);
  const formatted = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-3"
    >
      {/* Timeline dot + line */}
      <div className="flex flex-col items-center">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
          style={{
            backgroundColor: characterColor,
            opacity: 0.9,
          }}
        >
          <span className="text-white">{config.icon}</span>
        </div>
        <div className="w-px flex-1 bg-white/10 mt-1" />
      </div>

      {/* Content card */}
      <div
        className="flex-1 rounded-xl p-3 mb-2"
        style={{
          backgroundColor: `${characterColor}${Math.round(
            parseFloat(config.bgOpacity) * 255
          )
            .toString(16)
            .padStart(2, '0')}`,
        }}
      >
        <div className="flex items-center justify-between mb-1">
          <span
            className="text-[10px] font-medium uppercase tracking-wider"
            style={{ color: characterColor }}
          >
            {config.label}
          </span>
          <span className="text-[10px] text-gray-500">{formatted}</span>
        </div>
        <p className="text-sm text-white/80 leading-relaxed">{entry.content}</p>
      </div>
    </motion.div>
  );
}
