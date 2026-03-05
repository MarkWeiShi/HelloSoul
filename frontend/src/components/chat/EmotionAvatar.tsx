import { motion, AnimatePresence } from 'framer-motion';
import type { EmotionCode, GazeDirection, EmotionState } from '../../types/chat';
import { EMOTION_DISPLAY } from '../../types/chat';

interface EmotionAvatarProps {
  flag: string;
  accentColor: string;
  emotionState?: EmotionState;
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

/** Emotion-based animation configs */
function getEmotionAnimation(emotion: EmotionCode) {
  switch (emotion) {
    case 'EMO_02': // happy
      return { scale: [1, 1.08, 1], transition: { duration: 1.5, repeat: Infinity } };
    case 'EMO_03': // shy
      return { rotate: [-2, 2, -2], transition: { duration: 2, repeat: Infinity } };
    case 'EMO_06': // surprised
      return { scale: [1, 1.15, 1], transition: { duration: 0.6 } };
    case 'EMO_07': // playful
      return { y: [0, -4, 0], transition: { duration: 1, repeat: Infinity } };
    case 'EMO_10': // pouting
      return { x: [-1, 1, -1], transition: { duration: 0.5, repeat: Infinity } };
    case 'EMO_12': // sleepy
      return { rotate: [0, -5, 0], scale: [1, 0.97, 1], transition: { duration: 4, repeat: Infinity } };
    case 'EMO_14': // daydreaming
      return { y: [0, -2, 0], opacity: [1, 0.85, 1], transition: { duration: 3, repeat: Infinity } };
    default:
      return { scale: [1, 1.03, 1], transition: { duration: 3, repeat: Infinity } };
  }
}

export function EmotionAvatar({
  flag,
  accentColor,
  emotionState,
  size = 'md',
}: EmotionAvatarProps) {
  const s = SIZE_MAP[size];
  const emotion = emotionState?.current || 'EMO_01';
  const gaze = emotionState?.gazeDirection || 'user';
  const display = EMOTION_DISPLAY[emotion];
  const animation = getEmotionAnimation(emotion);

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
          key={emotion}
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
