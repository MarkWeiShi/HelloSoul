import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Share2, Download } from 'lucide-react';

interface ShareMemoryCardProps {
  content: string;
  characterName: string;
  characterColor: string;
  date: string;
  type: string;
}

export function ShareMemoryCard({
  content,
  characterName,
  characterColor,
  date,
  type,
}: ShareMemoryCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleShare = async () => {
    if (!cardRef.current) return;
    // Use native share if available
    if (navigator.share) {
      await navigator.share({
        title: `Memory with ${characterName}`,
        text: content,
      });
    }
  };

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-2xl p-5 max-w-sm mx-auto"
      style={{
        background: `linear-gradient(135deg, ${characterColor}20, #0F0B1E, ${characterColor}10)`,
        border: `1px solid ${characterColor}30`,
      }}
    >
      {/* Brand */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] tracking-widest uppercase text-gray-500">
          LingLove Memory
        </span>
        <span
          className="text-[10px] px-2 py-0.5 rounded-full"
          style={{ backgroundColor: `${characterColor}25`, color: characterColor }}
        >
          {type}
        </span>
      </div>

      {/* Content */}
      <p className="text-white/85 text-sm leading-relaxed font-serif mb-4">
        "{content}"
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-medium" style={{ color: characterColor }}>
            with {characterName}
          </span>
          <span className="text-[10px] text-gray-500 ml-2">{date}</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleShare}
            className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 transition"
          >
            <Share2 size={14} className="text-gray-400" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
