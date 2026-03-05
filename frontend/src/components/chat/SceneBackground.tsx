import { motion, AnimatePresence } from 'framer-motion';
import type { EmotionCode } from '../../types/chat';
import type { CharacterId } from '../../types/persona';

interface SceneBackgroundProps {
  sceneId?: string;
  characterId: CharacterId;
  emotionCode?: EmotionCode;
}

/**
 * Scene background definitions per character.
 * Each character has 10 scene IDs that map to CSS gradient backgrounds.
 */
const SCENE_GRADIENTS: Record<string, { gradient: string; particles?: string }> = {
  // Akari scenes (warm Japanese tones)
  'akari_cafe': {
    gradient: 'radial-gradient(ellipse at 30% 20%, #3D2B1F 0%, #1A0F08 50%, #0F0B1E 100%)',
    particles: '☕',
  },
  'akari_rooftop': {
    gradient: 'radial-gradient(ellipse at 50% 0%, #FF6B3520 0%, #1E1B4B 40%, #0F0B1E 100%)',
    particles: '🌆',
  },
  'akari_rain': {
    gradient: 'radial-gradient(ellipse at 50% 50%, #2D3748 0%, #1A202C 50%, #0F0B1E 100%)',
    particles: '🌧️',
  },
  'akari_night': {
    gradient: 'radial-gradient(ellipse at 50% 100%, #1E1B4B 0%, #0F0B1E 70%, #000 100%)',
    particles: '🌙',
  },
  'akari_sakura': {
    gradient: 'radial-gradient(ellipse at 50% 30%, #FFB7C520 0%, #1E1B4B 40%, #0F0B1E 100%)',
    particles: '🌸',
  },

  // Mina scenes (vibrant K-pop tones)
  'mina_studio': {
    gradient: 'radial-gradient(ellipse at 50% 50%, #FF69B415 0%, #1E1B4B 40%, #0F0B1E 100%)',
  },
  'mina_dorm': {
    gradient: 'radial-gradient(ellipse at 30% 80%, #FFD70015 0%, #1E1B4B 40%, #0F0B1E 100%)',
  },
  'mina_night_walk': {
    gradient: 'radial-gradient(ellipse at 50% 0%, #E040FB15 0%, #1E1B4B 40%, #0F0B1E 100%)',
  },

  // Sophie scenes (warm Parisian tones)
  'sophie_studio': {
    gradient: 'radial-gradient(ellipse at 50% 50%, #FFD70015 0%, #1E1B4B 40%, #0F0B1E 100%)',
  },
  'sophie_balcony': {
    gradient: 'radial-gradient(ellipse at 50% 0%, #87CEEB15 0%, #1E1B4B 40%, #0F0B1E 100%)',
  },
  'sophie_rain': {
    gradient: 'radial-gradient(ellipse at 50% 50%, #4A556815 0%, #1E1B4B 40%, #0F0B1E 100%)',
  },

  // Carlos scenes
  'carlos_workshop': {
    gradient: 'radial-gradient(ellipse at 50% 50%, #FF634720 0%, #1E1B4B 40%, #0F0B1E 100%)',
  },
  'carlos_terrace': {
    gradient: 'radial-gradient(ellipse at 50% 0%, #FFA50020 0%, #1E1B4B 40%, #0F0B1E 100%)',
  },
};

/** Emotion-influenced background color overlay */
function getEmotionOverlay(emotion?: EmotionCode): string {
  switch (emotion) {
    case 'EMO_02': return 'rgba(255,215,0,0.03)';
    case 'EMO_03': return 'rgba(255,182,193,0.04)';
    case 'EMO_05': return 'rgba(221,160,221,0.04)';
    case 'EMO_11': return 'rgba(230,230,250,0.05)';
    case 'EMO_12': return 'rgba(25,25,60,0.1)';
    default: return 'transparent';
  }
}

const DEFAULT_GRADIENT = 'radial-gradient(ellipse at 50% 50%, #1E1B4B 0%, #0F0B1E 100%)';

export function SceneBackground({
  sceneId,
  characterId,
  emotionCode,
}: SceneBackgroundProps) {
  const scene = sceneId ? SCENE_GRADIENTS[sceneId] : null;
  const background = scene?.gradient || DEFAULT_GRADIENT;
  const overlay = getEmotionOverlay(emotionCode);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={sceneId || 'default'}
        className="absolute inset-0 z-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1.5, ease: 'easeInOut' }}
      >
        {/* Base scene gradient */}
        <div className="absolute inset-0" style={{ background }} />

        {/* Emotion-driven overlay */}
        <div className="absolute inset-0" style={{ backgroundColor: overlay }} />

        {/* Optional ambient particles */}
        {scene?.particles && (
          <motion.div
            className="absolute top-4 right-4 text-2xl opacity-20"
            animate={{ y: [0, -8, 0], opacity: [0.15, 0.25, 0.15] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            {scene.particles}
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
