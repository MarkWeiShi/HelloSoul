import { motion } from 'framer-motion';
import { CHARACTERS } from '../../types/persona';
import type { FeedStory } from '../../types/feed';

interface StoryCirclesProps {
  stories: FeedStory[];
}

export function StoryCircles({ stories }: StoryCirclesProps) {
  if (stories.length === 0) return null;

  // Group by character
  const grouped = CHARACTERS.map((char) => ({
    character: char,
    hasStory: stories.some((s) => s.characterId === char.id),
    latest: stories.find((s) => s.characterId === char.id),
  })).filter((g) => g.hasStory);

  return (
    <div className="overflow-x-auto -mx-4 px-4">
      <div className="flex gap-4 w-max">
        {grouped.map(({ character, latest }) => (
          <button key={character.id} className="flex flex-col items-center gap-1.5">
            {/* Ring */}
            <div
              className="w-16 h-16 rounded-full p-[2px]"
              style={{
                background: `linear-gradient(135deg, ${character.color}, ${character.color}80)`,
              }}
            >
              <div className="w-full h-full rounded-full bg-[#0F0B1E] flex items-center justify-center p-[2px]">
                <div
                  className="w-full h-full rounded-full flex items-center justify-center text-xl"
                  style={{ backgroundColor: `${character.color}15` }}
                >
                  {character.flag}
                </div>
              </div>
            </div>

            {/* Name */}
            <span className="text-[10px] text-gray-400 max-w-[60px] truncate">
              {character.name.split(' ')[0]}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
