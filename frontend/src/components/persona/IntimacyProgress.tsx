import { motion } from 'framer-motion';
import { INTIMACY_LEVELS } from '../../types/persona';

interface IntimacyProgressProps {
  score: number;
  level: number;
  characterColor: string;
}

export function IntimacyProgress({
  score,
  level,
  characterColor,
}: IntimacyProgressProps) {
  const current = INTIMACY_LEVELS[level] || INTIMACY_LEVELS[0];
  const next = INTIMACY_LEVELS[level + 1];
  const progress = next
    ? (score - current.minScore) / (next.minScore - current.minScore)
    : 1;

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-2">
        <div>
          <span className="text-sm font-medium" style={{ color: characterColor }}>
            {current.nameJa}
          </span>
          <span className="text-xs text-gray-400 ml-2">
            Lv.{current.level} — {current.name}
          </span>
        </div>
        <span className="text-xs text-gray-500">{score} pts</span>
      </div>

      {/* Progress bar */}
      <div className="h-2 rounded-full bg-white/5 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: characterColor }}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(progress * 100, 100)}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>

      {/* Next unlock preview */}
      {next && (
        <div className="mt-2 flex items-center gap-2">
          <span className="text-[10px] text-gray-500">
            Next: {next.nameJa} Lv.{next.level}
          </span>
          <span className="text-[10px] text-gray-600">
            ({next.minScore - score} pts to go)
          </span>
        </div>
      )}

      {/* Unlock list */}
      <div className="mt-3 space-y-1">
        {current.unlocks.map((unlock) => (
          <div key={unlock} className="flex items-center gap-2">
            <span className="text-green-400 text-xs">✓</span>
            <span className="text-xs text-gray-400">{unlock}</span>
          </div>
        ))}
        {next?.unlocks.map((unlock) => (
          <div key={unlock} className="flex items-center gap-2">
            <span className="text-gray-600 text-xs">🔒</span>
            <span className="text-xs text-gray-600">{unlock}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
