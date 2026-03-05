import { motion } from 'framer-motion';
import { Volume2 } from 'lucide-react';
import { CHARACTERS } from '../../types/persona';
import type { CharacterId } from '../../types/persona';

interface CharacterSelectProps {
  onSelect: (characterId: CharacterId) => void;
}

export function CharacterSelect({ onSelect }: CharacterSelectProps) {
  return (
    <div className="min-h-screen bg-deep-space flex flex-col">
      {/* Header */}
      <div className="pt-16 px-6 text-center">
        <h1 className="text-xl font-medium text-white">
          Choose your companion
        </h1>
        <p className="text-xs text-gray-400 mt-2 font-serif">
          选择你的AI伴侣 / あなたのパートナーを選んで
        </p>
      </div>

      {/* Character cards — horizontal scroll */}
      <div className="flex-1 flex items-center px-6 py-8">
        <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 w-full">
          {CHARACTERS.map((character, index) => (
            <motion.div
              key={character.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect(character.id)}
              className="snap-center flex-shrink-0 w-[280px] h-[380px] rounded-2xl overflow-hidden cursor-pointer relative"
              style={{
                background: `linear-gradient(180deg, ${character.color}15 0%, ${character.color}05 100%)`,
                border: `1px solid ${character.color}30`,
              }}
            >
              {/* Character illustration placeholder */}
              <div
                className="h-[60%] flex items-center justify-center text-6xl"
                style={{
                  background: `linear-gradient(180deg, transparent 0%, ${character.color}15 100%)`,
                }}
              >
                {character.flag}
              </div>

              {/* Info section */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-1">
                  <div>
                    <h3 className="text-white font-medium text-lg">
                      {character.name}{' '}
                      <span className="text-gray-400 font-serif text-sm">
                        {character.nativeName}
                      </span>
                    </h3>
                    <p className="text-xs text-gray-400">
                      {character.flag} {character.city}, {character.country}
                    </p>
                  </div>
                  <button
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{
                      backgroundColor: `${character.color}22`,
                      border: `1px solid ${character.color}44`,
                    }}
                  >
                    <Volume2 size={14} style={{ color: character.color }} />
                  </button>
                </div>

                <p className="text-xs text-gray-500 italic mt-1">
                  {character.tagline}
                </p>

                {/* Personality traits */}
                <div className="flex flex-wrap gap-1 mt-3">
                  {character.personalityTraits.map((trait) => (
                    <span
                      key={trait}
                      className="text-[10px] px-2 py-0.5 rounded-full"
                      style={{
                        backgroundColor: `${character.color}15`,
                        color: character.color,
                        border: `1px solid ${character.color}30`,
                      }}
                    >
                      {trait}
                    </span>
                  ))}
                </div>
              </div>

              {/* Breathing float animation */}
              <motion.div
                className="absolute inset-0 pointer-events-none"
                animate={{ y: [-2, 2, -2] }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Progress dots */}
      <div className="flex justify-center gap-2 pb-8">
        <div className="w-6 h-1.5 rounded-full bg-white/50" />
        <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
        <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
        <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
        <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
      </div>
    </div>
  );
}
