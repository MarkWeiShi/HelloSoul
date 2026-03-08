import { motion, AnimatePresence } from 'framer-motion';
import {
  DEFAULT_EMOTION_KEY,
  EMOTION_DISPLAY,
  type Emotion,
  type EmotionKey,
  type GazeDirection,
} from '../../types/chat';

interface EmotionAvatarProps {
  flag: string;
  accentColor: string;
  emotion?: Emotion;
  size?: 'sm' | 'md' | 'lg';
}

const SIZE_MAP = {
  sm: { container: 'w-10 h-10', text: 'text-lg', badge: 'text-xs -top-1 -right-1' },
  md: { container: 'w-14 h-14', text: 'text-2xl', badge: 'text-sm -top-1 -right-1' },
  lg: { container: 'w-24 h-24', text: 'text-4xl', badge: 'text-lg -top-2 -right-2' },
};

/** Gaze-based CSS transforms */
const GAZE_TRANSFORMS: Record<GazeDirection, string> = {
  user: 'translateX(0) translateY(0)',
  away: 'translateX(3px) translateY(-1px)',
  down: 'translateX(0) translateY(2px)',
};

const ENERGETIC = new Set<EmotionKey>(['joy', 'enthusiasm', 'triumph', 'delight']);
const PLAYFUL = new Set<EmotionKey>(['playfulness', 'amusement', 'curiosity']);
const TENSE = new Set<EmotionKey>(['anger', 'rage', 'panic', 'frustration', 'anxiety', 'stress']);
const SOFT = new Set<EmotionKey>(['sadness', 'grief', 'serenity', 'contentment', 'exhaustion']);

/** Emotion-based animation configs */
function getEmotionAnimation(emotion: EmotionKey) {
  if (ENERGETIC.has(emotion)) {
    return { scale: [1, 1.1, 1], transition: { duration: 1.2, repeat: Infinity } };
  }

  if (PLAYFUL.has(emotion)) {
    return { y: [0, -4, 0], rotate: [-1, 1, -1], transition: { duration: 1.4, repeat: Infinity } };
  }

  if (TENSE.has(emotion)) {
    return { x: [-1, 1, -1], transition: { duration: 0.6, repeat: Infinity } };
  }

  if (SOFT.has(emotion)) {
    return { opacity: [1, 0.86, 1], scale: [1, 0.98, 1], transition: { duration: 3.5, repeat: Infinity } };
  }

  return { scale: [1, 1.03, 1], transition: { duration: 3, repeat: Infinity } };
}

export function EmotionAvatar({
  flag,
  accentColor,
  emotion,
  size = 'md',
}: EmotionAvatarProps) {
  const s = SIZE_MAP[size];
  const emotionKey = emotion?.key || DEFAULT_EMOTION_KEY;
  const gaze = emotion?.gazeDirection || 'user';
  const display = EMOTION_DISPLAY[emotionKey];
  const animation = getEmotionAnimation(emotionKey);

  return (
    <div className="relative inline-block">
      <motion.div
        animate={animation}
        style={{ transform: GAZE_TRANSFORMS[gaze] }}
        className="relative"
      >
        {/* Glow ring */}
        <div
          className={`absolute inset-0 ${s.container} rounded-full blur-md opacity-30`}
          style={{ backgroundColor: display.color }}
        />

        {/* Avatar face */}
        <div
          className={`${s.container} rounded-full flex items-center justify-center ${s.text} relative z-10`}
          style={{
            backgroundColor: `${accentColor}20`,
            border: `2px solid ${display.color}`,
            boxShadow: `0 0 12px ${display.color}40`,
          }}
        >
          {flag}
        </div>
      </motion.div>

      {/* Emotion badge */}
      <AnimatePresence mode="wait">
        <motion.span
          key={emotionKey}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          className={`absolute ${s.badge} z-20`}
          title={display.label}
        >
          {display.emoji}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
