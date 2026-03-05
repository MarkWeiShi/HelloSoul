import { motion, AnimatePresence } from 'framer-motion';
import { Heart } from 'lucide-react';

interface InnerVoiceBubbleProps {
  innerVoiceText: string;
  innerVoiceLanguage: string;
  innerVoiceTranslation: string;
  innerVoiceAudioUrl?: string;
  characterColor: string;
  revealed: boolean;
  onReveal: () => void;
}

export function InnerVoiceBubble({
  innerVoiceText,
  innerVoiceTranslation,
  innerVoiceAudioUrl,
  characterColor,
  revealed,
  onReveal,
}: InnerVoiceBubbleProps) {
  return (
    <div className="relative">
      {/* Heart trigger button */}
      <motion.button
        onClick={onReveal}
        className="absolute -bottom-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center z-10"
        style={{ backgroundColor: characterColor }}
        animate={
          revealed
            ? {}
            : { scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }
        }
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Heart
          size={12}
          fill={revealed ? 'white' : 'none'}
          color="white"
        />
      </motion.button>

      <AnimatePresence>
        {revealed && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="mt-3 p-3 rounded-xl backdrop-blur-md"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              maxWidth: '280px',
            }}
          >
            <p className="text-xs text-gray-400 mb-1 italic">
              ♡ she thought to herself...
            </p>
            <p
              className="text-sm italic"
              style={{
                color: characterColor,
                fontFamily: 'Noto Serif, serif',
              }}
            >
              {innerVoiceText}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {innerVoiceTranslation}
            </p>
            {innerVoiceAudioUrl && (
              <button
                onClick={() => new Audio(innerVoiceAudioUrl).play()}
                className="mt-2 text-xs opacity-60 hover:opacity-100 transition-opacity"
              >
                🔊 Hear her whisper
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
