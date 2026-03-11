import { motion, AnimatePresence } from 'framer-motion';
import { EMOTION_DISPLAY, type EmotionKey } from '../../types/chat';
import type { CharacterId } from '../../types/persona';

interface SceneBackgroundProps {
  sceneId?: string;
  characterId: CharacterId;
  emotionKey?: EmotionKey;
}

const SCENE_GRADIENTS: Record<string, { gradient: string; particles?: string }> = {
  cafe_counter: {
    gradient: 'radial-gradient(ellipse at 30% 20%, #4A3122 0%, #1B120D 48%, #0F0B1E 100%)',
    particles: '.',
  },
  classroom: {
    gradient: 'radial-gradient(ellipse at 50% 15%, #B7C9E230 0%, #243247 46%, #0F0B1E 100%)',
    particles: '+',
  },
  cycling_street: {
    gradient: 'radial-gradient(ellipse at 55% 0%, #FFB86B22 0%, #243B55 40%, #0F0B1E 100%)',
    particles: '~',
  },
  rainy_convenience: {
    gradient: 'radial-gradient(ellipse at 40% 10%, #7CC6FF18 0%, #273244 44%, #0F0B1E 100%)',
    particles: '|',
  },
  apartment_day: {
    gradient: 'radial-gradient(ellipse at 45% 0%, #F2D8A718 0%, #2B2A4C 46%, #0F0B1E 100%)',
    particles: '.',
  },
  apartment_night: {
    gradient: 'radial-gradient(ellipse at 50% 100%, #1F2755 0%, #0F0B1E 70%, #040308 100%)',
    particles: '*',
  },
  old_bookstore: {
    gradient: 'radial-gradient(ellipse at 35% 15%, #9A6B3C22 0%, #2A1B12 44%, #0F0B1E 100%)',
    particles: '.',
  },
  canal_walk: {
    gradient: 'radial-gradient(ellipse at 50% 5%, #6BC7C820 0%, #20384B 44%, #0F0B1E 100%)',
    particles: '~',
  },
  shrine_festival: {
    gradient: 'radial-gradient(ellipse at 50% 0%, #FF7A5922 0%, #432B40 42%, #0F0B1E 100%)',
    particles: '*',
  },
  cherry_blossom: {
    gradient: 'radial-gradient(ellipse at 50% 20%, #FFB7D520 0%, #3B2A4D 44%, #0F0B1E 100%)',
    particles: '.',
  },
};

const CHARACTER_BASE_GRADIENTS: Record<CharacterId, string> = {
  akari: 'radial-gradient(ellipse at 50% 20%, #FF6B9D18 0%, #2B2042 44%, #0F0B1E 100%)',
  mina: 'radial-gradient(ellipse at 50% 20%, #7B68EE18 0%, #251F49 44%, #0F0B1E 100%)',
  sophie: 'radial-gradient(ellipse at 50% 20%, #D4AF3718 0%, #352A1B 44%, #0F0B1E 100%)',
  carlos: 'radial-gradient(ellipse at 50% 20%, #00CED118 0%, #173747 44%, #0F0B1E 100%)',
};

function getEmotionOverlay(emotion?: EmotionKey): string {
  if (!emotion) return 'transparent';
  const meta = EMOTION_DISPLAY[emotion];
  if (!meta) return 'transparent';

  if (meta.cluster === 'negative') return 'rgba(20, 26, 52, 0.14)';
  return 'rgba(255, 214, 164, 0.06)';
}

export function SceneBackground({
  sceneId,
  characterId,
  emotionKey,
}: SceneBackgroundProps) {
  const scene = sceneId ? SCENE_GRADIENTS[sceneId] : null;
  const background = scene?.gradient || CHARACTER_BASE_GRADIENTS[characterId];
  const overlay = getEmotionOverlay(emotionKey);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={sceneId || `${characterId}-default`}
        className="absolute inset-0 z-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1.2, ease: 'easeInOut' }}
      >
        <div className="absolute inset-0" style={{ background }} />
        <div className="absolute inset-0" style={{ backgroundColor: overlay }} />

        {scene?.particles && (
          <motion.div
            className="absolute top-4 right-4 text-xl opacity-20"
            animate={{ y: [0, -8, 0], opacity: [0.08, 0.18, 0.08] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            {scene.particles}
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

