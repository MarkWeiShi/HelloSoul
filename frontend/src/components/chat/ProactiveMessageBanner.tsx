import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageCircle } from 'lucide-react';
import type { ProactiveMessage } from '../../types/chat';
import { EMOTION_DISPLAY, type EmotionKey } from '../../types/chat';

interface ProactiveMessageBannerProps {
  message: ProactiveMessage | null;
  show: boolean;
  characterName: string;
  characterColor: string;
  onDismiss: () => void;
  onReply: () => void;
}

const TRIGGER_ICONS: Record<string, string> = {
  thought_of_you: '💭',
  weather_share: '🌤️',
  followup_care: '💕',
  miss_you: '🥺',
  birthday: '🎂',
  seasonal: '🌸',
};

export function ProactiveMessageBanner({
  message,
  show,
  characterName,
  characterColor,
  onDismiss,
  onReply,
}: ProactiveMessageBannerProps) {
  if (!message) return null;

  const emotionEmoji = message.emotionKey
    ? EMOTION_DISPLAY[message.emotionKey as EmotionKey]?.emoji || ''
    : '';
  const triggerIcon = TRIGGER_ICONS[message.triggerType] || '💬';

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: -80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -80, opacity: 0 }}
          transition={{ type: 'spring', damping: 20, stiffness: 200 }}
          className="absolute top-0 left-0 right-0 z-50 px-4 pb-3"
          style={{
            background: `linear-gradient(to bottom, ${characterColor}20, transparent)`,
            paddingTop: 'calc(var(--akari-safe-top) + var(--akari-space-sm))',
          }}
        >
          <div className="glass-card rounded-xl p-4 flex items-start gap-3">
            {/* Character icon */}
            <div
              className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg"
              style={{ backgroundColor: `${characterColor}25` }}
            >
              {triggerIcon}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium" style={{ color: characterColor }}>
                  {characterName}
                </span>
                {emotionEmoji && <span className="text-xs">{emotionEmoji}</span>}
              </div>
              <p className="text-sm text-white/80 mt-0.5 line-clamp-2">
                {message.content}
              </p>

              {/* Actions */}
              <div className="flex gap-2 mt-2">
                <button
                  onClick={onReply}
                  className="flex items-center gap-1 text-xs px-3 py-1 rounded-full transition-colors"
                  style={{
                    backgroundColor: `${characterColor}20`,
                    color: characterColor,
                  }}
                >
                  <MessageCircle size={12} />
                  Reply
                </button>
              </div>
            </div>

            {/* Dismiss */}
            <button
              onClick={onDismiss}
              className="flex-shrink-0 p-1 text-gray-500 hover:text-gray-300 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
