import { motion } from 'framer-motion';
import { Volume2 } from 'lucide-react';
import { getChatMvpCharacterUi } from '../../config/privateChatMvp';
import { CHARACTERS } from '../../types/persona';
import type { CharacterId } from '../../types/persona';
import { PageLayout } from '../layout/PageLayout';

interface CharacterSelectProps {
  onSelect: (characterId: CharacterId) => void;
}

export function CharacterSelect({ onSelect }: CharacterSelectProps) {
  return (
    <PageLayout withNav={false} className="bg-deep-space flex flex-col">
      <div className="pt-6 px-4 sm:px-6 text-center">
        <h1 className="text-xl font-medium text-white">Choose your companion</h1>
        <p className="text-xs text-gray-400 mt-2 font-serif">
          Pick a role, then start with a focused DM scenario.
        </p>
      </div>

      <div className="flex-1 flex items-center px-4 sm:px-6 py-8">
        <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 w-full">
          {CHARACTERS.map((character, index) => {
            const chatMvp = getChatMvpCharacterUi(character.id);

            return (
              <motion.div
                key={character.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.15 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelect(character.id)}
                className="snap-center flex-shrink-0 w-[clamp(220px,78vw,280px)] h-[clamp(360px,68vh,430px)] rounded-2xl overflow-hidden cursor-pointer relative"
                style={{
                  background: `linear-gradient(180deg, ${character.color}15 0%, ${character.color}05 100%)`,
                  border: `1px solid ${character.color}30`,
                }}
              >
                <div
                  className="h-[50%] flex items-center justify-center text-6xl"
                  style={{
                    background: `linear-gradient(180deg, transparent 0%, ${character.color}15 100%)`,
                  }}
                >
                  {character.flag}
                </div>

                <div className="p-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white font-medium text-lg">
                        {chatMvp.displayName}{' '}
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

                  <p className="text-xs text-gray-500 italic">{chatMvp.tagline}</p>

                  <div
                    className="rounded-2xl px-3 py-2 text-[11px] leading-relaxed text-gray-300"
                    style={{
                      backgroundColor: `${character.color}12`,
                      border: `1px solid ${character.color}26`,
                    }}
                  >
                    {chatMvp.openingLine}
                  </div>

                  <div className="flex flex-wrap gap-1">
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
            );
          })}
        </div>
      </div>

      <div className="flex justify-center gap-2 pb-6">
        <div className="w-6 h-1.5 rounded-full bg-white/50" />
        <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
        <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
        <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
        <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
      </div>
    </PageLayout>
  );
}
