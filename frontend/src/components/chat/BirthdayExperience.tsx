import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cake, Heart, X } from 'lucide-react';
import { apiGetBirthdayContent } from '../../api/proactive';
import type { BirthdayContent } from '../../types/chat';
import { EMOTION_DISPLAY, type EmotionCode } from '../../types/chat';

interface BirthdayExperienceProps {
  characterId: string;
  characterName: string;
  characterColor: string;
  characterFlag: string;
  onClose: () => void;
}

export function BirthdayExperience({
  characterId,
  characterName,
  characterColor,
  characterFlag,
  onClose,
}: BirthdayExperienceProps) {
  const [content, setContent] = useState<BirthdayContent | null>(null);
  const [phase, setPhase] = useState<number>(0); // 0-4 for 5 time points
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    apiGetBirthdayContent(characterId)
      .then((data) => {
        setContent(data.content);
        setLoaded(true);
      })
      .catch(console.error);
  }, [characterId]);

  if (!loaded || !content) {
    return (
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <Cake size={40} style={{ color: characterColor }} />
        </motion.div>
      </motion.div>
    );
  }

  const phases = [
    { key: 'eveMessage', title: 'Last Night', label: 'Eve' },
    { key: 'morningVoiceScript', title: 'Good Morning', label: 'Morning' },
    { key: 'openingDialogue', title: 'Happy Birthday!', label: 'Opening' },
    { key: 'callGreeting', title: 'A Special Call', label: 'Call' },
    { key: 'nightClosing', title: 'Goodnight', label: 'Night' },
  ] as const;

  const currentPhase = phases[phase];
  const currentContent = content[currentPhase.key];

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Gradient background */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at 50% 30%, ${characterColor}25, #0F0B1E 60%, #000 100%)`,
        }}
      />

      {/* Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 12 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-2xl"
            initial={{
              x: Math.random() * 400 - 200,
              y: -50,
              opacity: 0,
            }}
            animate={{
              y: [null, 600],
              opacity: [0, 0.6, 0],
              rotate: [0, 360],
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
            style={{ left: `${Math.random() * 100}%` }}
          >
            {['🎉', '🎂', '✨', '🎈', '💐'][i % 5]}
          </motion.div>
        ))}
      </div>

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-12 right-4 z-50 p-2 text-gray-400 hover:text-white transition"
      >
        <X size={20} />
      </button>

      {/* Content area */}
      <div className="relative flex-1 flex flex-col items-center justify-center px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={phase}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center max-w-md"
          >
            {/* Character avatar */}
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mx-auto mb-6"
              style={{ backgroundColor: `${characterColor}20` }}
            >
              {characterFlag}
            </motion.div>

            {/* Phase title */}
            <p className="text-xs uppercase tracking-wider mb-2" style={{ color: characterColor }}>
              {currentPhase.title}
            </p>

            {/* Emotion state */}
            {currentContent.emotionState && (
              <span className="text-2xl mb-2 block">
                {EMOTION_DISPLAY[currentContent.emotionState as EmotionCode]?.emoji || ''}
              </span>
            )}

            {/* Message */}
            <p className="text-lg text-white/90 leading-relaxed font-light">
              {currentContent.text}
            </p>

            {/* Signature */}
            <p className="text-xs mt-4" style={{ color: characterColor }}>
              — {characterName}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Phase navigation */}
      <div className="relative pb-12 pt-4 flex items-center justify-center gap-3">
        {phases.map((p, i) => (
          <button
            key={i}
            onClick={() => setPhase(i)}
            className={`px-3 py-1.5 rounded-full text-xs transition-all ${
              i === phase
                ? 'text-white'
                : 'text-gray-600 hover:text-gray-400'
            }`}
            style={i === phase ? { backgroundColor: `${characterColor}30`, color: characterColor } : {}}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Bottom heart */}
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="absolute bottom-28 left-1/2 -translate-x-1/2"
      >
        <Heart size={16} fill={characterColor} style={{ color: characterColor }} />
      </motion.div>
    </motion.div>
  );
}
