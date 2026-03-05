import { motion } from 'framer-motion';
import { CHARACTERS } from '../../types/persona';
import type { CharacterId } from '../../types/persona';

interface PersonaBibleProps {
  characterId: CharacterId;
  expanded: boolean;
  onToggle: () => void;
}

export function PersonaBible({ characterId, expanded, onToggle }: PersonaBibleProps) {
  const character = CHARACTERS.find((c) => c.id === characterId);
  if (!character) return null;

  return (
    <motion.div
      layout
      onClick={onToggle}
      className="cursor-pointer overflow-hidden rounded-xl"
      style={{
        background: expanded ? 'rgba(255,255,255,0.05)' : 'transparent',
        border: expanded ? `1px solid ${character.color}30` : '1px solid transparent',
      }}
    >
      <motion.div layout className="p-4">
        <h3 className="text-sm font-medium mb-2" style={{ color: character.color }}>
          About {character.name}
        </h3>

        <motion.div
          initial={false}
          animate={{ height: expanded ? 'auto' : 0, opacity: expanded ? 1 : 0 }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <div className="space-y-2 pt-2">
            {character.bio.map((item, i) => (
              <p key={i} className="text-xs text-gray-300">
                {item}
              </p>
            ))}

            <div className="flex flex-wrap gap-1 pt-2">
              {character.personalityTraits.map((trait) => (
                <span
                  key={trait}
                  className="text-[10px] px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: `${character.color}15`,
                    color: character.color,
                  }}
                >
                  {trait}
                </span>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
